import {
  validateForeignId,
  validateUniqueCombination,
} from "../rules/database.rules.js";
import { validateFKFormat } from "../rules/format.rules.js";

export const validateStudentTutors = [
  ...validateFKFormat("student_id"),
  ...validateForeignId("student_id", "students"),
  ...validateFKFormat("tutor_id"),
  ...validateForeignId("tutor_id", "tutors"),
  ...validateUniqueCombination("student_tutors", ["student_id", "tutor_id"]),
];

export const validateEditStudentTutors = [
  ...validateFKFormat("student_id", true),
  ...validateForeignId("student_id", "students", true),
  ...validateFKFormat("tutor_id", true),
  ...validateForeignId("tutor_id", "tutors", true),
  ...validateUniqueCombination("student_tutors", ["student_id", "tutor_id"]),
];
