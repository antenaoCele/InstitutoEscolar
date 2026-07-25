import { db } from "../db.js";
import { getCurrentDateParts } from "../utils/dateUtils.js";

export const dashboardController = {
  getStats: async (req, res) => {
    const isAdmin = req.user.role === "ADMIN";

    try {
      const { today, yearMonth, day } = getCurrentDateParts();

      // Convertimos getDay() de JS (domingo=0...sábado=6) a la
      // convención que usa la columna `day` de schedules
      // (lunes=1...sábado=6, domingo=7), equivalente a lo que
      // devolvía WEEKDAY(CURDATE())+1 en MySQL.
      const jsDay = today.getDay();
      const weekday = jsDay === 0 ? 7 : jsDay;

      // ====================================================
      // DASHBOARD ADMIN
      // ====================================================
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
          // ESTUDIANTES ACTIVOS
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
          db.execute(
            `
          SELECT COUNT(*) AS total
          FROM schedules
          WHERE day = ?
        `,
            [weekday],
          ),

          // =====================================
          // ESTUDIANTES ACTIVOS POR NIVEL
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
          db.execute(
            `
          SELECT COUNT(*) AS total
          FROM (
              SELECT
                  sp.student_id,
                  sp.plan_id
              FROM payments p
              INNER JOIN student_plans sp
                  ON sp.id = p.student_plan_id
              WHERE
                  DATE_FORMAT(p.payment_date, '%Y-%m') = ?
              GROUP BY
                  sp.student_id,
                  sp.plan_id
          ) paid
        `,
            [yearMonth],
          ),

          // =====================================
          // DINERO COBRADO ESTE MES
          // (payments + enrollments del mes actual)
          // =====================================
          db.execute(
            `
          SELECT COALESCE(SUM(total), 0) AS total FROM (
              SELECT amount AS total
              FROM payments
              WHERE DATE_FORMAT(payment_date, '%Y-%m') = ?

              UNION ALL

              SELECT amount AS total
              FROM enrollments
              WHERE DATE_FORMAT(payment_date, '%Y-%m') = ?
          ) combined
        `,
            [yearMonth, yearMonth],
          ),

          // =====================================
          // DINERO PENDIENTE
          // =====================================
          db.execute(
            `
          SELECT
          COALESCE(
              SUM(
                  ROUND(
                      pp.price * IF(? > 15, 1.15, 1),
                      2
                  )
              ),
              0
          ) AS total
      FROM student_plans sp
      INNER JOIN plan_prices pp
          ON pp.plan_id = sp.plan_id
          AND pp.end_date IS NULL
      WHERE
          sp.end_date IS NULL
          AND NOT EXISTS (
              SELECT 1
              FROM payments p
              INNER JOIN student_plans sp2
                  ON sp2.id = p.student_plan_id
              WHERE
                  sp2.student_id = sp.student_id
                  AND sp2.plan_id = sp.plan_id
                  AND DATE_FORMAT(p.payment_date, '%Y-%m') = ?
          )
        `,
            [day, yearMonth],
          ),

          // =====================================
          // PLANES PENDIENTES
          // =====================================
          db.execute(
            `
         SELECT COUNT(*) AS total
        FROM student_plans sp
        WHERE
            sp.end_date IS NULL
            AND NOT EXISTS (
                SELECT 1
                FROM payments p
                INNER JOIN student_plans sp2
                    ON sp2.id = p.student_plan_id
                WHERE
                    sp2.student_id = sp.student_id
                    AND sp2.plan_id = sp.plan_id
                    AND DATE_FORMAT(p.payment_date, '%Y-%m') = ?
            )
        `,
            [yearMonth],
          ),
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

      const [teacherRows] = await db.execute(
        `
  SELECT id
  FROM teachers
  WHERE user_id = ?
  `,
        [req.user.userId],
      );

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
        // MIS ESTUDIANTES ACTIVOS
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
            AND day = ?
          `,
          [teacherId, weekday],
        ),

        // =====================================
        // MIS ESTUDIANTES POR NIVEL
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
        // MIS ESTUDIANTES POR PLAN
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
