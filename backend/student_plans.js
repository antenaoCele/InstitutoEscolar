import express from "express";
import { db } from "./db.js";
import {
  checkValidations,
  validateID,
  validateSubjects,
  validateEditSubjects
} from "./validations.js";
import { authentication } from "./auth.js";

const router = express.Router();

export default router;