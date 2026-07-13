import { db } from "../db.js";
import { createCrudController } from "../utils/crudFactory.js";
import { calculatePaymentAmount } from "../utils/paymentUtils.js";
import {
  getPlanPriceAtDate,
  existingPayment,
} from "../services/payments.service.js";
import { needsEnrollment } from "../services/enrollments.service.js";

const baseController = createCrudController("payments");

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
          sp.id AS student_plan_id,
          sp.plan_id,
          sp.teacher_id
        FROM payments p
        JOIN student_plans sp ON p.student_plan_id = sp.id
        WHERE sp.student_id = ?
        ORDER BY p.payment_date DESC
        `,
        [id],
      );

      res.json({
        success: true,
        total_payments: rows.length,
        data: rows,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener los registros",
      });
    }
  },

  create: async (req, res) => {
    try {
      const { student_plan_id, payment_date, payment_method } = req.body;

      // Obtener estudiante asociado al plan
      const [studentRows] = await db.execute(
        `
      SELECT student_id
      FROM student_plans
      WHERE id = ?
      `,
        [student_plan_id],
      );

      if (studentRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Plan del estudiante no encontrado",
        });
      }

      const studentId = studentRows[0].student_id;

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

      // Obtener precio vigente del plan
      const planPrice = await getPlanPriceAtDate(student_plan_id, payment_date);

      if (!planPrice) {
        return res.status(400).json({
          success: false,
          message: "No existe un precio para esa fecha",
        });
      }

      // Verificar si ya pagó ese mes
      if (await existingPayment(student_plan_id, payment_date)) {
        return res.status(400).json({
          success: false,
          message: "El estudiante ya pagó este mes",
        });
      }

      // Calcular monto e interés
      const { total, interest } = calculatePaymentAmount(
        planPrice,
        payment_date,
      );

      const amount = total;

      // Registrar pago
      const [result] = await db.execute(
        `
      INSERT INTO payments
      (
        student_plan_id,
        amount,
        plan_price,
        payment_date,
        payment_method
      )
      VALUES (?, ?, ?, ?, ?)
      `,
        [student_plan_id, amount, planPrice, payment_date, payment_method],
      );

      res.status(201).json({
        success: true,
        data: {
          id: result.insertId,
          student_plan_id,
          amount,
          plan_price: planPrice,
          interest,
          payment_date,
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
      const { student_plan_id, payment_date, payment_method } = req.body;

      // Crear nuevas variables
      const [rows] = await db.execute("SELECT * FROM payments WHERE id = ?", [
        id,
      ]);

      const newStudentPlanId = student_plan_id ?? rows[0].student_plan_id;
      const newPaymentDate = payment_date ?? rows[0].payment_date;
      const newPaymentMethod = payment_method ?? rows[0].payment_method;

      // 1. Obtener precio del plan vigente
      const planPrice = await getPlanPriceAtDate(
        newStudentPlanId,
        newPaymentDate,
      );

      if (!planPrice) {
        return res.status(400).json({
          success: false,
          message: "No existe un precio para esa fecha",
        });
      }

      // 2. Verificar si ya pagó ese mes
      if (await existingPayment(newStudentPlanId, newPaymentDate, id)) {
        return res.status(400).json({
          success: false,
          message: "El estudiante ya pagó este mes",
        });
      }

      // 3. Calcular monto e interés automáticamente
      const { total, interest } = calculatePaymentAmount(
        planPrice,
        newPaymentDate,
      );

      const amount = total;

      // 4. Actualizar pago
      await db.execute(
        `
  UPDATE payments SET
   student_plan_id = ?,
   amount = ?,
   plan_price = ?,
   payment_date = ?,
   payment_method = ?
  WHERE id = ?
  `,
        [
          newStudentPlanId,
          amount,
          planPrice,
          newPaymentDate,
          newPaymentMethod,
          id,
        ],
      );

      res.status(200).json({
        success: true,
        data: {
          id,
          student_plan_id: newStudentPlanId,
          amount,
          plan_price: planPrice,
          interest,
          payment_date: newPaymentDate,
          payment_method: newPaymentMethod,
        },
      });
    } catch (error) {
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
      res.status(500).json({
        success: false,
        message: "Error al obtener planes activos",
      });
    }
  },
};
