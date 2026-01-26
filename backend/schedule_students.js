import express from "express";
import { db } from "./db.js";
import {
  checkValidations,
  validateID,
  validateSubjects,
  validateEditSubjects
} from "./validations.js";
import { authentication } from "./auth.js";

const router = express.Router();

router.get("/", authentication, async (req, res) => {
  let sql =
"SELECT sc.id AS schedule_id, st.id AS student_id \
FROM schedule_students ss \
JOIN schedules sc ON ss.schedule_id = sc.id \
JOIN students st ON ss.student_id = st.id";

  const [schedulesSubjects] = await db.execute(sql);
  res.json({ success: true, schedulesSubjects });
});

router.post(
  "/",
  authentication,
  validateSubjects,
  checkValidations,
  async (req, res) => {
    const { schedule_id, student_id } = req.body;

    const [schedule] = await db.execute(
      "SELECT id FROM schedules WHERE id = ?",
      [schedule_id]
    );

    if (schedule.length === 0) {
      return res.status(400).json({
        success: false,
        message: "El horario no existe",
      });
    }

    const [student] = await db.execute(
      "SELECT id FROM students WHERE id = ?",
      [student_id]
    );

    if (student.length === 0) {
      return res.status(400).json({
        success: false,
        message: "El estudiante no existe",
      });
    }

    await db.execute(
      "INSERT INTO schedule_students (schedule_id, student_id) VALUES (?, ?)",
      [schedule_id, student_id]
    );

    res.status(201).json({
      success: true,
      data: {
        schedule_id,
        student_id,
      },
      message: "Horario asignado al estudiante exitosamente",
    });
  }
);


export default router;