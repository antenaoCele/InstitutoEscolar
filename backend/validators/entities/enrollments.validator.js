import { validateForeignId } from "../rules/database.rules.js";
import {
  validateDateAllowFuture,
  validateFKFormat,
  validateMoney,
} from "../rules/format.rules.js";

export const validateEnrollements = [
  ...validateFKFormat("student_id"),
  ...validateForeignId("student_id", "students"),
  ...validateMoney("amount"),
  ...validateDateAllowFuture("payment_date"),
];

export const validateEditEnrollements = [
  ...validateFKFormat("student_id", true),
  ...validateForeignId("student_id", "students", true),
  ...validateMoney("amount", true),
  ...validateDateAllowFuture("payment_date", true),
];
