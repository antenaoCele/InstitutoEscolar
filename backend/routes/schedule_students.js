import express from "express";
import { db } from "../db.js";
import {
  validateScheduleStudents,
  validateEditScheduleStudents,
} from "../validators/validations.js";
import { checkValidations, validateID } from "../validators/helpers.js";
import { authentication, authorization } from "./auth.js";

const router = express.Router();

router.get("/", authentication, async (req, res) => {
  try {
    let sql =
      "SELECT sc.id, sc.id AS schedule_id, st.id AS student_id \
      FROM schedule_students ss \
      JOIN schedules sc ON ss.schedule_id = sc.id \
      JOIN students st ON ss.student_id = st.id";

    const [scheduleStudents] = await db.execute(sql);
    res.json({ success: true, scheduleStudents });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener horarios de los estudiantes",
    });
  }
});

router.get(
  "/:id",
  authentication,
  validateID("schedule_students"),
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const [rows] = await db.execute(
        `SELECT ss.id, ss.schedule_id, ss.student_id, 
        st.first_name AS student_first_name, st.last_name AS student_last_name,
        sc.start_time, sc.end_time
        FROM schedule_students ss
        JOIN schedules sc ON ss.schedule_id = sc.id
        JOIN students st ON ss.student_id = st.id
        WHERE ss.id = ?`,
        [id],
      );

      res.json({ success: true, data: rows[0] });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener el horario del estudiante",
      });
    }
  },
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validateScheduleStudents,
  checkValidations,
  async (req, res) => {
    try {
      const { schedule_id, student_id } = req.body;
      await db.execute(
        "INSERT INTO schedule_students (schedule_id, student_id) VALUES (?, ?)",
        [schedule_id, student_id],
      );

      res.status(201).json({
        success: true,
        data: {
          schedule_id,
          student_id,
        },
        message: "Horario asignado al estudiante exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al asignar el horario al estudiante",
      });
    }
  },
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID("schedule_students"),
  validateEditScheduleStudents,
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { schedule_id, student_id } = req.body;

      const [scheduleStudents] = await db.execute(
        "SELECT * FROM schedule_students WHERE id = ?",
        [id],
      );

      const newScheduleId = schedule_id ?? scheduleStudents[0].schedule_id;
      const newStudentId = student_id ?? scheduleStudents[0].student_id;

      await db.execute(
        "UPDATE schedule_students SET schedule_id = ?, student_id = ? WHERE id = ?",
        [newScheduleId, newStudentId, id],
      );

      res.json({
        success: true,
        data: {
          id,
          schedule_id: newScheduleId,
          student_id: newStudentId,
        },
        message: "Registro actualizado exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar el horario del estudiante",
      });
    }
  },
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID("schedule_students"),
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      await db.execute("DELETE FROM schedule_students WHERE id = ?", [id]);

      res.json({ success: true, message: "Registro eliminado exitosamente." });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar el horario del estudiante",
      });
    }
  },
);

export default router;
