import express from "express";
import { enrollmentsController } from "../controllers/enrollments.controller.js";
import {
  authentication,
  authorization,
} from "../middlewares/auth.middleware.js";
import {
  validateID,
  checkValidations,
} from "../validators/helpers/validation.middleware.js";
import {
  validateEnrollements,
  validateEditEnrollements,
} from "../validators/entities/enrollments.validator.js";

const router = express.Router();

router.get("/", authentication, enrollmentsController.getAll);

router.get(
  "/:id",
  authentication,
  ...validateID("enrollments"),
  checkValidations,
  enrollmentsController.getById,
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validateEnrollements,
  checkValidations,
  enrollmentsController.create,
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("enrollments"),
  validateEditEnrollements,
  checkValidations,
  enrollmentsController.update,
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("enrollments"),
  checkValidations,
  enrollmentsController.delete,
);

export default router;
