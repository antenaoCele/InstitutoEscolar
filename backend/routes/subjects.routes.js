import express from "express";
import { subjectsController } from "../controllers/subjects.controller.js";
import {
  validateID,
  checkValidations,
} from "../validators/helpers/validation.middleware.js";
import {
  validateSubjects,
  validateEditSubjects,
} from "../validators/entities/subjects.validator.js";

const router = express.Router();

router.get("/", subjectsController.getAll);

router.get(
  "/:id",
  ...validateID("subjects"),
  checkValidations,
  subjectsController.getById,
);

router.post("/", validateSubjects, checkValidations, subjectsController.create);

router.put(
  "/:id",
  ...validateID("subjects"),
  validateEditSubjects,
  checkValidations,
  subjectsController.update,
);

router.delete(
  "/:id",
  ...validateID("subjects"),
  checkValidations,
  subjectsController.delete,
);

export default router;
