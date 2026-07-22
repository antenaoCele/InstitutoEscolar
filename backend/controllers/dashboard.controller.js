import { db } from "../db.js";

export const dashboardController = {
  getStats: async (req, res) => {
    const isAdmin = req.user.role === "ADMIN";

    try {
      // ====================================================
      // DASHBOARD ADMIN
      // ====================================================
      // Se mantiene exactamente igual al actual.
      if (isAdmin) {
        const [
          [activeStudents],
          [teachers],
          [plans],
          [subjects],
          [todaySchedules],
          [studentsByLevel],
          [studentsByPlan],
          [studentsPerTeacher],
          [paidPlans],
          [moneyReceived],
          [moneyPending],
          [pendingPlans],
        ] = await Promise.all([
          // =====================================
          // ALUMNOS ACTIVOS
          // =====================================
          db.execute(`
          SELECT COUNT(DISTINCT student_id) AS total
          FROM student_plans
          WHERE end_date IS NULL
        `),

          // =====================================
          // DOCENTES
          // =====================================
          db.execute(`
          SELECT COUNT(*) AS total
          FROM teachers
        `),

          // =====================================
          // PLANES
          // =====================================
          db.execute(`
          SELECT COUNT(*) AS total
          FROM plans
        `),

          // =====================================
          // MATERIAS
          // =====================================
          db.execute(`
          SELECT COUNT(*) AS total
          FROM subjects
        `),

          // =====================================
          // CLASES DEL DÍA
          // =====================================
          db.execute(`
          SELECT COUNT(*) AS total
          FROM schedules
          WHERE day = WEEKDAY(CURDATE()) + 1
        `),

          // =====================================
          // ALUMNOS ACTIVOS POR NIVEL
          // =====================================
          db.execute(`
          SELECT
            s.level,
            COUNT(DISTINCT sp.student_id) AS total
          FROM student_plans sp
          INNER JOIN students s
            ON s.id = sp.student_id
          WHERE sp.end_date IS NULL
          GROUP BY s.level
          ORDER BY s.level
        `),

          // =====================================
          // INSCRIPCIONES POR PLAN
          // =====================================
          db.execute(`
          SELECT
            p.name,
            COUNT(*) AS total
          FROM student_plans sp
          INNER JOIN plans p
            ON p.id = sp.plan_id
          WHERE sp.end_date IS NULL
          GROUP BY p.id, p.name
          ORDER BY total DESC
        `),

          // =====================================
          // INSCRIPCIONES POR DOCENTE
          // =====================================
          db.execute(`
          SELECT
            CONCAT(t.last_name, ', ', t.first_name) AS teacher,
            COUNT(sp.id) AS total
          FROM teachers t
          LEFT JOIN student_plans sp
            ON sp.teacher_id = t.id
            AND sp.end_date IS NULL
          GROUP BY t.id
          ORDER BY total DESC
        `),

          // =====================================
          // PLANES PAGADOS ESTE MES
          // =====================================
          db.execute(`
          SELECT COUNT(DISTINCT student_plan_id) AS total
          FROM payments
          WHERE
            MONTH(payment_date)=MONTH(CURDATE())
            AND YEAR(payment_date)=YEAR(CURDATE())
        `),

          // =====================================
          // DINERO COBRADO ESTE MES
          // =====================================
          db.execute(`
          SELECT
            COALESCE(SUM(amount),0) AS total
          FROM payments
          WHERE
            MONTH(payment_date)=MONTH(CURDATE())
            AND YEAR(payment_date)=YEAR(CURDATE())
        `),

          // =====================================
          // DINERO PENDIENTE
          // =====================================
          db.execute(`
          SELECT
            COALESCE(SUM(pp.price),0) AS total
          FROM student_plans sp
          INNER JOIN plan_prices pp
            ON pp.plan_id = sp.plan_id
            AND pp.end_date IS NULL
          WHERE
            sp.end_date IS NULL
            AND sp.id NOT IN (
              SELECT DISTINCT student_plan_id
              FROM payments
              WHERE
                MONTH(payment_date)=MONTH(CURDATE())
                AND YEAR(payment_date)=YEAR(CURDATE())
            )
        `),

          // =====================================
          // PLANES PENDIENTES
          // =====================================
          db.execute(`
          SELECT COUNT(*) AS total
          FROM student_plans sp
          WHERE
            sp.end_date IS NULL
            AND sp.id NOT IN (
              SELECT DISTINCT student_plan_id
              FROM payments
              WHERE
                MONTH(payment_date)=MONTH(CURDATE())
                AND YEAR(payment_date)=YEAR(CURDATE())
            )
        `),
        ]);

        return res.json({
          success: true,
          hasTeacher: true,
          data: {
            cards: {
              students: Number(activeStudents[0].total),
              teachers: Number(teachers[0].total),
              plans: Number(plans[0].total),
              subjects: Number(subjects[0].total),
              todaySchedules: Number(todaySchedules[0].total),
              paidPlans: Number(paidPlans[0].total),
              pendingPlans: Number(pendingPlans[0].total),
              moneyReceived: Number(moneyReceived[0].total),
              moneyPending: Number(moneyPending[0].total),
            },
            studentsByLevel,
            studentsByPlan,
            studentsPerTeacher,
          },
        });
      }

      // ====================================================
      // DASHBOARD DOCENTE
      // ====================================================

      // Buscar el docente asociado al usuario autenticado.
      // DESPUÉS
      const [teacherRows] = await db.execute(
        `
  SELECT id
  FROM teachers
  WHERE user_id = ?
  `,
        [req.user.userId],
      );
      // Si el usuario no tiene un docente asociado,
      // el frontend mostrará un mensaje.
      if (!teacherRows.length) {
        return res.json({
          success: true,
          hasTeacher: false,
          message:
            "Todavía no tenés un docente asignado. Contactá a un administrador.",
        });
      }

      const teacherId = teacherRows[0].id;

      const [
        [activeStudents],
        [todaySchedules],
        [studentsByLevel],
        [studentsByPlan],
      ] = await Promise.all([
        // =====================================
        // MIS ALUMNOS ACTIVOS
        // =====================================
        db.execute(
          `
          SELECT COUNT(DISTINCT student_id) AS total
          FROM student_plans
          WHERE
            teacher_id = ?
            AND end_date IS NULL
          `,
          [teacherId],
        ),

        // =====================================
        // MIS CLASES DE HOY
        // =====================================
        db.execute(
          `
          SELECT COUNT(*) AS total
          FROM schedules
          WHERE
            teacher_id = ?
            AND day = WEEKDAY(CURDATE()) + 1
          `,
          [teacherId],
        ),

        // =====================================
        // MIS ALUMNOS POR NIVEL
        // =====================================
        db.execute(
          `
          SELECT
            s.level,
            COUNT(DISTINCT sp.student_id) AS total
          FROM student_plans sp
          INNER JOIN students s
            ON s.id = sp.student_id
          WHERE
            sp.teacher_id = ?
            AND sp.end_date IS NULL
          GROUP BY s.level
          ORDER BY s.level
          `,
          [teacherId],
        ),

        // =====================================
        // MIS ALUMNOS POR PLAN
        // =====================================
        db.execute(
          `
          SELECT
            p.name,
            COUNT(*) AS total
          FROM student_plans sp
          INNER JOIN plans p
            ON p.id = sp.plan_id
          WHERE
            sp.teacher_id = ?
            AND sp.end_date IS NULL
          GROUP BY p.id, p.name
          ORDER BY total DESC
          `,
          [teacherId],
        ),
      ]);

      return res.json({
        success: true,
        hasTeacher: true,
        data: {
          cards: {
            students: Number(activeStudents[0].total),
            todaySchedules: Number(todaySchedules[0].total),
          },
          studentsByLevel,
          studentsByPlan,
        },
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Error al obtener estadísticas del dashboard",
      });
    }
  },
};
