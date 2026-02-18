import express from "express";
import { db } from "./db.js";
import {
  checkValidations,
  validateStudents,
  validateEditStudents,
  validateID,
} from "./validations.js";
import { authentication, authorization } from "./auth.js";

const router = express.Router();

router.get("/", authentication, async (req, res) => {
  const [students] = await db.execute(
    "SELECT id, first_name, last_name, dni, school, birth_date, enrolled, level, grade FROM students",
  );
  res.json({ success: true, students });
});

router.get(
  "/:id",
  authentication,
  validateID,
  checkValidations,
  async (req, res) => {
    const id = Number(req.params.id);

    const [students] = await db.execute("SELECT * FROM students WHERE id = ?", [
      id,
    ]);

    if (students.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Alumno no encontrado" });
    }

    res.json({ success: true, student: students[0] });
  },
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validateStudents,
  checkValidations,
  async (req, res) => {
    const {
      first_name,
      last_name,
      dni,
      school,
      birth_date,
      enrolled,
      level,
      grade,
    } = req.body;

    const [result] = await db.execute(
      "INSERT INTO students (first_name, last_name, dni, school, birth_date, enrolled, level, grade) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [first_name, last_name, dni, school, birth_date, enrolled, level, grade],
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        first_name,
        last_name,
        dni,
        school,
        birth_date,
        enrolled,
        level,
        grade,
      },
      message: "Alumno creado exitosamente",
    });
  },
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID,
  validateEditStudents,
  checkValidations,
  async (req, res) => {
    const id = Number(req.params.id);

    const [students] = await db.execute("SELECT * FROM students WHERE id = ?", [
      id,
    ]);

    if (students.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Alumno no encontrado" });
    }

    const {
      first_name,
      last_name,
      dni,
      school,
      birth_date,
      enrolled,
      level,
      grade,
    } = req.body;

    await db.execute(
      "UPDATE students SET first_name = ?, last_name = ?, dni = ?, school = ?, birth_date = ?, enrolled = ?, level = ?, grade = ? WHERE id = ?",
      [first_name, last_name, dni, school, birth_date, enrolled, level, grade],
    );

    res.json({
      success: true,
      data: {
        id: result.insertId,
        first_name,
        last_name,
        dni,
        school,
        birth_date,
        enrolled,
        level,
        grade,
      },
      message: "Alumno actualizado exitosamente",
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

    const [students] = await db.execute("SELECT * FROM students WHERE id = ?", [
      id,
    ]);

    if (students.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Alumno no encontrado" });
    }

    await db.execute("DELETE FROM students WHERE id = ?", [id]);

    res.json({ success: true, message: "Alumno eliminado exitosamente" });
  },
);

export default router;
