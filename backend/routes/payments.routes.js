import express from "express";
import { paymentsController } from "../controllers/payments.controller.js";
import {
  validateID,
  checkValidations,
} from "../validators/helpers/validation.middleware.js";
import {
  validatePayments,
  validateEditPayments,
} from "../validators/entities/payments.validator.js";
import {
  authentication,
  authorization,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
  "/",
  authentication,
  authorization("ADMIN"),
  paymentsController.getAll,
);

router.get(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("payments"),
  checkValidations,
  paymentsController.getById,
);

router.get(
  "/student/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("students"),
  checkValidations,
  paymentsController.getPaymentsByStudent,
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validatePayments,
  checkValidations,
  paymentsController.create,
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("payments"),
  validateEditPayments,
  checkValidations,
  paymentsController.update,
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("payments"),
  checkValidations,
  paymentsController.delete,
);

export default router;
