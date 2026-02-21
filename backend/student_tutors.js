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
  let sql =
    "SELECT st.id, st.student_id, st.tutor_id \
FROM student_tutors st \
    JOIN students s ON st.student_id = s.id \
    JOIN tutors t ON st.tutor_id = t.id";

  const [studentTutors] = await db.execute(sql);
  res.json({ success: true, studentTutors });
});

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validateStudentTutors,
  checkValidations,
  async (req, res) => {
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
    const id = Number(req.params.id);

    const [rows] = await db.execute(
      "SELECT * FROM student_tutors WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Relación no encontrada." });
    }

    const { student_id, tutor_id } = req.body;

    await db.execute(
      "UPDATE student_tutors SET student_id = ?, tutor_id = ? WHERE id = ?",
      [student_id, tutor_id, id],
    );

    res.json({
      success: true,
      data: {
        id,
        student_id,
        tutor_id,
      },
      message: "Registro actualizado exitosamente",
    });
  },
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID("student_tutors"),
  checkValidations,
  async (req, res) => {
    const id = Number(req.params.id);

    const [rows] = await db.execute(
      "SELECT * FROM student_tutors WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Relación no encontrada." });
    }

    await db.execute("DELETE FROM student_tutors WHERE id = ?", [id]);

    res.json({ success: true, message: "Registro eliminado exitosamente." });
  },
);

export default router;
