import { body } from "express-validator";
import { db } from "../db.js";
import { ALLOWED_TABLES } from "./helpers.js";

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
UNIQUE RELATION
========================================================= */
export const validateUniqueRelation = (
  table,
  fieldA,
  fieldB,
  message = "La combinación de registros ya está registrada.",
) => [
  body(fieldB).custom(async (_, { req }) => {
    const safeTable = ALLOWED_TABLES[table];
    if (!safeTable) throw new Error("Tabla no permitida");

    const id = req.params?.id ? Number(req.params.id) : null;

    let valueA = req.body[fieldA];
    let valueB = req.body[fieldB];

    // Si es update y no mandan ambos campos, traemos los actuales
    if (id && (valueA === undefined || valueB === undefined)) {
      const [current] = await db.execute(
        `SELECT ${fieldA}, ${fieldB} FROM ${safeTable} WHERE id = ?`,
        [id],
      );

      if (!current.length) return true;

      valueA = valueA ?? current[0][fieldA];
      valueB = valueB ?? current[0][fieldB];
    }

    const sql = `
      SELECT id FROM ${safeTable}
      WHERE ${fieldA} = ? AND ${fieldB} = ?
      ${id ? "AND id != ?" : ""}
    `;

    const params = id ? [valueA, valueB, id] : [valueA, valueB];

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
VALIDATE SCHEDULE OVERLAP (CREATE)
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
VALIDATE SCHEDULE OVERLAP (UPDATE)
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
