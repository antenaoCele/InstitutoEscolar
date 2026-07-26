import { db } from "../db.js";
import { createCrudController } from "../utils/crudFactory.js";
import {
  getPlanPriceAtDate,
  existingPayment,
  existingRegularization,
  getStudentPlanStatus,
  getFirstObligatedPeriod,
  periodToDate,
} from "../services/payments.service.js";
import { needsEnrollment } from "../services/enrollments.service.js";

const baseController = createCrudController("payments");

function round2(value) {
  return Math.round(value * 100) / 100;
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
          p.payment_method
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
          p.payment_method
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
      const { student_plan_id, payment_date, payment_period, payment_method } =
        req.body;

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

      // Puede haber más de un período vencido a la vez (alumno que
      // sigue ACTIVE acumulando meses sin pagar sin que lo den de
      // baja). Cada uno se regulariza por separado.
      const overdueMatch = status.overdue_periods.find(
        (o) => o.period === payment_period,
      );

      const validTargets = [
        ...status.overdue_periods.map((o) => o.period),
        status.current_period?.period,
      ].filter(Boolean);

      if (!validTargets.includes(payment_period)) {
        return res.status(400).json({
          success: false,
          message:
            "El período indicado no corresponde a una obligación pendiente de este plan.",
        });
      }

      const isRegularization = Boolean(overdueMatch);

      // El student_plan_id efectivo puede ser distinto al que mandó
      // el frontend: si es regularización, SIEMPRE se registra contra
      // la fila que generó la deuda (aunque el alumno ya tenga otro
      // docente hoy), para que la comisión le quede al docente correcto.
      const effectiveStudentPlanId = isRegularization
        ? overdueMatch.student_plan_id
        : student_plan_id;

      let planPrice;
      let amount;

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

        const historicPrice = await getPlanPriceAtDate(
          effectiveStudentPlanId,
          periodToDate(payment_period, "end"),
        );

        if (historicPrice == null) {
          return res.status(400).json({
            success: false,
            message: "No existe un precio histórico para ese período.",
          });
        }

        planPrice = historicPrice;
        amount = round2(historicPrice * 1.15);
      } else {
        const currentPrice = await getPlanPriceAtDate(
          effectiveStudentPlanId,
          periodToDate(payment_period, "end"),
        );

        if (currentPrice == null) {
          return res.status(400).json({
            success: false,
            message: "No existe un precio para ese período.",
          });
        }

        planPrice = currentPrice;

        const firstObligatedPeriod = await getFirstObligatedPeriod(studentPlan);
        const isFirstPayment = payment_period === firstObligatedPeriod;

        if (isFirstPayment && studentPlan.first_payment_option === "HALF") {
          amount = round2(currentPrice * 0.5);
        } else {
          amount = currentPrice;
        }
      }

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
          payment_method
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          effectiveStudentPlanId,
          amount,
          planPrice,
          payment_date,
          payment_period,
          paymentType,
          payment_method,
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
          interest: round2(amount - planPrice),
          payment_date,
          payment_period,
          payment_type: paymentType,
          payment_method,
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
      const { student_plan_id, payment_date, payment_period, payment_method } =
        req.body;

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

      const overdueMatch = status.overdue_periods.find(
        (o) => o.period === newPaymentPeriod,
      );

      const validTargets = [
        ...status.overdue_periods.map((o) => o.period),
        status.current_period?.period,
        // Permitimos mantener el período que el pago ya tenía, aunque
        // ya no figure entre los "vigentes", para no romper una edición
        // menor (ej. cambiar método de pago) de un pago ya regularizado.
        rows[0].payment_period,
      ].filter(Boolean);

      if (!validTargets.includes(newPaymentPeriod)) {
        return res.status(400).json({
          success: false,
          message:
            "El período indicado no corresponde a una obligación pendiente de este plan.",
        });
      }

      const isRegularization = Boolean(overdueMatch);

      // Mismo criterio que en create(): la regularización se ata a la
      // fila que generó la deuda, no a la que se mandó desde el form.
      const effectiveStudentPlanId = isRegularization
        ? overdueMatch.student_plan_id
        : newStudentPlanId;

      let planPrice;
      let amount;

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

        const historicPrice = await getPlanPriceAtDate(
          effectiveStudentPlanId,
          periodToDate(newPaymentPeriod, "end"),
        );

        if (historicPrice == null) {
          return res.status(400).json({
            success: false,
            message: "No existe un precio histórico para ese período.",
          });
        }

        planPrice = historicPrice;
        amount = round2(historicPrice * 1.15);
      } else {
        const currentPrice = await getPlanPriceAtDate(
          effectiveStudentPlanId,
          periodToDate(newPaymentPeriod, "end"),
        );

        if (currentPrice == null) {
          return res.status(400).json({
            success: false,
            message: "No existe un precio para ese período.",
          });
        }

        planPrice = currentPrice;

        const firstObligatedPeriod = await getFirstObligatedPeriod(studentPlan);
        const isFirstPayment = newPaymentPeriod === firstObligatedPeriod;

        if (isFirstPayment && studentPlan.first_payment_option === "HALF") {
          amount = round2(currentPrice * 0.5);
        } else {
          amount = currentPrice;
        }
      }

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
          payment_method = ?
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
          interest: round2(amount - planPrice),
          payment_date: newPaymentDate,
          payment_period: newPaymentPeriod,
          payment_type: paymentType,
          payment_method: newPaymentMethod,
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
        p.name AS plan_name
      FROM student_plans sp
      JOIN plans p
        ON p.id = sp.plan_id
      WHERE sp.student_id = ?
      AND sp.end_date IS NULL
      ORDER BY p.name
      `,
        [studentId],
      );

      res.json({
        success: true,
        data: rows,
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
