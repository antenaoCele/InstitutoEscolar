import { body } from "express-validator";
import { db } from "../db.js";
import { ALLOWED_TABLES } from "./helpers.js";

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

    const { plan_id, start_date, end_date } = req.body;

    if (!plan_id || !start_date || !end_date) return true;

    const id = req.params?.id ? Number(req.params.id) : null;

    const sql = `
      SELECT id FROM ${safeTable}
      WHERE plan_id = ?
      AND start_date <= ?
      AND end_date >= ?
      ${id ? "AND id != ?" : ""}
    `;

    const params = id
      ? [plan_id, end_date, start_date, id]
      : [plan_id, end_date, start_date];

    const [rows] = await db.execute(sql, params);

    if (rows.length) throw new Error(message);

    return true;
  }),
];

/* =========================================================
FOREIGN KEY EXISTENCE
========================================================= */
export const validateForeignId = (field, table, optional = false) => [
  body(field)
    .if((value) => value !== undefined)
    .custom(async (value) => {
      const safeTable = ALLOWED_TABLES[table];
      if (!safeTable) throw new Error("Tabla no permitida");

      const [rows] = await db.execute(
        `SELECT id FROM ${safeTable} WHERE id=?`,
        [value],
      );

      if (!rows.length) throw new Error("El registro asociado no existe.");

      return true;
    }),
];

/* =========================================================
SCHEDULE OVERLAP (CREATE)
========================================================= */
export const validateScheduleOverlap = (
  table = "schedules",
  message = "Ya existe un horario que se superpone.",
) => [
  body("teacher_id").custom(async (teacher_id, { req }) => {
    const { start_time, end_time, ...days } = req.body;

    if (!teacher_id || !start_time || !end_time) return true;

    const activeDays = Object.keys(days).filter((day) => days[day] === true);

    if (!activeDays.length) return true;

    const conditions = activeDays.map((day) => `${day} = true`).join(" OR ");

    const [rows] = await db.execute(
      `SELECT id FROM ${table}
       WHERE teacher_id = ?
       AND (${conditions})
       AND ? < end_time
       AND ? > start_time`,
      [teacher_id, start_time, end_time],
    );

    if (rows.length) throw new Error(message);

    return true;
  }),
];

/* =========================================================
SCHEDULE OVERLAP (UPDATE)
========================================================= */
export const validateScheduleOverlapOnUpdate = (
  table = "schedules",
  message = "Ya existe un horario que se superpone.",
) => [
  body("teacher_id").custom(async (_, { req }) => {
    const id = Number(req.params.id);
    if (!id) return true;

    const [current] = await db.execute(`SELECT * FROM ${table} WHERE id = ?`, [
      id,
    ]);

    if (!current.length) return true;

    const base = current[0];

    const teacher_id = req.body.teacher_id ?? base.teacher_id;
    const start_time = req.body.start_time ?? base.start_time;
    const end_time = req.body.end_time ?? base.end_time;

    const days = {
      monday: req.body.monday ?? base.monday,
      tuesday: req.body.tuesday ?? base.tuesday,
      wednesday: req.body.wednesday ?? base.wednesday,
      thursday: req.body.thursday ?? base.thursday,
      friday: req.body.friday ?? base.friday,
      saturday: req.body.saturday ?? base.saturday,
      sunday: req.body.sunday ?? base.sunday,
    };

    const activeDays = Object.keys(days).filter(
      (d) => days[d] === 1 || days[d] === true,
    );
    if (!activeDays.length) return true;

    const conditions = activeDays.map((day) => `${day} = true`).join(" OR ");

    const [rows] = await db.execute(
      `SELECT id FROM ${table}
       WHERE teacher_id = ?
       AND (${conditions})
       AND ? < end_time
       AND ? > start_time
       AND id != ?`,
      [teacher_id, start_time, end_time, id],
    );

    if (rows.length) throw new Error(message);

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
  body(field).custom(async (value, { req }) => {
    if (value === undefined) return true;

    const safeTable = ALLOWED_TABLES[table];
    if (!safeTable) throw new Error("Tabla no permitida");

    let sql = `SELECT id FROM ${safeTable} WHERE ${field}=?`;
    const params = [value];

    if (req.params?.id) {
      sql += " AND id!=?";
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

    const values = [];

    for (const field of fields) {
      let value = req.body[field];

      if (id && value === undefined) {
        const [current] = await db.execute(
          `SELECT ${fields.join(", ")} FROM ${safeTable} WHERE id = ?`,
          [id],
        );

        if (!current.length) return true;
        value = current[0][field];
      }

      values.push(value);
    }

    const whereClause = fields.map((f) => `${f} = ?`).join(" AND ");

    const sql = `
      SELECT id FROM ${safeTable}
      WHERE ${whereClause}
      ${id ? "AND id != ?" : ""}
    `;

    const params = id ? [...values, id] : values;

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

    const sql = `
      SELECT id FROM ${safeTable}
      WHERE year = ? AND month = ?
      ${id ? "AND id != ?" : ""}
    `;

    const params = id ? [year, month, id] : [year, month];

    const [rows] = await db.execute(sql, params);

    if (rows.length) throw new Error(message);

    return true;
  }),
];
