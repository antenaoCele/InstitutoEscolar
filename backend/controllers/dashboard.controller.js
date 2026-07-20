import { db } from "../db.js";

export const dashboardController = {
  getStats: async (req, res) => {
    const isAdmin = req.user.role === "ADMIN";

    try {
      const [
        [activeStudents],
        [teachers],
        [plans],
        [subjects],
        [todaySchedules],
        [studentsByLevel],
        [studentsByPlan],
        [studentsPerTeacher],
        [paidStudents],
        [moneyReceived],
        [expectedMoney],
        [debtStudents],
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
        // ALUMNOS QUE PAGARON ESTE MES
        // =====================================
        db.execute(`
          SELECT COUNT(DISTINCT sp.student_id) AS total
          FROM payments p
          INNER JOIN student_plans sp
            ON sp.id = p.student_plan_id
          WHERE
            MONTH(p.payment_date) = MONTH(CURDATE())
            AND YEAR(p.payment_date) = YEAR(CURDATE())
        `),

        // =====================================
        // DINERO COBRADO ESTE MES
        // =====================================
        db.execute(`
          SELECT
            COALESCE(SUM(amount),0) AS total
          FROM payments
          WHERE
            MONTH(payment_date) = MONTH(CURDATE())
            AND YEAR(payment_date) = YEAR(CURDATE())
        `),

        // =====================================
        // DINERO ESPERADO
        // =====================================
        db.execute(`
          SELECT
            COALESCE(SUM(pp.price),0) AS total
          FROM student_plans sp
          INNER JOIN plan_prices pp
            ON pp.plan_id = sp.plan_id
          WHERE
            sp.end_date IS NULL
            AND pp.end_date IS NULL
        `),

        // =====================================
        // ALUMNOS QUE TODAVÍA NO PAGARON
        // =====================================
        db.execute(`
          SELECT COUNT(DISTINCT sp.student_id) AS total
          FROM student_plans sp
          WHERE
            sp.end_date IS NULL
            AND sp.student_id NOT IN (
              SELECT DISTINCT sp2.student_id
              FROM payments p
              INNER JOIN student_plans sp2
                ON sp2.id = p.student_plan_id
              WHERE
                MONTH(p.payment_date) = MONTH(CURDATE())
                AND YEAR(p.payment_date) = YEAR(CURDATE())
            )
        `),
      ]);

      const active = Number(activeStudents[0].total);
      const paid = Number(paidStudents[0].total);
      const debtors = Number(debtStudents[0].total);

      const received = Number(moneyReceived[0].total);
      const expected = Number(expectedMoney[0].total);
      const pending = Math.max(expected - received, 0);

      const cards = {
        students: active,
        teachers: Number(teachers[0].total),
        plans: Number(plans[0].total),
        subjects: Number(subjects[0].total),
        todaySchedules: Number(todaySchedules[0].total),
      };

      if (isAdmin) {
        cards.studentsPaid = paid;
        cards.studentsDebt = debtors;
        cards.moneyReceived = received;
        cards.moneyPending = pending;
      }

      res.json({
        success: true,
        data: {
          cards,
          studentsByLevel,
          studentsByPlan,
          studentsPerTeacher,
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
