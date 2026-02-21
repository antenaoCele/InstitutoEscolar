import express from "express";
import { db } from "./db.js";
import { checkValidations, validateID } from "./helpers.js";
import { authentication } from "./auth.js";

const router = express.Router();

router.get("/", authentication, async (req, res) => {
  try {
    const sql = `
      SELECT 
        tl.id, 
        tl.teacher_id,
        t.first_name,
        t.last_name,
        tl.month, 
        tl.total_collected, 
        tl.net_salary 
      FROM teacher_liquidations tl
      JOIN teachers t ON tl.teacher_id = t.id
    `;

    const [liquidations] = await db.execute(sql);

    res.json({ success: true, data: liquidations });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error interno del servidor." });
  }
});

router.get(
  "/:id",
  authentication,
  validateID("teacher_liquidations"),
  checkValidations,
  async (req, res) => {
    try {
      const { id } = req.params;

      const sql = `
        SELECT 
          tl.id, 
          tl.teacher_id,
          t.first_name,
          t.last_name,
          tl.month, 
          tl.total_collected, 
          tl.net_salary 
        FROM teacher_liquidations tl
        JOIN teachers t ON tl.teacher_id = t.id
        WHERE tl.id = ?
      `;

      const [rows] = await db.execute(sql, [id]);

      res.json({ success: true, data: rows[0] });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error interno del servidor." });
    }
  },
);

export default router;
