import express from "express";
import { db } from "../db.js";
import {
  validateStudentPlans,
  validateEditStudentPlans,
} from "../validators/validations.js";
import { validateID, checkValidations } from "../validators/helpers.js";
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
       sp.end_date, \
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
       sp.end_date, \
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

//OBTENER EL ESTADO DE PAGO DE LOS ALUMNOS Y FILTRARLOS POR DOCENTE(es opcional lo del docente)
router.get(
  "/account-status",
  authentication,
  authorization("ADMIN"),
  async (req, res) => {
    try {
      const { month, teacher_id } = req.query;

      if (!month) {
        return res.status(400).json({
          success: false,
          error: "Debe enviar el mes en formato YYYY-MM",
        });
      }

      // Primer día del mes
      const firstDay = `${month}-01`;

      // Último día del mes (MySQL lo calcula solo)
      const lastDayQuery = `LAST_DAY(?)`;

      let query = `
        SELECT 
          sp.id AS student_plan_id,
          sp.student_id,
          sp.teacher_id,
          pp.price,
          IFNULL(SUM(p.amount), 0) AS total_paid
        FROM student_plans sp
        JOIN plan_prices pp ON sp.plan_id = pp.plan_id
        LEFT JOIN payments p 
          ON p.student_plan_id = sp.id
          AND DATE_FORMAT(p.payment_date, '%Y-%m') = ?
        WHERE 
          sp.start_date <= LAST_DAY(?)
          AND (sp.end_date IS NULL OR sp.end_date >= ?)
      `;

      const params = [month, firstDay, firstDay];

      if (teacher_id) {
        query += " AND sp.teacher_id = ? ";
        params.push(teacher_id);
      }

      query += `
        GROUP BY sp.id, sp.student_id, sp.teacher_id, pp.price
      `;

      const [rows] = await db.execute(query, params);

      const result = rows.map((row) => {
        const debt = row.price - row.total_paid;

        return {
          student_plan_id: row.student_plan_id,
          student_id: row.student_id,
          teacher_id: row.teacher_id,
          price: row.price,
          total_paid: row.total_paid,
          debt: debt < 0 ? 0 : debt,
          status: debt <= 0 ? "PAGADO" : "DEBE",
        };
      });

      res.json({
        success: true,
        month,
        data: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: "Error al calcular el estado de cuenta",
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
      const {
        student_id,
        plan_id,
        paid_amount,
        start_date,
        end_date,
        teacher_id,
      } = req.body;

      const [result] = await db.execute(
        "INSERT INTO student_plans (student_id, plan_id, start_date, end_date, teacher_id) VALUES (?, ?, ?, ?, ?)",
        [student_id, plan_id, start_date, end_date, teacher_id],
      );

      res.status(201).json({
        success: true,
        data: {
          id: result.insertId,
          student_id,
          plan_id,
          paid_amount,
          start_date,
          end_date,
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
      const { student_id, plan_id, teacher_id, start_date, end_date } =
        req.body;

      const [studentPlans] = await db.execute(
        "SELECT * FROM student_plans WHERE id = ?",
        [id],
      );

      const newStudentId = student_id ?? studentPlans[0].student_id;
      const newPlanId = plan_id ?? studentPlans[0].plan_id;
      const newTeacherId = teacher_id ?? studentPlans[0].teacher_id;
      const newStartDate = start_date ?? studentPlans[0].start_date;
      const newEndDate = end_date ?? studentPlans[0].end_date;

      await db.execute(
        "UPDATE student_plans SET student_id = ?, plan_id = ?, start_date = ?, teacher_id = ?, end_date = ? WHERE id = ?",
        [newStudentId, newPlanId, newStartDate, newTeacherId, newEndDate, id],
      );

      res.json({
        success: true,
        data: {
          id,
          student_id: newStudentId,
          plan_id: newPlanId,
          start_date: newStartDate,
          end_date: newEndDate,
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
