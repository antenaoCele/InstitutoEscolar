import { validateForeignId } from "../rules/database.rules.js";
import {
  validateDate,
  validateFKFormat,
  validatePaymentMethod,
  validateDateAllowFuture,
} from "../rules/format.rules.js";

export const validatePayments = [
  ...validateFKFormat("student_plan_id"),
  ...validateForeignId("student_plan_id", "student_plans"),
  ...validateDateAllowFuture("payment_date"), // antes: validateDate
  ...validatePaymentMethod("payment_method"),
];

export const validateEditPayments = [
  ...validateFKFormat("student_plan_id", true),
  ...validateForeignId("student_plan_id", "student_plans", true),
  ...validateDateAllowFuture("payment_date", true), // antes: validateDate
  ...validatePaymentMethod("payment_method", true),
];
