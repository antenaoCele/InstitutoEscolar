import express from "express";
import { studentTutorsController } from "../controllers/student_tutors.controller.js";
import {
  validateStudentTutors,
  validateEditStudentTutors,
} from "../validators/entities/student_tutors.validator.js";
import {
  validateID,
  checkValidations,
} from "../validators/helpers/validation.middleware.js";
import {
  authentication,
  authorization,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authentication, studentTutorsController.getAll);

router.get(
  "/:id",
  authentication,
  ...validateID("student_tutors"),
  checkValidations,
  studentTutorsController.getById,
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validateStudentTutors,
  checkValidations,
  studentTutorsController.create,
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("student_tutors"),
  validateEditStudentTutors,
  checkValidations,
  studentTutorsController.update,
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("student_tutors"),
  checkValidations,
  studentTutorsController.delete,
);

export default router;
