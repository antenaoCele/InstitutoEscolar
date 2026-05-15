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
          s.first_name AS student_first_name,
          s.last_name AS student_last_name,

          t.id AS tutor_id,
          t.first_name,
          t.last_name,
          t.dni,
          t.phone

        FROM student_tutors st

        JOIN students s
          ON st.student_id = s.id

        JOIN tutors t
          ON st.tutor_id = t.id
      `);

      const formatted = rows.map((row) => ({
        ...row,
        student_name: `${row.student_last_name} ${row.student_first_name}`,
      }));

      res.json({
        success: true,
        total: formatted.length,
        data: formatted,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Error al obtener registros",
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
          s.first_name AS student_first_name,
          s.last_name AS student_last_name,

          t.id AS tutor_id,
          t.first_name,
          t.last_name,
          t.dni,
          t.phone

        FROM student_tutors st

        JOIN students s
          ON st.student_id = s.id

        JOIN tutors t
          ON st.tutor_id = t.id

        WHERE st.id = ?
        `,
        [id],
      );

      if (!rows.length) {
        return res.status(404).json({
          success: false,
          message: "Registro no encontrado",
        });
      }

      const row = rows[0];

      res.json({
        success: true,
        data: {
          ...row,
          student_name: `${row.student_last_name} ${row.student_first_name}`,
        },
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Error al obtener registro",
      });
    }
  },
};
