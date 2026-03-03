import {
  validateForeignId,
  validateUniqueCombination,
} from "../rules/database.rules.js";
import { validateFKFormat } from "../rules/format.rules.js";

export const validateTeacherSubjects = [
  ...validateFKFormat("teacher_id"),
  ...validateForeignId("teacher_id", "teachers"),
  ...validateFKFormat("subject_id"),
  ...validateForeignId("subject_id", "subjects"),
  ...validateUniqueCombination("teacher_subjects", [
    "teacher_id",
    "subject_id",
  ]),
];

export const validateEditTeacherSubjects = [
  ...validateFKFormat("teacher_id", true),
  ...validateForeignId("teacher_id", "teachers", true),
  ...validateFKFormat("subject_id", true),
  ...validateForeignId("subject_id", "subjects", true),
  ...validateUniqueCombination("teacher_subjects", [
    "teacher_id",
    "subject_id",
  ]),
];
