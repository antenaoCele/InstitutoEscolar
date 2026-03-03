import { validateUnique } from "../rules/database.rules.js";
import { validateName } from "../rules/format.rules.js";

export const validatePlans = [
  ...validateName("name"),
  ...validateUnique("name", "plans"),
];

export const validateEditPlans = [
  ...validateName("name", true),
  ...validateUnique("name", "plans"),
];
