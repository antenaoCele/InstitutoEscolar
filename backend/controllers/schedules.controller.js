import { db } from "../db.js";
import { createCrudController } from "../utils/crudFactory.js";

const baseController = createCrudController("schedules");

export const schedulesController = {
  ...baseController,

  getAll: async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT
        s.id,
        t.id AS teacher_id,
        t.first_name,
        t.last_name,
        s.start_time,
        s.end_time,
        s.day, 
        s.classroom
        FROM schedules s
        JOIN teachers t ON s.teacher_id = t.id
        ORDER BY s.id DESC
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
        s.id,
        t.id AS teacher_id,
        t.first_name,
        t.last_name,
        s.start_time,
        s.end_time,
        s.day, 
        s.classroom
        FROM schedules s
        JOIN teachers t ON s.teacher_id = t.id
        WHERE s.id = ?
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

  create: async (req, res) => {
    try {
      const { teacher_id, start_time, day, classroom } = req.body;

      const [result] = await db.execute(
        `INSERT INTO schedules 
       (teacher_id, start_time, end_time, day, classroom) 
       VALUES (?, ?, ADDTIME(?, '01:30:00'), ?, ?)`,
        [teacher_id, start_time, start_time, day, classroom],
      );

      const [rows] = await db.execute(
        `
      SELECT 
        id,
        teacher_id,
        start_time,
        end_time,
        day,
        classroom
      FROM schedules
      WHERE id = ?
      `,
        [result.insertId],
      );

      const data = rows[0];

      data.end_time = data.end_time.slice(0, 5);

      res.status(201).json({
        success: true,
        data,
        message: "Registro creado",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { teacher_id, start_time, day, classroom } = req.body;

      const [rows] = await db.execute("SELECT * FROM schedules WHERE id = ?", [
        id,
      ]);

      const newTeacherId = teacher_id ?? rows[0].teacher_id;
      const newStartTime = start_time ?? rows[0].start_time;
      const newDay = day ?? rows[0].day;
      const newClassroom = classroom ?? rows[0].classroom;

      await db.execute(
        `
      UPDATE schedules 
      SET teacher_id = ?, 
          start_time = ?, 
          end_time = ADDTIME(?, '01:30:00'),
          day = ?, 
          classroom = ?
      WHERE id = ?
      `,
        [newTeacherId, newStartTime, newStartTime, newDay, newClassroom, id],
      );

      const [updatedRows] = await db.execute(
        `
      SELECT 
        id,
        teacher_id,
        start_time,
        end_time,
        day,
        classroom
      FROM schedules
      WHERE id = ?
      `,
        [id],
      );

      const data = updatedRows[0];

      data.start_time = data.start_time.slice(0, 5);
      data.end_time = data.end_time.slice(0, 5);

      res.json({
        success: true,
        data,
        message: "Registro actualizado",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
