import { db } from "../db.js";
import { createCrudController } from "../utils/crudFactory.js";

const baseController = createCrudController("enrollments");

export const enrollmentsController = {
  ...baseController,

  getAll: async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT 
        e.id,
        e.amount,
        e.student_id,
        e.payment_date,
        s.student_id AS student_code,
        s.first_name,
        s.last_name  
        FROM enrollments e
        JOIN students s ON e.student_id = s.id
        ORDER BY e.id ASC
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
        e.amount,
        e.student_id,
        e.payment_date,
        s.student_id AS student_code,
        s.first_name,
        s.last_name  
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
};
