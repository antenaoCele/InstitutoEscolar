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
   GENERALES
========================================================= */

export const validateName = (name) =>
  body(name)
    .trim()
    .notEmpty()
    .withMessage("Este campo es obligatorio.")
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("Este campo solo puede contener letras.")
    .isLength({ max: 45 });

export const validateDNI = (field, table, isEdit = false) =>
  body(field)
    .isInt({ min: 1000000, max: 99999999 })
    .custom(async (value, { req }) => {
      let sql = `SELECT id FROM ${table} WHERE ${field}=?`;
      const params = [value];
      if (isEdit) {
        sql += " AND id!=?";
        params.push(req.params.id);
      }
      const [rows] = await db.execute(sql, params);
      if (rows.length > 0) throw new Error(`${field} ya registrado`);
      return true;
    });

export const validateStudentInfo = () => [
  body("enrolled").isBoolean().toBoolean(),
  body("level").isIn(["inicial", "primario", "secundario", "universitario"]),
  body("grade").isInt({ min: 1, max: 7 }).toInt(),
];

export const validatePhone = () =>
  body("phone")
    .trim()
    .isLength({ max: 20 })
    .matches(/^[0-9+\- ]+$/);

export const validateDate = (field) =>
  body(field)
    .notEmpty()
    .isISO8601()
    .custom((value) => {
      const inputDate = new Date(value);
      const today = new Date();
      inputDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (inputDate > today) throw new Error("La fecha no puede ser futura.");
      return true;
    });

export const validateHour = (hour) =>
  body(hour)
    .notEmpty()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/);

export const validateMoney = (field) =>
  body(field)
    .notEmpty()
    .isDecimal({ decimal_digits: "1,2" })
    .custom((v) => {
      if (parseFloat(v) <= 0) throw new Error("Debe ser mayor a 0");
      return true;
    });

export const validatePaymentMethod = () =>
  body("payment_method").isIn([
    "transferencia",
    "efectivo",
    "tarjeta de crédito",
    "tarjeta de débito",
    "qr",
    "otro",
  ]);

/* =========================================================
   FOREIGN KEY GLOBAL
========================================================= */

export const validateForeignId = (field, table, optional = false) => {
  let v = body(field);

  if (optional) v = v.optional({ nullable: true, checkFalsy: true });
  else v = v.notEmpty().withMessage("El campo es obligatorio.");

  return v
    .isInt({ min: 1 })
    .withMessage("ID inválido.")
    .custom(async (value) => {
      if (value == null) return true;
      const [rows] = await db.execute(`SELECT id FROM ${table} WHERE id=?`, [
        value,
      ]);
      if (rows.length === 0) throw new Error("El registro asociado no existe.");
      return true;
    });
};

/* =========================================================
   USERNAME
========================================================= */

export const validateUsername = (isEdit = false) =>
  body("username")
    .trim()
    .notEmpty()
    .isAlphanumeric("es-ES")
    .isLength({ max: 45 })
    .custom(async (value, { req }) => {
      let sql = "SELECT id FROM users WHERE username=?";
      const params = [value];
      if (isEdit) {
        sql += " AND id!=?";
        params.push(req.params.id);
      }
      const [rows] = await db.execute(sql, params);
      if (rows.length > 0)
        throw new Error("El nombre de usuario ya está registrado");
      return true;
    });

/* =========================================================
   PASSWORD
========================================================= */

export const validatePassword = (optional = false) => {
  let v = body("password");
  if (optional) v = v.optional({ nullable: true, checkFalsy: true });
  return v.isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });
};

/* =========================================================
   ROLE
========================================================= */

export const validateRole = () => body("role").isIn(["ADMIN", "DOCENTE"]);

/* =========================================================
   USERS
========================================================= */

export const validateUsers = [
  validateName("first_name"),
  validateName("last_name"),
  validateUsername(),
  validatePassword(),
  validateRole(),
];

export const validateEditUsers = [
  validateName("first_name"),
  validateName("last_name"),
  validateUsername(true),
  validatePassword(true),
  validateRole(),
];

/* =========================================================
   STUDENTS
========================================================= */

export const validateStudents = [
  validateName("first_name"),
  validateName("last_name"),
  validateDNI("dni", "students"),
  validateName("school"),
  validateDate("birth_date"),
  validateStudentInfo(),
];

export const validateEditStudents = [
  validateName("first_name"),
  validateName("last_name"),
  validateDNI("dni", "students", true),
  validateName("school"),
  validateDate("birth_date"),
  validateStudentInfo(),
];

/* =========================================================
   TEACHERS
========================================================= */

export const validateTeachers = [
  validateName("first_name"),
  validateName("last_name"),
  validateDNI("dni", "teachers"),
  validatePhone(),
];

export const validateEditTeachers = [
  validateName("first_name").optional(),
  validateName("last_name").optional(),
  validateDNI("dni", "teachers", true).optional(),
  validatePhone().optional(),
];

/* =========================================================
   TUTORS
========================================================= */

export const validateTutors = [
  validateName("first_name"),
  validateName("last_name"),
  validateDNI("dni", "tutors"),
  validatePhone(),
];

export const validateEditTutors = [
  validateName("first_name").optional(),
  validateName("last_name").optional(),
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
