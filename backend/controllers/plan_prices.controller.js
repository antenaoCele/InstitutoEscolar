import { db } from "../db.js";
import { createCrudController } from "../utils/crudFactory.js";

const baseController = createCrudController("plan_prices");

export const planPricesController = {
  ...baseController,

  getAll: async (req, res) => {
    try {
      const sql = `
        SELECT 
        p.id, 
        pp.plan_id,  
        pp.price, 
        pp.start_date, 
        pp.end_date
        FROM plan_prices pp
        JOIN plans p ON pp.plan_id = p.id
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
        p.id, 
        pp.plan_id,  
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
};
