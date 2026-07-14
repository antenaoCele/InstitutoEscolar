import { body } from "express-validator";
import { validateUnique } from "../rules/database.rules.js";
import {
  validatePersonName,
  validateUsername,
  validatePassword,
} from "../rules/format.rules.js";

export const validateEditMe = [
  ...validatePersonName("first_name", true),
  ...validatePersonName("last_name", true),
  ...validateUsername("username", true),
  ...validateUnique("username", "users"),
];

export const validateChangePassword = [
  body("currentPassword")
    .trim()
    .notEmpty()
    .withMessage("Debes ingresar tu contraseña actual."),

  ...validatePassword("newPassword"),
];
