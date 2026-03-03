import { validateUnique } from "../rules/database.rules.js";
import {
  validatePassword,
  validatePersonName,
  validateRole,
  validateUsername,
} from "../rules/format.rules.js";

export const validateUsers = [
  ...validatePersonName("first_name"),
  ...validatePersonName("last_name"),
  ...validateUsername("username"),
  ...validateUnique("username", "users"),
  ...validatePassword("password"),
  ...validateRole("role"),
];

export const validateEditUsers = [
  ...validatePersonName("first_name", true),
  ...validatePersonName("last_name", true),
  ...validateUsername("username", true),
  ...validateUnique("username", "users"),
  ...validatePassword("password", true),
  ...validateRole("role", true),
];
