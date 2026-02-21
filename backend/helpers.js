import { param, validationResult } from "express-validator";
import { db } from "./db.js";

/* =========================================================
WHITELIST
========================================================= */
export const ALLOWED_TABLES = {
  students: "students",
  teachers: "teachers",
  tutors: "tutors",
  plans: "plans",
  plan_subjects: "plan_subjects",
  subjects: "subjects",
  schedules: "schedules",
  schedule_students: "schedule_students",
  payments: "payments",
  student_plans: "student_plans",
  teacher_liquidations: "teacher_liquidations",
  teacher_subjects: "teacher_subjects",
  users: "users",
  student_tutors: "student_tutors",
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
  const safeTable = ALLOWED_TABLES[tableName];
  if (!safeTable) throw new Error("Tabla no permitida en validación");

  return [
    param("id")
      .isInt({ min: 1 })
      .withMessage("El ID debe ser un número entero mayor a 0.")
      .bail()
      .custom(async (value) => {
        const [rows] = await db.execute(
          `SELECT id FROM ${safeTable} WHERE id = ?`,
          [Number(value)],
        );

        if (rows.length === 0) throw new Error("No se encontró el registro.");
        return true;
      }),
  ];
};
