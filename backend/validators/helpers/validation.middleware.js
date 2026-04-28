import { param, validationResult } from "express-validator";
import { db } from "../../db.js";
import { ALLOWED_TABLES } from "./validations.helpers.js";

/* =========================================================
CHECK VALIDATIONS
========================================================= */
export const checkValidations = (req, res, next) => {
  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Falla de validación",
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
