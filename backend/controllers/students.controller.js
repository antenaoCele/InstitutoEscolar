import { createCrudController } from "../utils/crudFactory.js";
import { calculateAccountStatus } from "../utils/accountStatus.js";
import { db } from "../db.js";

export const baseController = createCrudController("students");

export const studentsController = {
  ...baseController,

  getAllWithStatus: async (req, res) => {
    try {
      const {
        status: filterStatus = "",
        teacher_id,
        plan_id,
        payment_status,
      } = req.query;

      const today = new Date();
      const yearMonth = today.toISOString().slice(0, 7);

      let query = `
    SELECT
      s.id AS student_id,
      s.first_name,
      s.last_name,
      s.dni,
      s.school,
      s.birth_date,
      s.level,
      s.grade,

      sp.id AS student_plan_id,
      sp.teacher_id,
      sp.plan_id,
      sp.start_date,
      sp.end_date,

      tea.first_name AS teacher_first_name,
      tea.last_name AS teacher_last_name,
      pl.name AS plan_name,

      pp.price,

      IFNULL(SUM(pay.amount), 0) AS total_paid,

      t.id AS tutor_id,
      t.first_name AS tutor_first_name,
      t.last_name AS tutor_last_name,
      t.dni AS tutor_dni,
      t.phone AS tutor_phone

    FROM students s

    LEFT JOIN student_tutors st
      ON st.student_id = s.id

    LEFT JOIN tutors t
      ON t.id = st.tutor_id

    LEFT JOIN student_plans sp
      ON sp.student_id = s.id
      AND sp.start_date <= CURDATE()
      AND (
        sp.end_date IS NULL
        OR sp.end_date > CURDATE()
      )

    LEFT JOIN teachers tea
      ON tea.id = sp.teacher_id

    LEFT JOIN plans pl
      ON pl.id = sp.plan_id

    LEFT JOIN plan_prices pp
      ON pp.plan_id = sp.plan_id
      AND pp.start_date <= CURDATE()
      AND (
        pp.end_date IS NULL
        OR pp.end_date >= CURDATE()
      )

    LEFT JOIN payments pay
      ON pay.student_plan_id = sp.id
      AND DATE_FORMAT(pay.payment_date, '%Y-%m') = ?

    WHERE 1=1
    `;

      const params = [yearMonth];

      if (teacher_id) {
        query += ` AND sp.teacher_id = ? `;
        params.push(teacher_id);
      }

      if (plan_id) {
        query += ` AND sp.plan_id = ? `;
        params.push(plan_id);
      }

      if (filterStatus === "active") {
        query += ` AND sp.id IS NOT NULL `;
      }

      if (filterStatus === "inactive") {
        query += ` AND sp.id IS NULL `;
      }

      query += `
      GROUP BY
        s.id,
        sp.id,
        pp.price,
        t.id,
        tea.id,
        pl.id
    `;

      const [rows] = await db.execute(query, params);

      const result = rows.map((row) => {
        const accountData = calculateAccountStatus({
          price: row.price,
          total_paid: row.total_paid,
          today,
          yearMonth,
        });

        const studentData = {
          id: row.student_id,
          first_name: row.first_name,
          last_name: row.last_name,
          dni: row.dni,
          school: row.school,
          birth_date: row.birth_date,
          level: row.level,
          grade: row.grade,
          student_plan_id: row.student_plan_id,
        };

        if (row.student_plan_id) {
          Object.assign(studentData, {
            teacher_id: row.teacher_id,
            start_date: row.start_date,
            end_date: row.end_date,

            teacher_first_name: row.teacher_first_name,
            teacher_last_name: row.teacher_last_name,

            plan_id: row.plan_id,
            plan_name: row.plan_name,

            tutor: row.tutor_id
              ? {
                  id: row.tutor_id,
                  first_name: row.tutor_first_name,
                  last_name: row.tutor_last_name,
                  dni: row.tutor_dni,
                  phone: row.tutor_phone,
                }
              : null,

            price: accountData.price,
            total_paid: accountData.total_paid,
            interest: accountData.interest,
            expected_total: accountData.expected_total,
            debt: accountData.debt,
            status: accountData.status,
          });
        }

        return studentData;
      });

      // FILTRO POR ESTADO DE PAGO DEL MES ACTUAL
      let filteredResult = result;

      if (payment_status === "paid") {
        filteredResult = result.filter(
          (student) => student.student_plan_id && student.status === "PAGADO",
        );
      }

      if (payment_status === "pending") {
        filteredResult = result.filter(
          (student) => student.student_plan_id && student.status === "DEBE",
        );
      }

      res.json({
        success: true,
        total: filteredResult.length,
        data: filteredResult,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Error al obtener estudiantes",
      });
    }
  },

  getInfo: async (req, res) => {
    try {
      const studentId = Number(req.params.id);

      // Información principal del estudiante
      const [[student]] = await db.execute(
        `
      SELECT
        id,
        first_name,
        last_name,
        dni,
        school,
        birth_date,
        level,
        grade
      FROM students
      WHERE id = ?
      `,
        [studentId],
      );

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Estudiante no encontrado",
        });
      }

      // Tutores
      const [tutors] = await db.execute(
        `
      SELECT
          t.id,
          t.first_name,
          t.last_name,
          t.dni,
          t.phone
      FROM student_tutors st
      JOIN tutors t
          ON t.id = st.tutor_id
      WHERE st.student_id = ?
      ORDER BY t.last_name, t.first_name
      `,
        [studentId],
      );

      // Planes activos
      const [plans] = await db.execute(
        `
      SELECT
        sp.id,
        p.name AS plan_name,
        te.first_name,
        te.last_name,
        sp.start_date
      FROM student_plans sp

      JOIN plans p
        ON p.id = sp.plan_id

      JOIN teachers te
        ON te.id = sp.teacher_id

      WHERE
        sp.student_id = ?
        AND sp.end_date IS NULL

      ORDER BY p.name
      `,
        [studentId],
      );

      res.json({
        success: true,
        data: {
          student,
          tutors,
          plans,
        },
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Error al obtener la información del estudiante",
      });
    }
  },

  getPlans: async (req, res) => {
    try {
      const studentId = Number(req.params.id);
      const teacherId = Number(req.query.teacher_id);

      console.log("studentId:", studentId);
      console.log("teacherId:", teacherId);

      const [rows] = await db.execute(
        `
      SELECT
        p.id,
        p.name,
        sub.name AS subject_name
      FROM student_plans sp

      JOIN plans p
        ON p.id = sp.plan_id

      JOIN plan_subjects ps
        ON ps.plan_id = p.id

      JOIN subjects sub
        ON sub.id = ps.subject_id

      JOIN teacher_subjects ts
        ON ts.subject_id = sub.id

      WHERE sp.student_id = ?
      AND (
        sp.end_date IS NULL
        OR sp.end_date >= CURDATE()
      )
      AND ts.teacher_id = ?

      ORDER BY
        p.name,
        sub.name
      `,
        [studentId, teacherId],
      );

      console.log("studentId:", studentId);
      console.log("teacherId:", teacherId);

      console.log(rows);

      const plans = [];

      rows.forEach((row) => {
        let plan = plans.find((p) => p.id === row.id);

        if (!plan) {
          plan = {
            id: row.id,
            name: row.name,
            subjects: [],
          };

          plans.push(plan);
        }

        if (row.subject_name && !plan.subjects.includes(row.subject_name)) {
          plan.subjects.push(row.subject_name);
        }
      });

      res.json({
        success: true,
        data: plans,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Error al obtener planes",
      });
    }
  },

  getByStudentIdWithStatus: async (req, res) => {
    try {
      const { id } = req.params;

      const today = new Date();
      const yearMonth = today.toISOString().slice(0, 7);

      const [rows] = await db.execute(
        `
        SELECT 
          s.id AS student_id,
          s.first_name,
          s.last_name,
          s.dni,
          sp.teacher_id,
          sp.plan_id,
          pp.price,
          IFNULL(SUM(p.amount), 0) AS total_paid
        FROM students s
        LEFT JOIN student_plans sp ON sp.student_id = s.id
        LEFT JOIN plan_prices pp ON pp.plan_id = sp.plan_id
        LEFT JOIN payments p ON p.student_plan_id = sp.id
        WHERE s.id = ?
        GROUP BY s.id, sp.id, pp.price
        `,
        [id],
      );

      if (!rows.length) {
        return res.status(404).json({
          success: false,
          message: "Estudiante no encontrado",
        });
      }

      res.json({
        success: true,
        data: rows[0],
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener estudiante",
      });
    }
  },

  createWithPlan: async (req, res) => {
    try {
      const { formClasses, ...studentData } = req.body;

      // 1. Crear estudiante
      const [studentResult] = await db.execute(
        `INSERT INTO students (first_name, last_name, dni, school, birth_date, level, grade) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          studentData.first_name,
          studentData.last_name,
          studentData.dni,
          studentData.school,
          studentData.birth_date,
          studentData.level,
          studentData.grade,
        ],
      );

      const studentId = studentResult.insertId;

      // 2. Crear relación en student_plans
      if (formClasses && Array.isArray(formClasses)) {
        for (const p of formClasses) {
          if (p.teacher_id && p.plan_id) {
            await db.execute(
              `INSERT INTO student_plans
         (student_id, plan_id, teacher_id, start_date)
         VALUES (?, ?, ?, CURDATE())`,
              [studentId, p.plan_id, p.teacher_id],
            );
          }
        }
      }

      res.status(201).json({
        success: true,
        message: "Estudiante y plan creados exitosamente",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error al crear estudiante con plan",
      });
    }
  },

  getActiveStudents: async (req, res) => {
    try {
      const [rows] = await db.execute(`
      SELECT DISTINCT
        s.id,
        s.first_name,
        s.last_name,
        s.dni,
        s.school,
        s.birth_date,
        s.level,
        s.grade
      FROM students s
      INNER JOIN student_plans sp
        ON sp.student_id = s.id
      WHERE sp.start_date <= CURDATE()
      AND (
        sp.end_date IS NULL
        OR sp.end_date > CURDATE()
      )
      ORDER BY s.last_name, s.first_name
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
        message: "Error al obtener estudiantes activos",
      });
    }
  },

  closeYear: async (req, res) => {
    try {
      const year = req.body.year || new Date().getFullYear();

      const [result] = await db.execute(
        `UPDATE student_plans SET end_date = ? WHERE end_date IS NULL`,
        [`${year}-12-31`],
      );

      res.json({
        success: true,
        message: `Se dieron de baja ${result.affectedRows} planes activos.`,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Error al cerrar el año" });
    }
  },
};
