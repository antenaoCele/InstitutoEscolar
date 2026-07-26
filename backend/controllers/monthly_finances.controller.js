import { db } from "../db.js";
import { createCrudController } from "../utils/crudFactory.js";
import { calculateMonthlyFinance } from "../services/monthly.finances.service.js";

const baseController = createCrudController("monthly_finances");

export const monthlyFinancesController = {
  ...baseController,

  getAll: async (req, res) => {
    try {
      const [rows] = await db.execute(
        "SELECT * FROM monthly_finances ORDER BY year DESC, month DESC",
      );

      res.json({
        success: true,
        data: rows,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener los cierres mensuales",
      });
    }
  },

  getById: async (req, res) => {
    try {
      const id = Number(req.params.id);

      const [rows] = await db.execute(
        `
        SELECT 
          id, 
          year, 
          month, 
          total_income, 
          total_salaries, 
          other_expenses, 
          net_profit 
        FROM monthly_finances 
        WHERE id = ?
        `,
        [id],
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Registro no encontrado",
        });
      }

      return res.json({
        success: true,
        data: rows[0],
      });
    } catch (error) {
      console.error("Error en getById:", error);
      return res.status(500).json({
        success: false,
        message: "Error al obtener el registro",
      });
    }
  },

  create: async (req, res) => {
    try {
      const { year, month, other_expenses } = req.body;

      const { totalIncome, totalSalaries, netProfit } =
        await calculateMonthlyFinance(year, month, other_expenses);

      const [result] = await db.execute(
        `INSERT INTO monthly_finances 
        (year, month, total_income, total_salaries, other_expenses, net_profit) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [year, month, totalIncome, totalSalaries, other_expenses, netProfit],
      );

      return res.status(201).json({
        success: true,
        message: "Cierre mensual generado correctamente",
        data: {
          id: result.insertId,
          year,
          month,
          total_income: totalIncome,
          total_salaries: totalSalaries,
          other_expenses,
          net_profit: netProfit,
        },
      });
    } catch (error) {
      console.error("ERROR EN CIERRE MENSUAL:", error);
      return res.status(500).json({
        success: false,
        message: "Error al generar el cierre mensual",
        error: error.message,
      });
    }
  },

  update: async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { year, month, other_expenses } = req.body;

      const [rows] = await db.execute(
        "SELECT * FROM monthly_finances WHERE id = ?",
        [id],
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Cierre mensual no encontrado",
        });
      }

      const current = rows[0];

      const newYear = year !== undefined ? year : current.year;
      const newMonth = month !== undefined ? month : current.month;
      const newOtherExpenses =
        other_expenses !== undefined ? other_expenses : current.other_expenses;

      const { totalIncome, totalSalaries, netProfit } =
        await calculateMonthlyFinance(newYear, newMonth, newOtherExpenses);

      await db.execute(
        `
        UPDATE monthly_finances
        SET
          year = ?,
          month = ?,
          total_income = ?,
          total_salaries = ?,
          other_expenses = ?,
          net_profit = ?
        WHERE id = ?
        `,
        [
          newYear,
          newMonth,
          totalIncome,
          totalSalaries,
          newOtherExpenses,
          netProfit,
          id,
        ],
      );

      return res.json({
        success: true,
        message: "Cierre mensual actualizado y recalculado correctamente",
        data: {
          id,
          year: newYear,
          month: newMonth,
          total_income: totalIncome,
          total_salaries: totalSalaries,
          other_expenses: newOtherExpenses,
          net_profit: netProfit,
        },
      });
    } catch (error) {
      console.error("Error en update:", error);
      return res.status(500).json({
        success: false,
        message: "Error al actualizar el cierre mensual",
      });
    }
  },
};
