import { param, validationResult } from "express-validator";

/* =========================================================
   HELPERS
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

export const validateID = param("id").isInt({ min: 1 });

/* =========================================================
   WHITELIST ✅
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
   HELPER 
========================================================= */

export const isTruthy = (v) =>
  v === true || v === "true" || v === 1 || v === "1";
