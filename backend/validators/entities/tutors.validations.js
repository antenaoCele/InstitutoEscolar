import { validateUnique } from "../rules/database.rules.js";
import {
  validateDNI,
  validatePersonName,
  validatePhone,
} from "../rules/format.rules.js";

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
