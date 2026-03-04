import { createCrudController } from "../utils/crudFactory.js";

export const baseController = createCrudController("teachers");

export const teachersController = {
  ...baseController,

  getLiquidations: async (req, res) => {
    const id = Number(req.params.id);

    try {
      const [liquidations] = await db.execute(
        "SELECT * FROM teacher_liquidations WHERE teacher_id = ? ORDER BY id DESC",
        [id],
      );

      res.json({ success: true, data: liquidations });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener liquidaciones",
      });
    }
  },

  createLiquidation: async (req, res) => {
    try {
      const { id } = req.params;
      const { month } = req.body; // ejemplo: "2026-02"

      const [exists] = await db.execute(
        `
        SELECT id FROM teacher_liquidations
        WHERE teacher_id = ? AND month = ?
        `,
        [id, month],
      );

      if (exists.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Ese mes ya fue liquidado para este docente",
        });
      }

      // Calcular total recaudado del docente en ese mes
      const [rows] = await db.execute(
        `
        SELECT SUM(p.amount) AS total
        FROM payments p
        JOIN student_plans sp ON sp.id = p.student_plan_id
        WHERE sp.teacher_id = ?
        AND p.payment_date >= ?
        AND p.payment_date < DATE_ADD(?, INTERVAL 1 MONTH)
        `,
        [id, `${month}-01`, `${month}-01`],
      );
      console.log("ROWS RESULT:", rows);
      const totalCollected = Number(rows[0].total) || 0;
      const netSalary = Number(totalCollected) * (0.75).toFixed(2);

      console.log("TOTAL COLLECTED:", totalCollected);
      console.log("NET SALARY:", netSalary);

      // Insertar liquidación
      await db.execute(
        `
        INSERT INTO teacher_liquidations 
        (teacher_id, month, total_collected, net_salary)
        VALUES (?, ?, ?, ?)
        `,
        [id, month, totalCollected, netSalary],
      );

      res.status(201).json({
        success: true,
        data: {
          teacher_id: id,
          month,
          total_collected: totalCollected,
          net_salary: netSalary,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al liquidar sueldo",
      });
    }
  },
};
