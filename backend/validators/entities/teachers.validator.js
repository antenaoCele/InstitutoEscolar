import { validateUnique } from "../rules/database.rules.js";
import {
  validateDNI,
  validatePersonName,
  validatePhone,
} from "../rules/format.rules.js";

export const validateTeachers = [
  ...validatePersonName("first_name"),
  ...validatePersonName("last_name"),
  ...validateDNI("dni"),
  ...validateUnique("dni", "teachers"),
  ...validatePhone("phone"),
  ...validateUnique("phone", "teachers"),
];

export const validateEditTeachers = [
  ...validatePersonName("first_name", true),
  ...validatePersonName("last_name", true),
  ...validateDNI("dni", true),
  ...validateUnique("dni", "teachers"),
  ...validatePhone("phone", true),
  ...validateUnique("phone", "teachers"),
];
