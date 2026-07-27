import { db } from "../db.js";
import { createCrudController } from "../utils/crudFactory.js";
import { isTeacherCompatibleWithPlan } from "../utils/student_plans.utils.js";
import {
  getStudentPlanStatus,
  closeOverduePlansPastGracePeriod,
} from "../services/payments.service.js";

const baseController = createCrudController("student_plans");

export const studentPlansController = {
  ...baseController,

  // =====================================================
  // DISPARO MANUAL de la baja automática por deuda no
  // regularizada a tiempo. Es la misma función que corre el cron
  // todos los días — este endpoint sirve para probarla ahora mismo
  // sin esperar al horario programado, y como botón manual si algún
  // día lo necesitás (ej. el cron falló esa noche).
  // Devuelve el detalle de qué planes tocó, para poder verificar.
  // =====================================================
  closeOverduePlans: async (req, res) => {
    try {
      const closed = await closeOverduePlansPastGracePeriod();

      res.json({
        success: true,
        total: closed.length,
        data: closed,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error al cerrar los planes vencidos",
      });
    }
  },

  getAll: async (req, res) => {
    try {
      const [rows] = await db.execute(`
      SELECT
        sp.id,
        s.id AS student_id,
        p.id AS plan_id,
        t.id AS teacher_id,
        sp.start_date,
        sp.end_date,
        sp.first_payment_option
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
      console.error(error);
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
          sp.end_date,
          sp.first_payment_option
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
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error al obtener el registro",
      });
    }
  },

  // =====================================================
  // ESTADO DE CUENTA (siempre "hoy", ya no admite consultar
  // un mes histórico — usa getStudentPlanStatus del service)
  // =====================================================
  getAccountStatus: async (req, res) => {
    try {
      const { teacher_id } = req.query;

      let sql = `
        SELECT id, student_id, teacher_id
        FROM student_plans
      `;

      const params = [];

      if (teacher_id) {
        sql += " WHERE teacher_id = ? ";
        params.push(teacher_id);
      }

      const [plans] = await db.execute(sql, params);

      const result = await Promise.all(
        plans.map(async (plan) => {
          const status = await getStudentPlanStatus(plan.id);

          return {
            student_plan_id: plan.id,
            student_id: plan.student_id,
            teacher_id: plan.teacher_id,
            ...status,
          };
        }),
      );

      res.json({
        success: true,
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

  // =====================================================
  // ESTADO DE UN student_plan PUNTUAL (para el formulario de pago)
  // =====================================================
  getStatus: async (req, res) => {
    try {
      const id = Number(req.params.id);

      const status = await getStudentPlanStatus(id);

      if (!status) {
        return res.status(404).json({
          success: false,
          message: "Registro no encontrado",
        });
      }

      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error al obtener el estado del plan",
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
          end_date,
          first_payment_option
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
          end_date,
          first_payment_option
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
    const id = Number(req.params.id);
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const [rows] = await connection.execute(
        `SELECT student_id, teacher_id, plan_id
         FROM student_plans
         WHERE id = ?`,
        [id],
      );

      if (!rows.length) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: "Registro no encontrado",
        });
      }

      const { student_id, teacher_id, plan_id } = rows[0];

      // Sacamos al alumno de los horarios correspondientes a
      // este plan/docente puntual. No borramos el schedule en
      // sí, porque puede tener otros alumnos anotados.
      await connection.execute(
        `DELETE ss FROM schedule_students ss
         JOIN schedules sch ON sch.id = ss.schedule_id
         WHERE ss.student_id = ?
         AND sch.teacher_id = ?
         AND sch.plan_id = ?`,
        [student_id, teacher_id, plan_id],
      );

      await connection.execute(
        `UPDATE student_plans
        SET end_date = CURDATE()
        WHERE id = ?`,
        [id],
      );

      await connection.commit();

      res.json({ success: true, message: "Baja realizada correctamente" });
    } catch (error) {
      await connection.rollback();
      console.error(error);

      res
        .status(500)
        .json({ success: false, message: "Error al procesar la baja" });
    } finally {
      connection.release();
    }
  },
};
