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
"SELECT p.id, s.id \
FROM plan_subjects ps \
JOIN plan p ON ps.plan_id = p.id \
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

    const [result] = await db.execute(
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