import express from "express";
import { db } from "../db.js";
import { authentication, authorization } from "./auth.js";

const router = express.Router();

//GET
router.get("/", authentication, authorization("ADMIN"), async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM monthly_finances");
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

//POST PARA CERRAR FINANZAS DE UN MES (PARA PROBARLO INTRODUCIR MES Y OHTER_EXPENSES)
router.post("/", authentication, authorization("ADMIN"), async (req, res) => {
  try {
    const { month, other_expenses } = req.body;

    const [exists] = await db.execute(
      `
    SELECT id FROM monthly_finances
    WHERE month = ?
    `,
      [month],
    );

    if (exists.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Ese mes ya fue cerrado",
      });
    }

    if (!month) {
      return res.status(400).json({
        success: false,
        error: "Debe enviar el mes en formato YYYY-MM",
      });
    }

    const year = month.split("-")[0];
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;

    // Total pagos
    const [payments] = await db.execute(
      `
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM payments
      WHERE payment_date BETWEEN ? AND ?
      `,
      [startDate, endDate],
    );

    // Total inscripciones
    const [enrollments] = await db.execute(
      `
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM enrollments
      WHERE payment_date BETWEEN ? AND ?
      `,
      [startDate, endDate],
    );

    const totalIncome = payments[0].total + enrollments[0].total;

    // Total salarios
    const [salaries] = await db.execute(
      `
      SELECT COALESCE(SUM(net_salary), 0) AS total
      FROM teachers_liquidations
      WHERE month = ?
      `,
      [month],
    );

    const totalSalaries = salaries[0].total;

    const netProfit = totalIncome - totalSalaries - (other_expenses || 0);

    // Guardar cierre mensual
    const [result] = await db.execute(
      `
      INSERT INTO monthly_finances
      (year, month, total_income, total_salaries, other_expenses, net_profit)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [year, month, totalIncome, totalSalaries, other_expenses || 0, netProfit],
    );

    res.status(201).json({
      success: true,
      message: "Cierre mensual generado correctamente",
      data: {
        id: result.insertId,
        year,
        month,
        total_income: totalIncome,
        total_salaries: totalSalaries,
        other_expenses: other_expenses || 0,
        net_profit: netProfit,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

//SOLO DEBERIA PODER ACTUALIZAR MES Y OTHER_EXPENSES PQ EL RESTO ES CALCULADO POR EL SISTEMA
router.put("/:id", authentication, authorization("ADMIN"), async (req, res) => {
  try {
    const { month, other_expenses } = req.body;
    const id = Number(req.params.id);

    const [rows] = db.execute("SELECT * FROM monthly_finances WHERE id=?", [
      id,
    ]);

    const newMonth = month ?? rows[0].month;
    const newOtherExpenses = other_expenses ?? rows[0].other_expenses;

    await db.execute(
      `
      UPDATE monthly_finances
      SET month = ?, other_expenses = ?
      WHERE id = ?
      `,
      [id],
    );

    res.status(200).json({
      success: true,
      message: "Cierre mensual actualizado correctamente",
      data: {
        id: Number(id),
        month: newMonth,
        other_expenses: newOtherExpenses,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      await db.execute("DELETE FROM monthly_finances WHERE id=?", [id]);
      res.status(200).json({
        success: true,
        message: "Cierre mensual eliminado correctamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
);

export default router;
