import { validateForeignId } from "../rules/database.rules.js";
import { validateFKFormat, validateMonth } from "../rules/format.rules.js";

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
