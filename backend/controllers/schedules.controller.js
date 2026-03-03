import { db } from "../db.js";
import { createCrudController } from "../utils/crudFactory.js";

const baseController = createCrudController("schedules");

export const schedulesController = {
  ...baseController,

  getAll: async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT
        s.id,
        t.id AS teacher_id,
        s.start_time,
        s.end_time,
        s.monday,
        s.tuesday,
        s.wednesday,
        s.thursday,
        s.friday,
        s.saturday
        FROM schedules s
        JOIN teachers t ON s.teacher_id = t.id
        ORDER BY s.id DESC
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
        s.id,
        t.id AS teacher_id,
        s.start_time,
        s.end_time,
        s.monday,
        s.tuesday,
        s.wednesday,
        s.thursday,
        s.friday,
        s.saturday
        FROM schedules s
        JOIN teachers t ON s.teacher_id = t.id
        WHERE s.id = ?
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
