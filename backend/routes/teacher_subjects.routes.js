import express from "express";
import { teacherSubjectsController } from "../controllers/teacher_subjects.controller.js";
import {
  validateTeacherSubjects,
  validateEditTeacherSubjects,
} from "../validators/entities/teacher_subjects.validator.js";
import {
  validateID,
  checkValidations,
} from "../validators/helpers/validation.middleware.js";
import {
  authentication,
  authorization,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authentication, teacherSubjectsController.getAll);

router.get(
  "/:id",
  authentication,
  ...validateID("teacher_subjects"),
  checkValidations,
  teacherSubjectsController.getById,
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validateTeacherSubjects,
  checkValidations,
  teacherSubjectsController.create,
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("teacher_subjects"),
  validateEditTeacherSubjects,
  checkValidations,
  teacherSubjectsController.update,
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("teacher_subjects"),
  checkValidations,
  teacherSubjectsController.delete,
);

export default router;
