import express from "express";
import { db } from "../db.js";
import {
  validatePlanPrices,
  validateEditPlanPrices,
} from "../validators/validations.js";
import { validateID, checkValidations } from "../validators/helpers.js";
import { authentication, authorization } from "./auth.js";

const router = express.Router();

router.get("/", authentication, async (req, res) => {
  try {
    const sql = `
      SELECT pp.id, pp.plan_id, p.name AS plan_name, pp.price, pp.start_date, pp.end_date
      FROM plan_prices pp
      JOIN plans p ON pp.plan_id = p.id
    `;
    const [planPrices] = await db.execute(sql);
    res.json({ success: true, planPrices });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener los precios de los planes",
    });
  }
});

router.get(
  "/:id",
  authentication,
  validateID("plan_prices"),
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const sql = `
        SELECT pp.id, pp.plan_id, p.name AS plan_name, pp.price, pp.start_date, pp.end_date
        FROM plan_prices pp
        JOIN plans p ON pp.plan_id = p.id
        WHERE pp.id = ?
      `;
      const [rows] = await db.execute(sql, [id]);
      res.json({ success: true, data: rows[0] });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener el precio del plan",
      });
    }
  },
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validatePlanPrices,
  checkValidations,
  async (req, res) => {
    try {
      const { plan_id, price, start_date, end_date } = req.body;
      const [result] = await db.execute(
        "INSERT INTO plan_prices (plan_id, price, start_date, end_date) VALUES (?, ?, ?, ?)",
        [plan_id, price, start_date, end_date],
      );

      res.status(201).json({
        success: true,
        data: {
          id: result.insertId,
          plan_id,
          price,
          start_date,
          end_date,
        },
        message: "Precio de plan creado exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al crear el precio del plan",
      });
    }
  },
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID("plan_prices"),
  validateEditPlanPrices,
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { plan_id, price, start_date, end_date } = req.body;

      const [rows] = await db.execute(
        "SELECT * FROM plan_prices WHERE id = ?",
        [id],
      );

      const newPlanId = plan_id ?? rows[0].plan_id;
      const newPrice = price ?? rows[0].price;
      const newStartDate = start_date ?? rows[0].start_date;
      const newEndDate = end_date ?? rows[0].end_date;

      await db.execute(
        "UPDATE plan_prices SET plan_id = ?, price = ?, start_date = ?, end_date = ? WHERE id = ?",
        [newPlanId, newPrice, newStartDate, newEndDate, id],
      );

      res.json({
        success: true,
        data: {
          id,
          plan_id: newPlanId,
          price: newPrice,
          start_date: newStartDate,
          end_date: newEndDate,
        },
        message: "Precio de plan actualizado exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar el precio del plan",
      });
    }
  },
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID("plan_prices"),
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      await db.execute("DELETE FROM plan_prices WHERE id = ?", [id]);
      res.json({ success: true, message: "Precio de plan eliminado exitosamente" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar el precio del plan",
      });
    }
  },
);

export default router;
