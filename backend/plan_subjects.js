import express from "express";
import { db } from "./db.js";
import {
  checkValidations,
  validateID,
  validateSubjects,
  validateEditSubjects
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

router.post(
  "/",
  authentication,
  validateSubjects,
  checkValidations,
  async (req, res) => {
    const {plan_id, subject_id} = req.body;

    const [plan] = await db.execute(
      "SELECT id FROM plans WHERE id = ?",
      [plan_id]
    );

    if (plan.length === 0) {
      return res.status(400).json({
        success: false,
        message: "El plan no existe",
      });
    }

    const [subject] = await db.execute(
      "SELECT id FROM subjects WHERE id = ?",
      [subject_id]
    );

    if (subject.length === 0) {
      return res.status(400).json({
        success: false,
        message: "La materia no existe",
      });
    }

    await db.execute(
      "INSERT INTO plan_subjects (plan_id, subject_id) VALUES (?, ?)",
      [plan_id, subject_id]
    );

    res.status(201).json({
      success: true,
      data: {
        plan_id,
        subject_id,
      },
      message: "Materia asignada al plan exitosamente",
    });
  }
);

export default router;