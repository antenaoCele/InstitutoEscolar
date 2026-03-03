import express from "express";
import { schedulesController } from "../controllers/schedules.controller.js";
import {
  validateSchedules,
  validateEditSchedules,
} from "../validators/entities/schedules.validator.js";
import {
  validateID,
  checkValidations,
} from "../validators/helpers/validation.middleware.js";
import {
  authentication,
  authorization,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authentication, schedulesController.getAll);

router.get(
  "/:id",
  authentication,
  ...validateID("schedules"),
  checkValidations,
  schedulesController.getById,
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validateSchedules,
  checkValidations,
  schedulesController.create,
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("schedules"),
  validateEditSchedules,
  checkValidations,
  schedulesController.update,
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("schedules"),
  checkValidations,
  schedulesController.delete,
);

export default router;
