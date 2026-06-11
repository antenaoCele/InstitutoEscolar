import {
  validateForeignId,
  validateScheduleConflict,
  validateStudentScheduleConflict,
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

  ...validateHour("start_time"),
  ...validateStartTime("start_time"),

  ...validateScheduleConflict("schedules"),

  ...validateStudentScheduleConflict(),

  ...validateDay("day"),
  ...validateClassroom("classroom"),
];

export const validateEditSchedules = [
  ...validateFKFormat("teacher_id", true),
  ...validateForeignId("teacher_id", "teachers", true),

  ...validateHour("start_time", true),
  ...validateStartTime("start_time", true),

  ...validateScheduleConflict("schedules"),

  ...validateScheduleConflict("schedules"),

  ...validateStudentScheduleConflict(),

  ...validateDay("day", true),
  ...validateClassroom("classroom", true),
];
