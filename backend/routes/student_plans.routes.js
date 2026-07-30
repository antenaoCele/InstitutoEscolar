import express from "express";
import { studentPlansController } from "../controllers/student_plans.controller.js";
import {
  validateStudentPlans,
  validateEditStudentPlans,
} from "../validators/entities/student_plans.validator.js";
import {
  validateID,
  checkValidations,
} from "../validators/helpers/validation.middleware.js";
import {
  authentication,
  authorization,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authentication, studentPlansController.getAll);

// Dispara manualmente la baja automática por deuda no regularizada a
// tiempo (misma función que corre el cron todos los días). Útil para
// probarla ahora mismo sin esperar al horario programado.
router.post(
  "/close-overdue",
  authentication,
  authorization("ADMIN"),
  studentPlansController.closeOverduePlans,
);

//OBTENER EL ESTADO DE PAGO DE LOS ESTUDIANTES Y FILTRARLOS POR DOCENTE(es opcional lo del docente)
router.get(
  "/account-status",
  authentication,
  authorization("ADMIN"),
  studentPlansController.getAccountStatus,
);

router.get(
  "/:id/status",
  authentication,
  authorization("ADMIN"),
  ...validateID("student_plans"),
  checkValidations,
  studentPlansController.getStatus,
);

router.get(
  "/:id",
  authentication,
  ...validateID("student_plans"),
  checkValidations,
  studentPlansController.getById,
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validateStudentPlans,
  checkValidations,
  studentPlansController.create,
);

// CAMBIO DE DOCENTE: cierra la inscripción actual y abre una nueva
// copiando su first_payment_option, todo en una transacción. No usa
// validateEditStudentPlans porque el body solo trae teacher_id; el
// controller valida el tipo y la compatibilidad con el plan.
router.put(
  "/:id/change-teacher",
  authentication,
  authorization("ADMIN"),
  ...validateID("student_plans"),
  checkValidations,
  studentPlansController.changeTeacher,
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("student_plans"),
  validateEditStudentPlans,
  checkValidations,
  studentPlansController.update,
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  ...validateID("student_plans"),
  checkValidations,
  studentPlansController.softDelete,
);

export default router;
