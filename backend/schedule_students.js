import express from "express";
import { db } from "./db.js";
import {
  checkValidations,
  validateScheduleStudents,
  validateEditScheduleStudents,
  validateID,
} from "./validations.js";
import { authentication, authorization } from "./auth.js";

const router = express.Router();

router.get("/", authentication, async (req, res) => {
  let sql =
    "SELECT sc.id, sc.id AS schedule_id, st.id AS student_id \
FROM schedule_students ss \
JOIN schedules sc ON ss.schedule_id = sc.id \
JOIN students st ON ss.student_id = st.id";

  const [scheduleStudents] = await db.execute(sql);
  res.json({ success: true, scheduleStudents });
});

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validateScheduleStudents,
  checkValidations,
  async (req, res) => {
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
  },
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID,
  validateEditScheduleStudents,
  checkValidations,
  async (req, res) => {
    const id = Number(req.params.id);

    const [scheduleStudents] = await db.execute(
      "SELECT * FROM schedule_students WHERE id = ?",
      [id],
    );

    if (scheduleStudents.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Horario y estudiante no encontrados.",
      });
    }

    const { schedule_id, student_id } = req.body;

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

    const [scheduleStudents] = await db.execute(
      "SELECT * FROM schedule_students WHERE id = ?",
      [id],
    );

    if (scheduleStudents.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Horario y estudiante no encontrados.",
      });
    }

    await db.execute("DELETE FROM schedule_students WHERE id = ?", [id]);

    res.json({ success: true, message: "Registro eliminado exitosamente." });
  },
);

export default router;
