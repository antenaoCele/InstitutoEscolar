import express from "express";
import { teacherLiquidationsController } from "../controllers/teacher_liquidations.controller.js";
import {
  validateTeachersLiquidations,
  validateEditTeachersLiquidations,
} from "../validators/entities/teacher_liquidations.validator.js";
import {
  validateID,
  checkValidations,
} from "../validators/helpers/validation.middleware.js";
import {
  authentication,
  authorization,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
  "/",
  authentication,
  authorization("ADMIN"),
  teacherLiquidationsController.getAll,
);

router.get(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("teacher_liquidations"),
  checkValidations,
  teacherLiquidationsController.getById,
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validateTeachersLiquidations,
  checkValidations,
  teacherLiquidationsController.create,
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("teacher_liquidations"),
  validateEditTeachersLiquidations,
  checkValidations,
  teacherLiquidationsController.update,
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("teacher_liquidations"),
  checkValidations,
  teacherLiquidationsController.delete,
);

export default router;
