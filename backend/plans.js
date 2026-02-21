import express from "express";
import { db } from "./db.js";
import { validatePlans, validateEditPlans } from "./validations.js";
import { validateID, checkValidations } from "./helpers.js";
import { authentication, authorization } from "./auth.js";

const router = express.Router();

router.get("/", authentication, async (req, res) => {
  try {
    const [plans] = await db.execute("SELECT * FROM plans");
    res.json({ success: true, plans });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener planes",
    });
  }
});

router.get(
  "/:id",
  authentication,
  validateID("plans"),
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const [rows] = await db.execute("SELECT * FROM plans WHERE id=?", [id]);

      res.json({ success: true, data: rows[0] });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener el plan",
      });
    }
  },
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validatePlans,
  checkValidations,
  async (req, res) => {
    try {
      const { name, price } = req.body;

      const [result] = await db.execute(
        "INSERT INTO plans (name, price) VALUES (?,?)",
        [name, price],
      );

      res.status(201).json({
        success: true,
        data: { id: result.insertId, name, price },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al crear plan",
      });
    }
  },
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID("plans"),
  validateEditPlans,
  checkValidations,
  async (req, res) => {
    try {
      const { name, price } = req.body;
      const id = Number(req.params.id);

      const [rows] = await db.execute("SELECT * FROM plans WHERE id=?", [id]);

      const newName = name ?? rows[0].name;
      const newPrice = price ?? rows[0].price;

      await db.execute("UPDATE plans SET name=?, price=? WHERE id=?", [
        newName,
        newPrice,
        id,
      ]);

      return res.status(200).json({
        success: true,
        data: {
          id: Number(id),
          name: newName,
          price: newPrice,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar plan",
      });
    }
  },
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID("plans"),
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      await db.execute("DELETE FROM plans WHERE id=?", [id]);
      res.json({ success: true, message: "Plan eliminado con éxito" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar el plan",
      });
    }
  },
);

export default router;
