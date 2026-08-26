import { db } from "../db.js";
import { createCrudController } from "../utils/crudFactory.js";
import {
  existingPayment,
  existingRegularization,
  getStudentPlanStatus,
  getExpectedBaseAmount,
  SURCHARGE_RATE,
} from "../services/payments.service.js";
import { needsEnrollment } from "../services/enrollments.service.js";

const baseController = createCrudController("payments");

const MAX_NOTE_LENGTH = 200;

function round2(value) {
  return Math.round(value * 100) / 100;
}

// =====================================================
// MONTO A COBRAR + NOTA
//
// El monto efectivamente cobrado puede ser menor al esperado
// (perdonar el recargo por mora es una decisión real del negocio),
// pero dentro de una ventana cerrada:
//
//   base <= amount <= base * (1 + recargo)
//
// El piso evita cobrar de menos "sin querer" y el techo evita
// cobrar de más, que no tiene ninguna justificación y ensuciaría
// la liquidación docente (que se calcula sobre lo cobrado).
//
// Si el monto difiere del esperado, la nota es OBLIGATORIA: es la
// única traza de por qué esa cuota se cobró distinto. Y si NO
// difiere, la nota se fuerza a null para que nunca quede una
// explicación colgada de una diferencia inexistente.
//
// OJO: esto NO cambia el payment_type. Una regularización cobrada
// sin recargo sigue siendo REGULARIZATION — el tipo describe
// CUÁNDO se pagó (fuera de término), no cuánto se cobró. Si se
// degradara a NORMAL se rompería existingRegularization().
// =====================================================
function resolveAmountAndNote({
  rawAmount,
  rawNote,
  baseAmount,
  expectedAmount,
}) {
  const base = round2(baseAmount);
  const expected = round2(expectedAmount);

  let amount;

  if (rawAmount === undefined || rawAmount === null || rawAmount === "") {
    // Sin monto explícito: se cobra lo que corresponde.
    amount = expected;
  } else {
    amount = Number(rawAmount);
  }

  if (!Number.isFinite(amount)) {
    return { error: "El monto a cobrar no es un número válido." };
  }

  amount = round2(amount);

  if (amount < base) {
    return {
      error: `El monto a cobrar no puede ser menor al precio del plan ($${base}).`,
    };
  }

  if (amount > expected) {
    return {
      error: `El monto a cobrar no puede ser mayor al monto a abonar ($${expected}).`,
    };
  }

  const differs = amount !== expected;
  const note = String(rawNote ?? "").trim();

  if (differs && !note) {
    return {
      error: "Debe indicar el motivo de la diferencia de monto.",
    };
  }

  if (note.length > MAX_NOTE_LENGTH) {
    return {
      error: `El motivo no puede superar los ${MAX_NOTE_LENGTH} caracteres.`,
    };
  }

  return { amount, note: differs ? note : null };
}

export const paymentsController = {
  ...baseController,

  getAll: async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT 
          p.id,
          sp.id AS student_plan_id,
          sp.student_id,
          sp.teacher_id,
          p.amount,
          p.plan_price,
          (p.amount - p.plan_price) AS interest,
          p.payment_date,
          p.payment_period,
          p.payment_type,
          p.payment_method,
          p.note
        FROM payments p
        JOIN student_plans sp ON p.student_plan_id = sp.id
        ORDER BY p.id DESC
      `);

      res.json({
        success: true,
        total: rows.length,
        data: rows,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error al obtener los registros",
      });
    }
  },

  getById: async (req, res) => {
    try {
      const id = Number(req.params.id);

      const [rows] = await db.execute(
        `
        SELECT 
          p.id,
          sp.id AS student_plan_id,
          sp.student_id,
          sp.teacher_id,
          p.amount,
          p.plan_price,
          (p.amount - p.plan_price) AS interest,
          p.payment_date,
          p.payment_period,
          p.payment_type,
          p.payment_method,
          p.note
        FROM payments p
        JOIN student_plans sp ON p.student_plan_id = sp.id
        WHERE p.id = ?
        `,
        [id],
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Registro no encontrado",
        });
      }

      res.json({
        success: true,
        data: rows[0],
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error al obtener el registro",
      });
    }
  },

  getPaymentsByStudent: async (req, res) => {
    try {
      const id = Number(req.params.id);

      const [rows] = await db.execute(
        `
        SELECT 
          p.id AS payment_id,
          p.amount,
          p.plan_price,
          (p.amount - p.plan_price) AS interest,
          p.payment_method,
          p.payment_date,
          p.payment_period,
          p.payment_type,
          p.note,
          sp.id AS student_plan_id,
          sp.plan_id,
          sp.teacher_id
        FROM payments p
        JOIN student_plans sp ON p.student_plan_id = sp.id
        WHERE sp.student_id = ?
        ORDER BY p.payment_period DESC, p.payment_date DESC
        `,
        [id],
      );

      res.json({
        success: true,
        total_payments: rows.length,
        data: rows,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error al obtener los registros",
      });
    }
  },

  // =====================================================
  // CHEQUEO DE DUPLICADO (informativo, NO bloquea)
  // El frontend lo llama antes de confirmar el pago para
  // mostrar la advertencia. El create() nunca rechaza por esto.
  // =====================================================
  checkDuplicate: async (req, res) => {
    try {
      const { student_plan_id, payment_period, exclude_id } = req.query;

      if (!student_plan_id || !payment_period) {
        return res.status(400).json({
          success: false,
          message: "Faltan parámetros",
        });
      }

      const exists = await existingPayment(
        Number(student_plan_id),
        payment_period,
        exclude_id ? Number(exclude_id) : null,
      );

      res.json({ success: true, exists });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error al verificar el pago",
      });
    }
  },

  create: async (req, res) => {
    try {
      const {
        student_plan_id,
        payment_date,
        payment_period,
        payment_method,
        amount: rawAmount,
        note: rawNote,
      } = req.body;

      // Obtener el student_plan completo
      const [spRows] = await db.execute(
        `
        SELECT id, student_id, plan_id, start_date, first_payment_option
        FROM student_plans
        WHERE id = ?
        `,
        [student_plan_id],
      );

      if (spRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Plan del estudiante no encontrado",
        });
      }

      const studentPlan = spRows[0];
      const studentId = studentPlan.student_id;

      // Verificar si necesita una nueva inscripción
      if (await needsEnrollment(studentId, payment_date)) {
        return res.status(400).json({
          success: false,
          requiresEnrollment: true,
          student_id: studentId,
          message:
            "El estudiante debe realizar una nueva inscripción antes de registrar el pago.",
        });
      }

      // Estado actual del plan: qué período está vencido (si hay)
      // y cuál es el período "actual" habilitado para pago normal.
      const status = await getStudentPlanStatus(student_plan_id);

      if (!status) {
        return res.status(404).json({
          success: false,
          message: "No se pudo calcular el estado del plan",
        });
      }

      const validTargets = [
        status.overdue_period,
        status.current_period?.period,
      ].filter(Boolean);

      if (!validTargets.includes(payment_period)) {
        return res.status(400).json({
          success: false,
          message:
            "El período indicado no corresponde a una obligación pendiente de este plan.",
        });
      }

      const isRegularization = payment_period === status.overdue_period;

      // El student_plan_id efectivo puede ser distinto al que mandó
      // el frontend: si es regularización, SIEMPRE se registra contra
      // la fila que generó la deuda (aunque el alumno ya tenga otro
      // docente hoy), para que la comisión le quede al docente correcto.
      const effectiveStudentPlanId = isRegularization
        ? status.overdue_student_plan_id
        : student_plan_id;

      const baseAmount = await getExpectedBaseAmount(
        studentPlan,
        payment_period,
      );

      if (baseAmount == null) {
        return res.status(400).json({
          success: false,
          message: isRegularization
            ? "No existe un precio histórico para ese período."
            : "No existe un precio para ese período.",
        });
      }

      if (isRegularization) {
        // Una regularización por período: bloqueo real, no advertencia.
        if (
          await existingRegularization(effectiveStudentPlanId, payment_period)
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Ya existe una regularización registrada para ese período.",
          });
        }
      }

      // Lo que le CORRESPONDE abonar. El monto realmente cobrado sale
      // de resolveAmountAndNote() y puede ser menor (nunca mayor).
      const expectedAmount = isRegularization
        ? round2(baseAmount * (1 + SURCHARGE_RATE))
        : baseAmount;

      const resolved = resolveAmountAndNote({
        rawAmount,
        rawNote,
        baseAmount,
        expectedAmount,
      });

      if (resolved.error) {
        return res.status(400).json({
          success: false,
          message: resolved.error,
        });
      }

      const planPrice = baseAmount;
      const amount = resolved.amount;
      const note = resolved.note;

      const paymentType = isRegularization ? "REGULARIZATION" : "NORMAL";

      // Solo informativo, nunca bloquea
      const duplicateWarning = await existingPayment(
        effectiveStudentPlanId,
        payment_period,
      );

      const [result] = await db.execute(
        `
        INSERT INTO payments
        (
          student_plan_id,
          amount,
          plan_price,
          payment_date,
          payment_period,
          payment_type,
          payment_method,
          note
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          effectiveStudentPlanId,
          amount,
          planPrice,
          payment_date,
          payment_period,
          paymentType,
          payment_method,
          note,
        ],
      );

      res.status(201).json({
        success: true,
        duplicateWarning,
        data: {
          id: result.insertId,
          student_plan_id: effectiveStudentPlanId,
          amount,
          plan_price: planPrice,
          expected_amount: expectedAmount,
          interest: round2(amount - planPrice),
          payment_date,
          payment_period,
          payment_type: paymentType,
          payment_method,
          note,
        },
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Error al crear el pago",
      });
    }
  },

  update: async (req, res) => {
    try {
      const id = Number(req.params.id);
      const {
        student_plan_id,
        payment_date,
        payment_period,
        payment_method,
        amount: rawAmount,
        note: rawNote,
      } = req.body;

      const [rows] = await db.execute("SELECT * FROM payments WHERE id = ?", [
        id,
      ]);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Registro no encontrado",
        });
      }

      const newStudentPlanId = student_plan_id ?? rows[0].student_plan_id;
      const newPaymentDate = payment_date ?? rows[0].payment_date;
      const newPaymentPeriod = payment_period ?? rows[0].payment_period;
      const newPaymentMethod = payment_method ?? rows[0].payment_method;

      const [spRows] = await db.execute(
        `
        SELECT id, student_id, plan_id, start_date, first_payment_option
        FROM student_plans
        WHERE id = ?
        `,
        [newStudentPlanId],
      );

      if (spRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Plan del estudiante no encontrado",
        });
      }

      const studentPlan = spRows[0];

      const status = await getStudentPlanStatus(newStudentPlanId);

      if (!status) {
        return res.status(404).json({
          success: false,
          message: "No se pudo calcular el estado del plan",
        });
      }

      // Si el pago se reasigna a OTRO plan, deja de valer la excepción
      // del "período original": ese período pertenecía al plan viejo y
      // no dice nada sobre las obligaciones del plan nuevo. Sin esto se
      // podía reasignar un pago a un plan que ya estaba al día y
      // duplicarle la cuota del mes.
      const keepsSamePlan =
        Number(newStudentPlanId) === Number(rows[0].student_plan_id);

      const keepsSamePeriod = newPaymentPeriod === rows[0].payment_period;

      const validTargets = [
        status.overdue_period,
        status.current_period?.period,
        // Solo mientras se siga editando el MISMO plan: permite
        // corregir la fecha o el método de pago de un pago ya
        // registrado, aunque su período ya no figure como pendiente.
        keepsSamePlan ? rows[0].payment_period : null,
      ].filter(Boolean);

      if (!validTargets.includes(newPaymentPeriod)) {
        return res.status(400).json({
          success: false,
          message:
            "El período indicado no corresponde a una obligación pendiente de este plan.",
        });
      }

      // El tipo NO se puede deducir solo de status.overdue_period: cuando
      // se edita una regularización, esa deuda YA está paga (la pagó este
      // mismo pago), así que overdue_period vuelve null y el pago se
      // degradaba silenciosamente a NORMAL, perdiendo el 15% de recargo.
      // Cambiar la fecha de un pago le borraba el interés, alteraba el
      // total recaudado del mes y la comisión del docente.
      // Si no cambió ni el plan ni el período, se conserva el tipo original.
      const isRegularization =
        newPaymentPeriod === status.overdue_period ||
        (keepsSamePlan &&
          keepsSamePeriod &&
          rows[0].payment_type === "REGULARIZATION");

      // Mismo criterio que en create(): la regularización se ata a la
      // fila que generó la deuda, no a la que se mandó desde el form.
      // En una regularización PRESERVADA ya no hay overdue_student_plan_id
      // (la deuda está saldada), así que se mantiene la fila a la que el
      // pago ya apuntaba. Sin el ?? se escribía student_plan_id = NULL.
      const effectiveStudentPlanId = isRegularization
        ? (status.overdue_student_plan_id ?? newStudentPlanId)
        : newStudentPlanId;

      const baseAmount = await getExpectedBaseAmount(
        studentPlan,
        newPaymentPeriod,
      );

      if (baseAmount == null) {
        return res.status(400).json({
          success: false,
          message: isRegularization
            ? "No existe un precio histórico para ese período."
            : "No existe un precio para ese período.",
        });
      }

      if (isRegularization) {
        if (
          await existingRegularization(
            effectiveStudentPlanId,
            newPaymentPeriod,
            id,
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Ya existe una regularización registrada para ese período.",
          });
        }
      }

      const expectedAmount = isRegularization
        ? round2(baseAmount * (1 + SURCHARGE_RATE))
        : baseAmount;

      // Si el front no manda amount/note (ej. una edición parcial desde
      // otra pantalla), se conservan los del pago existente en vez de
      // recalcularlos: sin esto, entrar a corregir la FECHA de un pago
      // al que se le perdonó el recargo se lo volvía a sumar solo.
      // Si el período cambió, lo de antes ya no aplica y se recalcula.
      const keepsAmountContext = keepsSamePlan && keepsSamePeriod;

      const resolved = resolveAmountAndNote({
        rawAmount:
          rawAmount !== undefined
            ? rawAmount
            : keepsAmountContext
              ? rows[0].amount
              : undefined,
        rawNote:
          rawNote !== undefined
            ? rawNote
            : keepsAmountContext
              ? rows[0].note
              : undefined,
        baseAmount,
        expectedAmount,
      });

      if (resolved.error) {
        return res.status(400).json({
          success: false,
          message: resolved.error,
        });
      }

      const planPrice = baseAmount;
      const amount = resolved.amount;
      const note = resolved.note;

      const paymentType = isRegularization ? "REGULARIZATION" : "NORMAL";

      const duplicateWarning = await existingPayment(
        effectiveStudentPlanId,
        newPaymentPeriod,
        id,
      );

      await db.execute(
        `
        UPDATE payments SET
          student_plan_id = ?,
          amount = ?,
          plan_price = ?,
          payment_date = ?,
          payment_period = ?,
          payment_type = ?,
          payment_method = ?,
          note = ?
        WHERE id = ?
        `,
        [
          effectiveStudentPlanId,
          amount,
          planPrice,
          newPaymentDate,
          newPaymentPeriod,
          paymentType,
          newPaymentMethod,
          note,
          id,
        ],
      );

      res.status(200).json({
        success: true,
        duplicateWarning,
        data: {
          id,
          student_plan_id: effectiveStudentPlanId,
          amount,
          plan_price: planPrice,
          expected_amount: expectedAmount,
          interest: round2(amount - planPrice),
          payment_date: newPaymentDate,
          payment_period: newPaymentPeriod,
          payment_type: paymentType,
          payment_method: newPaymentMethod,
          note,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error al editar el pago",
      });
    }
  },

  getMonthlyPayments: async (req, res) => {
    try {
      const month = Number(req.query.month);
      const year = Number(req.query.year);

      const [rows] = await db.execute(
        `
      SELECT
        p.id,
        p.amount,
        p.plan_price,
        (p.amount - p.plan_price) AS interest,
        p.payment_date,
        p.payment_period,
        p.payment_type,
        p.payment_method,
        p.note,

        sp.id AS student_plan_id,

        s.id AS student_id,
        s.first_name,
        s.last_name,

        pl.name AS plan_name

      FROM payments p

      JOIN student_plans sp
        ON p.student_plan_id = sp.id

      JOIN students s
        ON sp.student_id = s.id

      JOIN plans pl
        ON sp.plan_id = pl.id

      WHERE MONTH(p.payment_date) = ?
      AND YEAR(p.payment_date) = ?

      ORDER BY p.payment_date DESC
      `,
        [month, year],
      );

      res.json({
        success: true,
        total: rows.length,
        data: rows,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error al obtener pagos mensuales",
      });
    }
  },

  getStudentActivePlans: async (req, res) => {
    try {
      const studentId = Number(req.params.studentId);

      const [rows] = await db.execute(
        `
      SELECT
        sp.id AS student_plan_id,
        sp.plan_id,
        p.name AS plan_name,
        sp.end_date
      FROM student_plans sp
      JOIN plans p
        ON p.id = sp.plan_id
      WHERE sp.student_id = ?
      ORDER BY p.name
      `,
        [studentId],
      );

      // Los planes activos se muestran siempre. Los inactivos SOLO se
      // muestran si todavía tienen deuda pendiente (para poder
      // regularizarla aunque el alumno ya no esté cursando ese plan),
      // etiquetados distinto para que no se confundan con el actual.
      const result = [];

      for (const row of rows) {
        const isActive = row.end_date === null;

        if (isActive) {
          result.push({
            student_plan_id: row.student_plan_id,
            plan_id: row.plan_id,
            plan_name: row.plan_name,
          });
          continue;
        }

        const status = await getStudentPlanStatus(row.student_plan_id);

        if (status?.overdue_period) {
          result.push({
            student_plan_id: row.student_plan_id,
            plan_id: row.plan_id,
            plan_name: `${row.plan_name} (de baja — debe ${status.overdue_period})`,
          });
        }
      }

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error al obtener planes activos",
      });
    }
  },
};
