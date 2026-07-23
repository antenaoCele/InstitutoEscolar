import express from "express";
import { planPricesController } from "../controllers/plan_prices.controller.js";
import {
  validatePlanPrices,
  validateEditPlanPrices,
} from "../validators/entities/plan_prices.validator.js";
import {
  validateID,
  checkValidations,
} from "../validators/helpers/validation.middleware.js";
import {
  authentication,
  authorization,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authentication, planPricesController.getAll);

router.put(
  "/change-price/:planId",
  authentication,
  authorization("ADMIN"),
  planPricesController.changePrice,
);

router.get(
  "/:id",
  authentication,
  ...validateID("plan_prices"),
  checkValidations,
  planPricesController.getById,
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validatePlanPrices,
  checkValidations,
  planPricesController.create,
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("plan_prices"),
  validateEditPlanPrices,
  checkValidations,
  planPricesController.update,
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("plan_prices"),
  checkValidations,
  planPricesController.delete,
);

export default router;
