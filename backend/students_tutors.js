import express from "express";
import { db } from "./db.js";
import {
  checkValidations,
  validateStudentsTutors
} from "./validations.js";
import { authentication } from "./auth.js";

const router = express.Router();

router.get("/", authentication, async (req, res) => {
  let sql =
    "SELECT s.id, t.id \
    FROM students_tutors st \
    JOIN students s ON st.student_id = s.id \
    JOIN tutors t ON st.tutor_id = t.id";

  const [studentsTutors] = await db.execute(sql);
  res.json({ success: true, studentsTutors });
});

router.post(
  "/",
  authentication,
  validateStudentsTutors,
  checkValidations,
  async (req, res) => {
    const { student_id, tutor_id } = req.body;

    const [result] = await db.execute(
      "INSERT INTO students_tutors (student_id, tutor_id) VALUES (?, ?)",
      [student_id, tutor_id]
    );

    res.status(201).json({
      success: true,
      data: {
        student_id,
        tutor_id,
      },
      message: "Tutor asignado al estudiante exitosamente",
    });
  }
);

export default router;
