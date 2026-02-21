import express from "express";
import { db } from "../db.js";
import {
  validatePlanSubjects,
  validateEditPlanSubjects,
} from "./validations.js";
import { validateID, checkValidations } from "./helpers.js";
import { authentication, authorization } from "./auth.js";

const router = express.Router();

router.get("/", authentication, async (req, res) => {
  try {
    let sql =
      "SELECT p.id AS plan_id, s.id AS subject_id \
      FROM plan_subjects ps \
      JOIN plans p ON ps.plan_id = p.id \
      JOIN subjects s ON ps.subject_id = s.id";

    const [planSubjects] = await db.execute(sql);
    res.json({ success: true, planSubjects });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener las asignaturas de los planes",
    });
  }
});

router.get(
  "/:id",
  authentication,
  validateID("plan_subjects"),
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const [planSubjects] = await db.execute(
        `SELECT 
     ps.id,
     p.id AS plan_id,
     s.id AS subject_id
    FROM plan_subjects ps
    JOIN plans p ON ps.plan_id = p.id
    JOIN subjects s ON ps.subject_id = s.id
    WHERE ps.id = ?`,
        [id],
      );

      res.json({ success: true, data: planSubjects[0] });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener las asignaturas del plan",
      });
    }
  },
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validatePlanSubjects,
  checkValidations,
  async (req, res) => {
    try {
      const { plan_id, subject_id } = req.body;

      await db.execute(
        "INSERT INTO plan_subjects (plan_id, subject_id) VALUES (?, ?)",
        [plan_id, subject_id],
      );

      res.status(201).json({
        success: true,
        data: {
          plan_id,
          subject_id,
        },
        message: "Materia asignada al plan, exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al asignar materias al plan",
      });
    }
  },
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID("plan_subjects"),
  validateEditPlanSubjects,
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { plan_id, subject_id } = req.body;

      const [planSubjects] = await db.execute(
        "SELECT * FROM plan_subjects WHERE id = ?",
        [id],
      );

      const newPlanId = plan_id ?? planSubjects[0].plan_id;
      const newSubjectId = subject_id ?? planSubjects[0].subject_id;

      await db.execute(
        "UPDATE plan_subjects SET plan_id = ?, subject_id = ? WHERE id = ?",
        [newPlanId, newSubjectId, id],
      );

      res.json({
        success: true,
        data: {
          id,
          plan_id: newPlanId,
          subject_id: newSubjectId,
        },
        message: "Registro actualizado exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al editar materias del plan",
      });
    }
  },
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID("plan_subjects"),
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      await db.execute("DELETE FROM plan_subjects WHERE id = ?", [id]);

      res.json({ success: true, message: "Registro eliminado exitosamente." });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar materias del plan",
      });
    }
  },
);

export default router;
