import { param, validationResult } from "express-validator";

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
   VALIDATE ID
========================================================= */

export const validateID = (tableName) => {
  const safeTable = ALLOWED_TABLES[tableName];
  if (!safeTable) throw new Error("Tabla no permitida en validación");

  return [
    param("id")
      .isInt({ min: 1 })
      .withMessage("El ID debe ser un número entero mayor a 0.")
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

/* =========================================================
   WHITELIST 
========================================================= */

export const ALLOWED_TABLES = {
  students: "students",
  teachers: "teachers",
  tutors: "tutors",
  plans: "plans",
  subjects: "subjects",
  schedules: "schedules",
};

/* =========================================================
   IS TRUTHY 
========================================================= */

export const isTruthy = (v) =>
  v === true || v === "true" || v === 1 || v === "1";
