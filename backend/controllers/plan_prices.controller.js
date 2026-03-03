import { db } from "../db.js";
import { createCrudController } from "../utils/crudFactory.js";

const baseCrud = createCrudController("plan_prices");

export const planPricesController = {
  getAll: async (req, res) => {
    try {
      const sql = `
        SELECT 
        pp.id, 
        pp.plan_id, 
        p.name AS plan_name, 
        pp.price, 
        pp.start_date, 
        pp.end_date
        FROM plan_prices pp
        JOIN plans p ON pp.plan_id = p.id
        ORDER BY pp.start_date DESC
      `;

      const [rows] = await db.execute(sql);

      res.json({ success: true, data: rows });
    } catch {
      res.status(500).json({
        success: false,
        message: "Error al obtener los precios de los planes",
      });
    }
  },

  getById: async (req, res) => {
    try {
      const id = Number(req.params.id);

      const sql = `
        SELECT 
        pp.id, 
        pp.plan_id, 
        p.name AS plan_name, 
        pp.price, 
        pp.start_date, 
        pp.end_date
        FROM plan_prices pp
        JOIN plans p ON pp.plan_id = p.id
        WHERE pp.id = ?
      `;

      const [rows] = await db.execute(sql, [id]);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Precio de plan no encontrado",
        });
      }

      res.json({ success: true, data: rows[0] });
    } catch {
      res.status(500).json({
        success: false,
        message: "Error al obtener el precio del plan",
      });
    }
  },

  create: baseCrud.create,

  update: async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { plan_id, price, start_date, end_date } = req.body;

      const [rows] = await db.execute(
        "SELECT * FROM plan_prices WHERE id = ?",
        [id],
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Precio de plan no encontrado",
        });
      }

      const current = rows[0];

      const newPlanId = plan_id ?? current.plan_id;
      const newPrice = price ?? current.price;
      const newStartDate = start_date ?? current.start_date;
      const newEndDate = end_date ?? current.end_date;

      await db.execute(
        `
        UPDATE plan_prices
        SET plan_id = ?, price = ?, start_date = ?, end_date = ?
        WHERE id = ?
        `,
        [newPlanId, newPrice, newStartDate, newEndDate, id],
      );

      res.json({
        success: true,
        message: "Precio de plan actualizado exitosamente",
        data: {
          id,
          plan_id: newPlanId,
          price: newPrice,
          start_date: newStartDate,
          end_date: newEndDate,
        },
      });
    } catch {
      res.status(500).json({
        success: false,
        message: "Error al actualizar el precio del plan",
      });
    }
  },

  delete: baseCrud.delete,
};
