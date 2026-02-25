import { body } from "express-validator";
import { isTruthy, baseField } from "./helpers.js";

/* =========================================================
PERSON NAME
========================================================= */
export const validatePersonName = (field, optional = false) => [
  baseField(field, optional)
    .trim()
    .matches(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/)
    .withMessage("Contiene caracteres inválidos.")
    .bail()
    .isLength({ max: 45 })
    .withMessage("Máximo 45 caracteres.")
    .escape(),
];

/* =========================================================
DNI
========================================================= */
export const validateDNI = (field, optional = false) => [
  baseField(field, optional)
    .isNumeric()
    .withMessage("Ingrese un DNI válido.")
    .customSanitizer((v) =>
      v === undefined || v === null || v === ""
        ? undefined
        : String(v).replace(/\D/g, ""),
    )
    .bail()
    .isLength({ min: 7, max: 8 })
    .withMessage("Ingrese un DNI válido."),
];

/* =========================================================
NAME
========================================================= */
export const validateName = (field, optional = false) => [
  baseField(field, optional)
    .trim()
    .matches(/^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s°º().,+\-/#]+$/)
    .withMessage("Contiene caracteres inválidos.")
    .bail()
    .isLength({ max: 45 })
    .withMessage("Este campo no puede superar los 45 caracteres.")
    .escape(),
];

/* =========================================================
PHONE
========================================================= */
export const validatePhone = (field, optional = false) => [
  baseField(field, optional)
    .trim()
    .isLength({ max: 20 })
    .withMessage("Este campo no puede superar los 20 caracteres.")
    .bail()
    .matches(/^[0-9+\- ]+$/)
    .withMessage("Contiene caracteres inválidos."),
];

/* =========================================================
INFO STUDENT
========================================================= */

export const validateStudentInfo = (
  fieldEnrolled,
  fieldLevel,
  fieldGrade,
  optional = false,
) => {
  const enrolledValidator = optional
    ? body(fieldEnrolled).optional({ values: "falsy" })
    : body(fieldEnrolled).notEmpty().withMessage("Este campo es obligatorio.");

  return [
    /* ================ ENROLLED ================ */
    enrolledValidator
      .isIn(["true", "false", true, false, 1, 0, "1", "0"])
      .withMessage("Valor inválido.")
      .bail(),

    /* ================ LEVEL ================ */
    body(fieldLevel)
      .custom((value, { req }) => {
        const enrolled = isTruthy(req.body[fieldEnrolled]);

        if (!enrolled) {
          if (value !== undefined && value !== "")
            throw new Error("No debe especificar nivel si no está inscripto.");
          return true;
        }

        if (!value) throw new Error("Debe indicar el nivel.");

        if (
          !["inicial", "primario", "secundario", "universitario"].includes(
            value,
          )
        )
          throw new Error("Elija un nivel válido.");

        return true;
      })
      .bail(),

    /* ================ GRADE ================ */
    body(fieldGrade)
      // Solo evaluar grade si level es válido y requiere grado
      .custom((value, { req }) => {
        const enrolled = isTruthy(req.body[fieldEnrolled]);
        const level = req.body[fieldLevel];

        if (!enrolled) {
          if (value !== undefined && value !== "")
            throw new Error("No debe indicar grado si no está inscripto.");
          return true;
        }

        if (!value) throw new Error("Debe indicar el grado.");

        const grade = Number(value);

        if (!Number.isInteger(grade) || grade < 1 || grade > 7)
          throw new Error("Elija un grado válido (1 a 7).");

        return true;
      }),
  ];
};

/* =========================================================
DATE
========================================================= */
export const validateDate = (field, optional = false) => [
  baseField(field, optional)
    .trim()
    .isISO8601({ strict: true })
    .withMessage("Formato debe ser YYYY-MM-DD.")
    .bail()
    .custom((value) => {
      const [year, month, day] = value.split("-").map(Number);

      const date = new Date(Date.UTC(year, month - 1, day));

      if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
      ) {
        throw new Error("Fecha inválida.");
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const inputDate = new Date(year, month - 1, day);

      if (inputDate > today) throw new Error("La fecha no puede ser futura.");

      return true;
    }),
];

/* =========================================================
HOUR
========================================================= */
export const validateHour = (field, optional = false) => [
  baseField(field, optional)
    .trim()
    .matches(/^([0-1]?\d|2[0-3]):[0-5]\d$/)
    .withMessage("Formato de hora inválido. Use hh:mm."),
];

/* =========================================================
VALIDATE TIME RANGE
========================================================= */
export const validateTimeRange = (
  startField,
  endField,
  optional = false,
  message = "La hora de fin debe ser mayor a la hora de inicio.",
) => {
  let validator = body(endField);

  if (optional) {
    validator = validator.optional();
  }

  return [
    validator.custom((endValue, { req }) => {
      const startValue = req.body[startField];

      if (!startValue || !endValue) return true;

      if (startValue >= endValue) {
        throw new Error(message);
      }

      return true;
    }),
  ];
};

/* =========================================================
MONEY
========================================================= */
export const validateMoney = (field, optional = false) => [
  baseField(field, optional)
    .customSanitizer((value) => {
      if (value === undefined || value === null || value === "")
        return undefined;

      value = String(value).trim();

      if (value.includes(",") && value.includes(".")) {
        value = value.replace(/\./g, "").replace(",", ".");
      } else if (value.includes(",")) {
        value = value.replace(",", ".");
      }

      return value;
    })
    .isFloat({ min: 0.01, max: 99999999, decimal_digits: "0,2" })
    .withMessage("Importe inválido.")
    .bail()
    .toFloat(),
];

/* =========================================================
PAYMENT METHOD
========================================================= */
export const validatePaymentMethod = (field, optional = false) => [
  baseField(field, optional)
    .trim()
    .isIn([
      "transferencia",
      "efectivo",
      "tarjeta de crédito",
      "tarjeta de débito",
      "qr",
      "otro",
    ])
    .withMessage("Método de pago no válido."),
];

/* =========================================================
FOREIGN KEY FORMAT
========================================================= */
export const validateIdFormat = (field, optional = false) => [
  baseField(field, optional)
    .customSanitizer((value) => {
      if (value === undefined || value === null || value === "")
        return undefined;
      return value;
    })
    .if((value) => value !== undefined)
    .isInt({ min: 1 })
    .withMessage("ID inválido.")
    .toInt(),
];

/* =========================================================
USERNAME
========================================================= */
export const validateUsername = (field, optional = false) => [
  baseField(field, optional)
    .trim()
    .isAlphanumeric("es-ES")
    .withMessage("Este campo es alfanumérico.")
    .bail()
    .isLength({ max: 45 })
    .withMessage("Este campo no puede superar los 45 caracteres."),
];

/* =========================================================
PASSWORD
========================================================= */
export const validatePassword = (field, optional = false) => [
  baseField(field, optional)
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

/* =========================================================
ROLE
========================================================= */
export const validateRole = (field, optional = false) => [
  baseField(field, optional)
    .trim()
    .isIn(["ADMIN", "DOCENTE"])
    .withMessage("Rol inválido."),
];
