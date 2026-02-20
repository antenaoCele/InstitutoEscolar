import { body } from "express-validator";
import { db } from "./db.js";
import {
  validatePersonName,
  validateDNI,
  validateName,
  validatePhone,
  validateStudentInfo,
  validateDate,
  validateHour,
  validateMoney,
  validatePaymentMethod,
  validateForeignId,
  validateUsername,
  validatePassword,
  validateRole,
} from "./validators.js";

/* =========================================================
   PAYMENTS
========================================================= */

export const validatePayments = [
  ...validateForeignId("student_id", "students", true),
  ...validateDate("payment_date", true),
  ...validateMoney("amount", true),
  ...validatePaymentMethod("payment_method"),
];

export const validateEditPayments = [
  ...validateForeignId("student_id", "students", true),
  ...validateDate("payment_date", true),
  ...validateMoney("amount", true),
  ...validatePaymentMethod("payment_method", true),
];

/* =========================================================
   PLAN_SUBJECTS
========================================================= */

export const validatePlanSubjects = [
  ...validateForeignId("plan_id", "plans"),
  ...validateForeignId("subject_id", "subjects"),
  body("subject_id").custom(async (subject_id, { req }) => {
    const [relation] = await db.execute(
      "SELECT id FROM plan_subjects WHERE plan_id = ? AND subject_id = ?",
      [req.body.plan_id, subject_id],
    );
    if (relation.length > 0)
      throw new Error("El plan ya tiene asignada esta materia.");
    return true;
  }),
];

export const validateEditPlanSubjects = [
  ...validateForeignId("plan_id", "plans", true),
  ...validateForeignId("subject_id", "subjects", true),
  body("subject_id").custom(async (subject_id, { req }) => {
    const [relation] = await db.execute(
      "SELECT id FROM plan_subjects WHERE plan_id = ? AND subject_id = ?",
      [req.body.plan_id, subject_id],
    );
    if (relation.length > 0)
      throw new Error("El plan ya tiene asignada esta materia.");
    return true;
  }),
];

/* =========================================================
   PLANS
========================================================= */

export const validatePlans = [
  ...validateName("name"),
  ...validateMoney("price"),
];

export const validateEditPlans = [
  ...validateName("name", true),
  ...validateMoney("price", true),
];

/* =========================================================
   SCHEDULE_STUDENTS
========================================================= */

export const validateScheduleStudents = [
  ...validateForeignId("student_id", "students"),
  ...validateForeignId("schedule_id", "schedules"),
  body("schedule_id").custom(async (schedule_id, { req }) => {
    const [relation] = await db.execute(
      "SELECT id FROM schedule_students WHERE student_id = ? AND schedule_id = ?",
      [req.body.student_id, schedule_id],
    );
    if (relation.length > 0)
      throw new Error("El estudiante ya tiene asignado este horario.");
    return true;
  }),
];

export const validateEditScheduleStudents = [
  ...validateForeignId("student_id", "students", true),
  ...validateForeignId("schedule_id", "schedules", true),
  body("schedule_id").custom(async (schedule_id, { req }) => {
    if (!schedule_id && !req.body.student_id) return true;

    const id = Number(req.params.id);

    const [current] = await db.execute(
      "SELECT student_id, schedule_id FROM schedule_students WHERE id = ?",
      [id],
    );

    if (current.length === 0) return true;

    const student_id = req.body.student_id ?? current[0].student_id;
    const resolvedScheduleId = schedule_id ?? current[0].schedule_id;

    const [relation] = await db.execute(
      `SELECT id FROM schedule_students
       WHERE student_id = ? AND schedule_id = ? AND id != ?`,
      [student_id, resolvedScheduleId, id],
    );

    if (relation.length > 0)
      throw new Error("El estudiante ya tiene asignado este horario.");

    return true;
  }),
];

/* =========================================================
   SCHEDULES
========================================================= */

export const validateSchedules = [
  ...validateForeignId("teacher_id", "teachers"),
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

    if (rows.length > 0)
      throw new Error("El docente ya tiene una clase en ese día y horario.");

    return true;
  }),
  ...validateHour("start_time"),
  ...validateHour("end_time"),
  body("end_time").custom((value, { req }) => {
    if (req.body.start_time >= value)
      throw new Error("La hora de fin debe ser mayor a la hora de inicio.");
    return true;
  }),
];

export const validateEditSchedules = [
  ...validateForeignId("teacher_id", "teachers", true),
  ...validateHour("start_time", true),
  ...validateHour("end_time", true),
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
  ...validateForeignId("student_id", "students"),
  ...validateForeignId("plan_id", "plans"),
  body("plan_id").custom(async (plan_id, { req }) => {
    const [relation] = await db.execute(
      "SELECT id FROM student_plans WHERE student_id = ? AND plan_id = ?",
      [req.body.student_id, plan_id],
    );
    if (relation.length > 0)
      throw new Error("El alumno ya tiene asignado este plan.");
    return true;
  }),
  ...validateDate("start_date"),
];

export const validateEditStudentPlans = [
  ...validateForeignId("student_id", "students", true),
  ...validateForeignId("plan_id", "plans", true),
  body("plan_id").custom(async (plan_id, { req }) => {
    if (!plan_id && !req.body.student_id) return true;

    const id = req.params.id;

    const [current] = await db.execute(
      "SELECT student_id, plan_id FROM student_plans WHERE id = ?",
      [id],
    );

    if (current.length === 0) return true;

    const student_id = req.body.student_id ?? current[0].student_id;
    const resolvedPlanId = plan_id ?? current[0].plan_id;

    const [dup] = await db.execute(
      "SELECT id FROM student_plans WHERE student_id = ? AND plan_id = ? AND id != ?",
      [student_id, resolvedPlanId, id],
    );

    if (dup.length > 0)
      throw new Error("El estudiante ya tiene asignado este plan.");

    return true;
  }),
  ...validateDate("start_date", true),
];

/* =========================================================
   STUDENT_TUTORS
========================================================= */

export const validateStudentTutors = [
  ...validateForeignId("student_id", "students"),
  ...validateForeignId("tutor_id", "tutors"),
  body("tutor_id").custom(async (value, { req }) => {
    const [relacion] = await db.execute(
      "SELECT id FROM student_tutors WHERE student_id = ? AND tutor_id = ?",
      [req.body.student_id, value],
    );
    if (relacion.length > 0)
      throw new Error("El tutor ya está asignado a este estudiante.");
    return true;
  }),
];

export const validateEditStudentTutors = [
  ...validateForeignId("student_id", "students", true),
  ...validateForeignId("tutor_id", "tutors", true),
  body("tutor_id").custom(async (value, { req }) => {
    const [relacion] = await db.execute(
      "SELECT id FROM student_tutors WHERE student_id = ? AND tutor_id = ? AND id != ?",
      [req.body.student_id, value, req.params.id],
    );
    if (relacion.length > 0)
      throw new Error("El tutor ya está asignado a este estudiante.");
    return true;
  }),
];

/* =========================================================
   STUDENTS
========================================================= */

export const validateStudents = [
  ...validatePersonName("first_name"),
  ...validatePersonName("last_name"),
  ...validateDNI("dni", "students"),
  ...validateName("school"),
  ...validateDate("birth_date"),
  ...validateStudentInfo("enrolled", "level", "grade"),
];

export const validateEditStudents = [
  ...validatePersonName("first_name", true),
  ...validatePersonName("last_name", true),
  ...validateDNI("dni", "students", true),
  ...validateName("school", true),
  ...validateDate("birth_date", true),
  ...validateStudentInfo("enrolled", "level", "grade", true),
];

/* =========================================================
   SUBJECTS
========================================================= */

export const validateSubjects = [
  ...validateName("name"),
  body("name").custom(async (name) => {
    const [r] = await db.execute("SELECT id FROM subjects WHERE name = ?", [
      name,
    ]);
    if (r.length > 0) throw new Error("Materia ya registrada.");
    return true;
  }),
];

export const validateEditSubjects = [
  ...validateName("name"),
  body("name").custom(async (name, { req }) => {
    const [r] = await db.execute(
      "SELECT id FROM subjects WHERE name = ? AND id != ?",
      [name, req.params.id],
    );
    if (r.length > 0) throw new Error("Materia ya registrada.");
    return true;
  }),
];

/* =========================================================
   TEACHER_SUBJECTS
========================================================= */

export const validateTeacherSubjects = [
  ...validateForeignId("teacher_id", "teachers"),
  ...validateForeignId("subject_id", "subjects"),
  body("subject_id").custom(async (value, { req }) => {
    const [relacion] = await db.execute(
      "SELECT id FROM teacher_subjects WHERE teacher_id = ? AND subject_id = ?",
      [req.body.teacher_id, value],
    );
    if (relacion.length > 0)
      throw new Error("La materia ya está asignada a este docente.");
    return true;
  }),
];

export const validateEditTeacherSubjects = [
  ...validateForeignId("teacher_id", "teachers", true),
  ...validateForeignId("subject_id", "subjects", true),
  body("subject_id").custom(async (subject_id, { req }) => {
    if (!subject_id && !req.body.teacher_id) return true;

    const id = req.params.id;

    const [current] = await db.execute(
      "SELECT teacher_id, subject_id FROM teacher_subjects WHERE id = ?",
      [id],
    );

    if (current.length === 0) return true;

    const teacher_id = req.body.teacher_id ?? current[0].teacher_id;
    const resolvedSubjectId = subject_id ?? current[0].subject_id;

    const [dup] = await db.execute(
      "SELECT id FROM teacher_subjects WHERE teacher_id = ? AND subject_id = ? AND id != ?",
      [teacher_id, resolvedSubjectId, id],
    );

    if (dup.length > 0)
      throw new Error("La materia ya está asignada a este docente.");

    return true;
  }),
];

/* =========================================================
   TEACHERS
========================================================= */

export const validateTeachers = [
  ...validatePersonName("first_name"),
  ...validatePersonName("last_name"),
  ...validateDNI("dni", "teachers"),
  ...validatePhone("phone"),
];

export const validateEditTeachers = [
  ...validatePersonName("first_name", true),
  ...validatePersonName("last_name", true),
  ...validateDNI("dni", "teachers", true),
  ...validatePhone("phone", true),
];

/* =========================================================
   TUTORS
========================================================= */

export const validateTutors = [
  ...validatePersonName("first_name", true),
  ...validatePersonName("last_name", true),
  ...validateDNI("dni", "tutors", true),
  ...validatePhone("phone"),
];

export const validateEditTutors = [
  ...validatePersonName("first_name", true),
  ...validatePersonName("last_name", true),
  ...validateDNI("dni", "tutors", true),
  ...validatePhone("phone", true),
];

/* =========================================================
   USERS
========================================================= */

export const validateUsers = [
  ...validatePersonName("first_name"),
  ...validatePersonName("last_name"),
  ...validateUsername("username"),
  ...validatePassword("password"),
  ...validateRole("role"),
];

export const validateEditUsers = [
  ...validatePersonName("first_name", true),
  ...validatePersonName("last_name", true),
  ...validateUsername("username", true),
  ...validatePassword("password", true),
  ...validateRole("role"),
];
