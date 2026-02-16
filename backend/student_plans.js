import express from "express";
import { db } from "./db.js";
import {
  validateID,
  checkValidations,
  validateStudentPlans,
  validateEditStudentPlans,
} from "./validations.js";
import { authentication, authorization } from "./auth.js";

const router = express.Router();

router.get("/", authentication, async (req, res) => {
  let sql =
    "SELECT s.id AS student_id, p.id AS plan_id, paid_amount, start_date, t.id AS teacher_id\
FROM student_plans sp \
JOIN students s ON sp.student_id = s.id \
JOIN plans p ON sp.plan_id = p.id \
JOIN teachers t ON sp.teacher_id = t.id";


  const [studentPlans] = await db.execute(sql);
  res.json({ success: true, studentPlans });
});

router.get(
  "/:id",
  authentication,
  validateID,
  checkValidations,
  async (req, res) => {
    const id = Number(req.params.id);

    const [studentPlans] = await db.execute(
      "SELECT sp.id, \
       s.first_name AS student_first_name, \
       s.last_name AS student_last_name, \
       p.name AS plan_name, \
       sp.paid_amount, \
       sp.start_date \
       t.id AS teacher_id \
FROM student_plans sp \
JOIN students s ON sp.student_id = s.id \
JOIN plans p ON sp.plan_id = p.id \
JOIN teachers t ON sp.teacher_id = t.id \
WHERE sp.id = ?",
      [id],
    );

    if (studentPlans.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Estudiante y plan no encontrados." });
    }

    res.json({ success: true, data: studentPlans[0] });
  },
);

router.post(
  "/",
  authentication,
  validateStudentPlans,
  checkValidations,
  async (req, res) => {
    const { student_id, plan_id, paid_amount, start_date, teacher_id } = req.body;

    const [result] = await db.execute(
      "INSERT INTO student_plans (student_id, plan_id, paid_amount, start_date, teacher_id) VALUES (?, ?, ?, ?, ?)",
      [student_id, plan_id, paid_amount, start_date, teacher_id],
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        student_id,
        plan_id,
        paid_amount,
        start_date,
        teacher_id
      },
      message: "Plan asignado al estudiante, exitosamente",
    });
  },
);

router.put(
  "/:id",
  authentication,
  validateID,
  validateEditStudentPlans,
  checkValidations,
  async (req, res) => {
    const id = Number(req.params.id);

    const [studentPlans] = await db.execute(
      "SELECT * FROM student_plans WHERE id = ?",
      [id],
    );

    if (studentPlans.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Estudiante y plan no encontrados." });
    }

    const { student_id, plan_id, paid_amount, start_date } = req.body;

    await db.execute(
      "UPDATE student_plans SET student_id = ?, plan_id = ?, paid_amount = ?, start_date = ?, teacher_id = ? WHERE id = ?",
      [student_id, plan_id, paid_amount, start_date, teacher_id, id],
    );

    res.json({
      success: true,
      data: {
        id,
        student_id,
        plan_id,
        paid_amount,
        start_date,
        teacher_id
      },
      message: "Registro actualizado exitosamente",
    });
  },
);

router.delete(
  "/:id",
  authentication,
  validateID,
  checkValidations,
  async (req, res) => {
    const id = Number(req.params.id);

    const [studentPlans] = await db.execute(
      "SELECT * FROM student_plans WHERE id = ?",
      [id],
    );

    if (studentPlans.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Alumno y plan no encontrados." });
    }

    await db.execute("DELETE FROM student_plans WHERE id = ?", [id]);

    res.json({ success: true, message: "Registro eliminado exitosamente." });
  },
);

export default router;
