import { body } from "express-validator";
import { db } from "../../db.js";
import { ALLOWED_TABLES } from "../helpers/validations.helpers.js";

/* =========================================================
FINANCE OVERLAP (CREATE + UPDATE)
========================================================= */
export const validateFinanceOverlap = (
  table,
  message = "Ya existe un período que se superpone para este plan.",
) => [
  body("end_date").custom(async (_, { req }) => {
    const safeTable = ALLOWED_TABLES[table];
    if (!safeTable) throw new Error("Tabla no permitida");

    let { plan_id, start_date, end_date } = req.body;
    if (!plan_id || !start_date) return true;

    const id = req.params?.id ? Number(req.params.id) : null;

    const safeEndDate = end_date ?? "9999-12-31";

    const sql = `
      SELECT id FROM ${safeTable}
      WHERE plan_id = ?
      AND start_date < ?
      AND (
        end_date IS NULL OR end_date > ?
      )
      `;

    const params = [plan_id, safeEndDate, start_date];

    if (id) {
      sql += " AND id != ?";
      params.push(id);
    }

    const [rows] = await db.execute(sql, params);

    if (rows.length) throw new Error(message);

    return true;
  }),
];

/* =========================================================
FOREIGN KEY EXISTENCE
========================================================= */
export const validateForeignId = (field, table) => [
  body(field)
    .optional({ values: "null" })
    .custom(async (value) => {
      const safeTable = ALLOWED_TABLES[table];
      if (!safeTable) throw new Error("Tabla no permitida");

      const [rows] = await db.execute(
        `SELECT id FROM ${safeTable} WHERE id=?`,
        [value],
      );

      if (!rows.length) {
        throw new Error("El registro asociado no existe.");
      }

      return true;
    }),
];

/* =========================================================
SCHEDULE OVERLAP (CREATE + UPDATE)
========================================================= */
export const validateScheduleConflict = (table = "schedules") => [
  body("start_time").custom(async (start_time, { req }) => {
    const id = req.params?.id ?? null;

    let { teacher_id, day, classroom } = req.body;

    if (id) {
      const [currentRows] = await db.execute(
        `SELECT teacher_id, day, classroom FROM ${table} WHERE id = ?`,
        [id],
      );

      const current = currentRows[0];

      teacher_id = teacher_id ?? current.teacher_id;
      day = day ?? current.day;
      classroom = classroom ?? current.classroom;
    }

    if (!start_time || !day || !teacher_id || !classroom) return true;

    const [rows] = await db.execute(
      `
      SELECT id FROM ${table}
      WHERE day = ?
      AND (? IS NULL OR id != ?)
      AND (
        (
          teacher_id = ?
          AND ? < end_time
          AND ADDTIME(?, '01:30:00') > start_time
        )
        OR
        (
          classroom = ?
          AND ? < end_time
          AND ADDTIME(?, '01:30:00') > start_time
        )
      )
      `,
      [
        day,
        id,
        id,
        teacher_id,
        start_time,
        start_time,
        classroom,
        start_time,
        start_time,
      ],
    );

    if (rows.length) {
      throw new Error(
        "El horario se superpone con otro del mismo docente o aula.",
      );
    }

    return true;
  }),
];

/* =========================================================
SCHEDULES_STUDEMTS CONFLICT
========================================================= */
export const validateStudentScheduleConflict = () => [
  body("students").custom(async (students, { req }) => {
    const { day, start_time } = req.body;

    if (!students?.length || !day || !start_time) {
      return true;
    }

    const end_time = await db.execute(
      `
      SELECT ADDTIME(?, '01:30:00') AS end_time
      `,
      [start_time],
    );

    const newEndTime = end_time[0][0].end_time;

    for (const student_id of students) {
      const [rows] = await db.execute(
        `
        SELECT ss.id
        FROM schedule_students ss

        JOIN schedules s
          ON s.id = ss.schedule_id

        WHERE ss.student_id = ?
        AND s.day = ?
        AND (
          ? < s.end_time
          AND ? > s.start_time
        )
        `,
        [student_id, day, start_time, newEndTime],
      );

      if (rows.length) {
        throw new Error(
          "El alumno ya está inscripto en otra clase en ese mismo horario.",
        );
      }
    }

    return true;
  }),
];

/* =========================================================
SCHEDULE-STUDENT MAX
========================================================= */
export const validateScheduleStudentRules = (
  table = "schedule_students",
  max = 5,
) => [
  body("student_id").custom(async (student_id, { req }) => {
    const { schedule_id } = req.body;
    const id = req.params?.id ?? null;

    if (!student_id || !schedule_id) return true;

    const [rows] = await db.execute(
      `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN student_id = ? THEN 1 ELSE 0 END) as existsStudent
      FROM ${table}
      WHERE schedule_id = ?
      AND (? IS NULL OR id != ?)
      `,
      [student_id, schedule_id, id, id],
    );

    const total = rows[0].total;
    const existsStudent = rows[0].existsStudent;

    if (existsStudent > 0) {
      throw new Error("El alumno ya está inscripto en esta clase.");
    }

    if (total >= max) {
      throw new Error(`La clase ya alcanzó el máximo de ${max} alumnos.`);
    }

    return true;
  }),
];

/* =========================================================
UNIQUE
========================================================= */
export const validateUnique = (
  field,
  table,
  message = "El valor ya está registrado.",
) => [
  body(field)
    .optional({ values: "null" })
    .custom(async (value, { req }) => {
      const safeTable = ALLOWED_TABLES[table];
      if (!safeTable) throw new Error("Tabla no permitida");

      let sql = `SELECT id FROM ${safeTable} WHERE ${field}=?`;
      const params = [value];

      if (req.params?.id) {
        sql += " AND id != ?";
        params.push(req.params.id);
      }

      const [rows] = await db.execute(sql, params);

      if (rows.length) throw new Error(message);

      return true;
    }),
];

/* =========================================================
UNIQUE COMBINATION
========================================================= */
export const validateUniqueCombination = (
  table,
  fields,
  message = "La combinación ya existe.",
) => [
  body(fields[0]).custom(async (_, { req }) => {
    const safeTable = ALLOWED_TABLES[table];
    if (!safeTable) throw new Error("Tabla no permitida");

    const id = req.params?.id ? Number(req.params.id) : null;

    let currentData = null;

    if (id) {
      const [current] = await db.execute(
        `SELECT ${fields.join(", ")} FROM ${safeTable} WHERE id = ?`,
        [id],
      );

      if (!current.length) return true;
      currentData = current[0];
    }

    const values = [];

    for (const field of fields) {
      let value = req.body[field];

      if (value === undefined && currentData) {
        value = currentData[field];
      }

      values.push(value);
    }

    const whereClause = fields.map((f) => `${f} = ?`).join(" AND ");

    let sql = `
      SELECT id FROM ${safeTable}
      WHERE ${whereClause}
    `;

    const params = [...values];

    if (id) {
      sql += " AND id != ?";
      params.push(id);
    }

    const [rows] = await db.execute(sql, params);

    if (rows.length) throw new Error(message);

    return true;
  }),
];

/* =========================================================
UNIQUE MONTH + YEAR
========================================================= */
export const validateUniqueMonthYear = (
  table,
  message = "Ya existe un registro para ese mes y año.",
) => [
  body("month").custom(async (_, { req }) => {
    const safeTable = ALLOWED_TABLES[table];
    if (!safeTable) throw new Error("Tabla no permitida");

    const { year, month } = req.body;
    if (!year || !month) return true;

    const id = req.params?.id ? Number(req.params.id) : null;

    let sql = `
      SELECT id FROM ${safeTable}
      WHERE year = ? AND month = ?
    `;

    const params = [year, month];

    if (id) {
      sql += " AND id != ?";
      params.push(id);
    }

    const [rows] = await db.execute(sql, params);

    if (rows.length) throw new Error(message);

    return true;
  }),
];
