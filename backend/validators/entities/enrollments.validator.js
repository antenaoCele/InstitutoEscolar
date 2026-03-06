import { validateForeignId, validateUnique } from "../rules/database.rules.js";
import {
  validateDate,
  validateFKFormat,
  validateMoney,
} from "../rules/format.rules.js";

export const validateEnrollements = [
  ...validateFKFormat("student_id"),
  ...validateForeignId("student_id", "students"),
  ...validateUnique("student_id", "enrollments"),
  ...validateMoney("amount"),
  ...validateDate("payment_date"),
];

export const validateEditEnrollements = [
  ...validateFKFormat("student_id", true),
  ...validateForeignId("student_id", "students", true),
  ...validateUnique("student_id", "enrollments"),
  ...validateMoney("amount", true),
  ...validateDate("payment_date", true),
];
