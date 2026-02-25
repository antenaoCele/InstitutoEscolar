import {
  validateUnique,
  validateUniqueRelation,
  validateForeignId,
  validateScheduleOverlap,
  validateScheduleOverlapOnUpdate,
} from "./databaseValidators.js";
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
  validateIdFormat,
  validateUsername,
  validatePassword,
  validateRole,
} from "./formatValidators.js";

/* =========================================================
PAYMENTS
========================================================= */
export const validatePayments = [
  ...validateIdFormat("student_id"),
  ...validateForeignId("student_id", "students"),
  ...validateDate("payment_date"),
  ...validateMoney("amount"),
  ...validatePaymentMethod("payment_method"),
];

export const validateEditPayments = [
  ...validateIdFormat("student_id", true),
  ...validateForeignId("student_id", "students", true),
  ...validateDate("payment_date", true),
  ...validateMoney("amount", true),
  ...validatePaymentMethod("payment_method", true),
];

/* =========================================================
PLAN_SUBJECTS
========================================================= */
export const validatePlanSubjects = [
  ...validateIdFormat("plan_id"),
  ...validateForeignId("plan_id", "plans"),
  ...validateIdFormat("subject_id"),
  ...validateForeignId("subject_id", "subjects"),
  ...validateUniqueRelation("plan_subjects", "plan_id", "subject_id"),
];

export const validateEditPlanSubjects = [
  ...validateIdFormat("plan_id", true),
  ...validateForeignId("plan_id", "plans", true),
  ...validateIdFormat("subject_id", true),
  ...validateForeignId("subject_id", "subjects", true),
  ...validateUniqueRelation("plan_subjects", "plan_id", "subject_id"),
];

/* =========================================================
PLANS
========================================================= */
export const validatePlans = [
  ...validateName("name"),
  ...validateUnique("name", "plans"),
];

export const validateEditPlans = [
  ...validateName("name", true),
  ...validateUnique("name", "plans"),
];

/* =========================================================
SCHEDULE_STUDENTS
========================================================= */
export const validateScheduleStudents = [
  ...validateIdFormat("student_id"),
  ...validateForeignId("student_id", "students"),
  ...validateIdFormat("schedule_id"),
  ...validateForeignId("schedule_id", "schedules"),
  ...validateUniqueRelation("schedule_students", "student_id", "schedule_id"),
];

export const validateEditScheduleStudents = [
  ...validateIdFormat("student_id", true),
  ...validateForeignId("student_id", "students", true),
  ...validateIdFormat("schedule_id", true),
  ...validateForeignId("schedule_id", "schedules", true),
  ...validateUniqueRelation("schedule_students", "student_id", "schedule_id"),
];

/* =========================================================
SCHEDULES
========================================================= */
export const validateSchedules = [
  ...validateIdFormat("teacher_id"),
  ...validateForeignId("teacher_id", "teachers"),
  ...validateHour("start_time"),
  ...validateHour("end_time"),
  ...validateTimeRange("start_time", "end_time"),
  ...validateScheduleOverlap("schedules"),
];

export const validateEditSchedules = [
  ...validateIdFormat("teacher_id", true),
  ...validateForeignId("teacher_id", "teachers", true),
  ...validateHour("start_time", true),
  ...validateHour("end_time", true),
  ...validateTimeRange("start_time", "end_time", true),
  ...validateScheduleOverlapOnUpdate("schedules"),
];

/* =========================================================
STUDENT_PLANS
========================================================= */
export const validateStudentPlans = [
  ...validateIdFormat("student_id"),
  ...validateForeignId("student_id", "students"),
  ...validateIdFormat("plan_id"),
  ...validateForeignId("plan_id", "plans"),
  ...validateUniqueRelation("student_plans", "student_id", "plan_id"),
  ...validateDate("start_date"),
];

export const validateEditStudentPlans = [
  ...validateIdFormat("student_id", true),
  ...validateForeignId("student_id", "students", true),
  ...validateIdFormat("plan_id", true),
  ...validateForeignId("plan_id", "plans", true),
  ...validateUniqueRelation("student_plans", "student_id", "plan_id"),
  ...validateDate("start_date", true),
];

/* =========================================================
STUDENT_TUTORS
========================================================= */
export const validateStudentTutors = [
  ...validateIdFormat("student_id"),
  ...validateForeignId("student_id", "students"),
  ...validateIdFormat("tutor_id"),
  ...validateForeignId("tutor_id", "tutors"),
  ...validateUniqueRelation("student_tutors", "student_id", "tutor_id"),
];

export const validateEditStudentTutors = [
  ...validateIdFormat("student_id", true),
  ...validateForeignId("student_id", "students", true),
  ...validateIdFormat("tutor_id", true),
  ...validateForeignId("tutor_id", "tutors", true),
  ...validateUniqueRelation("student_tutors", "student_id", "tutor_id"),
];

/* =========================================================
STUDENTS
========================================================= */
export const validateStudents = [
  ...validatePersonName("first_name"),
  ...validatePersonName("last_name"),
  ...validateDNI("dni"),
  ...validateUnique("dni", "students"),
  ...validateName("school"),
  ...validateDate("birth_date"),
  ...validateStudentInfo("level", "grade"),
];

export const validateEditStudents = [
  ...validatePersonName("first_name", true),
  ...validatePersonName("last_name", true),
  ...validateDNI("dni", true),
  ...validateUnique("dni", "students"),
  ...validateName("school", true),
  ...validateDate("birth_date", true),
  ...validateStudentInfo("level", "grade", true),
];

/* =========================================================
SUBJECTS
========================================================= */
export const validateSubjects = [
  ...validateName("name"),
  ...validateUnique("name", "subjects"),
];

export const validateEditSubjects = [
  ...validateName("name", true),
  ...validateUnique("name", "subjects"),
];

/* =========================================================
TEACHER_SUBJECTS
========================================================= */
export const validateTeacherSubjects = [
  ...validateIdFormat("teacher_id"),
  ...validateForeignId("teacher_id", "teachers"),
  ...validateIdFormat("subject_id"),
  ...validateForeignId("subject_id", "subjects"),
  ...validateUniqueRelation("teacher_subjects", "teacher_id", "subject_id"),
];

export const validateEditTeacherSubjects = [
  ...validateIdFormat("teacher_id", true),
  ...validateForeignId("teacher_id", "teachers", true),
  ...validateIdFormat("subject_id", true),
  ...validateForeignId("subject_id", "subjects", true),
  ...validateUniqueRelation("teacher_subjects", "teacher_id", "subject_id"),
];

/* =========================================================
TEACHERS
========================================================= */
export const validateTeachers = [
  ...validatePersonName("first_name"),
  ...validatePersonName("last_name"),
  ...validateDNI("dni"),
  ...validateUnique("dni", "teachers"),
  ...validatePhone("phone"),
  ...validateUnique("phone", "teachers"),
];

export const validateEditTeachers = [
  ...validatePersonName("first_name", true),
  ...validatePersonName("last_name", true),
  ...validateDNI("dni", true),
  ...validateUnique("dni", "teachers"),
  ...validatePhone("phone", true),
  ...validateUnique("phone", "teachers"),
];

/* =========================================================
TUTORS
========================================================= */
export const validateTutors = [
  ...validatePersonName("first_name"),
  ...validatePersonName("last_name"),
  ...validateDNI("dni"),
  ...validateUnique("dni", "tutors"),
  ...validatePhone("phone"),
  ...validateUnique("phone", "tutors"),
];

export const validateEditTutors = [
  ...validatePersonName("first_name", true),
  ...validatePersonName("last_name", true),
  ...validateDNI("dni", true),
  ...validateUnique("dni", "tutors"),
  ...validatePhone("phone", true),
  ...validateUnique("phone", "tutors"),
];

/* =========================================================
USERS
========================================================= */
export const validateUsers = [
  ...validatePersonName("first_name"),
  ...validatePersonName("last_name"),
  ...validateUsername("username"),
  ...validateUnique("username", "users"),
  ...validatePassword("password"),
  ...validateRole("role"),
];

export const validateEditUsers = [
  ...validatePersonName("first_name", true),
  ...validatePersonName("last_name", true),
  ...validateUsername("username", true),
  ...validateUnique("username", "users"),
  ...validatePassword("password", true),
  ...validateRole("role", true),
];
