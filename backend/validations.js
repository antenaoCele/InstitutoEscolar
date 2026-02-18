import { param, body, validationResult } from "express-validator";
import { db } from "./db.js";

import { body } from "express-validator";
import { db } from "./db.js";

// ----------------------
// Validación nombre y apellido
// ----------------------
export const validateNames = (name) =>
  body(name)
    .trim()
    .notEmpty()
    .withMessage("Este campo es obligatorio.")
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("Este campo solo puede contener letras.")
    .isLength({ max: 45 })
    .withMessage("No puedes superar los 45 caracteres.");

// ----------------------
// Validación username
// ----------------------
export const validateUsername = (isEdit = false) =>
  body("username")
    .trim()
    .notEmpty()
    .withMessage("El nombre de usuario es obligatorio.")
    .isAlphanumeric("es-ES")
    .withMessage("El nombre de usuario debe ser alfanumérico y sin espacios.")
    .isLength({ max: 45 })
    .withMessage("El nombre de usuario no puede tener más de 45 caracteres.")
    .custom(async (value, { req }) => {
      let query = "SELECT id FROM users WHERE username = ?";
      const params = [value];

      if (isEdit) {
        const { id } = req.params;
        query += " AND id != ?";
        params.push(id);
      }

      const [rows] = await db.execute(query, params);
      if (rows.length > 0)
        throw new Error("El nombre de usuario ya está registrado");
      return true;
    });

// ----------------------
// Validación contraseña
// ----------------------
export const validatePassword = (optional = false) => {
  let validator = body("password");
  if (optional)
    validator = validator.optional({ nullable: true, checkFalsy: true });

  return validator
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.",
    );
};

// ----------------------
// Validación rol
// ----------------------
export const validateRole = () =>
  body("role")
    .trim()
    .notEmpty()
    .withMessage("El rol es obligatorio.")
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("El rol solo puede contener letras.")
    .isIn(["ADMIN", "DOCENTE"])
    .withMessage("El rol debe ser ADMIN o DOCENTE.");

// ----------------------
// Validación DNI
// ----------------------
export const validateDNI = (fieldName = "dni", tableName, isEdit = false) =>
  body(fieldName)
    .isInt({ min: 1000000, max: 99999999 })
    .withMessage("El DNI debe ser un número válido y hasta 8 dígitos.")
    .custom(async (value, { req }) => {
      let query = `SELECT id FROM ${tableName} WHERE ${fieldName} = ?`;
      const params = [value];

      if (isEdit) {
        const { id } = req.params; // id del registro que estamos editando
        query += " AND id != ?";
        params.push(id);
      }

      const [rows] = await db.execute(query, params);
      if (rows.length > 0) throw new Error(`${fieldName} ya registrado`);
      return true;
    });

// ----------------------
// Validación NUMERO
// ----------------------
export const validatePhone = () =>
  body("phone")
    .trim()
    .isLength({ max: 20 })
    .withMessage("El teléfono no puede superar los 20 caracteres.")
    .matches(/^[0-9+\- ]+$/)
    .withMessage("El teléfono solo puede contener números, + o -");

// ----------------------
// Validación MONTOS
// ----------------------
export const validateMoney = (monto) =>
  body(monto)
    .notEmpty()
    .withMessage("El sueldo es obligatorio.")
    .isDecimal({ decimal_digits: "1,2" })
    .withMessage("El sueldo debe ser un número decimal válido.")
    .custom((value) => {
      if (parseFloat(value) <= 0) {
        throw new Error("El sueldo debe ser mayor a 0");
      }
      return true;
    });

// ----------------------
// Validación FECHAS
// ----------------------
export const validateDate = (date) =>
  body(date)
    .trim()
    .notEmpty()
    .withMessage("Este campo es obligatorio.")
    .isISO8601()
    .withMessage("La fecha debe tener formato válido (YYYY-MM-DD).")
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();

      if (date > today) {
        throw new Error("La fecha no puede ser futura.");
      }
    });

// ------------------------------
// Validación IDS de otras tablas
// ------------------------------
export const validateForeignId = (field, table, optional = false) => {
  let validator = body(field);

  if (optional) {
    validator = validator.optional({ checkFalsy: true });
  }

  return validator
    .notEmpty()
    .withMessage("El campo es obligatorio.")
    .isInt({ min: 1 })
    .withMessage("El identificador debe ser válido.")
    .custom(async (value) => {
      const [rows] = await db.execute(`SELECT id FROM ${table} WHERE id = ?`, [
        value,
      ]);

      if (rows.length === 0) {
        throw new Error("El registro asociado no existe.");
      }

      return true;
    });
};

// ------------------------------
// Validación info estudiante
// ------------------------------

export const validateStudentInfo = () => [
  // Estado de inscripción
  body("enrolled")
    .isBoolean()
    .withMessage("La inscripción debe ser un valor booleano.")
    .toBoolean(),

  // Nivel educativo
  body("level")
    .isString()
    .withMessage("El nivel debe ser un texto válido.")
    .trim()
    .toLowerCase()
    .isIn(["inicial", "primario", "secundario", "universitario"])
    .withMessage(
      "El nivel debe ser inicial, primario, secundario o universitario.",
    ),

  // Grado / Año
  body("grade")
    .isInt()
    .withMessage("El grado debe ser un número entero.")
    .toInt()
    .isIn([1, 2, 3, 4, 5, 6, 7])
    .withMessage("La categoría debe ser del 1 al 7"),
];

// ------------------------------
// Validación de HORA
// ------------------------------
export const validateHour = (hour) =>
  body(hour)
    .notEmpty()
    .withMessage("La hora de fin es obligatoria.")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("La hora de fin debe tener formato HH:MM.");

// =============================================================================
// ID Y AUTH
// =============================================================================

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

export const validateLogin = [
  body("username").notEmpty().withMessage("El username es obligatorio."),
  body("password").notEmpty().withMessage("La contraseña es obligatoria."),
];

// =============================================================================
// USERS
// =============================================================================

export const validateUsers = [
  validateNames("first_name"),
  validateNames("last_name"),
  validateUsername(),
  validatePassword(),
  validateRole(),
];

// =============================================================================
// USERS (PUT)
// =============================================================================

export const validateEditUsers = [
  validateNames("first_name"),
  validateNames("last_name"),
  validateUsername(true), // true = ignorar su propio ID
  validatePassword(true), // opcional, si no viene no valida
  validateRole(),
];

// =============================================================================
// STUDENTS
// =============================================================================

export const validateStudents = [
  validateNames("first_name"),
  validateNames("last_name"),
  validateDNI("dni", "students"),
  validateNames("school"),
  validateDate("birth_date"),
  validateStudentInfo(),
];

// =============================================================================
// STUDENTS (PUT)
// =============================================================================

export const validateEditStudents = [
  validateNames("first_name"),
  validateNames("last_name"),
  validateDNI("dni", "students", true),
  validateNames("school"),
  validateDate("birth_date"),
  validateStudentInfo(),
];

// =============================================================================
// TEACHERS
// =============================================================================

export const validateTeachers = [
  validateNames("first_name"),
  validateNames("last_name"),
  validateDNI("dni", "students"),
  validatePhone(),
];

// =============================================================================
// TUTORS
// =============================================================================

export const validateTutors = [
  validateNames("first_name"),
  validateNames("last_name"),
  validateDNI("dni", "students"),
  validatePhone(),
];

// =============================================================================
// PAYMENTS
// =============================================================================

export const validatePayments = [
  validateForeignId("student_id", "students"),
  validateDate("payment_date"),
  validateMoney("amount"),
  body("payment_method")
    .trim()
    .notEmpty()
    .withMessage("El método de pago es obligatorio.")
    .isIn(
      "transferencia",
      "efectivo",
      "tarjeta de crédito",
      "tarjeta de débito",
      "qr",
      "otro",
    )
    .withMessage("El método de pago no es válido"),
];

// =============================================================================
// PLAN_SUBJECTS
// =============================================================================

export const validatePlanSubjects = [
  validateForeignId("plan_id", "plans"),
  validateForeignId("subject_id", "subjects"),

  body("subject_id").custom(async (subject_id, { req }) => {
    const [relation] = await db.execute(
      "SELECT id FROM plan_subjects WHERE plan_id = ? AND subject_id = ?",
      [req.body.plan_id, subject_id],
    );
    if (relation.length > 0) {
      throw new Error("El plan ya tiene asignada esta materia.");
    }
    return true;
  }),
];

// =============================================================================
// PLANS
// =============================================================================

export const validatePlans = [validateNames("name"), validateMoney("price")];

// =============================================================================
// SCHEDULE_STUDENTS
// =============================================================================

export const validateScheduleStudents = [
  validateForeignId("student_id", "students"),
  validateForeignId("schedule_id", "schedules"),
  body("schedule_id").custom(async (schedule_id, { req }) => {
    const [relation] = await db.execute(
      "SELECT id FROM schedule_students WHERE student_id = ? AND schedule_id = ?",
      [req.body.student_id, schedule_id],
    );

    if (relation.length > 0) {
      throw new Error("El estudiante ya tiene asignado este horario.");
    }
    return true;
  }),
];

// =============================================================================
// SCHEDULES
// =============================================================================

export const validateSchedules = [
  validateForeignId("teacher_id", "teachers"),
  body("teacher_id").custom(async (teacher_id, { req }) => {
    const { start_time, end_time, ...days } = req.body;

    const activeDays = Object.keys(days).filter((day) => days[day] === true);

    if (activeDays.length === 0) return true;

    const conditions = activeDays.map((day) => `${day} = true`).join(" OR ");

    const [rows] = await db.execute(
      `SELECT id FROM schedules
     WHERE teacher_id = ?
     AND (${conditions})
     AND ? < end_time
     AND ? > start_time`,
      [teacher_id, start_time, end_time],
    );

    if (rows.length > 0) {
      throw new Error("El docente ya tiene una clase en ese día y horario.");
    }

    return true;
  }),

  validateHour("start_time"),
  validateHour("end_time"),
  body("end_time").custom((value, { req }) => {
    if (req.body.start_time >= value) {
      throw new Error("La hora de fin debe ser mayor a la hora de inicio.");
    }
    return true;
  }),
];

// =============================================================================
// STUDENT_PLANS
// =============================================================================

export const validateStudentPlans = [
  validateForeignId("student_id", "students"),
  validateForeignId("plan_id", "plans"),
  body("plan_id").custom(async (plan_id, { req }) => {
    const [relation] = await db.execute(
      "SELECT id FROM student_plans WHERE student_id = ? AND plan_id = ?",
      [req.body.student_id, plan_id],
    );
    if (relation.length > 0) {
      throw new Error("El alumno ya tiene asignado este plan.");
    }
    return true;
  }),
  validateDate("start_date"),
];

// =============================================================================
// STUDENT_PLANS (PUT)
// =============================================================================

export const validateEditStudentPlans = [
  body("student_id")
    .notEmpty()
    .withMessage("El estudiante es obligatorio.")
    .isInt({ min: 1 })
    .withMessage("El estudiante debe ser válido")
    .custom(async (student_id) => {
      const [rows] = await db.execute("SELECT id FROM students WHERE id = ?", [
        student_id,
      ]);
      if (rows.length === 0) {
        throw new Error("El estudiante no existe.");
      }
      return true;
    }),

  body("plan_id")
    .notEmpty()
    .withMessage("El plan es obligatorio.")
    .isInt({ min: 1 })
    .withMessage("El plan debe ser válido.")
    .custom(async (plan_id, { req }) => {
      const [rows] = await db.execute("SELECT id FROM plans WHERE id = ?", [
        plan_id,
      ]);
      if (rows.length === 0) {
        throw new Error("El plan no existe.");
      }

      const recordId = req.params.id;
      const studentId = req.body.student_id;

      const [relation] = await db.execute(
        "SELECT id FROM student_plans WHERE student_id = ? AND plan_id = ? AND id != ?",
        [studentId, plan_id, recordId],
      );

      if (relation.length > 0) {
        throw new Error("El alumno ya tiene asignado este plan.");
      }

      return true;
    }),

  body("paid_amount")
    .notEmpty()
    .withMessage("El monto pagado es obligatorio.")
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("El monto pagado debe ser válido."),

  body("start_date")
    .notEmpty()
    .withMessage("La fecha de inicio es obligatoria.")
    .isISO8601()
    .withMessage("La fecha debe tener formato AAAA-MM-DD."),
];

// =============================================================================
// STUDENT_TUTORS
// =============================================================================

export const validateStudentTutors = [
  body("student_id")
    .notEmpty()
    .withMessage("El alumno es obligatorio.")
    .isInt({ min: 1 })
    .withMessage("El alumno debe ser válido.")
    .custom(async (value) => {
      const [rows] = await db.execute("SELECT id FROM students WHERE id = ?", [
        value,
      ]);
      if (rows.length === 0) {
        throw new Error("El alumno no existe.");
      }
      return true;
    }),

  body("tutor_id")
    .notEmpty()
    .withMessage("El tutor es obligatorio.")
    .isInt({ min: 1 })
    .withMessage("El tutor debe ser válido.")
    .custom(async (value, { req }) => {
      const [rows] = await db.execute("SELECT id FROM tutors WHERE id = ?", [
        value,
      ]);
      if (rows.length === 0) {
        throw new Error("El tutor no existe.");
      }

      const [relacion] = await db.execute(
        "SELECT id FROM student_tutors WHERE student_id = ? AND tutor_id = ?",
        [req.body.student_id, value],
      );

      if (relacion.length > 0) {
        throw new Error("El tutor ya está asignado a este alumno.");
      }

      return true;
    }),
];

// =============================================================================
// STUDENT_TUTORS (PUT)
// =============================================================================

export const validateEditStudentTutors = [
  body("student_id")
    .notEmpty()
    .withMessage("El alumno es obligatorio.")
    .isInt({ min: 1 })
    .withMessage("El alumno debe ser válido.")
    .custom(async (value) => {
      const [rows] = await db.execute("SELECT id FROM students WHERE id = ?", [
        value,
      ]);
      if (rows.length === 0) {
        throw new Error("El alumno no existe.");
      }
      return true;
    }),

  body("tutor_id")
    .notEmpty()
    .withMessage("El tutor es obligatorio.")
    .isInt({ min: 1 })
    .withMessage("El tutor debe ser válido.")
    .custom(async (value, { req }) => {
      const [rows] = await db.execute("SELECT id FROM tutors WHERE id = ?", [
        value,
      ]);
      if (rows.length === 0) {
        throw new Error("El tutor no existe.");
      }

      const [relacion] = await db.execute(
        "SELECT id FROM student_tutors WHERE student_id = ? AND tutor_id = ? AND id != ?",
        [req.body.student_id, value, req.params.id],
      );

      if (relacion.length > 0) {
        throw new Error("El tutor ya está asignado a este alumno.");
      }

      return true;
    }),
];

// =============================================================================
// SUBJECTS
// =============================================================================

export const validateSubjects = [
  body("name")
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("La materia debe ser alfabética.")
    .trim()
    .notEmpty()
    .withMessage("La materia es obligatoria.")
    .isLength({ max: 45 })
    .withMessage("La materia no puede tener más de 45 caracteres.")
    .custom(async (name) => {
      const [rows] = await db.execute(
        "SELECT id FROM subjects WHERE name = ?",
        [name],
      );
      if (rows.length > 0) {
        throw new Error("Materia ya registrada");
      }
      return true;
    }),
];

// =============================================================================
// SUBJECTS (PUT)
// =============================================================================

export const validateEditSubjects = [
  body("name")
    .isAlpha("es-ES")
    .withMessage("La materia debe ser alfabético.")
    .trim()
    .notEmpty()
    .withMessage("La materia es obligatorio.")
    .isLength({ max: 45 })
    .withMessage("La materia no puede tener más de 45 caracteres.")
    .custom(async (name, { req }) => {
      const { id } = req.params;
      const [rows] = await db.execute(
        "SELECT id FROM subjects WHERE name = ? AND id != ?",
        [name, id],
      );
      if (rows.length > 0) {
        throw new Error("Materia ya registrada");
      }
      return true;
    }),
];

// =============================================================================
// TEACHER_SUBJECTS
// =============================================================================

export const validateTeacherSubjects = [
  body("teacher_id")
    .notEmpty()
    .withMessage("El docente es obligatorio.")
    .isInt({ min: 1 })
    .withMessage("El docente debe ser válido.")
    .custom(async (value) => {
      const [rows] = await db.execute("SELECT id FROM teachers WHERE id = ?", [
        value,
      ]);
      if (rows.length === 0) {
        throw new Error("El docente no existe.");
      }
      return true;
    }),

  body("subject_id")
    .notEmpty()
    .withMessage("La materia es obligatoria.")
    .isInt({ min: 1 })
    .withMessage("La materia debe ser válida.")
    .custom(async (value, { req }) => {
      const [rows] = await db.execute("SELECT id FROM subjects WHERE id = ?", [
        value,
      ]);
      if (rows.length === 0) {
        throw new Error("La materia no existe.");
      }

      const [relacion] = await db.execute(
        "SELECT id FROM teacher_subjects WHERE teacher_id = ? AND subject_id = ?",
        [req.body.teacher_id, value],
      );

      if (relacion.length > 0) {
        throw new Error("La materia ya está asignada a este docente.");
      }

      return true;
    }),
];

// =============================================================================
// TEACHER_SUBJECTS (PUT)
// =============================================================================

export const validateEditTeacherSubjects = [
  body("teacher_id")
    .notEmpty()
    .withMessage("El docente es obligatorio.")
    .isInt({ min: 1 })
    .withMessage("El docente debe ser válido.")
    .custom(async (value) => {
      const [rows] = await db.execute("SELECT id FROM teachers WHERE id = ?", [
        value,
      ]);
      if (rows.length === 0) {
        throw new Error("El docente no existe.");
      }
      return true;
    }),

  body("subject_id")
    .notEmpty()
    .withMessage("La materia es obligatoria.")
    .isInt({ min: 1 })
    .withMessage("La materia debe ser válida.")
    .custom(async (value, { req }) => {
      const [rows] = await db.execute("SELECT id FROM subjects WHERE id = ?", [
        value,
      ]);
      if (rows.length === 0) {
        throw new Error("La materia no existe.");
      }

      const [relacion] = await db.execute(
        "SELECT id FROM teacher_subjects WHERE teacher_id = ? AND subject_id = ? AND id != ?",
        [req.body.teacher_id, value, req.params.id],
      );

      if (relacion.length > 0) {
        throw new Error("La materia ya está asignada a este docente.");
      }

      return true;
    }),
];
