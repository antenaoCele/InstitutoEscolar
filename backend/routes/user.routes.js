import { Router } from "express";
import passport from "passport";
import { getMe } from "../controllers/user.controller.js";

const router = Router();

router.get("/me", passport.authenticate("jwt", { session: false }), getMe);

export default router;
