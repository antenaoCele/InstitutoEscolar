import express from "express";
import { db } from "./db.js";
import { validateEditSchedules, validateSchedules } from "./validations.js";
import { validateID, checkValidations } from "./helpers.js";
import { authentication, authorization } from "./auth.js";

const router = express.Router();

router.get("/", authentication, async (req, res) => {
  try {
    const [rows] = await db.execute(`
    SELECT s.id, s.teacher_id AS teacher, s.start_time, s.end_time, s.monday, s.tuesday, s.wednesday, s.thursday, s.friday, s.saturday
    FROM schedules s
    JOIN teachers t ON s.teacher_id = t.id
  `);

    res.json({ success: true, schedules: rows });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener los horarios",
    });
  }
});

router.get(
  "/:id",
  authentication,
  validateID("schedules"),
  checkValidations,
  async (req, res) => {
    try {
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

      res.json({ success: true, data: schedules[0] });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener el horario",
      });
    }
  },
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validateSchedules,
  checkValidations,
  async (req, res) => {
    try {
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
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al crear el horario",
      });
    }
  },
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID("schedules"),
  validateEditSchedules,
  checkValidations,
  async (req, res) => {
    try {
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

      const newTeacherId = teacher_id ?? exists[0].teacher_id;
      const newStartTime = start_time ?? exists[0].start_time;
      const newEndTime = end_time ?? exists[0].end_time;
      const newMonday = monday ?? exists[0].monday;
      const newTuesday = tuesday ?? exists[0].tuesday;
      const newWednesday = wednesday ?? exists[0].wednesday;
      const newThursday = thursday ?? exists[0].thursday;
      const newFriday = friday ?? exists[0].friday;
      const newSaturday = saturday ?? exists[0].saturday;

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
          newTeacherId,
          newStartTime,
          newEndTime,
          newMonday,
          newTuesday,
          newWednesday,
          newThursday,
          newFriday,
          newSaturday,
          id,
        ],
      );

      res.json({
        success: true,
        data: {
          id,
          teacher_id: newTeacherId,
          start_time: newStartTime,
          end_time: newEndTime,
          monday: newMonday,
          tuesday: newTuesday,
          wednesday: newWednesday,
          thursday: newThursday,
          friday: newFriday,
          saturday: newSaturday,
        },
        message: "Horario actualizado correctamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar el horario",
      });
    }
  },
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID("schedules"),
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      await db.execute("DELETE FROM schedules WHERE id=?", [id]);

      res.json({ success: true, message: "Horario eliminado correctamente" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar el horario",
      });
    }
  },
);

export default router;
