import express from "express";
import { db } from "./db.js";
import {
  checkValidations,
  validateStudentPlans
} from "./validations.js";
import { authentication } from "./auth.js";

const router = express.Router();

router.get("/", authentication, async (req, res) => {
  let sql =
"SELECT s.id AS student_id, p.id AS plan_id, paid_amount, start_date\
FROM students_plans sp \
JOIN students s ON sp.student_id = s.id \
JOIN plans p ON sp.plan_id = p.id";

const [studentPlans] = await db.execute(sql);
res.json({ success: true, studentPlans });
  
});

router.post(
  "/",
  authentication,
 validateStudentPlans,
  checkValidations,
  async (req, res) => {
    const {student_id, plan_id, paid_amount, start_date} = req.body;

    const [student] = await db.execute(
      "SELECT id FROM students WHERE id = ?",
      [student_id]
    );

    if (student.length === 0) {
      return res.status(400).json({
        success: false,
        message: "El ID del estudiante no existe",
      });
    }

    const [plan] = await db.execute(
      "SELECT id FROM plans WHERE id = ?",
      [plan_id]
    );

    if (plan.length === 0) {
      return res.status(400).json({
        success: false,
        message: "El ID del plan no existe",
      });
    }

    await db.execute(
      "INSERT INTO plan_subjects (plan_id, subject_id, paid_amount, start_date) VALUES (?, ?, ?, ?)",
      [student_id, plan_id, paid_amount, start_date]
    );

    res.status(201).json({
      success: true,
      data: {
        plan_id,
        subject_id,
      },
      message: "Plan asignado al estudiante, exitosamente",
    });
  }
);

export default router;