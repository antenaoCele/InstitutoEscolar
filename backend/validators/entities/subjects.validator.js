import { validateUnique } from "../rules/database.rules.js";
import { validateSubjectName } from "../rules/format.rules.js";

export const validateSubjects = [
  ...validateSubjectName("name"),
  ...validateUnique("name", "subjects"),
];

export const validateEditSubjects = [
  ...validateSubjectName("name", true),
  ...validateUnique("name", "subjects"),
];
