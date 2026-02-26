import {
  validateFinanceOverlap,
  validateForeignId,
  validateScheduleOverlap,
  validateScheduleOverlapOnUpdate,
  validateUnique,
  validateUniqueCombination,
  validateUniqueMonthYear,
} from "./databaseValidators.js";
import {
  validateDate,
  validateDateRange,
  validateDNI,
  validateFKFormat,
  validateHour,
  validateHourRange,
  validateStudentInfo,
  validateMoney,
  validateMonth,
  validateName,
  validatePaymentMethod,
  validatePassword,
  validatePersonName,
  validatePhone,
  validateRole,
  validateUsername,
  validateYear,
} from "./formatValidators.js";

/* =========================================================
ENROLLEMENT
========================================================= */
export const validateEnrollement = [
  ...validateFKFormat("student_id"),
  ...validateForeignId("student_id", "students"),
  ...validateMoney("amount"),
  ...validateDate("payment_date"),
];

export const validateEditEnrollement = [
  ...validateFKFormat("student_id", true),
  ...validateForeignId("student_id", "students", true),
  ...validateMoney("amount", true),
  ...validateDate("payment_date", true),
];

/* =========================================================
MONTHLY_FINANCES
========================================================= */
export const validateMonthlyFinances = [
  ...validateMonth("month"),
  ...validateYear("year"),
  ...validateMoney("other_expenses"),
  ...validateUniqueMonthYear("monthly_finances"),
];

export const validateEditMonthlyFinances = [
  ...validateMonth("month", true),
  ...validateYear("year", true),
  ...validateMoney("other_expenses", true),
  ...validateUniqueMonthYear("monthly_finances"),
];

/* =========================================================
PAYMENTS
========================================================= */
export const validatePayments = [
  ...validateFKFormat("student_id"),
  ...validateForeignId("student_id", "students"),
  ...validateDate("payment_date"),
  ...validateMoney("amount"),
  ...validatePaymentMethod("payment_method"),
];

export const validateEditPayments = [
  ...validateFKFormat("student_id", true),
  ...validateForeignId("student_id", "students", true),
  ...validateDate("payment_date", true),
  ...validateMoney("amount", true),
  ...validatePaymentMethod("payment_method", true),
];

/* =========================================================
PLAN_PRICES
========================================================= */
export const validatePlanPrices = [
  ...validateFKFormat("plan_id"),
  ...validateForeignId("plan_id", "plans"),
  ...validateMoney("price"),
  ...validateDate("start_date"),
  ...validateDate("end_date"),
  ...validateDateRange("start_date", "end_date"),
  ...validateFinanceOverlap("plan_prices"),
];

export const validateEditPlanPrices = [
  ...validateFKFormat("plan_id", true),
  ...validateForeignId("plan_id", "plans", true),
  ...validateMoney("price", true),
  ...validateDate("start_date", true),
  ...validateDate("end_date", true),
  ...validateDateRange("start_date", "end_date", true),
  ...validateFinanceOverlap("plan_prices"),
];

/* =========================================================
PLAN_SUBJECTS
========================================================= */
export const validatePlanSubjects = [
  ...validateFKFormat("plan_id"),
  ...validateForeignId("plan_id", "plans"),
  ...validateFKFormat("subject_id"),
  ...validateForeignId("subject_id", "subjects"),
  ...validateUniqueCombination("plan_subjects", ["plan_id", "subject_id"]),
];

export const validateEditPlanSubjects = [
  ...validateFKFormat("plan_id", true),
  ...validateForeignId("plan_id", "plans", true),
  ...validateFKFormat("subject_id", true),
  ...validateForeignId("subject_id", "subjects", true),
  ...validateUniqueCombination("plan_subjects", ["plan_id", "subject_id"]),
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
  ...validateFKFormat("student_id"),
  ...validateForeignId("student_id", "students"),
  ...validateFKFormat("schedule_id"),
  ...validateForeignId("schedule_id", "schedules"),
  ...validateUniqueCombination("schedule_students", [
    "student_id",
    "schedule_id",
  ]),
];

export const validateEditScheduleStudents = [
  ...validateFKFormat("student_id", true),
  ...validateForeignId("student_id", "students", true),
  ...validateFKFormat("schedule_id", true),
  ...validateForeignId("schedule_id", "schedules", true),
  ...validateUniqueCombination("schedule_students", [
    "student_id",
    "schedule_id",
  ]),
];

/* =========================================================
SCHEDULES
========================================================= */
export const validateSchedules = [
  ...validateFKFormat("teacher_id"),
  ...validateForeignId("teacher_id", "teachers"),
  ...validateHour("start_time"),
  ...validateHour("end_time"),
  ...validateHourRange("start_time", "end_time"),
  ...validateScheduleOverlap("schedules"),
];

export const validateEditSchedules = [
  ...validateFKFormat("teacher_id", true),
  ...validateForeignId("teacher_id", "teachers", true),
  ...validateHour("start_time", true),
  ...validateHour("end_time", true),
  ...validateHourRange("start_time", "end_time", true),
  ...validateScheduleOverlapOnUpdate("schedules"),
];

/* =========================================================
STUDENT_PLANS
========================================================= */
export const validateStudentPlans = [
  ...validateFKFormat("student_id"),
  ...validateForeignId("student_id", "students"),
  ...validateFKFormat("plan_id"),
  ...validateForeignId("plan_id", "plans"),
  ...validateFKFormat("teacher_id"),
  ...validateForeignId("teacher_id", "teachers"),
  ...validateDate("start_date"),
  ...validateDate("end_date"),
  ...validateDateRange("start_date", "end_date"),
  ...validateUniqueCombination("student_plans", [
    "student_id",
    "plan_id",
    "teacher_id",
  ]),
];

export const validateEditStudentPlans = [
  ...validateFKFormat("student_id", true),
  ...validateForeignId("student_id", "students", true),
  ...validateFKFormat("plan_id", true),
  ...validateForeignId("plan_id", "plans", true),
  ...validateFKFormat("teacher_id", true),
  ...validateForeignId("teacher_id", "teachers", true),
  ...validateDate("start_date", true),
  ...validateDate("end_date", true),
  ...validateDateRange("start_date", "end_date", true),
  ...validateUniqueCombination("student_plans", [
    "student_id",
    "plan_id",
    "teacher_id",
  ]),
];

/* =========================================================
STUDENT_TUTORS
========================================================= */
export const validateStudentTutors = [
  ...validateFKFormat("student_id"),
  ...validateForeignId("student_id", "students"),
  ...validateFKFormat("tutor_id"),
  ...validateForeignId("tutor_id", "tutors"),
  ...validateUniqueCombination("student_tutors", ["student_id", "tutor_id"]),
];

export const validateEditStudentTutors = [
  ...validateFKFormat("student_id", true),
  ...validateForeignId("student_id", "students", true),
  ...validateFKFormat("tutor_id", true),
  ...validateForeignId("tutor_id", "tutors", true),
  ...validateUniqueCombination("student_tutors", ["student_id", "tutor_id"]),
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
  ...validateFKFormat("teacher_id"),
  ...validateForeignId("teacher_id", "teachers"),
  ...validateFKFormat("subject_id"),
  ...validateForeignId("subject_id", "subjects"),
  ...validateUniqueCombination("teacher_subjects", [
    "teacher_id",
    "subject_id",
  ]),
];

export const validateEditTeacherSubjects = [
  ...validateFKFormat("teacher_id", true),
  ...validateForeignId("teacher_id", "teachers", true),
  ...validateFKFormat("subject_id", true),
  ...validateForeignId("subject_id", "subjects", true),
  ...validateUniqueCombination("teacher_subjects", [
    "teacher_id",
    "subject_id",
  ]),
];

/* =========================================================
TEACHERS_LIQUIDATIONS
========================================================= */
export const validateTeachersLiquidations = [
  ...validateFKFormat("teacher_id"),
  ...validateForeignId("teacher_id", "teachers"),
  ...validateMonth("month"),
];

export const validateEditTeachersLiquidations = [
  ...validateFKFormat("teacher_id", true),
  ...validateForeignId("teacher_id", "teachers", true),
  ...validateMonth("month", true),
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
