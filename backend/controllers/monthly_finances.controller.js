import { db } from "../db.js";

const calculateMonthlyFinance = async (year, month, otherExpenses = 0) => {
  const monthString = `${year}-${String(month).padStart(2, "0")}`;

  const startDateObj = new Date(year, month - 1, 1);
  const endDateObj = new Date(year, month, 0);

  const startDate = startDateObj.toISOString().split("T")[0];
  const endDate = endDateObj.toISOString().split("T")[0];

  const [payments] = await db.execute(
    `
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM payments
    WHERE payment_date BETWEEN ? AND ?
    `,
    [startDate, endDate],
  );

  const [enrollments] = await db.execute(
    `
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM enrollments
    WHERE payment_date BETWEEN ? AND ?
    `,
    [startDate, endDate],
  );

  const totalIncome = Number(payments[0].total) + Number(enrollments[0].total);

  const [salaries] = await db.execute(
    `
  SELECT COALESCE(SUM(net_salary), 0) AS total
  FROM teacher_liquidations
  WHERE month = ?
  `,
    [monthString],
  );

  const totalSalaries = Number(salaries[0].total);

  const netProfit = totalIncome - totalSalaries - otherExpenses;

  return {
    monthString,
    totalIncome,
    totalSalaries,
    netProfit,
  };
};

export const monthlyFinancesController = {
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

  create: async (req, res) => {
    try {
      const { year, month, other_expenses = 0 } = req.body;

      const numYear = Number(year);
      const numMonth = Number(month);

      if (!numYear || numYear < 2020 || numYear > 2100) {
        return res.status(400).json({
          success: false,
          message: "Año inválido. Debe ser un año real (ej. 2026).",
        });
      }

      if (!numMonth || numMonth < 1 || numMonth > 12) {
        return res.status(400).json({
          success: false,
          message: "Mes inválido. Debe estar entre 1 y 12.",
        });
      }

      if (!year || !month) {
        return res.status(400).json({
          success: false,
          message: "Año y mes son obligatorios",
        });
      }

      const [exists] = await db.execute(
        "SELECT id FROM monthly_finances WHERE year = ? AND month = ?",
        [year, month],
      );

      if (exists.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Ese mes ya fue cerrado",
        });
      }

      const { totalIncome, totalSalaries, netProfit } =
        await calculateMonthlyFinance(year, month, other_expenses);

      const [result] = await db.execute(
        `INSERT INTO monthly_finances 
      (year, month, total_income, total_salaries, other_expenses, net_profit) 
      VALUES (?, ?, ?, ?, ?, ?)`,
        [
          Number(year),
          Number(month),
          totalIncome,
          totalSalaries,
          Number(other_expenses),
          netProfit,
        ],
      );

      return res.status(201).json({
        success: true,
        message: "Cierre mensual generado correctamente",
        data: {
          id: result.insertId,
          year,
          month,
          total_income: totalIncome,
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

      const newYear = year ?? current.year;
      const newMonth = month ?? current.month;
      const newOtherExpenses = other_expenses ?? current.other_expenses;

      const [exists] = await db.execute(
        `
        SELECT id FROM monthly_finances
        WHERE year = ? AND month = ? AND id != ?
        `,
        [newYear, newMonth, id],
      );

      if (exists.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Ya existe un cierre para ese mes",
        });
      }

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

      res.json({
        success: true,
        message: "Cierre mensual actualizado correctamente",
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
      res.status(500).json({
        success: false,
        message: "Error al actualizar el cierre mensual",
      });
    }
  },

  delete: async (req, res) => {
    try {
      const id = Number(req.params.id);

      const [result] = await db.execute(
        "DELETE FROM monthly_finances WHERE id = ?",
        [id],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Cierre mensual no encontrado",
        });
      }

      res.json({
        success: true,
        message: "Cierre mensual eliminado correctamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar el cierre mensual",
      });
    }
  },
};
