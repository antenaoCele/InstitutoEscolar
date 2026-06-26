import { createCrudController } from "../utils/crudFactory.js";
import { calculateAccountStatus } from "../utils/accountStatus.js";
import { db } from "../db.js";

export const baseController = createCrudController("students");

export const studentsController = {
  ...baseController,

  getAllWithStatus: async (req, res) => {
    try {
      const { status: filterStatus = "", teacher_id, plan_id } = req.query;

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

      res.json({
        success: true,
        total: result.length,
        data: result,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Error al obtener alumnos",
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
          message: "Alumno no encontrado",
        });
      }

      res.json({
        success: true,
        data: rows[0],
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener alumno",
      });
    }
  },

  createWithPlan: async (req, res) => {
    try {
      const { formClasses, ...studentData } = req.body;

      // 1. Crear alumno
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
        message: "Alumno y plan creados exitosamente",
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Error al crear alumno con plan" });
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
        message: "Error al obtener alumnos activos",
      });
    }
  },
};
