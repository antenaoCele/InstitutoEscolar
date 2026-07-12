import { db } from "../db.js";
import { createCrudController } from "../utils/crudFactory.js";

const baseController = createCrudController("teacher_plans");

export const teacherPlansController = {
  ...baseController,

  getAll: async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT

          tp.id,

          p.id AS plan_id,
          p.name AS plan_name,

          t.id AS teacher_id,
          CONCAT(t.last_name, ', ', t.first_name) AS teacher_name

        FROM teacher_plans tp

        INNER JOIN plans p
          ON p.id = tp.plan_id

        INNER JOIN teachers t
          ON t.id = tp.teacher_id

        ORDER BY
          p.name,
          t.last_name,
          t.first_name
      `);

      res.json({
        success: true,
        total: rows.length,
        data: rows,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Error al obtener las asignaciones.",
      });
    }
  },

  getByPlan: async (req, res) => {
    try {
      const planId = Number(req.params.planId);

      const [rows] = await db.execute(
        `
        SELECT
          teacher_id

        FROM teacher_plans

        WHERE plan_id = ?
        `,
        [planId],
      );

      res.json({
        success: true,
        data: rows,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Error al obtener los docentes.",
      });
    }
  },

  updateByPlan: async (req, res) => {
    const planId = Number(req.params.planId);
    const { teacher_ids } = req.body;

    if (!Array.isArray(teacher_ids)) {
      return res.status(400).json({
        success: false,
        message: "teacher_ids debe ser un arreglo.",
      });
    }

    const uniqueTeacherIds = [...new Set(teacher_ids)];

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Eliminar todas las asignaciones actuales del plan
      await connection.execute(
        `
      DELETE
      FROM teacher_plans
      WHERE plan_id = ?
      `,
        [planId],
      );

      // Insertar las nuevas asignaciones
      for (const teacherId of uniqueTeacherIds) {
        await connection.execute(
          `
        INSERT INTO teacher_plans
        (
          teacher_id,
          plan_id
        )
        VALUES (?, ?)
        `,
          [teacherId, planId],
        );
      }

      await connection.commit();

      res.json({
        success: true,
        message: "Docentes asignados correctamente.",
      });
    } catch (error) {
      await connection.rollback();

      console.error(error);

      res.status(500).json({
        success: false,
        message: "Error al guardar los docentes del plan.",
      });
    } finally {
      connection.release();
    }
  },
};
