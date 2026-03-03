import { validateForeignId } from "../rules/database.rules.js";
import {
  validateDate,
  validateFKFormat,
  validateMoney,
  validatePaymentMethod,
} from "../rules/format.rules.js";

export const validatePayments = [
  ...validateFKFormat("student_id"),
  ...validateForeignId("student_id", "students"),
  ...validateDate("payment_date"),
  ...validateMoney("amount"),
  ...validatePaymentMethod("payment_method"),
];

export const validateEditPayments = [
  ...validateFKFormat("student_id", true),
  ...validateForeignId("student_id", "students", true),
  ...validateDate("payment_date", true),
  ...validateMoney("amount", true),
  ...validatePaymentMethod("payment_method", true),
];
