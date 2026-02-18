import express from "express";
import { db } from "./db.js";
import {
  checkValidations,
  validateID,
  validateSubjects,
  validateEditSubjects,
} from "./validations.js";
import { authentication, authorization } from "./auth.js";

const router = express.Router();

router.get("/", authentication, async (req, res) => {
  const [subjects] = await db.execute("SELECT * FROM subjects");
  res.json({ success: true, subjects });
});

router.get(
  "/:id",
  authentication,
  validateID,
  checkValidations,
  async (req, res) => {
    const id = Number(req.params.id);

    const [subjects] = await db.execute("SELECT * FROM subjects WHERE id = ?", [
      id,
    ]);

    if (subjects.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Asignatura no encontrada" });
    }

    res.json({ success: true, materia: subjects[0] });
  },
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validateSubjects,
  checkValidations,
  async (req, res) => {
    const { name } = req.body;

    const [result] = await db.execute(
      "INSERT INTO subjects (name) VALUES (?)",
      [name],
    );

    res.status(201).json({
      success: true,
      data: { id: result.insertId, name },
      message: "Asignatura creada exitosamente",
    });
  },
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID,
  validateEditSubjects,
  checkValidations,
  async (req, res) => {
    const id = Number(req.params.id);

    const [subjects] = await db.execute("SELECT * FROM subjects WHERE id = ?", [
      id,
    ]);

    if (subjects.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Asignatura no encontrada" });
    }

    const { name } = req.body;

    await db.execute("UPDATE subjects SET name = ? WHERE id = ?", [name, id]);

    res.json({
      success: true,
      data: { name },
      message: "Asignatura actualizada exitosamente",
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

    const [subjects] = await db.execute("SELECT * FROM subjects WHERE id = ?", [
      id,
    ]);

    if (subjects.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Asignatura no encontrada" });
    }

    const [registeredSubject] = await db.execute(
      "SELECT * FROM teacher_subjects WHERE subject_id = ?",
      [id],
    );

    if (registeredSubject.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "No se puede eliminar la Asignatura porque está asociada a uno o más docentes.",
      });
    }

    await db.execute("DELETE FROM subjects WHERE id = ?", [id]);

    res.json({ success: true, message: "Asignatura eliminada exitosamente" });
  },
);

export default router;
