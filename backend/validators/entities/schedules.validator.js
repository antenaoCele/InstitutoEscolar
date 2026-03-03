import {
  validateForeignId,
  validateScheduleOverlap,
  validateScheduleOverlapOnUpdate,
} from "../rules/database.rules.js";
import {
  validateFKFormat,
  validateHour,
  validateHourRange,
} from "../rules/format.rules.js";

export const validateSchedules = [
  ...validateFKFormat("teacher_id"),
  ...validateForeignId("teacher_id", "teachers"),
  ...validateHour("start_time"),
  ...validateHour("end_time"),
  ...validateHourRange("start_time", "end_time"),
  ...validateScheduleOverlap("schedules"),
];

export const validateEditSchedules = [
  ...validateFKFormat("teacher_id", true),
  ...validateForeignId("teacher_id", "teachers", true),
  ...validateHour("start_time", true),
  ...validateHour("end_time", true),
  ...validateHourRange("start_time", "end_time", true),
  ...validateScheduleOverlapOnUpdate("schedules"),
];
