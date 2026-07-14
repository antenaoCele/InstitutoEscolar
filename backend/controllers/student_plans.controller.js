import { db } from "../db.js";
import { createCrudController } from "../utils/crudFactory.js";
import { calculateAccountStatus } from "../utils/accountStatus.js";
import { isTeacherCompatibleWithPlan } from "../utils/student_plans.utils.js";

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

      const firstDay = `${month}-01`;

      const nextMonth = new Date(firstDay);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nextMonthStr = nextMonth.toISOString().slice(0, 10);

      let query = `
      SELECT
        sp.id AS student_plan_id,
        sp.student_id,
        sp.teacher_id,

        pp.price,

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

  create: async (req, res) => {
    try {
      const { teacher_id, plan_id } = req.body;

      if (!(await isTeacherCompatibleWithPlan(teacher_id, plan_id))) {
        return res.status(400).json({
          success: false,
          message: "El docente seleccionado no puede dictar ese plan.",
        });
      }

      const fields = Object.keys(req.body);

      if (!fields.length) {
        return res.status(400).json({
          success: false,
          message: "No se enviaron datos",
        });
      }

      const values = Object.values(req.body);

      const placeholders = fields.map(() => "?").join(", ");

      const [result] = await db.execute(
        `
        INSERT INTO student_plans
        (${fields.join(",")})

        VALUES
        (${placeholders})
        `,
        values,
      );

      const [rows] = await db.execute(
        `
        SELECT
          id,
          student_id,
          teacher_id,
          plan_id,
          start_date,
          end_date
        FROM student_plans
        WHERE id = ?
        `,
        [result.insertId],
      );

      res.status(201).json({
        success: true,
        data: rows[0],
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          error.sqlMessage || error.message || "Error al crear el registro",
      });
    }
  },

  update: async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!id || Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "ID inválido",
        });
      }

      const [currentRows] = await db.execute(
        `
        SELECT
          teacher_id,
          plan_id
          FROM student_plans
        WHERE id = ?
        `,
        [id],
      );

      if (!currentRows.length) {
        return res.status(404).json({
          success: false,
          message: "Registro no encontrado",
        });
      }

      const current = currentRows[0];

      const teacher_id = req.body.teacher_id ?? current.teacher_id;
      const plan_id = req.body.plan_id ?? current.plan_id;

      if (!(await isTeacherCompatibleWithPlan(teacher_id, plan_id))) {
        return res.status(400).json({
          success: false,
          message: "El docente seleccionado no puede dictar ese plan.",
        });
      }

      const fields = req.body;

      if (!Object.keys(fields).length) {
        return res.status(400).json({
          success: false,
          message: "No hay campos para actualizar",
        });
      }

      const columns = Object.keys(fields)
        .map((key) => `${key} = ?`)
        .join(", ");

      const values = Object.values(fields);

      const [result] = await db.execute(
        `
        UPDATE student_plans
        SET ${columns}
        WHERE id = ?
        `,
        [...values, id],
      );

      if (!result.affectedRows) {
        return res.status(404).json({
          success: false,
          message: "Registro no encontrado",
        });
      }

      const [rows] = await db.execute(
        `
        SELECT
          id,
          student_id,
          teacher_id,
          plan_id,
          start_date,
          end_date
        FROM student_plans
        WHERE id = ?
        `,
        [id],
      );

      res.json({
        success: true,
        data: rows[0],
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message:
          error.sqlMessage ||
          error.message ||
          "Error al actualizar el registro",
      });
    }
  },

  softDelete: async (req, res) => {
    try {
      const id = Number(req.params.id);

      await db.execute(
        `UPDATE student_plans
        SET end_date = CURDATE()
        WHERE id = ?`,
        [id],
      );

      res.json({ success: true, message: "Baja realizada correctamente" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error al procesar la baja" });
    }
  },

  reactivate: async (req, res) => {
    try {
      const { student_id } = req.body;
      await db.execute(
        `UPDATE student_plans
        SET end_date = NULL
        WHERE student_id = ?
        ORDER BY id DESC LIMIT 1`,
        [student_id],
      );
      res.json({ success: true, message: "Alumno reactivado correctamente" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error al reactivar al alumno" });
    }
  },
};
