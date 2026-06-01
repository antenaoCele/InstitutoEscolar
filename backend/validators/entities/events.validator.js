import { validateUnique } from "../rules/database.rules.js";
import {
  validateName,
  validateDayEvent,
  validateHour,
} from "../rules/format.rules.js";

export const validateEvents = [
  ...validateName("name"),
  ...validateDayEvent("date"),
  ...validateHour("hour"),
];

export const validateEditEvents = [
  ...validateName("name", true),
  ...validateDayEvent("date", true),
  ...validateHour("hour", true),
];
