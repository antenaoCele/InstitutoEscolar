import express from "express";
import { db } from "./db.js";
import {
  checkValidations,
  validateTeachersSubjects
} from "./validations.js";
import { authentication } from "./auth.js";

const router = express.Router();

router.get("/", authentication, async (req, res) => {
  let sql =
    "SELECT t.id, s.id \
    FROM teachers_subjects ts \
    JOIN teachers t ON ts.teacher_id = t.id \
    JOIN subjects s ON ts.subject_id = s.id";

  const [teachersSubjects] = await db.execute(sql);
  res.json({ success: true, teachersSubjects });
});

router.post(
  "/",
  authentication,
  validateTeachersSubjects,
  checkValidations,
  async (req, res) => {
    const { teacher_id, subject_id } = req.body;

    const [result] = await db.execute(
      "INSERT INTO teachers_subjects (teacher_id, subject_id) VALUES (?, ?)",
      [teacher_id, subject_id]
    );

    res.status(201).json({
      success: true,
      data: {
        teacher_id,
        subject_id,
      },
      message: "Materia asignada al docente exitosamente",
    });
  }
);

export default router;
