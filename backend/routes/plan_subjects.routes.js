import express from "express";
import { planSubjectsController } from "../controllers/plan_subjects.controller.js";
import {
  validatePlanSubjects,
  validateEditPlanSubjects,
} from "../validators/entities/plan_subjects.validator.js";
import {
  validateID,
  checkValidations,
} from "../validators/helpers/validation.middleware.js";
import {
  authentication,
  authorization,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authentication, planSubjectsController.getAll);

router.get(
  "/:id",
  authentication,
  ...validateID("plan_subjects"),
  checkValidations,
  planSubjectsController.getById,
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validatePlanSubjects,
  checkValidations,
  planSubjectsController.create,
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("plan_subjects"),
  validateEditPlanSubjects,
  checkValidations,
  planSubjectsController.update,
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("plan_subjects"),
  checkValidations,
  planSubjectsController.delete,
);

export default router;
