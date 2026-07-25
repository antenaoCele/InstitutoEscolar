import { createCrudController } from "../utils/crudFactory.js";
import { db } from "../db.js";
import bcrypt from "bcrypt";

export const baseController = createCrudController("teachers");

// ======================================================
// GENERACIÓN DE USERNAME
// nombre + 2 primeras letras del apellido + 4 números random
// Reintenta si ya existe, en vez de confiar en que no va a chocar.
// ======================================================
const normalizeForUsername = (str) =>
  (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // saca tildes
    .replace(/[^a-zA-Z]/g, "") // solo letras
    .toLowerCase();

const generateUniqueUsername = async (connection, firstName, lastName) => {
  // username es varchar(20): nombre (máx 10) + apellido (2) + 4 dígitos = máx 16
  const base =
    normalizeForUsername(firstName).slice(0, 10) +
    normalizeForUsername(lastName).slice(0, 2);

  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = Math.floor(1000 + Math.random() * 9000); // 4 dígitos
    const candidate = `${base}${suffix}`.slice(0, 20);

    const [rows] = await connection.execute(
      "SELECT id FROM users WHERE username = ?",
      [candidate],
    );

    if (rows.length === 0) {
      return candidate;
    }
  }

  throw new Error("No se pudo generar un username único, reintentá de nuevo");
};

export const teachersController = {
  ...baseController,

  // ======================================================
  // CREATE
  // Si generate_user viene en true, crea el usuario de acceso
  // (username autogenerado, password = DNI, rol DOCENTE) y el
  // docente en una misma transacción.
  // ======================================================
  create: async (req, res) => {
    const { first_name, last_name, dni, phone, generate_user } = req.body;

    if (!first_name || !last_name || !dni) {
      return res.status(400).json({
        success: false,
        message: "Faltan datos obligatorios del docente",
      });
    }

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      let userId = null;
      let generatedUser = null;

      if (generate_user) {
        const username = await generateUniqueUsername(
          connection,
          first_name,
          last_name,
        );

        const plainPassword = String(dni);
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const [userResult] = await connection.execute(
          `INSERT INTO users (first_name, last_name, username, password, role)
           VALUES (?, ?, ?, ?, ?)`,
          [first_name, last_name, username, hashedPassword, "DOCENTE"],
        );

        userId = userResult.insertId;
        generatedUser = { username, password: plainPassword };
      }

      const [teacherResult] = await connection.execute(
        `INSERT INTO teachers (first_name, last_name, dni, phone, user_id)
         VALUES (?, ?, ?, ?, ?)`,
        [first_name, last_name, dni, phone || null, userId],
      );

      await connection.commit();

      const [teacherRows] = await db.execute(
        `SELECT id, first_name, last_name, dni, phone, user_id
         FROM teachers WHERE id = ?`,
        [teacherResult.insertId],
      );

      res.status(201).json({
        success: true,
        data: teacherRows[0],
        generatedUser, // null si generate_user era false
      });
    } catch (error) {
      await connection.rollback();
      console.error(error);

      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          success: false,
          message: "Ya existe un docente o usuario con esos datos",
        });
      }

      res.status(500).json({
        success: false,
        message: "Error al crear el docente",
      });
    } finally {
      connection.release();
    }
  },

  getAll: async (req, res) => {
    try {
      const { plan_id, active } = req.query;

      let query = `
SELECT DISTINCT
  t.id,
  t.first_name,
  t.last_name,
  t.dni,
  t.phone,
  t.user_id,
  t.active,
  u.username,
  u.role,
  (t.user_id IS NOT NULL) AS has_user
FROM teachers t
LEFT JOIN users u
  ON u.id = t.user_id
`;

      const params = [];
      const conditions = [];

      if (plan_id) {
        query += `
      INNER JOIN teacher_plans tp
        ON tp.teacher_id = t.id
    `;
        conditions.push("tp.plan_id = ?");
        params.push(plan_id);
      }

      // active=true / active=false / sin mandar el param => trae todos
      if (active === "true") {
        conditions.push("t.active = true");
      } else if (active === "false") {
        conditions.push("t.active = false");
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`;
      }

      query += `
    ORDER BY t.last_name, t.first_name
  `;

      const [rows] = await db.execute(query, params);

      res.json({
        success: true,
        total: rows.length,
        data: rows,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Error al obtener docentes",
      });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const [rows] = await db.execute(
        `
      SELECT
        t.id,
        t.first_name,
        t.last_name,
        t.dni,
        t.phone,
        t.user_id,
        u.username,
        u.role
      FROM teachers t
      LEFT JOIN users u
        ON u.id = t.user_id
      WHERE t.id = ?
      `,
        [id],
      );

      if (!rows.length) {
        return res.status(404).json({
          success: false,
          message: "Docente no encontrado",
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
        message: "Error al obtener docente",
      });
    }
  },

  getAvailableStudents: async (req, res) => {
    try {
      const teacherId = Number(req.params.id);
      const planId = Number(req.query.plan_id);

      const [rows] = await db.execute(
        `
        SELECT DISTINCT
            s.id,
            s.first_name,
            s.last_name
        FROM students s
        JOIN student_plans sp
            ON sp.student_id = s.id
        WHERE
            sp.teacher_id = ?
            AND sp.plan_id = ?
            AND (
                sp.end_date IS NULL
                OR sp.end_date > CURDATE()
            )
        ORDER BY
            s.last_name,
            s.first_name
        `,
        [teacherId, planId],
      );

      res.json({
        success: true,
        total: rows.length,
        data: rows,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Error al obtener estudiantes disponibles",
      });
    }
  },

  getAvailablePlans: async (req, res) => {
    try {
      const teacherId = Number(req.params.id);

      const [rows] = await db.execute(
        `
      SELECT DISTINCT
        p.id,
        p.name
      FROM plans p

      JOIN teacher_plans tp
        ON tp.plan_id = p.id

      WHERE tp.teacher_id = ?

      ORDER BY p.name
      `,
        [teacherId],
      );

      res.json({
        success: true,
        total: rows.length,
        data: rows,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener planes compatibles",
      });
    }
  },

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
        SELECT SUM(p.plan_price) AS total
        FROM payments p
        JOIN student_plans sp ON sp.id = p.student_plan_id
        WHERE sp.teacher_id = ?
        AND p.payment_date >= ?
        AND p.payment_date < DATE_ADD(?, INTERVAL 1 MONTH)
        `,
        [id, `${month}-01`, `${month}-01`],
      );

      const totalCollected = Number(rows[0].total) || 0;
      const netSalary = Number((totalCollected * 0.75).toFixed(2));

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

  // ======================================================
  // DELETE (soft-delete)
  // Desactiva al docente y cierra (end_date) todos los
  // student_plans que tenía abiertos, en una transacción.
  // ======================================================
  delete: async (req, res) => {
    const { id } = req.params;
    const { delete_user_too } = req.query; // o req.body, según cómo lo mandes desde el front

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const [teacherRows] = await connection.execute(
        "SELECT id, active, user_id FROM teachers WHERE id = ?",
        [id],
      );

      if (!teacherRows.length) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: "Docente no encontrado",
        });
      }

      if (!teacherRows[0].active) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: "El docente ya está desactivado",
        });
      }

      const userId = teacherRows[0].user_id;

      // Cerramos todos los student_plans abiertos de este docente
      await connection.execute(
        `UPDATE student_plans
       SET end_date = CURDATE()
       WHERE teacher_id = ? AND end_date IS NULL`,
        [id],
      );

      // Desactivamos al docente (no se borra físicamente)
      await connection.execute(
        "UPDATE teachers SET active = false WHERE id = ?",
        [id],
      );

      // Si tenía usuario y se pidió eliminarlo también
      if (delete_user_too === "true" && userId) {
        await connection.execute("DELETE FROM users WHERE id = ?", [userId]);

        // Como el docente sigue existiendo (soft-delete), hay que
        // limpiar la referencia para no dejar un user_id colgando
        // de un usuario que ya no existe
        await connection.execute(
          "UPDATE teachers SET user_id = NULL WHERE id = ?",
          [id],
        );
      }

      await connection.commit();

      res.json({
        success: true,
        message: "Docente desactivado correctamente",
      });
    } catch (error) {
      await connection.rollback();
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Error al desactivar el docente",
      });
    } finally {
      connection.release();
    }
  },

  // ======================================================
  // REACTIVATE
  // ======================================================
  reactivate: async (req, res) => {
    const { id } = req.params;

    try {
      const [teacherRows] = await db.execute(
        "SELECT id, active FROM teachers WHERE id = ?",
        [id],
      );

      if (!teacherRows.length) {
        return res.status(404).json({
          success: false,
          message: "Docente no encontrado",
        });
      }

      if (teacherRows[0].active) {
        return res.status(400).json({
          success: false,
          message: "El docente ya está activo",
        });
      }

      await db.execute("UPDATE teachers SET active = true WHERE id = ?", [id]);

      res.json({
        success: true,
        message: "Docente reactivado correctamente",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Error al reactivar el docente",
      });
    }
  },
};
