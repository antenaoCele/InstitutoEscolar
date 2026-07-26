import { validateUniqueMonthYear } from "../rules/database.rules.js";
import {
  validateMonth,
  validateYear,
  validateMoney,
  validateNotFutureMonthYear,
} from "../rules/format.rules.js";

export const validateMonthlyFinances = [
  ...validateMonth("month"),
  ...validateYear("year"),
  ...validateMoney("other_expenses"),
  ...validateNotFutureMonthYear("month", "year"),
  ...validateUniqueMonthYear("monthly_finances"),
];

export const validateEditMonthlyFinances = [
  ...validateMonth("month", true),
  ...validateYear("year", true),
  ...validateMoney("other_expenses", true),
  ...validateNotFutureMonthYear("month", "year", true),
  ...validateUniqueMonthYear("monthly_finances", true),
];
