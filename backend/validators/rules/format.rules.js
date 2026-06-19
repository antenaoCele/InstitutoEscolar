import { body } from "express-validator";
import { baseField, isTruthy } from "../helpers/validations.helpers.js";

/* =========================================================
DATE
========================================================= */
export const validateDate = (field, optional = false) => [
  baseField(field, optional)
    .trim()
    .isISO8601({ strict: true })
    .withMessage("Ingrese una fecha válida.")
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
DATE RANGE
========================================================= */
export const validateDateRange = (
  startField,
  endField,
  optional = false,
  message = "La fecha de cierre debe ser posterior a la fecha de inicio.",
) => {
  let validator = body(endField);

  if (optional) {
    validator = validator.optional();
  }

  return [
    validator.custom((endValue, { req }) => {
      const startValue = req.body[startField];

      if (!startValue || !endValue) return true;

      const startDate = new Date(startValue);
      const endDate = new Date(endValue);

      if (endDate < startDate) {
        throw new Error(message);
      }

      return true;
    }),
  ];
};

/* =========================================================
DAY
========================================================= */
export const validateDay = (field, optional = false) => [
  baseField(field, optional)
    .toInt()
    .isInt({ min: 1, max: 6 })
    .withMessage("Ingrese un número válido (del 1 al 6)."),
];

/* =========================================================
DAY EVENT
========================================================= */

export const validateDayEvent = (field, optional = false) => [
  baseField(field, optional)
    .trim()
    .isISO8601({ strict: true })
    .withMessage("Ingrese una fecha válida.")
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

      return true;
    }),
];

/* =========================================================
DNI
========================================================= */
export const validateDNI = (field, optional = false) => [
  baseField(field, optional)
    .trim()
    .notEmpty()
    .withMessage("Este campo no puede estar vacío.")
    .bail()
    .isNumeric()
    .withMessage("Este campo no puede contener un DNI no válido.")
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
CLASSROOM
========================================================= */
export const validateClassroom = (field, optional = false) => [
  baseField(field, optional)
    .trim()
    .toUpperCase()
    .isIn(["A", "B"])
    .withMessage("El aula debe ser A o B."),
];

/* =========================================================
FOREIGN KEY FORMAT
========================================================= */
export const validateFKFormat = (field, optional = false) => [
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
HOUR
========================================================= */
export const validateHour = (field, optional = false) => [
  baseField(field, optional)
    .trim()
    .matches(/^([0-1]?\d|2[0-3]):[0-5]\d$/)
    .withMessage("Formato de hora inválido. Use hh:mm."),
];

// /* =========================================================
// HOUR RANGE
// ========================================================= */
// export const validateHourRange = (
//   startField,
//   endField,
//   optional = false,
//   optional = false,
//   message = "La hora de fin debe ser mayor a la hora de inicio.",
// ) => {
//   let validator = body(endField);

//   if (optional) {
//     validator = validator.optional();
//   }

//   return [
//     validator.custom((endValue, { req }) => {
//       const startValue = req.body[startField];

//       if (!startValue || !endValue) return true;

//       if (startValue >= endValue) {
//         throw new Error(message);
//       }

//       return true;
//     }),
//   ];
// };

/* =========================================================
INFO STUDENT
========================================================= */
export const validateStudentInfo = (
  fieldLevel,
  fieldGrade,
  optional = false,
) => {
  const levelValidator = optional
    ? body(fieldLevel).optional({ values: "falsy" })
    : body(fieldLevel)
        .notEmpty()
        .withMessage("Este campo no puede estar vacío.");

  return [
    /* ================ LEVEL ================ */
    levelValidator
      .isIn(["Inicial", "Primario", "Secundario", "Universitario"])
      .withMessage("Seleccione una opción válida.")
      .bail(),

    /* ================ GRADE ================ */
    body(fieldGrade)
      .notEmpty()
      .withMessage("Seleccione una opción válida.")
      .bail()
      .custom((value) => {
        const grade = Number(value);

        if (!Number.isInteger(grade) || grade < 1 || grade > 7) {
          throw new Error("El grado no es válido.");
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
MONTH
========================================================= */
export const validateMonth = (field, optional = false) => [
  baseField(field, optional)
    .trim()
    .isInt({ min: 1, max: 12 })
    .withMessage("Mes inválido. Debe ser un número entre 1 y 12."),
];

/* =========================================================
NAME
========================================================= */
export const validateName = (field, optional = false) => [
  baseField(field, optional)
    .trim()
    .notEmpty()
    .withMessage("Este campo no puede estar vacío.")
    .bail()
    .matches(/^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s°º().,+\-/#]+$/)
    .withMessage("Este campo no puede contener caracteres no válidos.")
    .bail()
    .isLength({ min: 3 })
    .withMessage("Este campo debe superar los 3 caracteres.")
    .isLength({ max: 45 })
    .withMessage("Este campo no puede superar los 45 caracteres.")
    .escape(),
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
PAYMENT METHOD
========================================================= */
export const validatePaymentMethod = (field, optional = false) => [
  baseField(field, optional)
    .trim()
    .isIn(["transferencia", "efectivo", "qr", "otro"])
    .withMessage("Método de pago no válido."),
];

/* =========================================================
PERSON NAME
========================================================= */
export const validatePersonName = (field, optional = false) => [
  baseField(field, optional)
    .trim()
    .notEmpty()
    .withMessage("Este campo no puede estar vacío.")
    .bail()
    .matches(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/)
    .withMessage("Este campo no puede contener caracteres no válidos.")
    .bail()
    .isLength({ min: 3 })
    .withMessage("Este campo debe superar los 3 caracteres.")
    .isLength({ max: 45 })
    .withMessage("Este campo no puede superar los 45 caracteres.")
    .escape(),
];

/* =========================================================
PHONE
========================================================= */
export const validatePhone = (field, optional = false) => [
  baseField(field, optional)
    .notEmpty()
    .withMessage("Este campo no puede estar vacío.")
    .bail()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Este campo no puede superar los 20 caracteres.")
    .bail()
    .matches(/^[0-9+\- ]+$/)
    .withMessage("Este campo no puede contener caracteres no válidos."),
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

/* =========================================================
START TIME
========================================================= */
export const validateStartTime = (field, optional = false) => [
  baseField(field, optional).custom((value) => {
    if (value === undefined) return true;

    const validHours = [
      "08:00",
      "09:30",
      "11:00",
      "15:00",
      "16:30",
      "18:00",
      "19:30",
      "21:00",
    ];

    if (!validHours.includes(value)) {
      throw new Error("El horario seleccionado no es válido.");
    }

    return true;
  }),
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
    .isLength({ min: 3 })
    .withMessage("Este campo debe superar los 3 caracteres.")
    .isLength({ max: 45 })
    .withMessage("Este campo no puede superar los 45 caracteres."),
];

/* =========================================================
YEAR
========================================================= */
export const validateYear = (field, optional = false) => [
  baseField(field, optional)
    .trim()
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Año inválido."),
];
