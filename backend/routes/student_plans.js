import express from "express";
import { db } from "../db.js";
import {
  validateStudentPlans,
  validateEditStudentPlans,
} from "./validations.js";
import { validateID, checkValidations } from "./helpers.js";
import { authentication, authorization } from "./auth.js";

const router = express.Router();

router.get("/", authentication, async (req, res) => {
  try {
    let sql =
      "SELECT sp.id, \
       s.first_name AS student_first_name, \
       s.last_name AS student_last_name, \
       p.name AS plan_name, \
       sp.start_date \
       t.id AS teacher_id \
      t.first_name AS teacher_first_name, \
      t.last_name AS teacher_last_name \
      FROM student_plans sp \
      JOIN students s ON sp.student_id = s.id \
      JOIN plans p ON sp.plan_id = p.id \
      JOIN teachers t ON sp.teacher_id = t.id";

    const [studentPlans] = await db.execute(sql);
    res.json({ success: true, studentPlans });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener planes y estudiantes",
    });
  }
});

router.get(
  "/:id",
  authentication,
  validateID("student_plans"),
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const [studentPlans] = await db.execute(
        "SELECT sp.id, \
       s.first_name AS student_first_name, \
       s.last_name AS student_last_name, \
       p.name AS plan_name, \
       sp.start_date \
       t.id AS teacher_id \
      t.first_name AS teacher_first_name, \
      t.last_name AS teacher_last_name \
      FROM student_plans sp \
      JOIN students s ON sp.student_id = s.id \
      JOIN plans p ON sp.plan_id = p.id \
      JOIN teachers t ON sp.teacher_id = t.id \
      WHERE sp.id = ?",
        [id],
      );
      res.json({ success: true, data: studentPlans[0] });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener plan y estudiante",
      });
    }
  },
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validateStudentPlans,
  checkValidations,
  async (req, res) => {
    try {
      const { student_id, plan_id, paid_amount, start_date, teacher_id } =
        req.body;

      const [result] = await db.execute(
        "INSERT INTO student_plans (student_id, plan_id, start_date, teacher_id) VALUES (?, ?, ?, ?)",
        [student_id, plan_id, start_date, teacher_id],
      );

      res.status(201).json({
        success: true,
        data: {
          id: result.insertId,
          student_id,
          plan_id,
          paid_amount,
          start_date,
          teacher_id,
        },
        message: "Plan asignado al estudiante, exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al crear plan y estudiante",
      });
    }
  },
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID("student_plans"),
  validateEditStudentPlans,
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { student_id, plan_id, teacher_id, start_date } = req.body;

      const [studentPlans] = await db.execute(
        "SELECT * FROM student_plans WHERE id = ?",
        [id],
      );

      const newStudentId = student_id ?? studentPlans[0].student_id;
      const newPlanId = plan_id ?? studentPlans[0].plan_id;
      const newTeacherId = teacher_id ?? studentPlans[0].teacher_id;
      const newStartDate = start_date ?? studentPlans[0].start_date;

      await db.execute(
        "UPDATE student_plans SET student_id = ?, plan_id = ?, start_date = ?, teacher_id = ? WHERE id = ?",
        [newStudentId, newPlanId, newStartDate, newTeacherId, id],
      );

      res.json({
        success: true,
        data: {
          id,
          student_id: newStudentId,
          plan_id: newPlanId,
          start_date: newStartDate,
          teacher_id: newTeacherId,
        },
        message: "Registro actualizado exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar plan y estudiante",
      });
    }
  },
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID("student_plans"),
  checkValidations,
  async (req, res) => {
    const id = Number(req.params.id);

    await db.execute("DELETE FROM student_plans WHERE id = ?", [id]);

    res.json({ success: true, message: "Registro eliminado exitosamente." });
  },
);

export default router;
