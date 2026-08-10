import { validateUniqueMonthYear } from "../rules/database.rules.js";
import {
  validateMonth,
  validateYear,
  validateMoney,
  validateCurrentYearMonth,
} from "../rules/format.rules.js";

export const validateMonthlyFinances = [
  ...validateMonth("month"),
  ...validateYear("year"),
  // ...validateMoney("other_expenses"),
  ...validateCurrentYearMonth("month", "year"),
  ...validateUniqueMonthYear("monthly_finances"),
];

export const validateEditMonthlyFinances = [
  ...validateMonth("month", true),
  ...validateYear("year", true),
  // ...validateMoney("other_expenses", true),
  ...validateCurrentYearMonth("month", "year", true),
  ...validateUniqueMonthYear("monthly_finances", true),
];
