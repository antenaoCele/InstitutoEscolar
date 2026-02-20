import { param, body, validationResult } from "express-validator";
import { db } from "./db.js";

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

const ALLOWED_TABLES = {
  students: "students",
  teachers: "teachers",
  tutors: "tutors",
  plans: "plans",
  subjects: "subjects",
  schedules: "schedules",
};

/* =========================================================
   HELPER — normaliza cualquier representación de booleano
   entrante (string, number, boolean) a true/false real.
   Se usa en validateStudentInfo para no depender del orden
   de ejecución de customSanitizer dentro del array.
========================================================= */

const isTruthy = (v) => v === true || v === "true" || v === 1 || v === "1";

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

   BUG 1 FIX: No usamos toBoolean() porque hace coerción
   prematura ("false" → true). En cambio, validamos los
   valores aceptados explícitamente y normalizamos con
   isTruthy() dentro de cada custom(), sin depender del
   orden de ejecución de sanitizers entre validadores.
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
        // Normalizamos el valor crudo en el momento de la validación,
        // sin asumir que ningún sanitizer previo ya lo transformó
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

   BUG 2 FIX: optional({ values: "undefined" }) en lugar de
   "falsy" para que 0 y "0" NO sean ignorados sino validados
   y rechazados correctamente (min: 0.01).
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

   BUG 2 FIX: optional({ values: "undefined" }) para que
   0 y "0" sean validados y rechazados (isInt min: 1),
   no silenciosamente ignorados.
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

/* =========================================================
   USERS
========================================================= */

export const validateUsers = [
  validatePersonName("first_name"),
  validatePersonName("last_name"),
  validateUsername(),
  validatePassword(),
  validateRole(),
];

export const validateEditUsers = [
  validatePersonName("first_name"),
  validatePersonName("last_name"),
  validateUsername(true),
  validatePassword(true),
  validateRole(),
];

/* =========================================================
   STUDENTS
========================================================= */

export const validateStudents = [
  validatePersonName("first_name", true),
  validatePersonName("last_name", true),
  validateDNI("dni", "students"),
  validateName("school"),
  validateDate("birth_date"),
  ...validateStudentInfo(),
];

export const validateEditStudents = [
  validatePersonName("first_name"),
  validatePersonName("last_name"),
  validateDNI("dni", "students", true),
  validateName("school"),
  validateDate("birth_date"),
  validateStudentInfo(),
];

/* =========================================================
   TEACHERS
========================================================= */

export const validateTeachers = [
  validatePersonName("first_name"),
  validatePersonName("last_name"),
  validateDNI("dni", "teachers"),
  validatePhone(),
];

export const validateEditTeachers = [
  validatePersonName("first_name").optional(),
  validatePersonName("last_name").optional(),
  validateDNI("dni", "teachers", true).optional(),
  validatePhone().optional(),
];

/* =========================================================
   TUTORS
========================================================= */

export const validateTutors = [
  validatePersonName("first_name"),
  validatePersonName("last_name"),
  validateDNI("dni", "tutors"),
  validatePhone(),
];

export const validateEditTutors = [
  validatePersonName("first_name").optional(),
  validatePersonName("last_name").optional(),
  validateDNI("dni", "tutors", true).optional(),
  validatePhone().optional(),
];

/* =========================================================
   PAYMENTS
========================================================= */

export const validatePayments = [
  validateForeignId("student_id", "students"),
  validateDate("payment_date"),
  validateMoney("amount"),
  validatePaymentMethod(),
];

export const validateEditPayments = [
  validateForeignId("student_id", "students", true),
  validateDate("payment_date").optional(),
  validateMoney("amount").optional(),
  validatePaymentMethod().optional(),
];

/* =========================================================
   PLANS
========================================================= */

export const validatePlans = [validateName("name"), validateMoney("price")];

export const validateEditPlans = [
  validateName("name").optional(),
  validateMoney("price").optional(),
];

/* =========================================================
   SUBJECTS
========================================================= */

export const validateSubjects = [
  validateName("name"),
  body("name").custom(async (name) => {
    const [r] = await db.execute("SELECT id FROM subjects WHERE name=?", [
      name,
    ]);
    if (r.length > 0) throw new Error("Materia ya registrada");
    return true;
  }),
];

export const validateEditSubjects = [
  validateName("name"),
  body("name").custom(async (name, { req }) => {
    const [r] = await db.execute(
      "SELECT id FROM subjects WHERE name=? AND id!=?",
      [name, req.params.id],
    );
    if (r.length > 0) throw new Error("Materia ya registrada");
    return true;
  }),
];

/* =========================================================
   SCHEDULES
========================================================= */

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

export const validateEditSchedules = [
  validateForeignId("teacher_id", "teachers", true),
  validateHour("start_time").optional(),
  validateHour("end_time").optional(),
  body("end_time")
    .optional()
    .custom((value, { req }) => {
      if (req.body.start_time && value && req.body.start_time >= value)
        throw new Error("La hora de fin debe ser mayor a la hora de inicio.");
      return true;
    }),
];

/* =========================================================
   STUDENT_PLANS
========================================================= */

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

export const validateEditStudentPlans = [
  validateForeignId("student_id", "students", true),
  validateForeignId("plan_id", "plans", true),
  body("plan_id").custom(async (plan_id, { req }) => {
    const id = req.params.id;

    const [current] = await db.execute(
      "SELECT student_id,plan_id FROM student_plans WHERE id=?",
      [id],
    );

    if (current.length === 0) return true;

    const student_id = req.body.student_id ?? current[0].student_id;
    const plan_id = req.body.plan_id ?? current[0].plan_id;

    const [dup] = await db.execute(
      "SELECT id FROM student_plans WHERE student_id=? AND plan_id=? AND id!=?",
      [student_id, plan_id, id],
    );

    if (dup.length > 0)
      throw new Error("El estudiante ya tiene asignado este plan.");

    return true;
  }),

  validateDate("start_date").optional(),
];

/* =========================================================
   TEACHER_SUBJECTS
========================================================= */

export const validateTeacherSubjects = [
  validateForeignId("teacher_id", "teachers"),
  validateForeignId("subject_id", "subjects"),
  body("subject_id").custom(async (value, { req }) => {
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

export const validateEditTeacherSubjects = [
  validateForeignId("teacher_id", "teachers", true),
  validateForeignId("subject_id", "subjects", true),
  body().custom(async (_, { req }) => {
    const id = req.params.id;

    const [current] = await db.execute(
      "SELECT teacher_id,subject_id FROM teacher_subjects WHERE id=?",
      [id],
    );

    if (current.length === 0) return true;

    const teacher_id = req.body.teacher_id ?? current[0].teacher_id;
    const subject_id = req.body.subject_id ?? current[0].subject_id;

    const [dup] = await db.execute(
      "SELECT id FROM teacher_subjects WHERE teacher_id=? AND subject_id=? AND id!=?",
      [teacher_id, subject_id, id],
    );

    if (dup.length > 0)
      throw new Error("La materia ya está asignada a este docente.");

    return true;
  }),
];

/* =========================================================
   STUDENT_TUTORS
========================================================= */

export const validateStudentTutors = [
  validateForeignId("student_id", "students"),
  validateForeignId("tutor_id", "tutors"),
  body("tutor_id").custom(async (value, { req }) => {
    const [relacion] = await db.execute(
      "SELECT id FROM student_tutors WHERE student_id = ? AND tutor_id = ?",
      [req.body.student_id, value],
    );

    if (relacion.length > 0) {
      throw new Error("El tutor ya está asignado a este estudiante.");
    }
    return true;
  }),
];

export const validateEditStudentTutors = [
  validateForeignId("student_id", "students", true),
  validateForeignId("tutor_id", "tutors", true),
  body("tutor_id").custom(async (value, { req }) => {
    const [relacion] = await db.execute(
      "SELECT id FROM student_tutors WHERE student_id = ? AND tutor_id = ? AND id != ?",
      [req.body.student_id, value, req.params.id],
    );
    if (relacion.length > 0) {
      throw new Error("El tutor ya está asignado a este estudiante.");
    }
    return true;
  }),
];

/* =========================================================
   SCHEDULE_STUDENTS
========================================================= */

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

export const validateEditScheduleStudents = [
  validateForeignId("student_id", "students", true),
  validateForeignId("schedule_id", "schedules", true),
  body().custom(async (value, { req }) => {
    const id = Number(req.params.id);

    const [current] = await db.execute(
      "SELECT student_id, schedule_id FROM schedule_students WHERE id = ?",
      [id],
    );

    if (current.length === 0) return true;

    const student_id = req.body.student_id ?? current[0].student_id;
    const schedule_id = req.body.schedule_id ?? current[0].schedule_id;

    const [relation] = await db.execute(
      `SELECT id FROM schedule_students
       WHERE student_id = ? AND schedule_id = ? AND id != ?`,
      [student_id, schedule_id, id],
    );

    if (relation.length > 0) {
      throw new Error("El estudiante ya tiene asignado este horario.");
    }

    return true;
  }),
];

/* =========================================================
   PLAN_SUBJECTS
========================================================= */

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

export const validateEditPlanSubjects = [
  validateForeignId("plan_id", "plans", true),
  validateForeignId("subject_id", "subjects", true),
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
