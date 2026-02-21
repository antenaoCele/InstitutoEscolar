import express from "express";
import { db } from "../db.js";
import {
  validateSubjects,
  validateEditSubjects,
} from "../validators/validations.js";
import { validateID, checkValidations } from "../validators/helpers.js";
import { authentication, authorization } from "./auth.js";

const router = express.Router();

router.get("/", authentication, async (req, res) => {
  try {
    const [subjects] = await db.execute("SELECT * FROM subjects");
    res.json({ success: true, subjects });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener las asignaturas",
    });
  }
});

router.get(
  "/:id",
  authentication,
  validateID("subjects"),
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const [subjects] = await db.execute(
        "SELECT * FROM subjects WHERE id = ?",
        [id],
      );

      res.json({ success: true, materia: subjects[0] });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener la asignatura",
      });
    }
  },
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validateSubjects,
  checkValidations,
  async (req, res) => {
    try {
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
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al crear la asignatura",
      });
    }
  },
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID("subjects"),
  validateEditSubjects,
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { name } = req.body;

      const [subjects] = await db.execute(
        "SELECT * FROM subjects WHERE id = ?",
        [id],
      );

      const newName = name ?? subjects[0].name;

      await db.execute("UPDATE subjects SET name = ? WHERE id = ?", [
        newName,
        id,
      ]);

      res.json({
        success: true,
        data: { id, name: newName },
        message: "Asignatura actualizada exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar la asignatura",
      });
    }
  },
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID("subjects"),
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

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
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar la asignatura",
      });
    }
  },
);

export default router;
