import { validateForeignId } from "../rules/database.rules.js";
import {
  validateDate,
  validateFKFormat,
  validatePaymentMethod,
} from "../rules/format.rules.js";

export const validatePayments = [
  ...validateFKFormat("student_plan_id"),
  ...validateForeignId("student_plan_id", "student_plans"),
  ...validateDate("payment_date"),
  ...validatePaymentMethod("payment_method"),
];

export const validateEditPayments = [
  ...validateFKFormat("student_plan_id", true),
  ...validateForeignId("student_plan_id", "student_plans", true),
  ...validateDate("payment_date", true),
  ...validatePaymentMethod("payment_method", true),
];
