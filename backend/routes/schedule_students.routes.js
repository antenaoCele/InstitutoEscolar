import express from "express";
import { scheduleStudentsController } from "../controllers/schedule_students.controller.js";
import {
  validateID,
  checkValidations,
} from "../validators/helpers/validation.middleware.js";
import {
  validateScheduleStudents,
  validateEditScheduleStudents,
} from "../validators/entities/schedule_students.validator.js";
import {
  authentication,
  authorization,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authentication, scheduleStudentsController.getAll);

router.get(
  "/:id",
  authentication,
  ...validateID("schedule_students"),
  checkValidations,
  scheduleStudentsController.getById,
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validateScheduleStudents,
  checkValidations,
  scheduleStudentsController.create,
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("schedule_students"),
  validateEditScheduleStudents,
  checkValidations,
  scheduleStudentsController.update,
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("schedule_students"),
  checkValidations,
  scheduleStudentsController.delete,
);

export default router;
