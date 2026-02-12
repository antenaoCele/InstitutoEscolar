import express from "express";
import { db } from "./db.js";
import {
  validateID,
  checkValidations,
  validateSchedules,
} from "./validations.js";
import { authentication } from "./auth.js";
// import { body } from "express-validator";

const router = express.Router();

// GET TODOS
router.get("/", authentication, async (req, res) => {
  const [rows] = await db.execute(`
    SELECT s.teacher_id AS teacher, s.start_time, s.end_time, s.days, s.id
    FROM schedules s
    JOIN teachers t ON s.teacher_id = t.id
  `);

  res.json({ success: true, schedules: rows });
});

// GET POR ID
router.get(
  "/:id",
  authentication,
  validateID,
  checkValidations,
  async (req, res) => {
    const id = Number(req.params.id);

    const [schedules] = await db.execute(
      `
      SELECT s.teacher_id AS teacher, s.start_time, s.end_time, s.days, s.id
      FROM schedules s
      JOIN teachers t ON s.teacher_id = t.id
      WHERE s.id = ?
    `,
      [id],
    );

    if (schedules.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Horario no encontrado" });
    }

    res.json({ success: true, data: schedules[0] });
  },
);

// CREAR
router.post(
  "/",
  authentication,
  validateSchedules,
  checkValidations,
  async (req, res) => {
    const { teacher_id, start_time, end_time, days } = req.body;

    const [result] = await db.execute(
      `INSERT INTO schedules (teacher_id, start_time, end_time, days)
       VALUES (?, ?, ?, ?)`,
      [teacher_id, start_time, end_time, days],
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        teacher_id,
        start_time,
        end_time,
        days,
      },
      message: "Horario creado exitosamente",
    });
  },
);

// EDITAR
router.put(
  "/:id",
  authentication,
  validateID,
  validateSchedules,
  checkValidations,
  async (req, res) => {
    const id = Number(req.params.id);
    const { teacher_id, start_time, end_time, days } = req.body;

    const [exists] = await db.execute("SELECT id FROM schedules WHERE id=?", [
      id,
    ]);
    if (exists.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Horario no encontrado" });
    }

    await db.execute(
      `UPDATE schedules
       SET teacher_id=?, start_time=?, end_time=?, days=?
       WHERE id=?`,
      [teacher_id, start_time, end_time, days, id],
    );

    res.json({
      success: true,
      data: { id, teacher_id, start_time, end_time, days },
    });
  },
);

// ELIMINAR
router.delete(
  "/:id",
  authentication,
  validateID,
  checkValidations,
  async (req, res) => {
    const id = Number(req.params.id);

    const [exists] = await db.execute("SELECT id FROM schedules WHERE id=?", [
      id,
    ]);
    if (exists.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Horario no encontrado" });
    }

    await db.execute("DELETE FROM schedules WHERE id=?", [id]);

    res.json({ success: true, message: "Horario eliminado correctamente" });
  },
);

export default router;
