import { db } from "../db.js";
import { createCrudController } from "../utils/crudFactory.js";

const baseController = createCrudController("plans");

export const plansController = {
  ...baseController,

  getCurrentPlans: async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT
            p.id,
            p.name,

            s.name AS subject_name,

            CONCAT(t.last_name, ', ', t.first_name) AS teacher_name,

            pp.price

        FROM plans p

        LEFT JOIN plan_subjects ps
            ON ps.plan_id = p.id

        LEFT JOIN subjects s
            ON s.id = ps.subject_id

        LEFT JOIN teacher_plans tp
            ON tp.plan_id = p.id

        LEFT JOIN teachers t
            ON t.id = tp.teacher_id

        LEFT JOIN plan_prices pp
            ON pp.plan_id = p.id

        WHERE
            pp.start_date <= CURDATE()
            AND pp.end_date IS NULL

        ORDER BY
            p.id,
            s.name,
            t.last_name,
            t.first_name;
      `);

      const plansMap = {};

      rows.forEach((row) => {
        if (!plansMap[row.id]) {
          plansMap[row.id] = {
            id: row.id,
            name: row.name,
            current_price: row.price,
            subjects: [],
            teachers: [],
          };
        }

        if (
          row.subject_name &&
          !plansMap[row.id].subjects.includes(row.subject_name)
        ) {
          plansMap[row.id].subjects.push(row.subject_name);
        }

        if (
          row.teacher_name &&
          !plansMap[row.id].teachers.includes(row.teacher_name)
        ) {
          plansMap[row.id].teachers.push(row.teacher_name);
        }
      });

      res.json({
        success: true,
        data: Object.values(plansMap),
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Error al obtener los planes actuales",
      });
    }
  },
};
