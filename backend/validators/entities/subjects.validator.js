import { validateUnique } from "../rules/database.rules.js";
import { validateName } from "../rules/format.rules.js";

export const validateSubjects = [
  ...validateName("name"),
  ...validateUnique("name", "subjects"),
];

export const validateEditSubjects = [
  ...validateName("name", true),
  ...validateUnique("name", "subjects"),
];
