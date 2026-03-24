import { db } from "../db.js";
import { createCrudController } from "../utils/crudFactory.js";
import { calculateAccountStatus } from "../utils/accountStatus.js";

const baseController = createCrudController("student_plans");

export const studentPlansController = {
  ...baseController,

  getAll: async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT 
        sp.id, 
        s.id AS student_id,
        p.id AS plan_id,
        t.id AS teacher_id,
        sp.start_date,
        sp.end_date
        FROM student_plans sp 
        JOIN students s ON sp.student_id = s.id 
        JOIN plans p ON sp.plan_id = p.id 
        JOIN teachers t ON sp.teacher_id = t.id
      `);

      res.json({
        success: true,
        total: rows.length,
        data: rows,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener los registros",
      });
    }
  },

  getById: async (req, res) => {
    try {
      const id = Number(req.params.id);

      const [rows] = await db.execute(
        `
        SELECT 
        sp.id, 
        s.id AS student_id,
        p.id AS plan_id,
        t.id AS teacher_id,
        sp.start_date,
        sp.end_date
        FROM student_plans sp 
        JOIN students s ON sp.student_id = s.id 
        JOIN plans p ON sp.plan_id = p.id 
        JOIN teachers t ON sp.teacher_id = t.id
        WHERE sp.id = ?
        `,
        [id],
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Registro no encontrado",
        });
      }

      res.json({
        success: true,
        data: rows[0],
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener el registro",
      });
    }
  },

  getAccountStatus: async (req, res) => {
    try {
      const { month, teacher_id } = req.query;

      if (!month) {
        return res.status(400).json({
          success: false,
          error: "Debe enviar el mes en formato YYYY-MM",
        });
      }

      // Fechas
      const firstDay = `${month}-01`;

      const nextMonth = new Date(firstDay);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nextMonthStr = nextMonth.toISOString().slice(0, 10);

      let query = `
      SELECT 
        sp.id AS student_plan_id,
        sp.student_id,
        sp.teacher_id,

        -- precio vigente al FINAL del mes
        pp.price,

        -- pagos del mes
        IFNULL(SUM(p.amount), 0) AS total_paid

      FROM student_plans sp

      LEFT JOIN plan_prices pp 
        ON sp.plan_id = pp.plan_id
        AND pp.start_date <= LAST_DAY(?)
        AND (pp.end_date IS NULL OR pp.end_date >= LAST_DAY(?))

      LEFT JOIN payments p 
        ON p.student_plan_id = sp.id
        AND p.payment_date >= ?
        AND p.payment_date < ?

      WHERE 
        sp.start_date <= LAST_DAY(?)
        AND (sp.end_date IS NULL OR sp.end_date >= ?)
    `;

      const params = [
        firstDay,
        firstDay,
        firstDay,
        nextMonthStr,
        firstDay,
        firstDay,
      ];

      if (teacher_id) {
        query += " AND sp.teacher_id = ? ";
        params.push(teacher_id);
      }

      query += `
      GROUP BY sp.id, sp.student_id, sp.teacher_id, pp.price
    `;

      const [rows] = await db.execute(query, params);

      const today = new Date();

      const result = rows.map((row) => {
        const { interest, total_paid, price, expected_total, debt, status } =
          calculateAccountStatus({
            price: row.price,
            total_paid: row.total_paid,
            today,
            yearMonth: month,
          });

        return {
          student_plan_id: row.student_plan_id,
          student_id: row.student_id,
          teacher_id: row.teacher_id,

          price,
          total_paid,
          interest,
          expected_total,
          debt,
          status,
        };
      });

      res.json({
        success: true,
        month,
        data: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: "Error al calcular el estado de cuenta",
      });
    }
  },
};
