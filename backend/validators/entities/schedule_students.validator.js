import {
  validateForeignId,
  validateUniqueCombination,
  validateScheduleStudentRules,
} from "../rules/database.rules.js";
import { validateFKFormat } from "../rules/format.rules.js";

export const validateScheduleStudents = [
  ...validateFKFormat("student_id"),
  ...validateForeignId("student_id", "students"),
  ...validateFKFormat("schedule_id"),
  ...validateForeignId("schedule_id", "schedules"),
  ...validateUniqueCombination("schedule_students", [
    "student_id",
    "schedule_id",
  ]),
  validateScheduleStudentRules("schedule_students", 5),
];

export const validateEditScheduleStudents = [
  ...validateFKFormat("student_id", true),
  ...validateForeignId("student_id", "students", true),
  ...validateFKFormat("schedule_id", true),
  ...validateForeignId("schedule_id", "schedules", true),
  ...validateUniqueCombination("schedule_students", [
    "student_id",
    "schedule_id",
  ]),
  validateScheduleStudentRules("schedule_students", 5),
];
