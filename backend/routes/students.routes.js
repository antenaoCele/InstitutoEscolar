import express from "express";
import { studentsController } from "../controllers/students.controller.js";
import {
  validateStudents,
  validateEditStudents,
} from "../validators/entities/students.validator.js";
import {
  validateID,
  checkValidations,
} from "../validators/helpers/validation.middleware.js";
import {
  authentication,
  authorization,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/active", authentication, studentsController.getActiveStudents);

router.get("/", authentication, studentsController.getAllWithStatus);

router.get(
  "/:id/info",
  authentication,
  ...validateID("students"),
  checkValidations,
  studentsController.getInfo,
);

router.get(
  "/:id/plans",
  authentication,
  ...validateID("students"),
  checkValidations,
  studentsController.getPlans,
);

router.get(
  "/:id",
  authentication,
  ...validateID("students"),
  checkValidations,
  studentsController.getByStudentIdWithStatus,
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validateStudents,
  checkValidations,
  studentsController.createWithPlan,
);

router.post(
  "/close-year",
  authentication,
  authorization("ADMIN"),
  studentsController.closeYear,
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("students"),
  validateEditStudents,
  checkValidations,
  studentsController.update,
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("students"),
  checkValidations,
  studentsController.delete,
);

export default router;
