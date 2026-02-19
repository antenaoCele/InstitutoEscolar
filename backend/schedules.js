import express from "express";
import { db } from "./db.js";
import {
  validateID,
  checkValidations,
  validateSchedules,
} from "./validations.js";
import { authentication, authorization } from "./auth.js";

const router = express.Router();

router.get("/", authentication, async (req, res) => {
  const [rows] = await db.execute(`
    SELECT s.id, s.teacher_id AS teacher, s.start_time, s.end_time, s.monday, s.tuesday, s.wednesday, s.thursday, s.friday, s.saturday
    FROM schedules s
    JOIN teachers t ON s.teacher_id = t.id
  `);

  res.json({ success: true, schedules: rows });
});

router.get(
  "/:id",
  authentication,
  validateID,
  checkValidations,
  async (req, res) => {
    const id = Number(req.params.id);

    const [schedules] = await db.execute(
      `
      SELECT s.id, s.teacher_id AS teacher, s.start_time, s.end_time, s.monday, s.tuesday, s.wednesday, s.thursday, s.friday, s.saturday
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

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validateSchedules,
  checkValidations,
  async (req, res) => {
    const {
      teacher_id,
      start_time,
      end_time,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
    } = req.body;

    const [result] = await db.execute(
      `INSERT INTO schedules 
       (teacher_id, start_time, end_time, monday, tuesday, wednesday, thursday, friday, saturday)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        teacher_id,
        start_time,
        end_time,
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
      ],
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        teacher_id,
        start_time,
        end_time,
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
      },
      message: "Horario creado exitosamente",
    });
  },
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID,
  validateSchedules,
  checkValidations,
  async (req, res) => {
    const id = Number(req.params.id);

    const {
      teacher_id,
      start_time,
      end_time,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
    } = req.body;

    const [exists] = await db.execute("SELECT id FROM schedules WHERE id = ?", [
      id,
    ]);

    if (exists.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Horario no encontrado",
      });
    }

    await db.execute(
      `UPDATE schedules
       SET teacher_id = ?,
           start_time = ?,
           end_time = ?,
           monday = ?,
           tuesday = ?,
           wednesday = ?,
           thursday = ?,
           friday = ?,
           saturday = ?
       WHERE id = ?`,
      [
        teacher_id,
        start_time,
        end_time,
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
        id,
      ],
    );

    res.json({
      success: true,
      data: {
        id,
        teacher_id,
        start_time,
        end_time,
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
      },
      message: "Horario actualizado correctamente",
    });
  },
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
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
