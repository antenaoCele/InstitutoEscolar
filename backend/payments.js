//id, student_plan_id, amount, payment_method

import express from "express";
import { db } from "./db.js";
import { validatePayments } from "./validations.js";
import { validateID, checkValidations } from "./helpers.js";
import { authentication, authorization } from "./auth.js";

const router = express.Router();

//GET
router.get("/", authentication, authorization("ADMIN"), async (req, res) => {
  try {
    const [payments] = await db.execute(`
    SELECT 
      p.id,
      p.amount,
      p.payment_method,
      p.student_plan_id,
      p.payment_date,
      sp.student_id,
      sp.plan_id
    FROM payments p
    JOIN student_plans sp ON p.student_plan_id = sp.id
  `);

    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener pagos",
    });
  }
});

router.get(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID("payments"),
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const [rows] = await db.execute(
        `
      SELECT 
        p.id,
        p.amount,
        p.payment_method,
        p.student_plan_id,
        p.payment_date,
        sp.student_id,
        sp.plan_id
      FROM payments p
      JOIN student_plans sp ON p.student_plan_id = sp.id
      WHERE p.id = ?
    `,
        [id],
      );

      if (rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Pago no registrado" });
      }

      res.json({ success: true, data: rows[0] });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener el pago",
      });
    }
  },
);

//obtener todos los pagos de un alumno
router.get(
  "/students/:id/payments",
  authentication,
  validateID,
  checkValidations,
  async (req, res) => {
    try {
      const studentId = Number(req.params.id);

      const [student] = await db.execute(
        "SELECT id FROM students WHERE id = ?",
        [studentId],
      );

      if (student.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Alumno no encontrado",
        });
      }

      const [payments] = await db.execute(
        `
      SELECT 
        p.id AS payment_id,
        p.amount,
        p.payment_method,
        p.payment_date,
        p.student_plan_id,
        sp.plan_id
      FROM payments p
      JOIN student_plans sp ON p.student_plan_id = sp.id
      WHERE sp.student_id = ?
      ORDER BY p.id DESC
    `,
        [studentId],
      );

      res.json({
        success: true,
        total_payments: payments.length,
        payments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener los pagos del alumno",
      });
    }
  },
);

router.post(
  "/",
  authentication,
  validatePayments,
  checkValidations,
  async (req, res) => {
    try {
      const { student_plan_id, amount, payment_date, payment_method } =
        req.body;

      const [plan] = await db.execute(
        "SELECT id FROM student_plans WHERE id = ?",
        [student_plan_id],
      );

      if (plan.length === 0) {
        return res.status(400).json({
          success: false,
          error: "El student_plan_id no existe",
        });
      }

      const [result] = await db.execute(
        "INSERT INTO payments (student_plan_id, amount, payment_date, payment_method) VALUES (?,?, ?,?)",
        [student_plan_id, amount, payment_date, payment_method],
      );

      res.status(201).json({
        success: true,
        data: {
          id: result.insertId,
          student_plan_id,
          amount,
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
);

router.put(
  "/:id",
  authentication,
  validateID,
  validatePayments,
  checkValidations,
  async (req, res) => {
    try {
      const { student_plan_id, amount, payment_method, payment_date } =
        req.body;
      const id = Number(req.params.id);

      const [payment] = await db.execute("SELECT id FROM payments WHERE id=?", [
        id,
      ]);

      if (payment.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Pago no registrado" });
      }

      const newStudentPlanId = student_plan_id ?? payment[0].student_plan_id;
      const newAmount = amount ?? payment[0].amount;
      const newPaymentDate = payment_date ?? payment[0].payment_date;
      const newPaymentMethod = payment_method ?? payment[0].payment_method;

      await db.execute(
        "UPDATE payments SET student_plan_id=?, amount=?, payment_method=?, payment_date=? WHERE id=?",
        [newStudentPlanId, newAmount, newPaymentMethod, newPaymentDate, id],
      );

      res.json({
        success: true,
        data: {
          id: Number(id),
          student_plan_id: newStudentPlanId,
          payment_date: newPaymentDate,
          amount: newAmount,
          payment_method: newPaymentMethod,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar el pago",
      });
    }
  },
);

router.delete(
  "/:id",
  authentication,
  validateID,
  checkValidations,
  async (req, res) => {
    try {
      const { id } = req.params;

      const [rows] = await db.execute("SELECT * FROM payments WHERE id=?", [
        id,
      ]);

      if (rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Pago no encontrado" });
      }

      await db.execute("DELETE FROM payments WHERE id=?", [id]);

      res.json({ success: true, message: "Pago eliminado correctamente" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar el pago",
      });
    }
  },
);

export default router;
