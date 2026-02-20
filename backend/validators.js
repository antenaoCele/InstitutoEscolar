import { body } from "express-validator";
import { db } from "./db.js";
import { ALLOWED_TABLES, isTruthy } from "./helpers.js";

/* =========================================================
   VALIDATE PERSON NAME (STUDENT, TEACHER, TUTOR) ✅
========================================================= */

export const validatePersonName = (field, optional = false) => {
  let v = body(field).trim();

  if (optional) v = v.optional({ values: "falsy" });
  else v = v.notEmpty().withMessage("Este campo es obligatorio.");

  return [
    v
      .matches(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/)
      .withMessage("Contiene caracteres inválidos.")
      .bail()
      .isLength({ max: 45 })
      .withMessage("Este campo no puede superar los 45 caracteres.")
      .bail()
      .escape(),
  ];
};

/* =========================================================
   VALIDATE DNI ✅
========================================================= */

export const validateDNI = (field, table, optional = false) => {
  const safeTable = ALLOWED_TABLES[table];
  if (!safeTable) throw new Error("Tabla no permitida en validación");

  let v = body(field).customSanitizer((v) =>
    v === undefined || v === null || v === ""
      ? undefined
      : String(v).replace(/\D/g, ""),
  );

  if (optional) v = v.optional({ values: "falsy" });
  else v = v.notEmpty().withMessage("El DNI es obligatorio.");

  return [
    v
      .isLength({ min: 7, max: 8 })
      .withMessage("Ingrese un número de DNI válido.")
      .bail()
      .isNumeric()
      .withMessage("Ingrese un número de DNI válido.")
      .bail()
      .custom(async (value, { req }) => {
        if (value === undefined) return true;

        let sql = `SELECT id FROM ${safeTable} WHERE ${field}=?`;
        const params = [value];

        if (req.params?.id) {
          sql += " AND id != ?";
          params.push(req.params.id);
        }

        const [rows] = await db.execute(sql, params);
        if (rows.length) throw new Error("El DNI ya está registrado.");
        return true;
      }),
  ];
};

/* =========================================================
   VALIDATE NAME (PLAN, SUBJECT, SCHOOL) ✅
========================================================= */

export const validateName = (field, optional = false) => {
  let v = body(field).trim();

  if (optional) v = v.optional({ values: "falsy" });
  else v = v.notEmpty().withMessage("Este campo es obligatorio.");

  return [
    v
      .matches(/^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s°º().,+\-/#]+$/)
      .withMessage("Contiene caracteres inválidos.")
      .bail()
      .isLength({ max: 45 })
      .withMessage("Este campo no puede superar los 45 caracteres."),
  ];
};

/* =========================================================
   VALIDATE PHONE ✅
========================================================= */

export const validatePhone = (field, optional = false) => {
  let v = body(field).trim();

  if (optional) v = v.optional({ values: "falsy" });
  else v = v.notEmpty().withMessage("Este campo es obligatorio.");

  return [
    v
      .isLength({ max: 20 })
      .withMessage("Este campo no puede superar los 20 caracteres.")
      .bail()
      .matches(/^[0-9+\- ]+$/)
      .withMessage("Contiene caracteres inválidos."),
  ];
};

/* =========================================================
   VALIDATE STUDENT INFO (ENROLLED, LEVEL, GRADE) ✅
========================================================= */

export const validateStudentInfo = (
  fieldEnrolled,
  fieldLevel,
  fieldGrade,
  optional = false,
) => {
  let enrolled = body(fieldEnrolled);

  if (optional) enrolled = enrolled.optional({ values: "falsy" });
  else enrolled = enrolled.notEmpty().withMessage("Este campo es obligatorio.");

  return [
    enrolled
      .isIn(["true", "false", true, false, 1, 0, "1", "0"])
      .withMessage("Valor inválido."),

    body(fieldLevel)
      .optional({ values: "falsy" })
      .custom((value, { req }) => {
        if (!isTruthy(req.body[fieldEnrolled])) return true;

        if (
          !["inicial", "primario", "secundario", "universitario"].includes(
            value,
          )
        )
          throw new Error("Elija un nivel válido.");

        return true;
      }),

    body(fieldGrade)
      .optional({ values: "falsy" })
      .toInt()
      .custom((value, { req }) => {
        if (!isTruthy(req.body[fieldEnrolled])) return true;
        if (!["primario", "secundario"].includes(req.body[fieldLevel]))
          return true;

        if (!Number.isInteger(value) || value < 1 || value > 7)
          throw new Error("Elija un grado válido.");

        return true;
      }),
  ];
};

/* =========================================================
   VALIDATE DATE ✅
========================================================= */

export const validateDate = (field, optional = false) => {
  let v = body(field).trim();

  if (optional) v = v.optional({ values: "falsy" });
  else v = v.notEmpty().withMessage("Este campo es obligatorio.");

  return [
    v
      .isISO8601({ strict: true })
      .withMessage("El formato debe ser aaaa-mm-dd.")
      .bail()
      .custom((value) => {
        const [y, m, d] = value.split("-").map(Number);

        const date = new Date(y, m - 1, d);
        if (
          date.getFullYear() !== y ||
          date.getMonth() !== m - 1 ||
          date.getDate() !== d
        )
          throw new Error("Fecha inválida.");

        const todayLocal = new Date();
        todayLocal.setHours(0, 0, 0, 0);

        if (date > todayLocal) throw new Error("La fecha no puede ser futura.");

        return true;
      }),
  ];
};

/* =========================================================
   VALIDATE HOUR ✅
========================================================= */

export const validateHour = (field, optional = false) => {
  let v = body(field).trim();

  if (optional) v = v.optional({ values: "falsy" });
  else v = v.notEmpty().withMessage("Este campo es obligatorio.");

  return [
    v
      .matches(/^([0-1]?\d|2[0-3]):[0-5]\d$/)
      .withMessage("Formato de hora inválido. Use hh:mm."),
  ];
};

/* =========================================================
   VALIDATE MONEY ✅
========================================================= */

export const validateMoney = (field, optional = false) => {
  let v = body(field).customSanitizer((v) => {
    if (v === undefined || v === null || v === "") return undefined;

    const str = String(v).trim();

    const latinFormat = /^\d{1,3}(\.\d{3})*(,\d{1,2})?$/.test(str);
    const englishFormat = /^\d{1,3}(,\d{3})*(\.\d{1,2})?$/.test(str);

    if (latinFormat) return str.replace(/\./g, "").replace(",", ".");
    if (englishFormat) return str.replace(/,/g, "");

    return str.replace(",", ".");
  });

  if (optional) v = v.optional({ values: "undefined" });
  else v = v.notEmpty().withMessage("El importe es obligatorio.");

  return [
    v
      .isFloat({ min: 0.01, max: 99999999, decimal_digits: "0,2" })
      .withMessage("Ingrese un importe válido (hasta 2 decimales).")
      .toFloat(),
  ];
};

/* =========================================================
   VALIDATE PAYMENT METHOD ✅
========================================================= */

export const validatePaymentMethod = (field, optional = false) => {
  let v = body(field).trim();

  if (optional) v = v.optional({ values: "falsy" });
  else v = v.notEmpty().withMessage("Este campo es obligatorio.");

  return [
    v
      .isIn([
        "transferencia",
        "efectivo",
        "tarjeta de crédito",
        "tarjeta de débito",
        "qr",
        "otro",
      ])
      .withMessage("Elija un método de pago válido."),
  ];
};

/* =========================================================
   VALIDATE FOREIGN KEY ✅
========================================================= */

export const validateForeignId = (field, table, optional = false) => {
  const safeTable = ALLOWED_TABLES[table];
  if (!safeTable) throw new Error("Tabla no permitida en validación");

  let v = body(field).trim();

  if (optional) {
    v = v.optional({ values: "undefined" }).toInt();
  } else {
    v = v.notEmpty().withMessage("El campo es obligatorio.").toInt();
  }

  return [
    v
      .isInt({ min: 1 })
      .withMessage("Ingrese un ID válido.")
      .bail()
      .custom(async (value) => {
        if (value === undefined || isNaN(value)) return true;

        const [rows] = await db.execute(
          `SELECT id FROM ${safeTable} WHERE id = ?`,
          [value],
        );

        if (!rows.length) throw new Error("El registro asociado no existe.");
        return true;
      }),
  ];
};

/* =========================================================
   USERNAME ✅
========================================================= */

export const validateUsername = (field, optional = false) => {
  let v = body(field).trim();

  if (optional) v = v.optional({ values: "falsy" });
  else v = v.notEmpty().withMessage("Este campo es obligatorio.");

  return [
    v
      .isAlphanumeric("es-ES")
      .withMessage("Este campo es alfanumérico.")
      .bail()
      .isLength({ max: 45 })
      .withMessage("Este campo no puede superar los 45 caracteres.")
      .bail()
      .custom(async (value, { req }) => {
        let sql = "SELECT id FROM users WHERE username=?";
        const params = [value];

        if (req.params?.id) {
          sql += " AND id!=?";
          params.push(req.params.id);
        }

        const [rows] = await db.execute(sql, params);

        if (rows.length > 0)
          throw new Error("El nombre de usuario ya está registrado");

        return true;
      }),
  ];
};

/* =========================================================
   PASSWORD ✅
========================================================= */

export const validatePassword = (field, optional = false) => {
  let v = body(field);

  if (optional) v = v.optional({ values: "falsy" });
  else v = v.notEmpty().withMessage("Este campo es obligatorio.");

  return [
    v
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "La contraseña debe contener 8 caracteres como mínimo, una mayúscula, una minúscula, un número y un símbolo.",
      ),
  ];
};

/* =========================================================
   ROLE ✅
========================================================= */

export const validateRole = (field, optional = false) => {
  let v = body(field).trim();

  if (optional) v = v.optional({ values: "falsy" });
  else v = v.notEmpty().withMessage("Este campo es obligatorio.");

  return [v.isIn(["ADMIN", "DOCENTE"]).withMessage("Rol inválido.")];
};
