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
        sc.id AS schedule_id, 
        st.id AS student_id 
        FROM schedule_students ss 
        JOIN schedules sc ON ss.schedule_id = sc.id 
        JOIN students st ON ss.student_id = st.id
      `);

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
        SELECT ss.id, ss.schedule_id, ss.student_id, 
        st.first_name AS student_first_name, st.last_name AS student_last_name,
        sc.start_time, sc.end_time
        FROM schedule_students ss
        JOIN schedules sc ON ss.schedule_id = sc.id
        JOIN students st ON ss.student_id = st.id
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
};
