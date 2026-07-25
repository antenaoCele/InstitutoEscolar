import { db } from "../db.js";
import { createCrudController } from "../utils/crudFactory.js";

const baseController = createCrudController("plan_prices");

export const planPricesController = {
  ...baseController,

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
        JOIN plans p
          ON pp.plan_id = p.id
        ORDER BY pp.id ASC
      `;

      const [rows] = await db.execute(sql);

      res.json({
        success: true,
        data: rows,
      });
    } catch {
      res.status(500).json({
        success: false,
        message: "Error al obtener los precios de los planes",
      });
    }
  },

  changePrice: async (req, res) => {
    try {
      const planId = Number(req.params.planId);
      const { price } = req.body;

      // Función auxiliar para formatear fechas
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
      };

      const today = new Date();

      // => Para hacer pruebas, comentar:
      const day = today.getDate();

      // Para hacer pruebas, descomentar:
      // const day = 3;

      if (day < 1 || day > 5) {
        return res.status(400).json({
          success: false,
          message:
            "Los precios solo pueden modificarse entre los días 1 y 5 de cada mes.",
        });
      }

      const todayString = formatDate(today);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = formatDate(yesterday);

      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      const [rows] = await db.execute(
        `
      SELECT *
      FROM plan_prices
      WHERE plan_id = ? AND end_date IS NULL
      ORDER BY start_date DESC
      LIMIT 1
      `,
        [planId],
      );

      if (!rows.length) {
        return res.status(404).json({
          success: false,
          message: "No existe un precio vigente para este plan.",
        });
      }

      const currentPrice = rows[0];
      const startDate = new Date(currentPrice.start_date);

      const sameDay = formatDate(startDate) === todayString;

      const sameMonth =
        startDate.getMonth() === currentMonth &&
        startDate.getFullYear() === currentYear;

      // Si el precio comenzó hoy, solo corregimos el valor.
      if (sameDay) {
        await db.execute(
          `
        UPDATE plan_prices
        SET price = ?
        WHERE id = ?
        `,
          [price, currentPrice.id],
        );

        return res.json({
          success: true,
          action: "updated",
          message:
            "El precio fue actualizado correctamente. Puede corregirlo nuevamente durante el día de hoy.",
        });
      }

      // Ya hubo un cambio este mes.
      if (sameMonth) {
        return res.status(400).json({
          success: false,
          message:
            "Este plan ya fue actualizado durante el presente mes. Podrá volver a modificarlo entre los días 1 y 5 del próximo mes.",
        });
      }

      // Cerrar el precio anterior.
      await db.execute(
        `
      UPDATE plan_prices
      SET end_date = ?
      WHERE id = ?
      `,
        [yesterdayString, currentPrice.id],
      );

      // Crear el nuevo precio.
      await db.execute(
        `
      INSERT INTO plan_prices
      (plan_id, price, start_date)
      VALUES (?, ?, ?)
      `,
        [planId, price, todayString],
      );

      return res.json({
        success: true,
        action: "created",
        message:
          "El precio fue actualizado correctamente. Podrá realizar correcciones durante el día de hoy. A partir de mañana no podrá modificar este precio y las futuras actualizaciones solo podrán efectuarse entre los días 1 y 5 de cada mes.",
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Error al actualizar el precio del plan.",
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
        JOIN plans p
          ON pp.plan_id = p.id
        WHERE pp.id = ?
      `;

      const [rows] = await db.execute(sql, [id]);

      if (!rows.length) {
        return res.status(404).json({
          success: false,
          message: "Precio de plan no encontrado",
        });
      }

      res.json({
        success: true,
        data: rows[0],
      });
    } catch {
      res.status(500).json({
        success: false,
        message: "Error al obtener el precio del plan",
      });
    }
  },
};
