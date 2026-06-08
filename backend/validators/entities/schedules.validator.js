import {
  validateForeignId,
  validateScheduleConflict,
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

  ...validateFKFormat("subject_id"),
  ...validateForeignId("subject_id", "subjects"),

  ...validateHour("start_time"),
  ...validateStartTime("start_time"),

  ...validateScheduleConflict("schedules"),

  ...validateDay("day"),
  ...validateClassroom("classroom"),
];

export const validateEditSchedules = [
  ...validateFKFormat("teacher_id", true),
  ...validateForeignId("teacher_id", "teachers", true),

  ...validateFKFormat("subject_id", true),
  ...validateForeignId("subject_id", "subjects", true),

  ...validateHour("start_time", true),
  ...validateStartTime("start_time", true),

  ...validateScheduleConflict("schedules"),

  ...validateDay("day", true),
  ...validateClassroom("classroom", true),
];
