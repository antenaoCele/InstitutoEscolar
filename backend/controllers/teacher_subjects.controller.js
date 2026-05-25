import { db } from "../db.js";
import { createCrudController } from "../utils/crudFactory.js";

const baseController = createCrudController("teacher_subjects");

export const teacherSubjectsController = {
  ...baseController,

  getAll: async (req, res) => {
    try {
      const [rows] = await db.execute(`
      SELECT
        ts.id,
        t.id AS teacher_id,
        CONCAT(t.last_name, ', ', t.first_name) AS teacher_name,
        s.id AS subject_id,
        s.name AS subject_name
      FROM teacher_subjects ts
      JOIN teachers t ON ts.teacher_id = t.id
      JOIN subjects s ON ts.subject_id = s.id
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
        ts.id,
        t.id AS teacher_id,
        CONCAT(t.last_name, ' ', t.first_name) AS teacher_name,
        s.id AS subject_id,
        s.name AS subject_name
      FROM teacher_subjects ts
      JOIN teachers t ON ts.teacher_id = t.id
      JOIN subjects s ON ts.subject_id = s.id
      WHERE ts.id = ?
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
