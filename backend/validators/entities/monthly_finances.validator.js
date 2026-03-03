import { validateUniqueMonthYear } from "./databaseValidators.js";
import {
  validateMoney,
  validateMonth,
  validateYear,
} from "./formatValidators.js";

export const validateMonthlyFinances = [
  ...validateMonth("month"),
  ...validateYear("year"),
  ...validateMoney("other_expenses"),
  ...validateUniqueMonthYear("monthly_finances"),
];

export const validateEditMonthlyFinances = [
  ...validateMonth("month", true),
  ...validateYear("year", true),
  ...validateMoney("other_expenses", true),
  ...validateUniqueMonthYear("monthly_finances"),
];
