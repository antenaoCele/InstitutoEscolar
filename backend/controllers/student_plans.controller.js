import { db } from "../db.js";
import { createCrudController } from "../utils/crudFactory.js";

const baseController = createCrudController("student_plans");

export const studentPlansController = {
  ...baseController,

  getAll: async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT sp.id, 
        s.first_name AS student_first_name, 
        s.last_name AS student_last_name, 
        p.name AS plan_name, 
        sp.start_date,
        sp.end_date, 
        t.id AS teacher_id 
        t.first_name AS teacher_first_name, 
        t.last_name AS teacher_last_name 
        FROM student_plans sp 
        JOIN students s ON sp.student_id = s.id 
        JOIN plans p ON sp.plan_id = p.id 
        JOIN teachers t ON sp.teacher_id = t.id
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
        SELECT sp.id, 
        s.first_name AS student_first_name, 
        s.last_name AS student_last_name, 
        p.name AS plan_name, 
        sp.start_date,
        sp.end_date, 
        t.id AS teacher_id,
        t.first_name AS teacher_first_name, 
        t.last_name AS teacher_last_name 
        FROM student_plans sp 
        JOIN students s ON sp.student_id = s.id 
        JOIN plans p ON sp.plan_id = p.id 
        JOIN teachers t ON sp.teacher_id = t.id 
        WHERE sp.id = ?
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
