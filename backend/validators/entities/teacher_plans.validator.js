import {
  validateForeignId,
  validateUniqueCombination,
} from "../rules/database.rules.js";

import { validateFKFormat } from "../rules/format.rules.js";

export const validateTeacherPlans = [
  ...validateFKFormat("teacher_id"),
  ...validateForeignId("teacher_id", "teachers"),

  ...validateFKFormat("plan_id"),
  ...validateForeignId("plan_id", "plans"),

  ...validateUniqueCombination("teacher_plans", ["teacher_id", "plan_id"]),
];

export const validateEditTeacherPlans = [
  ...validateFKFormat("teacher_id", true),
  ...validateForeignId("teacher_id", "teachers", true),

  ...validateFKFormat("plan_id", true),
  ...validateForeignId("plan_id", "plans", true),

  ...validateUniqueCombination("teacher_plans", ["teacher_id", "plan_id"]),
];
