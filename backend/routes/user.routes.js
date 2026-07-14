import { Router } from "express";
import {
  getMe,
  updateMe,
  changePassword,
} from "../controllers/user.controller.js";
import {
  validateEditMe,
  validateChangePassword,
} from "../validators/entities/me.validator.js";
import { checkValidations } from "../validators/helpers/validation.middleware.js";
import { authentication } from "../middlewares/auth.middleware.js";

const router = Router();

// validateUnique() lee req.params.id para excluir el registro propio
// al chequear duplicados; en /me no hay :id en la URL, así que lo
// completamos a mano desde el usuario autenticado antes de validar.
const attachSelfId = (req, res, next) => {
  req.params.id = String(req.user.userId);
  next();
};

router.get("/me", authentication, getMe);

router.put(
  "/me",
  authentication,
  attachSelfId,
  validateEditMe,
  checkValidations,
  updateMe,
);

router.put(
  "/me/password",
  authentication,
  validateChangePassword,
  checkValidations,
  changePassword,
);

export default router;
