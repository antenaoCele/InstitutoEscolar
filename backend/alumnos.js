import express from "express";
import { db } from "./db.js";
import {
  verificarValidaciones,
  validarAlumnos,
  validarModificarAlumnos,
  validarId,
} from "./validaciones.js";
import { autenticacion } from "./auth.js";

const router = express.Router();

router.get("/", autenticacion, async (req, res) => {
  const [alumnos] = await db.execute(
    "SELECT id, nombre, apellido, dni, colegio, nacimiento, id_plan, inscripcion, nivel, grado FROM alumnos"
  );
  res.json({ success: true, alumnos });
});

router.get(
  "/:id",
  autenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [alumnos] = await db.execute("SELECT * FROM alumnos WHERE id = ?", [
      id,
    ]);

    if (alumnos.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Alumno no encontrado" });
    }

    res.json({ success: true, alumno: alumnos[0] });
  }
);

router.post(
  "/",
  autenticacion,
  validarAlumnos,
  verificarValidaciones,
  async (req, res) => {
    const { nombre, apellido, dni } = req.body;

    const [resultado] = await db.execute(
      "INSERT INTO alumnos (nombre, apellido, dni) VALUES (?, ?, ?)",
      [nombre, apellido, dni]
    );

    res.status(201).json({
      success: true,
      data: { id: resultado.insertId, nombre, apellido, dni },
      message: "Alumno creado exitosamente",
    });
  }
);

router.put(
  "/:id",
  autenticacion,
  validarId,
  validarModificarAlumnos,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const [alumnos] = await db.execute("SELECT * FROM alumnos WHERE id = ?", [
      id,
    ]);

    if (alumnos.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Alumno no encontrado" });
    }

    const { nombre, apellido, dni } = req.body;

    await db.execute(
      "UPDATE alumnos SET nombre = ?, apellido = ?, dni = ? WHERE id = ?",
      [nombre, apellido, dni, id]
    );

    res.json({
      success: true,
      data: { nombre, apellido, dni },
      message: "Alumno actualizado exitosamente",
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

    const [alumnos] = await db.execute("SELECT * FROM alumnos WHERE id = ?", [
      id,
    ]);

    if (alumnos.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Alumno no encontrado" });
    }

    const [alumnoRegistrado] = await db.query(
      "SELECT * FROM notas WHERE materia_id = ?",
      [id]
    );

    if (alumnoRegistrado.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "No se puede eliminar este alumno, ya que se le ha asignado una o más materias.",
      });
    }

    await db.execute("DELETE FROM alumnos WHERE id = ?", [id]);

    res.json({ success: true, message: "Alumno eliminado exitosamente" });
  }
);

export default router;