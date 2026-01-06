import express from "express";
import { db } from "./db.js";
import {
  verificarValidaciones,
  validarId,
  validarMaterias,
  validarModificarMaterias,
} from "./validaciones.js";
import { autenticacion } from "./auth.js";

const router = express.Router();

router.get("/", autenticacion, async (req, res) => {
  const [materias] = await db.execute("SELECT * FROM materias");
  res.json({ success: true, materias });
});

router.get(
  "/:id",
  autenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [materias] = await db.execute(
      "SELECT * FROM materias WHERE id = ?",
      [id]
    );

    if (materias.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Materia no encontrada" });
    }

    res.json({ success: true, materia: materias[0] });
  }
);

router.post(
  "/",
  autenticacion,
  validarMaterias,
  verificarValidaciones,
  async (req, res) => {
    const { nombre, id_docente } = req.body;

    const [resultado] = await db.execute(
      "INSERT INTO materias (nombre, id_docente) VALUES (?, ?)",
      [nombre, id_docente]
    );

    res.status(201).json({
      success: true,
      data: { id: resultado.insertId, nombre, id_docente },
      message: "Materia creada exitosamente",
    });
  }
);

router.put(
  "/:id",
  autenticacion,
  validarId,
  validarModificarMaterias,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [materias] = await db.execute(
      "SELECT * FROM materias WHERE id = ?",
      [id]
    );

    if (materias.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Materia no encontrada" });
    }

    const { nombre, id_docente } = req.body;

    await db.execute(
      "UPDATE materias SET nombre = ?, id_docente = ? WHERE id = ?",
      [nombre, id_docente, id]
    );

    res.json({
      success: true,
      data: { nombre, id_docente },
      message: "Materia actualizada exitosamente",
    });
  }
);

router.delete(
  "/:id",
  autenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [materia] = await db.execute(
      "SELECT * FROM materias WHERE id = ?",
      [id]
    );

    if (materia.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Materia no encontrada" });
    }

    const [materiaRegistrada] = await db.execute(
      "SELECT * FROM notas WHERE materia_id = ?",
      [id]
    );

    if (materiaRegistrada.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "No se puede eliminar la materia porque está asociada a uno o más alumnos.",
      });
    }

    await db.execute("DELETE FROM materias WHERE id = ?", [id]);

    res.json({ success: true, message: "Materia eliminada exitosamente" });
  }
);

export default router;
