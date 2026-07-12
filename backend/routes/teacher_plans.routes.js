import express from "express";

import { teacherPlansController } from "../controllers/teacher_plans.controller.js";

import {
  authentication,
  authorization,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authentication, teacherPlansController.getAll);

router.get("/plan/:planId", authentication, teacherPlansController.getByPlan);

router.put(
  "/plan/:planId",
  authentication,
  authorization("ADMIN"),
  teacherPlansController.updateByPlan,
);

export default router;
