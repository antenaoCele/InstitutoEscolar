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
        s.teacher_id,
        t.first_name,
        t.last_name,
        s.start_time,
        s.end_time,
        s.day,
        s.classroom
      FROM schedules s
      JOIN teachers t
        ON t.id = s.teacher_id
      ORDER BY s.day, s.start_time
    `);

      res.json({
        success: true,
        total: rows.length,
        data: rows,
      });
    } catch (error) {
      console.log("ERROR EN GETALL SCHEDULES");
      console.log(error);

      res.status(500).json({
        success: false,
        message: "Error al obtener horarios",
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
          s.teacher_id,
          t.first_name,
          t.last_name,
          s.start_time,
          s.end_time,
          s.day,
          s.classroom
        FROM schedules s
        JOIN teachers t
          ON t.id = s.teacher_id
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

  getInfo: async (req, res) => {
    console.log("ENTRÓ A GETINFO");
    console.log(req.params.id);

    try {
      const id = Number(req.params.id);

      const [rows] = await db.execute(
        `
        SELECT
            s.id AS schedule_id,

            t.first_name AS teacher_first_name,
            t.last_name AS teacher_last_name,

            s.classroom,

            st.id AS student_id,
            st.first_name AS student_first_name,
            st.last_name AS student_last_name,

            p.id AS plan_id,
            p.name AS plan_name,

            sub.id AS subject_id,
            sub.name AS subject_name

        FROM schedules s

        JOIN teachers t
            ON t.id = s.teacher_id

        LEFT JOIN schedule_students ss
            ON ss.schedule_id = s.id

        LEFT JOIN students st
            ON st.id = ss.student_id

        LEFT JOIN student_plans sp
            ON sp.student_id = st.id
            AND sp.end_date IS NULL

        LEFT JOIN plans p
            ON p.id = sp.plan_id

        LEFT JOIN plan_subjects ps
            ON ps.plan_id = p.id

        LEFT JOIN subjects sub
            ON sub.id = ps.subject_id

        WHERE s.id = ?

        ORDER BY
            p.id,
            st.last_name,
            sub.name
        `,
        [id],
      );

      console.log(rows);

      if (!rows.length) {
        return res.status(404).json({
          success: false,
          message: "Horario no encontrado",
        });
      }

      const info = {
        teacher: "",
        classroom: "",
        plans: [],
        students: [],
      };

      rows.forEach((row) => {
        if (!info.teacher) {
          info.teacher = `${row.teacher_last_name}, ${row.teacher_first_name}`;
        }

        if (!info.classroom) {
          info.classroom = row.classroom;
        }

        if (row.plan_id) {
          let plan = info.plans.find((p) => p.id === row.plan_id);

          if (!plan) {
            plan = {
              id: row.plan_id,
              name: row.plan_name,
              subjects: [],
            };

            info.plans.push(plan);
          }

          if (row.subject_name && !plan.subjects.includes(row.subject_name)) {
            plan.subjects.push(row.subject_name);
          }
        }

        if (row.student_id) {
          let student = info.students.find((s) => s.id === row.student_id);

          if (!student) {
            student = {
              id: row.student_id,
              name: `${row.student_last_name}, ${row.student_first_name}`,
              plan: row.plan_name || "Sin plan",
              subjects: [],
            };

            info.students.push(student);
          }

          if (
            row.subject_name &&
            !student.subjects.includes(row.subject_name)
          ) {
            student.subjects.push(row.subject_name);
          }
        }

        // if (row.subject_name && !student.subjects.includes(row.subject_name)) {
        //   student.subjects.push(row.subject_name);
        // }
      });

      res.json({
        success: true,
        data: info,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener la información del horario",
      });
    }
  },

  create: async (req, res) => {
    let connection;

    try {
      connection = await db.getConnection();

      await connection.beginTransaction();

      const { teacher_id, start_time, day, classroom, students } = req.body;

      const [result] = await connection.execute(
        `
        INSERT INTO schedules
        (
        teacher_id,
        start_time,
        end_time,
        day,
        classroom
        )
        VALUES (?, ?, ADDTIME(?, '01:30:00'), ?, ?)
        `,
        [teacher_id, start_time, start_time, day, classroom],
      );

      const scheduleId = result.insertId;

      for (const student_id of students) {
        await connection.execute(
          `
          INSERT INTO schedule_students
          (
            schedule_id,
            student_id
          )
          VALUES (?, ?)
          `,
          [scheduleId, student_id],
        );
      }

      const [rows] = await connection.execute(
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
        [scheduleId],
      );

      const data = rows[0];

      data.end_time = data.end_time.slice(0, 5);

      await connection.commit();

      res.status(201).json({
        success: true,
        data,
        message: "Registro creado",
      });
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }

      res.status(500).json({
        error: error.message,
      });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  },

  update: async (req, res) => {
    let connection;

    try {
      connection = await db.getConnection();

      await connection.beginTransaction();

      const id = Number(req.params.id);

      const { teacher_id, start_time, day, classroom, students } = req.body;

      const [rows] = await connection.execute(
        "SELECT * FROM schedules WHERE id = ?",
        [id],
      );

      const current = rows[0];

      const newTeacherId = teacher_id ?? current.teacher_id;
      const newStartTime = start_time ?? current.start_time;
      const newDay = day ?? current.day;
      const newClassroom = classroom ?? current.classroom;

      await connection.execute(
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

      await connection.execute(
        `
        DELETE FROM schedule_students
        WHERE schedule_id = ?
        `,
        [id],
      );

      for (const student_id of students) {
        await connection.execute(
          `
          INSERT INTO schedule_students
          (
            schedule_id,
            student_id
          )
          VALUES (?, ?)
          `,
          [id, student_id],
        );
      }

      const [updatedRows] = await connection.execute(
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

      await connection.commit();

      res.json({
        success: true,
        data,
        message: "Registro actualizado",
      });
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }

      console.log("ERROR EN UPDATE SCHEDULE");
      console.log(error);

      res.status(500).json({
        error: error.message,
      });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  },
};
