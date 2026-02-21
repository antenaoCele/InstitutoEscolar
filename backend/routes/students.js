import express from "express";
import { db } from "../db.js";
import { validateStudents, validateEditStudents } from "./validations.js";
import { validateID, checkValidations } from "./helpers.js";
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
  validateID("students"),
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const [students] = await db.execute(
        "SELECT * FROM students WHERE id = ?",
        [id],
      );

      res.json({ success: true, student: students[0] });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener el alumno",
      });
    }
  },
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validateStudents,
  checkValidations,
  async (req, res) => {
    try {
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
        [
          first_name,
          last_name,
          dni,
          school,
          birth_date,
          enrolled,
          level,
          grade,
        ],
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
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al crear el alumno",
      });
    }
  },
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID("students"),
  validateEditStudents,
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

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

      const [students] = await db.execute(
        "SELECT * FROM students WHERE id = ?",
        [id],
      );

      const newFirstName = first_name ?? students[0].first_name;
      const newLastName = last_name ?? students[0].last_name;
      const newDni = dni ?? students[0].dni;
      const newSchool = school ?? students[0].school;
      const newBirthDate = birth_date ?? students[0].birth_date;
      const newEnrolled = enrolled ?? students[0].enrolled;
      const newLevel = level ?? students[0].level;
      const newGrade = grade ?? students[0].grade;

      await db.execute(
        "UPDATE students SET first_name = ?, last_name = ?, dni = ?, school = ?, birth_date = ?, enrolled = ?, level = ?, grade = ? WHERE id = ?",
        [
          newFirstName,
          newLastName,
          newDni,
          newSchool,
          newBirthDate,
          newEnrolled,
          newLevel,
          newGrade,
          id,
        ],
      );

      res.json({
        success: true,
        data: {
          id: result.insertId,
          first_name: newFirstName,
          last_name: newLastName,
          dni: newDni,
          school: newSchool,
          birth_date: newBirthDate,
          enrolled: newEnrolled,
          level: newLevel,
          grade: newGrade,
          id,
        },
        message: "Alumno actualizado exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar el alumno",
      });
    }
  },
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID("students"),
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      await db.execute("DELETE FROM students WHERE id = ?", [id]);

      res.json({ success: true, message: "Alumno eliminado exitosamente" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar el alumno",
      });
    }
  },
);

export default router;
