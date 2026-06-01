import express from "express";
import { eventsController } from "../controllers/events.controller.js";
import {
  authentication,
  authorization,
} from "../middlewares/auth.middleware.js";
import {
  validateID,
  checkValidations,
} from "../validators/helpers/validation.middleware.js";
import {
  validateEvents,
  validateEditEvents,
} from "../validators/entities/events.validator.js";

const router = express.Router();

router.get("/", authentication, eventsController.getAll);

router.get(
  "/:id",
  authentication,
  ...validateID("events"),
  checkValidations,
  eventsController.getById,
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validateEvents,
  checkValidations,
  eventsController.create,
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("events"),
  validateEditEvents,
  checkValidations,
  eventsController.update,
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("events"),
  checkValidations,
  eventsController.delete,
);

export default router;
