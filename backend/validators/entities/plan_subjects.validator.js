import {
  validateForeignId,
  validateUniqueCombination,
} from "../rules/database.rules.js";
import { validateFKFormat } from "../rules/format.rules.js";

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
