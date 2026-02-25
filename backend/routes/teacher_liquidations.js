import express from "express";
import { db } from "../db.js";
import { checkValidations, validateID } from "../validators/helpers.js";
import { authentication, authorization } from "./auth.js";

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

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID("teacher_liquidations"),
  checkValidations,
  async (req, res) => {
    try {
      const { id } = req.params;

      await db.execute("DELETE FROM teacher_liquidations WHERE id = ?", [id]);

      res.json({
        success: true,
        message: "Liquidación eliminada correctamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar la liquidación",
      });
    }
  },
);

export default router;
