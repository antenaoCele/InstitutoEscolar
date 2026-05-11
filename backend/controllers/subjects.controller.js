import { db } from "../db.js";
import { createCrudController } from "../utils/crudFactory.js";

const baseController = createCrudController("subjects");

export const subjectsController = {
  ...baseController,

  getAll: async (req, res) => {
    try {
      const { teacher_id } = req.query;

      let query = `
        SELECT DISTINCT
          s.id,
          s.name
        FROM subjects s
        LEFT JOIN teacher_subjects ts
          ON ts.subject_id = s.id
      `;

      const params = [];

      if (teacher_id) {
        query += ` WHERE ts.teacher_id = ? `;
        params.push(teacher_id);
      }

      query += ` ORDER BY s.name ASC`;

      const [rows] = await db.execute(query, params);

      res.json({
        success: true,
        total: rows.length,
        data: rows,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Error al obtener materias",
      });
    }
  },
};
