import express from "express";
import { db } from "./db.js";
import {
  checkValidations,
  validatePlanSubjects,
  validateID,
} from "./validations.js";
import { authentication } from "./auth.js";

const router = express.Router();

router.get("/", authentication, async (req, res) => {
  let sql =
    "SELECT p.id AS plan_id, s.id AS subject_id \
FROM plan_subjects ps \
JOIN plans p ON ps.plan_id = p.id \
JOIN subjects s ON ps.subject_id = s.id";

  const [planSubjects] = await db.execute(sql);
  res.json({ success: true, planSubjects });
});

router.get(
  "/:id",
  authentication,
  validateID,
  checkValidations,
  async (req, res) => {
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

    if (planSubjects.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Plan y materia no encontrados." });
    }

    res.json({ success: true, data: planSubjects[0] });
  },
);

router.post(
  "/",
  authentication,
  validatePlanSubjects,
  checkValidations,
  async (req, res) => {
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
  },
);

router.put(
  "/:id",
  authentication,
  validateID,
  checkValidations,
  async (req, res) => {
    const id = Number(req.params.id);

    const [planSubjects] = await db.execute(
      "SELECT * FROM plan_subjects WHERE id = ?",
      [id],
    );

    if (planSubjects.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Plan y materia no encontrados." });
    }

    const { plan_id, subject_id } = req.body;

    await db.execute(
      "UPDATE plan_subjects SET plan_id = ?, subject_id = ? WHERE id = ?",
      [plan_id, subject_id, id],
    );

    res.json({
      success: true,
      data: {
        id,
        plan_id,
        subject_id,
      },
      message: "Registro actualizado exitosamente",
    });
  },
);

router.delete(
  "/:id",
  authentication,
  validateID,
  checkValidations,
  async (req, res) => {
    const id = Number(req.params.id);

    const [planSubjects] = await db.execute(
      "SELECT * FROM plan_subjects WHERE id = ?",
      [id],
    );

    if (planSubjects.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Plan y materia no encontrados." });
    }

    await db.execute("DELETE FROM plan_subjects WHERE id = ?", [id]);

    res.json({ success: true, message: "Registro eliminado exitosamente." });
  },
);

export default router;
