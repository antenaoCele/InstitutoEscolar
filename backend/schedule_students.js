import express from "express";
import { db } from "./db.js";
import { checkValidations, validateScheduleStudents } from "./validations.js";
import { authentication } from "./auth.js";

const router = express.Router();

router.get("/", authentication, async (req, res) => {
  let sql =
    "SELECT sc.id AS schedule_id, st.id AS student_id \
FROM schedule_students ss \
JOIN schedules sc ON ss.schedule_id = sc.id \
JOIN students st ON ss.student_id = st.id";

  const [scheduleStudents] = await db.execute(sql);
  res.json({ success: true, scheduleStudents });
});

router.post(
  "/",
  authentication,
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

export default router;
