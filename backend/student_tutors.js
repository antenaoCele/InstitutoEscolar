import express from "express";
import { db } from "./db.js";
import {
  validateStudentTutors,
  validateEditStudentTutors,
} from "./validations.js";
import { validateID, checkValidations } from "./helpers.js";
import { authentication, authorization } from "./auth.js";

const router = express.Router();

router.get("/", authentication, async (req, res) => {
  try {
    let sql =
      "SELECT st.id, st.student_id, st.tutor_id \
    st.first_name AS student_first_name, \
    st.last_name AS student_last_name, \
    t.first_name AS tutor_first_name, \
    t.last_name AS tutor_last_name \
    FROM student_tutors st \
    JOIN students s ON st.student_id = s.id \
    JOIN tutors t ON st.tutor_id = t.id";

    const [studentTutors] = await db.execute(sql);
    res.json({ success: true, studentTutors });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener los estudiantes y tutores",
    });
  }
});

router.get(
  "/:id",
  authentication,
  validateID("student_tutors"),
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      let sql =
        "SELECT st.id, st.student_id, st.tutor_id \
    s.first_name AS student_first_name, \
    s.last_name AS student_last_name, \
    t.first_name AS tutor_first_name, \
    t.last_name AS tutor_last_name \
    FROM student_tutors st \
    JOIN students s ON st.student_id = s.id \
    JOIN tutors t ON st.tutor_id = t.id\
    WHERE st.id = ?";

      const [studentTutors] = await db.execute(sql, [id]);
      res.json({ success: true, studentTutors });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener el estudiante y tutor",
      });
    }
  },
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validateStudentTutors,
  checkValidations,
  async (req, res) => {
    try {
      const { student_id, tutor_id } = req.body;

      const [result] = await db.execute(
        "INSERT INTO student_tutors (student_id, tutor_id) VALUES (?, ?)",
        [student_id, tutor_id],
      );

      res.status(201).json({
        success: true,
        data: {
          id: result.insertId,
          student_id,
          tutor_id,
        },
        message: "Tutor asignado al estudiante exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al asignar el tutor al estudiante",
      });
    }
  },
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID("student_tutors"),
  validateEditStudentTutors,
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { student_id, tutor_id } = req.body;

      const [rows] = await db.execute(
        "SELECT * FROM student_tutors WHERE id = ?",
        [id],
      );

      const newStudentId = student_id ?? rows[0].student_id;
      const newTutorId = tutor_id ?? rows[0].tutor_id;

      await db.execute(
        "UPDATE student_tutors SET student_id = ?, tutor_id = ? WHERE id = ?",
        [newStudentId, newTutorId, id],
      );

      res.json({
        success: true,
        data: {
          id,
          student_id: newStudentId,
          tutor_id: newTutorId,
        },
        message: "Registro actualizado exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar la relación",
      });
    }
  },
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID("student_tutors"),
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      await db.execute("DELETE FROM student_tutors WHERE id = ?", [id]);

      res.json({ success: true, message: "Registro eliminado exitosamente." });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar el registro",
      });
    }
  },
);

export default router;
