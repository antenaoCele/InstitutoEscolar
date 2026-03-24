import { db } from "../db.js";
import { createCrudController } from "../utils/crudFactory.js";
import {
  calculatePaymentAmount,
  getPlanPriceAtDate,
} from "../utils/paymentUtils.js";

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
      const { student_plan_id, amount, payment_date, payment_method } =
        req.body;

      // 1. Obtener precio del plan vigente)
      const planPrice = await getPlanPriceAtDate(student_plan_id, payment_date);

      // 2. Verificar si ya pagó ese mes
      const paymentDateObj = new Date(payment_date);
      const yearMonth = paymentDateObj.toISOString().slice(0, 7);

      const [existingPayment] = await db.execute(
        `
      SELECT id
      FROM payments
      WHERE student_plan_id = ?
      AND DATE_FORMAT(payment_date, '%Y-%m') = ?
      `,
        [student_plan_id, yearMonth],
      );

      if (existingPayment.length > 0) {
        return res.status(400).json({
          success: false,
          message: "El alumno ya pagó este mes",
        });
      }

      // 3. Calcular interes del pago
      const { total, interest } = calculatePaymentAmount(
        planPrice,
        payment_date,
      );

      // 4. Validar monto exacto
      const roundedTotal = Math.round(total * 100) / 100;
      const roundedAmount = Math.round(Number(amount) * 100) / 100;

      if (roundedAmount !== roundedTotal) {
        return res.status(400).json({
          success: false,
          message: `El monto debe ser exactamente ${roundedTotal}`,
        });
      }

      // 4. Insertar pago
      const [result] = await db.execute(
        `
      INSERT INTO payments
      (student_plan_id, amount, plan_price, payment_date, payment_method)
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
      res.status(500).json({
        success: false,
        message: "Error al crear el pago",
      });
    }
  },

  update: async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { student_plan_id, amount, payment_date, payment_method } =
        req.body;

      // Crear nuevas variables
      const [rows] = await db.execute("SELECT * FROM payments WHERE id = ?", [
        id,
      ]);

      const newStudentPlanId = student_plan_id ?? rows[0].student_plan_id;
      const newAmount = amount ?? rows[0].amount;
      const newPaymentDate = payment_date ?? rows[0].payment_date;
      const newPaymentMethod = payment_method ?? rows[0].payment_method;

      // 1. Obtener precio del plan vigente
      const planPrice = await getPlanPriceAtDate(student_plan_id, payment_date);

      // // 2. Verificar si ya pagó ese mes VER COMO SE HARIA EN UPDATE
      // const paymentDateObj = new Date(payment_date);
      // const yearMonth = paymentDateObj.toISOString().slice(0, 7);

      // const [existingPayment] = await db.execute(
      //   `
      // SELECT id
      // FROM payments
      // WHERE student_plan_id = ?
      // AND DATE_FORMAT(payment_date, '%Y-%m') = ?
      // `,
      //   [student_plan_id, yearMonth],
      // );

      // if (existingPayment.length > 0) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "El alumno ya pagó este mes",
      //   });
      // }

      const { total, interest } = calculatePaymentAmount(
        planPrice,
        payment_date,
      );

      const roundedTotal = Math.round(total * 100) / 100;
      const roundedAmount = Math.round(Number(amount) * 100) / 100;

      // 3. Validar monto exacto
      if (roundedAmount !== roundedTotal) {
        return res.status(400).json({
          success: false,
          message: `El monto debe ser exactamente ${roundedTotal}`,
        });
      }

      // 4. Actualizar pago
      const [result] = await db.execute(
        `
      UPDATE payments
      (student_plan_id, amount, plan_price, payment_date, payment_method)
      VALUES (?, ?, ?, ?, ?)
      WHERE id = ?
      `,
        [
          newStudentPlanId,
          newAmount,
          planPrice,
          newPaymentDate,
          newPaymentMethod,
          id,
        ],
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
      res.status(500).json({
        success: false,
        message: "Error al editar el pago",
      });
    }
  },
};
