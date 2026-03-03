import {
  validateForeignId,
  validateUniqueCombination,
} from "../rules/database.rules.js";
import {
  validateDate,
  validateDateRange,
  validateFKFormat,
} from "../rules/format.rules.js";

export const validateStudentPlans = [
  ...validateFKFormat("student_id"),
  ...validateForeignId("student_id", "students"),
  ...validateFKFormat("plan_id"),
  ...validateForeignId("plan_id", "plans"),
  ...validateFKFormat("teacher_id"),
  ...validateForeignId("teacher_id", "teachers"),
  ...validateDate("start_date"),
  ...validateDate("end_date", true),
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
