import { db } from "../db.js";
import { createCrudController } from "../utils/crudFactory.js";

const baseController = createCrudController("subjects");

export const subjectsController = {
  ...baseController,

  getAll: async (req, res) => {
    try {
      const [rows] = await db.execute(`
      SELECT
        s.id,
        s.name,

        p.id AS plan_id,
        p.name AS plan_name

      FROM subjects s

      LEFT JOIN plan_subjects ps
        ON ps.subject_id = s.id

      LEFT JOIN plans p
        ON p.id = ps.plan_id

      ORDER BY
        s.name,
        p.name
    `);

      const subjectsMap = new Map();

      for (const row of rows) {
        if (!subjectsMap.has(row.id)) {
          subjectsMap.set(row.id, {
            id: row.id,
            name: row.name,
            plans: [],
          });
        }

        if (row.plan_id) {
          subjectsMap.get(row.id).plans.push({
            id: row.plan_id,
            name: row.plan_name,
          });
        }
      }

      const subjects = [...subjectsMap.values()];

      res.json({
        success: true,
        total: subjects.length,
        data: subjects,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Error al obtener materias.",
      });
    }
  },
};
