import express from "express";
import { db } from "./db.js";
import {
  checkValidations,
  validateTeacherSubjects,
  validateID,
  validateEditTeacherSubjects,
} from "./validations.js";
import { authentication, authorization } from "./auth.js";

const router = express.Router();

router.get("/", authentication, authorization("ADMIN"), async (req, res) => {
  let sql =
    "SELECT ts.id, ts.teacher_id, ts.subject_id \
    FROM teacher_subjects ts \
    JOIN teachers t ON ts.teacher_id = t.id \
    JOIN subjects s ON ts.subject_id = s.id";

  const [teacherSubjects] = await db.execute(sql);
  res.json({ success: true, teacherSubjects });
});

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validateTeacherSubjects,
  checkValidations,
  async (req, res) => {
    const { teacher_id, subject_id } = req.body;

    const [result] = await db.execute(
      "INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES (?, ?)",
      [teacher_id, subject_id],
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        teacher_id,
        subject_id,
      },
      message: "Materia asignada al docente exitosamente",
    });
  },
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID,
  validateEditTeacherSubjects,
  checkValidations,
  async (req, res) => {
    const id = Number(req.params.id);

    const [rows] = await db.execute(
      "SELECT * FROM teachers_subjects WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Relación no encontrada." });
    }

    const { teacher_id, subject_id } = req.body;

    await db.execute(
      "UPDATE teacher_subjects SET teacher_id = ?, subject_id = ? WHERE id = ?",
      [teacher_id, subject_id, id],
    );

    res.json({
      success: true,
      data: {
        id,
        teacher_id,
        subject_id,
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

    const [rows] = await db.execute(
      "SELECT * FROM teacher_subjects WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Relación no encontrada." });
    }

    await db.execute("DELETE FROM teacher_subjects WHERE id = ?", [id]);

    res.json({ success: true, message: "Registro eliminado exitosamente." });
  },
);

export default router;
