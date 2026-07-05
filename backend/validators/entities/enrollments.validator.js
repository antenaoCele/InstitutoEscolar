import { validateForeignId } from "../rules/database.rules.js";
import {
  validateDate,
  validateFKFormat,
  validateMoney,
} from "../rules/format.rules.js";

export const validateEnrollements = [
  ...validateFKFormat("student_id"),
  ...validateForeignId("student_id", "students"),
  ...validateMoney("amount"),
  ...validateDate("payment_date"),
  // se sacó validateUnique: la unicidad por año la controla existingEnrollment en el controller
];

export const validateEditEnrollements = [
  ...validateFKFormat("student_id", true),
  ...validateForeignId("student_id", "students", true),
  ...validateMoney("amount", true),
  ...validateDate("payment_date", true),
];
