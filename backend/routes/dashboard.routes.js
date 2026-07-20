import express from "express";
import { dashboardController } from "../controllers/dashboard.controller.js";
import { authentication } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authentication, dashboardController.getStats);

export default router;
