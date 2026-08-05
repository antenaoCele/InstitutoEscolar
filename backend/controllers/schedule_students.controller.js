import { db } from "../db.js";
import { createCrudController } from "../utils/crudFactory.js";

const baseController = createCrudController("schedule_students");

export const scheduleStudentsController = {
  ...baseController,

  getAll: async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT
          ss.id,
          ss.schedule_id,
          ss.plan_id,
          p.name AS plan_name,
          st.id AS student_id,
          st.first_name,
          st.last_name
        FROM schedule_students ss
        JOIN students st
          ON st.id = ss.student_id
        JOIN plans p
          ON p.id = ss.plan_id
      `);

      res.json({ success: true, total: rows.length, data: rows });
    } catch (error) {
      console.log("ERROR EN GETALL SCHEDULE_STUDENTS");
      console.log(error);

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
          ss.id,
          ss.schedule_id,
          ss.student_id,
          ss.plan_id,
          p.name AS plan_name,
          st.first_name AS student_first_name,
          st.last_name AS student_last_name,
          sc.start_time,
          sc.end_time
        FROM schedule_students ss
        JOIN schedules sc
          ON ss.schedule_id = sc.id
        JOIN students st
          ON ss.student_id = st.id
        JOIN plans p
          ON p.id = ss.plan_id
        WHERE ss.id = ?
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

  deleteByScheduleId: async (req, res) => {
    try {
      const { scheduleId } = req.params;

      await db.execute(
        `
      DELETE FROM schedule_students
      WHERE schedule_id = ?
      `,
        [scheduleId],
      );

      res.json({
        success: true,
        message: "Estudiantes eliminados",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar estudiantes",
      });
    }
  },
};
