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
    const {plan_id, subject_id} = req.body;

    const [result] = await db.execute(
      "INSERT INTO plan_subjects (plan_id, subject_id) VALUES (?, ?)",
      [plan_id, subject_id]
    );

    res.status(201).json({
      success: true,
      data: {
        plan_id,
        subject_id,
      },
      message: "Materia asignada al plan exitosamente",
    });
  }
);

export default router;