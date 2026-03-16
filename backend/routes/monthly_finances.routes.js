import express from "express";
import { monthlyFinancesController } from "../controllers/monthly_finances.controller.js";
import {
  authentication,
  authorization,
} from "../middlewares/auth.middleware.js";
import { validateID } from "../validators/helpers/validation.middleware.js";
import { checkValidations } from "../validators/helpers/validation.middleware.js";

const router = express.Router();

router.get(
  "/",
  authentication,
  authorization("ADMIN"),
  monthlyFinancesController.getAll,
);

router.get(
  "/:id",
  authentication,
  ...validateID("monthly_finances"),
  checkValidations,
  monthlyFinancesController.getById,
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  monthlyFinancesController.create,
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("monthly_finances"),
  checkValidations,
  monthlyFinancesController.update,
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("monthly_finances"),
  checkValidations,
  monthlyFinancesController.delete,
);

export default router;
