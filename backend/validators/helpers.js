import { param, validationResult } from "express-validator";
import { db } from "../db.js";

/* =========================================================
WHITELIST
========================================================= */
export const ALLOWED_TABLES = {
  payments: "payments",
  plan_subjects: "plan_subjects",
  plans: "plans",
  schedule_students: "schedule_students",
  schedules: "schedules",
  student_plans: "student_plans",
  student_tutors: "student_tutors",
  students: "students",
  subjects: "subjects",
  teacher_liquidations: "teacher_liquidations",
  teacher_subjects: "teacher_subjects",
  teachers: "teachers",
  tutors: "tutors",
  users: "users",
};

/* =========================================================
TRUTHY
========================================================= */
export const isTruthy = (v) => {
  return v === true || v === "true" || v === 1 || v === "1";
};

/* =========================================================
CHECK VALIDATIONS
========================================================= */
export const checkValidations = (req, res, next) => {
  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Falla de validacion",
      errors: validation.array(),
    });
  }

  next();
};

/* =========================================================
ID
========================================================= */
export const validateID = (tableName) => {
  return [
    param("id")
      .isInt({ min: 1 })
      .withMessage("El ID debe ser un número entero mayor a 0.")
      .bail()
      .custom(async (value) => {
        const safeTable = ALLOWED_TABLES[tableName];

        if (!safeTable) {
          throw new Error(`La tabla '${tableName}' no está permitida`);
        }

        const [rows] = await db.execute(
          `SELECT id FROM ${safeTable} WHERE id = ?`,
          [Number(value)],
        );

        if (rows.length === 0) {
          throw new Error("No se encontró el registro.");
        }

        return true;
      }),
  ];
};

/* =========================================================
BASE FIELD BUILDER
========================================================= */
export const baseField = (field, optional) => {
  let v = body(field);

  if (optional) return v.optional({ values: "falsy" });
  return v.notEmpty().withMessage("Este campo es obligatorio.");
};
