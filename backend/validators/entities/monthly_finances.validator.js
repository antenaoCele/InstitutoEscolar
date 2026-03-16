import { validateUniqueMonthYear } from "../rules/database.rules.js";
import {
  validateDate,
  validateMoney,
  validateYear,
} from "../rules/format.rules.js";

export const validateMonthlyFinances = [
  ...validateDate("month"),
  ...validateDate("year"),
  ...validateMoney("other_expenses"),
  ...validateUniqueMonthYear("monthly_finances"),
];

export const validateEditMonthlyFinances = [
  ...validateDate("month", true),
  ...validateDate("year", true),
  ...validateMoney("other_expenses", true),
  ...validateUniqueMonthYear("monthly_finances"),
];
