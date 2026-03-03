import express from "express";
import { login } from "../controllers/login.controller.js";
import { checkValidations } from "../validators/helpers/validation.middleware.js";

const router = express.Router();

router.post("/", checkValidations, login);

export default router;
