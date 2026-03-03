import { db } from "../db.js";
import { createCrudController } from "../utils/crudFactory.js";

const baseController = createCrudController("plan_subjects");

export const planSubjectsController = {
  ...baseController,

  getAll: async (req, res) => {
    try {
      const [rows] = await db.execute(
        `
        SELECT 
        ps.id,
        p.id AS plan_id,
        s.id AS subject_id
        FROM plan_subjects ps
        JOIN plans p ON ps.plan_id = p.id
        JOIN subjects s ON ps.subject_id = s.id`,
      );

      res.json({ success: true, total: rows.length, data: rows });
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
        ps.id,
        p.id AS plan_id,
        s.id AS subject_id
        FROM plan_subjects ps
        JOIN plans p ON ps.plan_id = p.id
        JOIN subjects s ON ps.subject_id = s.id
        WHERE ps.id = ?
      `,
        [id],
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Registro no encontrado",
        });
      }

      res.json({ success: true, data: rows[0] });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener el registro",
      });
    }
  },
};
