import express from "express";
import { usersController } from "../controllers/users.controller.js";
import {
  validateUsers,
  validateEditUsers,
} from "../validators/entities/users.validator.js";
import {
  validateID,
  checkValidations,
} from "../validators/helpers/validation.middleware.js";
import {
  authentication,
  authorization,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authentication, authorization("ADMIN"), usersController.getAll);

router.get(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("users"),
  checkValidations,
  usersController.getById,
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validateUsers,
  checkValidations,
  usersController.create,
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("users"),
  validateEditUsers,
  checkValidations,
  usersController.update,
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("users"),
  checkValidations,
  usersController.delete,
);

export default router;
