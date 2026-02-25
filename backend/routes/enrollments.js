import express from "express";
import { db } from "../db.js";
import { authentication, authorization } from "./auth.js";

const router = express.Router();

//GET
router.get("/", authentication, authorization("ADMIN"), async (req, res) => {
  try {
    const [payments] = await db.execute(`
    SELECT 
      e.id,
      e.amount,
      e.student_id,
      e.payment_date,
      s.student_id,
      s.first_name,
      s.last_name  
    FROM enrollments e
    JOIN student s ON e.student_id = s.id
  `);

    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener inscripciones",
    });
  }
});

//GET POR ID
router.get("/:id", authentication, authorization("ADMIN"), async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [rows] = await db.execute(
      `
      SELECT 
      e.id,
      e.amount,
      e.student_id,
      e.payment_date,
      s.student_id,
      s.first_name,
      s.last_name  
    FROM enrollments e
    JOIN student s ON e.student_id = s.id
    WHERE e.id = ?
    `,
      [id],
    );

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener la inscripcion",
    });
  }
});

//POST
router.post("/", authentication, authorization("ADMIN"), async (req, res) => {
  try {
    const { student_id, amount, payment_date } = req.body;

    const [result] = await db.execute(
      "INSERT INTO enrollments (student_id, amount, payment_date) VALUES (?,?,?)",
      [student_id, amount, payment_date],
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        student_id,
        amount,
        payment_date,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al crear el pago de la inscripcion",
    });
  }
});

router.put("/:id", authentication, authorization("ADMIN"), async (req, res) => {
  try {
    const { student_id, amount, payment_date } = req.body;
    const id = Number(req.params.id);

    const [enrollment] = await db.execute(
      "SELECT * FROM enrollments WHERE id=?",
      [id],
    );

    const newStudentId = student_id ?? enrollment[0].student_id;
    const newAmount = amount ?? enrollment[0].amount;
    const newPaymentDate = payment_date ?? enrollment[0].payment_date;

    await db.execute(
      "UPDATE enrollments SET student_id=?, amount=?, payment_date=? WHERE id=?",
      [newStudentId, newAmount, newPaymentDate, id],
    );

    res.json({
      success: true,
      data: {
        id: Number(id),
        student_id: newStudentId,
        payment_date: newPaymentDate,
        amount: newAmount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar la inscripcion",
    });
  }
});

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      await db.execute("DELETE FROM enrollments WHERE id=?", [id]);

      res.json({
        success: true,
        message: "inscripcion eliminada correctamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar el pago de la inscripcion",
      });
    }
  },
);

export default router;
