import { validateUnique } from "../rules/database.rules.js";
import {
  validateDate,
  validateDNI,
  validateStudentInfo,
  validateName,
  validatePersonName,
} from "../rules/format.rules.js";

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
