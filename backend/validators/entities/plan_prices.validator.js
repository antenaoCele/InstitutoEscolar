import {
  validateFinanceOverlap,
  validateForeignId,
} from "../rules/database.rules.js";
import {
  validateDate,
  validateDateRange,
  validateFKFormat,
  validateMoney,
} from "../rules/format.rules.js";

export const validatePlanPrices = [
  ...validateFKFormat("plan_id"),
  ...validateForeignId("plan_id", "plans"),
  ...validateMoney("price"),
  ...validateDate("start_date"),
  ...validateDate("end_date"),
  ...validateDateRange("start_date", "end_date"),
  ...validateFinanceOverlap("plan_prices"),
];

export const validateEditPlanPrices = [
  ...validateFKFormat("plan_id", true),
  ...validateForeignId("plan_id", "plans", true),
  ...validateMoney("price", true),
  ...validateDate("start_date", true),
  ...validateDate("end_date", true),
  ...validateDateRange("start_date", "end_date", true),
  ...validateFinanceOverlap("plan_prices"),
];
