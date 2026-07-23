import { db } from "../db.js";
import { createCrudController } from "../utils/crudFactory.js";

const baseController = createCrudController("teacher_liquidations");

export const teacherLiquidationsController = {
  ...baseController,
  getAll: async (req, res) => {
    try {
      const sql = `
        SELECT 
        t.id AS teacher_id, 
        tl.month, 
        tl.total_collected, 
        tl.net_salary 
        FROM teacher_liquidations tl
        JOIN teachers t ON tl.teacher_id = t.id
      `;

      const [rows] = await db.execute(sql);

      res.json({
        success: true,
        data: rows,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener las liquidaciones",
      });
    }
  },

  getMonthly: async (req, res) => {
    try {
      const now = new Date();
      const month = req.query.month || now.getMonth() + 1;
      const year = req.query.year || now.getFullYear();

      const sql = `
      SELECT 
      t.id AS teacher_id,
      t.first_name,
      t.last_name,
      COALESCE(SUM(p.amount), 0) AS total_collected,
      COALESCE(SUM(p.amount), 0) * 0.75 AS net_salary
      FROM teachers t
      LEFT JOIN student_plans sp ON sp.teacher_id = t.id
      LEFT JOIN payments p 
        ON p.student_plan_id = sp.id
        AND MONTH(p.payment_date) = ?
        AND YEAR(p.payment_date) = ?
      GROUP BY t.id, t.first_name, t.last_name
      ORDER BY t.last_name ASC, t.first_name ASC
    `;

      const [rows] = await db.execute(sql, [month, year]);

      res.json({ success: true, data: rows });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener las liquidaciones",
      });
    }
  },

  getById: async (req, res) => {
    try {
      const id = Number(req.params.id);

      const sql = `
        SELECT 
        t.id AS teacher_id, 
        tl.month, 
        tl.total_collected, 
        tl.net_salary 
        FROM teacher_liquidations tl
        JOIN teachers t ON tl.teacher_id = t.id
        WHERE tl.id = ?
      `;

      const [rows] = await db.execute(sql, [id]);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Liquidación no encontrada",
        });
      }

      res.json({
        success: true,
        data: rows[0],
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener la liquidación",
      });
    }
  },
};
