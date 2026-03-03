import express from "express";
import { tutorsController } from "../controllers/tutors.controller.js";
import {
  validateTutors,
  validateEditTutors,
} from "../validators/entities/tutors.validations.js";
import {
  validateID,
  checkValidations,
} from "../validators/helpers/validation.middleware.js";
import {
  authentication,
  authorization,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authentication, tutorsController.getAll);

router.get(
  "/:id",
  authentication,
  ...validateID("tutors"),
  checkValidations,
  tutorsController.getById,
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validateTutors,
  checkValidations,
  tutorsController.create,
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("tutors"),
  validateEditTutors,
  checkValidations,
  tutorsController.update,
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("tutors"),
  checkValidations,
  tutorsController.delete,
);

export default router;
