import { body } from "express-validator";

/* =========================================================
BASE FIELD BUILDER
========================================================= */
export const baseField = (field, optional) => {
  let v = body(field);

  if (optional) return v.optional({ values: "falsy" });
  return v.notEmpty().withMessage("Campo obligatorio.");
};

/* =========================================================
DURATION TIME
========================================================= */
export function addDurationToTime(time, minutesToAdd = 90) {
  const [h, m, s] = time.split(":").map(Number);

  const date = new Date();
  date.setHours(h, m, s || 0);
  date.setMinutes(date.getMinutes() + minutesToAdd);

  return date.toTimeString().slice(0, 8);
}

/* =========================================================
TRUTHY
========================================================= */
export const isTruthy = (v) => {
  return v === true || v === "true" || v === 1 || v === "1";
};

/* =========================================================
WHITELIST
========================================================= */
export const ALLOWED_TABLES = {
  enrollments: "enrollments",
  events: "events",
  monthly_finances: "monthly_finances",
  payments: "payments",
  plan_prices: "plan_prices",
  plan_subjects: "plan_subjects",
  plans: "plans",
  schedule_students: "schedule_students",
  schedules: "schedules",
  student_plans: "student_plans",
  student_tutors: "student_tutors",
  students: "students",
  subjects: "subjects",
  teacher_liquidations: "teacher_liquidations",
  teacher_subjects: "teacher_subjects",
  teachers: "teachers",
  tutors: "tutors",
  users: "users",
};
