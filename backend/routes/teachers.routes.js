import express from "express";
import { teachersController } from "../controllers/teachers.controller.js";
import {
  validateTeachers,
  validateEditTeachers,
} from "../validators/entities/teachers.validator.js";
import {
  validateID,
  checkValidations,
} from "../validators/helpers/validation.middleware.js";
import {
  authentication,
  authorization,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authentication, teachersController.getAll);

//Obtener las liquidaciones de un docente
router.get(
  "/:id/liquidate",
  authentication,
  authorization("ADMIN"),
  ...validateID("teachers"),
  checkValidations,
  teachersController.getLiquidations,
);

router.get(
  "/:id/students",
  authentication,
  authorization("ADMIN"),
  ...validateID("teachers"),
  checkValidations,
  teachersController.getAvailableStudents,
);

router.get(
  "/:id/plans",
  authentication,
  authorization("ADMIN"),
  ...validateID("teachers"),
  checkValidations,
  teachersController.getAvailablePlans,
);

router.get(
  "/:id",
  authentication,
  ...validateID("teachers"),
  checkValidations,
  teachersController.getById,
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validateTeachers,
  checkValidations,
  teachersController.create,
);

//POST PARA LIQUIDAR SUELDO POR MES DE UN DOCENTE
router.post(
  "/:id/liquidate",
  authentication,
  authorization("ADMIN"),
  validateID("teachers"),
  // validateTeachers,
  checkValidations,
  teachersController.createLiquidation,
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("teachers"),
  validateEditTeachers,
  checkValidations,
  teachersController.update,
);

router.put(
  "/:id/reactivate",
  authentication,
  authorization("ADMIN"),
  ...validateID("teachers"),
  teachersController.reactivate,
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("teachers"),
  checkValidations,
  teachersController.delete,
);

export default router;
