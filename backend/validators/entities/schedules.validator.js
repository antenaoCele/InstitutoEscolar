import {
  validateForeignId,
  validateScheduleOverlap,
} from "../rules/database.rules.js";
import {
  validateDay,
  validateClassroom,
  validateFKFormat,
  validateHour,
  validateStartTime,
} from "../rules/format.rules.js";

export const validateSchedules = [
  ...validateFKFormat("teacher_id"),
  ...validateForeignId("teacher_id", "teachers"),
  ...validateDay("day"),
  ...validateClassroom("classroom"),
  ...validateHour("start_time"),
  ...validateStartTime("start_time"),
  ...validateScheduleOverlap("schedules"),
];

export const validateEditSchedules = [
  ...validateFKFormat("teacher_id", true),
  ...validateForeignId("teacher_id", "teachers"),
  ...validateDay("day", true),
  ...validateClassroom("classroom", true),
  ...validateHour("start_time", true),
  ...validateStartTime("start_time", true),
  ...validateScheduleOverlap("schedules"),
];
