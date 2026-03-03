import { db } from "../db.js";
import { createCrudController } from "../utils/crudFactory.js";

const baseController = createCrudController("student_tutors");

export const studentTutorsController = {
  ...baseController,

  getAll: async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT 
        st.id,
        s.id AS student_id,
        t.id AS tutor_id
        FROM student_tutors st
        JOIN students s ON st.student_id = s.id
        JOIN tutors t ON st.tutor_id = t.id
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
        SELECT
        st.id,
        s.id AS student_id,
        t.id AS tutor_id
        FROM student_tutors st
        JOIN students s ON st.student_id = s.id
        JOIN tutors t ON st.tutor_id = t.id
        WHERE st.id = ?
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
