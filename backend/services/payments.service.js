import { db } from "../db.js";
import { getCurrentDateParts } from "../utils/dateUtils.js";

/* =========================================================
HELPERS DE PERÍODO (YYYY-MM), sin Date/toISOString para
evitar corrimientos de zona horaria.
========================================================= */
function toPeriod(dateValue) {
  if (dateValue instanceof Date) {
    const year = dateValue.getFullYear();
    const month = dateValue.getMonth() + 1;
    return `${year}-${String(month).padStart(2, "0")}`;
  }
  // Viene como string 'YYYY-MM-DD' desde MySQL
  return String(dateValue).slice(0, 7);
}

function addMonths(period, delta) {
  let [year, month] = period.split("-").map(Number);
  month += delta;
  while (month > 12) {
    month -= 12;
    year += 1;
  }
  while (month < 1) {
    month += 12;
    year -= 1;
  }
  return `${year}-${String(month).padStart(2, "0")}`;
}

// Comparación lexicográfica: funciona porque el formato es YYYY-MM
function periodLTE(a, b) {
  return a <= b;
}

/* =========================================================
PRECIO VIGENTE EN UNA FECHA (sin cambios)
========================================================= */
export async function getPlanPriceAtDate(student_plan_id, date) {
  const [rows] = await db.execute(
    `
    SELECT pp.price
    FROM student_plans sp
    JOIN plan_prices pp ON sp.plan_id = pp.plan_id
    WHERE sp.id = ?
      AND pp.start_date <= ?
      AND (pp.end_date IS NULL OR pp.end_date >= ?)
    ORDER BY pp.start_date DESC
    LIMIT 1
    `,
    [student_plan_id, date, date],
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0].price;
}

/* =========================================================
HELPER INTERNO: student_id + plan_id a partir de student_plan_id
========================================================= */
async function getStudentAndPlan(student_plan_id) {
  const [rows] = await db.execute(
    `SELECT student_id, plan_id FROM student_plans WHERE id = ?`,
    [student_plan_id],
  );
  return rows[0] ?? null;
}

/* =========================================================
¿YA EXISTE UN PAGO PARA ESE PERÍODO? (informativo, no bloquea)
========================================================= */
export async function existingPayment(
  student_plan_id,
  payment_period,
  excludeId = null,
) {
  const sp = await getStudentAndPlan(student_plan_id);
  if (!sp) return false;

  const { student_id, plan_id } = sp;

  let sql = `
    SELECT p.id
    FROM payments p
    JOIN student_plans sp ON p.student_plan_id = sp.id
    WHERE sp.student_id = ?
      AND sp.plan_id = ?
      AND p.payment_period = ?
  `;

  const params = [student_id, plan_id, payment_period];

  if (excludeId) {
    sql += " AND p.id != ?";
    params.push(excludeId);
  }

  const [rows] = await db.execute(sql, params);

  return rows.length > 0;
}

/* =========================================================
¿YA EXISTE UNA REGULARIZACIÓN PARA ESE PERÍODO? (bloquea)
========================================================= */
export async function existingRegularization(
  student_plan_id,
  payment_period,
  excludeId = null,
) {
  const sp = await getStudentAndPlan(student_plan_id);
  if (!sp) return false;

  const { student_id, plan_id } = sp;

  let sql = `
    SELECT p.id
    FROM payments p
    JOIN student_plans sp ON p.student_plan_id = sp.id
    WHERE sp.student_id = ?
      AND sp.plan_id = ?
      AND p.payment_period = ?
      AND p.payment_type = 'REGULARIZATION'
  `;

  const params = [student_id, plan_id, payment_period];

  if (excludeId) {
    sql += " AND p.id != ?";
    params.push(excludeId);
  }

  const [rows] = await db.execute(sql, params);

  return rows.length > 0;
}

/* =========================================================
CADENA COMPLETA DE UN student_plan
Trae TODAS las filas históricas de ese alumno+plan y camina hacia
atrás desde la fila dada mientras cada una conecte "sin hueco de
calendario" con la anterior: se considera continuo si la fila
siguiente arranca dentro del mismo mes en el que terminó la
anterior, o como mucho el mes inmediato posterior. Esto cubre tanto
un cambio de docente el mismo día como una reincorporación unos
días después dentro del mismo mes (ej. dar de baja y reactivar un
docente, reasignando a sus alumnos poco después). Si hay un hueco
de calendario real (mes de por medio sin ninguna fila activa), la
cadena se corta ahí.

Devuelve un array ordenado de la fila más vieja a la más nueva
(incluye la fila que se pasó como parámetro).
========================================================= */
async function resolveChain(student_plan) {
  const [allRows] = await db.execute(
    `
    SELECT id, start_date, end_date, first_payment_option
    FROM student_plans
    WHERE student_id = ?
      AND plan_id = ?
    ORDER BY start_date ASC, id ASC
    `,
    [student_plan.student_id, student_plan.plan_id],
  );

  const targetIndex = allRows.findIndex((r) => r.id === student_plan.id);

  // No debería pasar, pero por las dudas devolvemos solo la fila que
  // nos pasaron si no la encontramos en la consulta.
  if (targetIndex === -1) {
    return [
      {
        id: student_plan.id,
        start_date: student_plan.start_date,
        end_date: student_plan.end_date ?? null,
        first_payment_option: student_plan.first_payment_option,
      },
    ];
  }

  let chainStart = targetIndex;

  for (let i = targetIndex; i > 0; i--) {
    const prev = allRows[i - 1];
    const curr = allRows[i];

    if (prev.end_date === null) break; // dos filas activas a la vez: no debería pasar, cortamos por seguridad

    const prevEndPeriod = toPeriod(prev.end_date);
    const currStartPeriod = toPeriod(curr.start_date);

    const isContinuous = periodLTE(
      currStartPeriod,
      addMonths(prevEndPeriod, 1),
    );

    if (!isContinuous) break;

    chainStart = i - 1;
  }

  return allRows.slice(chainStart, targetIndex + 1);
}

/* =========================================================
PERÍODO INICIAL DE LA CADENA Y SU OPCIÓN DE PRIMER PAGO
El período inicial lo define la fila más vieja de la cadena. Pero
la opción de primer pago que rige para ese período es la de la
ÚLTIMA fila que arranca en ese mismo mes: si en el mismo mes hubo
una baja y una nueva asignación, vale lo que se eligió al
reasignar, no lo que decía la inscripción anterior.
========================================================= */
function resolveChainOrigin(chain) {
  const startPeriod = toPeriod(chain[0].start_date);

  const sameMonthRows = chain.filter(
    (r) => toPeriod(r.start_date) === startPeriod,
  );

  const governing = sameMonthRows[sameMonthRows.length - 1] ?? chain[0];

  return {
    startPeriod,
    firstPaymentOption: governing.first_payment_option,
  };
}

/* =========================================================
¿A QUÉ FILA DE LA CADENA LE PERTENECE UN PERÍODO DADO?
Recorre la cadena en orden y se queda con la última fila cuyo
start_date (en formato período) es <= al período buscado.
========================================================= */
function findOwnerId(chain, period) {
  let owner = chain[0];

  for (const entry of chain) {
    if (periodLTE(toPeriod(entry.start_date), period)) {
      owner = entry;
    } else {
      break;
    }
  }

  return owner.id;
}

/* =========================================================
¿ESTA FILA FUE REEMPLAZADA POR OTRA QUE LA CONTINÚA?
Una fila dada de baja que tiene una fila POSTERIOR del mismo
alumno+plan que la continúa (mismo mes de la baja, o el mes
siguiente) no es una baja real: es un cambio de docente / una
reasignación. En ese caso la fila vieja NO debe reclamar deuda
propia — la obligación de ese período le corresponde a la fila
que quedó vigente. Sin esto, el mismo período aparecería
reclamado dos veces (una por cada fila).

IMPORTANTE: la candidata a sucesora tiene que ser estrictamente
POSTERIOR en el mismo orden que usa resolveChain (start_date ASC,
id ASC). Con solo "start_date >= end_date" no alcanzaba: cuando el
alta, el cambio de docente y la baja caen todos el mismo día, las
dos filas quedan con start_date = end_date = hoy y cada una veía a
la otra como su sucesora. Las dos se marcaban superseded, ninguna
reclamaba la deuda y el alumno aparecía sin planes y sin deuda al
darlo de baja.
========================================================= */
async function hasSuccessor(plan) {
  if (plan.end_date === null) return false;

  const [rows] = await db.execute(
    `
    SELECT start_date
    FROM student_plans
    WHERE student_id = ?
      AND plan_id = ?
      AND id != ?
      AND start_date >= ?
      AND (
        start_date > ?
        OR (start_date = ? AND id > ?)
      )
    ORDER BY start_date ASC, id ASC
    LIMIT 1
    `,
    [
      plan.student_id,
      plan.plan_id,
      plan.id,
      plan.end_date,
      plan.start_date,
      plan.start_date,
      plan.id,
    ],
  );

  if (!rows.length) return false;

  const endPeriod = toPeriod(plan.end_date);
  const successorStartPeriod = toPeriod(rows[0].start_date);

  return periodLTE(successorStartPeriod, addMonths(endPeriod, 1));
}

/* =========================================================
ESTADO COMPLETO DE UN student_plan
(cuota vencida congelada + estado del período actual)
========================================================= */
// Día límite del mes SIGUIENTE al que quedó vencido para regularizar
// antes de que se dé la baja automática. Fijo, no configurable.
const GRACE_PERIOD_DAY = 5;

export async function getStudentPlanStatus(student_plan_id) {
  const [rows] = await db.execute(
    `
    SELECT id, student_id, plan_id, start_date, end_date, first_payment_option
    FROM student_plans
    WHERE id = ?
    `,
    [student_plan_id],
  );

  if (!rows.length) return null;

  const plan = rows[0];
  const isActive = plan.end_date === null;

  const { yearMonth: currentPeriod, day } = getCurrentDateParts();

  // Si esta fila fue reemplazada por otra que la continúa (cambio de
  // docente, reasignación), no reclama deuda propia: la obligación
  // del período la lleva la fila vigente.
  if (!isActive && (await hasSuccessor(plan))) {
    return {
      student_plan_id: plan.id,
      academic_status: "INACTIVE",
      account_status: "CURRENT",
      overdue_period: null,
      overdue_student_plan_id: null,
      current_period: null,
      superseded: true,
    };
  }

  // Resolvemos la cadena completa (por si hubo cambios de docente sin
  // hueco de calendario) para no perder deuda vieja, y para saber en
  // qué fila puntual se originó el período vencido (importante para
  // que la regularización se cobre al docente correcto, no al actual).
  const chain = await resolveChain(plan);

  const { startPeriod, firstPaymentOption } = resolveChainOrigin(chain);

  const firstObligatedPeriod =
    firstPaymentOption === "NEXT_MONTH"
      ? addMonths(startPeriod, 1)
      : startPeriod;

  // Hasta qué período se escanea buscando deuda:
  // - INACTIVE: se congela en el mes de la baja, nunca avanza más.
  // - ACTIVE, día <= 20: hasta el mes ANTERIOR al actual (el actual
  //   todavía está en su plazo normal, se evalúa aparte).
  // - ACTIVE, día 21+: incluye también el mes actual, porque ya pasó
  //   su fecha límite.
  let scanEndPeriod;
  if (!isActive) {
    scanEndPeriod = toPeriod(plan.end_date);
  } else if (day > 20) {
    scanEndPeriod = currentPeriod;
  } else {
    scanEndPeriod = addMonths(currentPeriod, -1);
  }

  // Traemos los períodos ya pagados (NORMAL o REGULARIZATION, no importa
  // el tipo) para este alumno+plan, cruzando cualquier student_plan_id
  // histórico (cambios de docente, reincorporaciones, etc).
  const [paymentRows] = await db.execute(
    `
    SELECT DISTINCT p.payment_period
    FROM payments p
    JOIN student_plans sp2 ON p.student_plan_id = sp2.id
    WHERE sp2.student_id = ?
      AND sp2.plan_id = ?
    `,
    [plan.student_id, plan.plan_id],
  );
  const paidPeriods = new Set(paymentRows.map((r) => r.payment_period));

  // Buscamos el período impago más antiguo. Con el cron que da de
  // baja automáticamente a quien no regulariza dentro de la ventana
  // de gracia, nunca debería acumularse más de uno mientras el plan
  // sigue ACTIVE (si igual apareciera más de uno, por ejemplo porque
  // el cron todavía no corrió, nos quedamos con el más viejo).
  let overduePeriod = null;
  if (periodLTE(firstObligatedPeriod, scanEndPeriod)) {
    let cursor = firstObligatedPeriod;
    while (periodLTE(cursor, scanEndPeriod)) {
      if (!paidPeriods.has(cursor)) {
        overduePeriod = cursor;
        break;
      }
      cursor = addMonths(cursor, 1);
    }
  }

  const result = {
    student_plan_id: plan.id,
    academic_status: isActive ? "ACTIVE" : "INACTIVE",
    account_status: overduePeriod ? "OVERDUE" : "CURRENT",
    overdue_period: overduePeriod,
    // Fila real dueña de la deuda (puede ser una fila vieja/inactiva
    // de un docente distinto al actual). Acá es donde se debe
    // registrar el pago de regularización.
    overdue_student_plan_id: overduePeriod
      ? findOwnerId(chain, overduePeriod)
      : null,
    current_period: null,
  };

  if (isActive) {
    if (currentPeriod < firstObligatedPeriod) {
      // Eligió "empezar el próximo mes" y todavía estamos en el mes
      // de alta: no hay ninguna obligación de pago este mes.
      result.current_period = { period: currentPeriod, status: "not_due_yet" };
    } else if (overduePeriod) {
      // Hay un mes vencido (sea el actual u otro anterior): el mes
      // actual queda en espera hasta que se regularice.
      result.current_period = { period: currentPeriod, status: "on_hold" };
    } else if (paidPeriods.has(currentPeriod)) {
      result.current_period = { period: currentPeriod, status: "paid" };
    } else {
      result.current_period = { period: currentPeriod, status: "pending" };
    }
  }

  return result;
}

/* =========================================================
CRON: BAJA AUTOMÁTICA POR DEUDA NO REGULARIZADA A TIEMPO
========================================================= */

// Devuelve la lista de student_plans ACTIVE cuyo período vencido más
// viejo ya superó el día de gracia (día 5 del mes siguiente al que
// quedó impago). Separada de la función que efectivamente escribe en
// la base, para poder testear/inspeccionar sin modificar nada todavía.
export async function findPlansPastGracePeriod() {
  const [activePlans] = await db.execute(
    `SELECT id FROM student_plans WHERE end_date IS NULL`,
  );

  const { yearMonth: currentPeriod, day } = getCurrentDateParts();

  const results = [];

  for (const row of activePlans) {
    const status = await getStudentPlanStatus(row.id);

    if (!status?.overdue_period) continue;

    const graceDeadlinePeriod = addMonths(status.overdue_period, 1);

    const pastDeadline =
      currentPeriod > graceDeadlinePeriod ||
      (currentPeriod === graceDeadlinePeriod && day > GRACE_PERIOD_DAY);

    if (pastDeadline) {
      results.push({
        student_plan_id: row.id,
        overdue_period: status.overdue_period,
      });
    }
  }

  return results;
}

// Efectivamente da de baja (end_date = último día del mes vencido) a
// los planes que superaron la ventana de gracia. Devuelve el detalle
// de lo que hizo, útil tanto para el log del cron como para probarlo
// a mano y ver qué tocó.
export async function closeOverduePlansPastGracePeriod() {
  const candidates = await findPlansPastGracePeriod();

  const results = [];

  for (const { student_plan_id, overdue_period } of candidates) {
    const endDate = periodToDate(overdue_period, "end");

    await db.execute(`UPDATE student_plans SET end_date = ? WHERE id = ?`, [
      endDate,
      student_plan_id,
    ]);

    results.push({ student_plan_id, overdue_period, end_date: endDate });
  }

  return results;
}

/* =========================================================
PRIMER PERÍODO OBLIGADO (usa la cadena real, no solo esta fila)
========================================================= */
export async function getFirstObligatedPeriod(student_plan) {
  const chain = await resolveChain(student_plan);
  const { startPeriod, firstPaymentOption } = resolveChainOrigin(chain);

  return firstPaymentOption === "NEXT_MONTH"
    ? addMonths(startPeriod, 1)
    : startPeriod;
}

// Precio BASE esperado para un período de un student_plan, antes de
// aplicar el 15% de regularización si corresponde. Centraliza la
// regla de "media cuota" para que nunca se desincronice entre el
// cálculo de un pago normal, una regularización, o el "Debe" que se
// muestra en la ficha del alumno: si el período es justo la primera
// cuota obligada Y se eligió HALF, el precio base es la mitad
// del precio histórico de ese período. Para cualquier otro caso
// (incluida una regularización de un período que NO es el primero),
// el precio base es el precio histórico completo.
export async function getExpectedBaseAmount(student_plan, period) {
  const historicPrice = await getPlanPriceAtDate(
    student_plan.id,
    periodToDate(period, "end"),
  );

  if (historicPrice == null) return null;

  const chain = await resolveChain(student_plan);
  const { startPeriod, firstPaymentOption } = resolveChainOrigin(chain);

  const firstObligatedPeriod =
    firstPaymentOption === "NEXT_MONTH"
      ? addMonths(startPeriod, 1)
      : startPeriod;

  const isFirstPeriod = period === firstObligatedPeriod;

  if (isFirstPeriod && firstPaymentOption === "HALF") {
    return Math.round(historicPrice * 0.5 * 100) / 100;
  }

  return historicPrice;
}

export function periodToDate(period, position = "end") {
  const [year, month] = period.split("-").map(Number);

  if (position === "start") {
    return `${year}-${String(month).padStart(2, "0")}-01`;
  }

  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
}
