import express from "express";
import { plansController } from "../controllers/plans.controller.js";
import {
  validateID,
  checkValidations,
} from "../validators/helpers/validation.middleware.js";
import {
  validatePlans,
  validateEditPlans,
} from "../validators/entities/plans.validator.js";
import {
  authentication,
  authorization,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authentication, plansController.getAll);

router.get(
  "/:id",
  authentication,
  ...validateID("plans"),
  checkValidations,
  plansController.getById,
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validatePlans,
  checkValidations,
  plansController.create,
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("plans"),
  validateEditPlans,
  checkValidations,
  plansController.update,
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("plans"),
  checkValidations,
  plansController.delete,
);

export default router;
