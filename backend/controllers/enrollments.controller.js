import { db } from "../db.js";
import { createCrudController } from "../utils/crudFactory.js";
import { existingEnrollment } from "../services/enrollments.service.js";

const baseController = createCrudController("enrollments");

export const enrollmentsController = {
  ...baseController,

  getAll: async (req, res) => {
    try {
      const [rows] = await db.execute(`
       SELECT
e.id,
s.id AS student_id,
s.first_name,
s.last_name,
e.amount,
e.payment_date
FROM enrollments e
JOIN students s
  ON e.student_id = s.id
ORDER BY e.payment_date DESC
      `);

      res.json({
        success: true,
        total: rows.length,
        data: rows,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener los registros",
      });
    }
  },

  getById: async (req, res) => {
    try {
      const id = Number(req.params.id);

      const [rows] = await db.execute(
        `
        SELECT 
        e.id,
        s.id AS student_id,
        e.amount,
        e.payment_date
        FROM enrollments e
        JOIN students s ON e.student_id = s.id
        WHERE e.id = ?
      `,
        [id],
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Registro no encontrado",
        });
      }

      res.json({
        success: true,
        data: rows[0],
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener el registro",
      });
    }
  },

  getMonthlyEnrollments: async (req, res) => {
    try {
      const month = Number(req.query.month);
      const year = Number(req.query.year);

      const [rows] = await db.execute(
        `
      SELECT
        e.id,
        e.amount,
        e.payment_date,

        s.id AS student_id,
        s.first_name,
        s.last_name

      FROM enrollments e

      JOIN students s
        ON e.student_id = s.id

      WHERE MONTH(e.payment_date) = ?
      AND YEAR(e.payment_date) = ?

      ORDER BY e.payment_date DESC
      `,
        [month, year],
      );

      res.json({
        success: true,
        total: rows.length,
        data: rows,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Error al obtener inscripciones mensuales",
      });
    }
  },

  create: async (req, res) => {
    try {
      const { student_id, amount, payment_date } = req.body;

      if (await existingEnrollment(student_id, payment_date)) {
        return res.status(400).json({
          success: false,
          message: "El alumno ya abonó la inscripción este año",
        });
      }

      const [result] = await db.execute(
        `
      INSERT INTO enrollments
      (student_id, amount, payment_date)
      VALUES (?, ?, ?)
      `,
        [student_id, amount, payment_date],
      );

      res.status(201).json({
        success: true,
        data: {
          id: result.insertId,
          student_id,
          amount,
          payment_date,
        },
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Error al registrar la inscripción",
      });
    }
  },

  update: async (req, res) => {
    try {
      const id = Number(req.params.id);

      const { student_id, amount, payment_date } = req.body;

      const [rows] = await db.execute(
        "SELECT * FROM enrollments WHERE id = ?",
        [id],
      );

      const newStudentId = student_id ?? rows[0].student_id;
      const newAmount = amount ?? rows[0].amount;
      const newPaymentDate = payment_date ?? rows[0].payment_date;

      if (await existingEnrollment(newStudentId, newPaymentDate, id)) {
        return res.status(400).json({
          success: false,
          message: "El alumno ya tiene una inscripción registrada este mes",
        });
      }

      await db.execute(
        `
      UPDATE enrollments
      SET
        student_id = ?,
        amount = ?,
        payment_date = ?
      WHERE id = ?
      `,
        [newStudentId, newAmount, newPaymentDate, id],
      );

      res.json({
        success: true,
        data: {
          id,
          student_id: newStudentId,
          amount: newAmount,
          payment_date: newPaymentDate,
        },
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Error al editar la inscripción",
      });
    }
  },
};
