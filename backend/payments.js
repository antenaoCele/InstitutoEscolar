//id, student_plan_id, amount, payment_method

import express from "express";
import { db } from "./db.js";
import {
  validateID,
  checkValidations,
  validatePayments,
} from "./validations.js";
import { authentication, authorization } from "./auth.js";

const router = express.Router();

//GET
router.get("/", authentication, authorization("ADMIN"), async (req, res) => {
  const [payments] = await db.execute(`
    SELECT 
      p.id,
      p.amount,
      p.payment_method,
      p.student_plan_id,
      sp.student_id,
      sp.plan_id
    FROM payments p
    JOIN student_plans sp ON p.student_plan_id = sp.id
  `);

  res.json({ success: true, payments });
});

router.get(
  "/:id",
  authentication,
  validateID,
  checkValidations,
  async (req, res) => {
    const id = Number(req.params.id);

    const [rows] = await db.execute(
      `
      SELECT 
        p.id,
        p.amount,
        p.payment_method,
        p.student_plan_id,
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
  },
);

//obtener todos los pagos de un alumno
router.get(
  "/students/:id/payments",
  authentication,
  validateID,
  checkValidations,
  async (req, res) => {
    const studentId = Number(req.params.id);

    const [student] = await db.execute("SELECT id FROM students WHERE id = ?", [
      studentId,
    ]);

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
  },
);

router.post(
  "/",
  authentication,
  validatePayments,
  checkValidations,
  async (req, res) => {
    const { student_plan_id, amount, payment_date, payment_method } = req.body;

    //-----------------------------------
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
  },
);

router.put(
  "/:id",
  authentication,
  validateID,
  validatePayments,
  checkValidations,
  async (req, res) => {
    const { student_plan_id, amount, payment_method } = req.body;
    const id = Number(req.params.id);

    const [payment] = await db.execute("SELECT id FROM payments WHERE id=?", [
      id,
    ]);

    if (payment.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Pago no registrado" });
    }

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

    await db.execute(
      "UPDATE payments SET student_plan_id=?, amount=?, payment_method=? WHERE id=?",
      [student_plan_id, amount, payment_method, id],
    );

    res.json({
      success: true,
      data: { id, student_plan_id, amount, payment_method },
    });
  },
);

router.delete(
  "/:id",
  authentication,
  validateID,
  checkValidations,
  async (req, res) => {
    const { id } = req.params;

    const [rows] = await db.execute("SELECT * FROM payments WHERE id=?", [id]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Pago no encontrado" });
    }

    await db.execute("DELETE FROM payments WHERE id=?", [id]);

    res.json({ success: true, message: "Pago eliminado correctamente" });
  },
);

export default router;
