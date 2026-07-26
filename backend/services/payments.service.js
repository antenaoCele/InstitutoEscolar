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
Camina hacia atrás mientras encuentre una fila anterior (mismo
alumno + mismo plan) cuyo end_date coincida EXACTAMENTE con el
start_date de la fila siguiente (cambio de docente sin hueco
real). Si hay un hueco de calendario real (baja + vuelta meses
después), la cadena se corta ahí.

Devuelve un array ordenado de la fila más vieja a la más nueva
(incluye la fila que se pasó como parámetro al final).
========================================================= */
async function resolveChain(student_plan) {
  const chain = [
    {
      id: student_plan.id,
      start_date: student_plan.start_date,
      end_date: student_plan.end_date ?? null,
      first_payment_option: student_plan.first_payment_option,
    },
  ];

  let cursor = chain[0];

  // Límite de seguridad para evitar loops infinitos ante datos corruptos
  for (let i = 0; i < 50; i++) {
    const [prevRows] = await db.execute(
      `
      SELECT id, start_date, end_date, first_payment_option
      FROM student_plans
      WHERE student_id = ?
        AND plan_id = ?
        AND end_date = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      [student_plan.student_id, student_plan.plan_id, cursor.start_date],
    );

    if (!prevRows.length) break;

    cursor = prevRows[0];
    chain.unshift(cursor);
  }

  return chain;
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
ESTADO COMPLETO DE UN student_plan
(cuota vencida congelada + estado del período actual)
========================================================= */
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

  // Resolvemos la cadena completa (por si hubo cambios de docente sin
  // hueco de calendario) para no perder deuda vieja, y para saber en
  // qué fila puntual se originó cada período (importante para que la
  // regularización se cobre al docente correcto, no al actual).
  const chain = await resolveChain(plan);
  const origin = chain[0];

  const startPeriod = toPeriod(origin.start_date);
  const firstObligatedPeriod =
    origin.first_payment_option === "NEXT_MONTH"
      ? addMonths(startPeriod, 1)
      : startPeriod;

  // Hasta qué período se escanea buscando deuda:
  // - INACTIVE: se congela en el mes de la baja, nunca avanza más.
  // - ACTIVE, día <= 20: hasta el mes ANTERIOR al actual (el actual
  //   todavía está en su plazo normal, se evalúa aparte).
  // - ACTIVE, día 21+: incluye también el mes actual, porque ya pasó
  //   su fecha límite y pasa a ser una cuota vencida más.
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

  // Buscamos TODOS los períodos impagos del rango (no solo el más
  // viejo): si el alumno sigue ACTIVE sin que lo den de baja mientras
  // acumula varios meses sin pagar, cada uno de esos meses es una
  // cuota vencida real y se regulariza por separado, con el precio
  // histórico de SU propio período.
  const overduePeriods = [];
  if (periodLTE(firstObligatedPeriod, scanEndPeriod)) {
    let cursor = firstObligatedPeriod;
    while (periodLTE(cursor, scanEndPeriod)) {
      if (!paidPeriods.has(cursor)) {
        overduePeriods.push({
          period: cursor,
          student_plan_id: findOwnerId(chain, cursor),
        });
      }
      cursor = addMonths(cursor, 1);
    }
  }

  const result = {
    student_plan_id: plan.id,
    academic_status: isActive ? "ACTIVE" : "INACTIVE",
    account_status: overduePeriods.length ? "OVERDUE" : "CURRENT",
    overdue_periods: overduePeriods,
    current_period: null,
  };

  if (isActive) {
    if (currentPeriod < firstObligatedPeriod) {
      // Eligió "empezar el próximo mes" y todavía estamos en el mes
      // de alta: no hay ninguna obligación de pago este mes.
      result.current_period = { period: currentPeriod, status: "not_due_yet" };
    } else if (day > 20) {
      // El mes actual ya se evaluó dentro del escaneo de arriba: si
      // no estaba pago, ya quedó adentro de overduePeriods. Si sí
      // está pago, lo reflejamos acá.
      if (paidPeriods.has(currentPeriod)) {
        result.current_period = { period: currentPeriod, status: "paid" };
      }
    } else if (overduePeriods.length) {
      // Hay deuda de meses anteriores, pero el mes actual todavía
      // está dentro de su plazo normal (día <= 20): queda en espera.
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
PRIMER PERÍODO OBLIGADO (usa la cadena real, no solo esta fila)
========================================================= */
export async function getFirstObligatedPeriod(student_plan) {
  const chain = await resolveChain(student_plan);
  const origin = chain[0];
  const startPeriod = toPeriod(origin.start_date);

  return origin.first_payment_option === "NEXT_MONTH"
    ? addMonths(startPeriod, 1)
    : startPeriod;
}

export function periodToDate(period, position = "end") {
  const [year, month] = period.split("-").map(Number);

  if (position === "start") {
    return `${year}-${String(month).padStart(2, "0")}-01`;
  }

  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
}
