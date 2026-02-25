import express from "express";
import { db } from "../db.js";
import {
  validateTeacherSubjects,
  validateEditTeacherSubjects,
} from "../validators/validations.js";
import { validateID, checkValidations } from "../validators/helpers.js";
import { authentication, authorization } from "./auth.js";

const router = express.Router();

router.get("/", authentication, async (req, res) => {
  try {
    const [teacher_subjects] = await db.execute(`
      SELECT ts.id, ts.teacher_id, ts.subject_id, t.first_name, t.last_name, s.name as subject_name
      FROM teacher_subjects ts
      JOIN teachers t ON ts.teacher_id = t.id
      JOIN subjects s ON ts.subject_id = s.id
    `);
    res.json({ success: true, teacher_subjects });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener las asignaciones de materias",
    });
  }
});

router.get(
  "/:id",
  authentication,
  validateID("teacher_subjects"),
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const [rows] = await db.execute(
        `
        SELECT ts.id, ts.teacher_id, ts.subject_id, t.first_name, t.last_name, s.name as subject_name
        FROM teacher_subjects ts
        JOIN teachers t ON ts.teacher_id = t.id
        JOIN subjects s ON ts.subject_id = s.id
        WHERE ts.id = ?
        `,
        [id],
      );

      res.json({ success: true, data: rows[0] });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener la asignación",
      });
    }
  },
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validateTeacherSubjects,
  checkValidations,
  async (req, res) => {
    try {
      const { teacher_id, subject_id } = req.body;

      const [result] = await db.execute(
        "INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES (?, ?)",
        [teacher_id, subject_id],
      );

      res.status(201).json({
        success: true,
        data: { id: result.insertId, teacher_id, subject_id },
        message: "Materia asignada al docente exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al asignar la materia",
      });
    }
  },
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID("teacher_subjects"),
  validateEditTeacherSubjects,
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { teacher_id, subject_id } = req.body;

      const [rows] = await db.execute(
        "SELECT * FROM teacher_subjects WHERE id = ?",
        [id],
      );

      const newTeacherId = teacher_id ?? rows[0].teacher_id;
      const newSubjectId = subject_id ?? rows[0].subject_id;

      await db.execute(
        "UPDATE teacher_subjects SET teacher_id = ?, subject_id = ? WHERE id = ?",
        [newTeacherId, newSubjectId, id],
      );

      res.json({
        success: true,
        data: {
          id,
          teacher_id: newTeacherId,
          subject_id: newSubjectId,
        },
        message: "Asignación actualizada exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar la asignación",
      });
    }
  },
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID("teacher_subjects"),
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      await db.execute("DELETE FROM teacher_subjects WHERE id = ?", [id]);

      res.json({
        success: true,
        message: "Asignación eliminada correctamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar la asignación",
      });
    }
  },
);

export default router;
