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
export const validateScheduleOverlap = (
  table = "schedules",
  message = "Ya existe un horario que se superpone.",
) => [
  body("teacher_id").custom(async (teacher_id, { req }) => {
    const safeTable = ALLOWED_TABLES[table];
    if (!safeTable) throw new Error("Tabla no permitida");

    let { start_time, end_time, day } = req.body;
    const { id } = req.params;

    if (id) {
      const [rows] = await db.execute(
        `SELECT teacher_id, start_time, end_time, day
         FROM ${safeTable}
         WHERE id = ?`,
        [id],
      );

      if (!rows.length) throw new Error("Horario no encontrado");

      const current = rows[0];

      teacher_id = teacher_id ?? current.teacher_id;
      start_time = start_time ?? current.start_time;
      end_time = end_time ?? current.end_time;
      day = day ?? current.day;
    }

    if (!teacher_id || !start_time || !end_time || !day) return true;

    let sql = `
      SELECT id FROM ${safeTable}
      WHERE teacher_id = ?
      AND day = ?
      AND ? < end_time
      AND ? > start_time
    `;

    const params = [teacher_id, day, start_time, end_time];

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
