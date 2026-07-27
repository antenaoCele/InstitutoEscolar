import { createCrudController } from "../utils/crudFactory.js";
import { getCurrentDateParts } from "../utils/dateUtils.js";
import {
  getStudentPlanStatus,
  getExpectedBaseAmount,
} from "../services/payments.service.js";
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

      // Se sacó el filtro por fecha del JOIN de student_plans: ahora
      // se traen TODOS (activos e inactivos). Un plan dado de baja
      // puede seguir teniendo deuda pendiente, y no queremos que
      // desaparezca del listado apenas se da la baja.
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

      LEFT JOIN teachers tea
          ON tea.id = sp.teacher_id

      LEFT JOIN plans pl
          ON pl.id = sp.plan_id

      WHERE 1=1
      `;

      const params = [];

      if (teacher_id) {
        query += ` AND sp.teacher_id = ? `;
        params.push(teacher_id);
      }

      if (plan_id) {
        query += ` AND sp.plan_id = ? `;
        params.push(plan_id);
      }

      query += `
      GROUP BY
          s.id,
          sp.id,
          tea.id,
          pl.id,
          t.id
      `;

      const [rows] = await db.execute(query, params);

      const rawResult = await Promise.all(
        rows.map(async (row) => {
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
            const planStatus = await getStudentPlanStatus(row.student_plan_id);

            // Un plan INACTIVE sin ninguna deuda pendiente es una
            // inscripción vieja ya resuelta: no aporta nada mostrarla,
            // así que se descarta. Un plan INACTIVE CON deuda se
            // mantiene visible a propósito (para no "olvidar" la
            // deuda al dar de baja).
            if (
              planStatus.academic_status === "INACTIVE" &&
              planStatus.account_status !== "OVERDUE"
            ) {
              return null;
            }

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

              academic_status: planStatus.academic_status,
              account_status: planStatus.account_status,
              overdue_period: planStatus.overdue_period,
              current_period: planStatus.current_period,
            });
          }

          return studentData;
        }),
      );

      const result = rawResult.filter(Boolean);

      // FILTRO POR ESTADO ACADÉMICO (activo/inactivo)
      // Se hace en JS porque ahora un mismo alumno puede tener más de
      // una fila (una activa + una inactiva con deuda), y la condición
      // es sobre el alumno en conjunto, no sobre una fila puntual.
      let filteredResult = result;

      if (filterStatus === "active" || filterStatus === "inactive") {
        const activeStudentIds = new Set(
          result.filter((r) => r.academic_status === "ACTIVE").map((r) => r.id),
        );

        filteredResult = result.filter((r) =>
          filterStatus === "active"
            ? activeStudentIds.has(r.id)
            : !activeStudentIds.has(r.id),
        );
      }

      // FILTRO POR ESTADO DE PAGO DEL MES ACTUAL
      if (payment_status === "paid") {
        filteredResult = filteredResult.filter(
          (student) => student.current_period?.status === "paid",
        );
      }

      if (payment_status === "pending") {
        filteredResult = filteredResult.filter(
          (student) =>
            student.current_period?.status === "pending" ||
            student.account_status === "OVERDUE",
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

      // Planes: activos, más los inactivos que TODAVÍA tengan deuda
      // pendiente (para poder ver cuánto debe pagar para reincorporarse
      // aunque ya no esté cursando ese plan).
      const [allPlans] = await db.execute(
        `
      SELECT
        sp.id,
        sp.plan_id,
        sp.first_payment_option,
        p.name AS plan_name,
        te.first_name,
        te.last_name,
        sp.start_date,
        sp.end_date
      FROM student_plans sp

      JOIN plans p
        ON p.id = sp.plan_id

      JOIN teachers te
        ON te.id = sp.teacher_id

      WHERE
        sp.student_id = ?

      ORDER BY p.name
      `,
        [studentId],
      );

      // Cuánto debe cada plan: su período vencido, calculado con el
      // precio histórico de ESE período (nunca el actual) + 15%. Si
      // ese período era la primera cuota y el alumno eligió media
      // cuota, el 15% se aplica sobre la mitad, no sobre el total
      // (getExpectedBaseAmount centraliza esa regla). Si no debe
      // nada, 0.
      const plansWithDebtRaw = await Promise.all(
        allPlans.map(async (plan) => {
          const status = await getStudentPlanStatus(plan.id);

          // Plan inactivo sin deuda pendiente: no aporta nada
          // mostrarlo acá, es historial viejo ya resuelto.
          if (
            status.academic_status === "INACTIVE" &&
            status.account_status !== "OVERDUE"
          ) {
            return null;
          }

          let debt = 0;

          if (status.overdue_period) {
            const baseAmount = await getExpectedBaseAmount(
              {
                id: plan.id,
                student_id: studentId,
                plan_id: plan.plan_id,
                start_date: plan.start_date,
                first_payment_option: plan.first_payment_option,
              },
              status.overdue_period,
            );

            if (baseAmount != null) {
              debt = Math.round(baseAmount * 1.15 * 100) / 100;
            }
          }

          return {
            id: plan.id,
            plan_name: plan.plan_name,
            first_name: plan.first_name,
            last_name: plan.last_name,
            start_date: plan.start_date,
            academic_status: status.academic_status,
            debt,
            overdue_period: status.overdue_period,
          };
        }),
      );

      const plansWithDebt = plansWithDebtRaw.filter(Boolean);

      res.json({
        success: true,
        data: {
          student,
          tutors,
          plans: plansWithDebt,
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
      const { date } = getCurrentDateParts();

      const [rows] = await db.execute(
        `
  SELECT
      p.id,
      p.name,
      s.name AS subject_name

  FROM student_plans sp

  JOIN teacher_plans tp
      ON tp.plan_id = sp.plan_id

  JOIN plans p
      ON p.id = sp.plan_id

  JOIN plan_subjects ps
      ON ps.plan_id = p.id

  JOIN subjects s
      ON s.id = ps.subject_id

  WHERE
      sp.student_id = ?
      AND tp.teacher_id = ?
      AND (
          sp.end_date IS NULL
          OR sp.end_date >= ?
      )

  ORDER BY
      p.name,
      s.name
  `,
        [studentId, teacherId, date],
      );

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

        if (!plan.subjects.includes(row.subject_name)) {
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

  createWithPlan: async (req, res) => {
    try {
      const { formClasses, ...studentData } = req.body;
      const { date } = getCurrentDateParts();

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
      // (agregado: first_payment_option, faltaba acá y por eso se
      // perdía la opción elegida en el alta desde el frontend)
      if (formClasses && Array.isArray(formClasses)) {
        for (const p of formClasses) {
          if (p.teacher_id && p.plan_id) {
            await db.execute(
              `INSERT INTO student_plans
         (student_id, plan_id, teacher_id, start_date, first_payment_option)
         VALUES (?, ?, ?, ?, ?)`,
              [
                studentId,
                p.plan_id,
                p.teacher_id,
                date,
                p.first_payment_option,
              ],
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
      const { date } = getCurrentDateParts();

      const [rows] = await db.execute(
        `
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
      WHERE sp.start_date <= ?
      AND (
        sp.end_date IS NULL
        OR sp.end_date > ?
      )
      ORDER BY s.last_name, s.first_name
    `,
        [date, date],
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
        message: "Error al obtener estudiantes activos",
      });
    }
  },

  // NOTA: closeYear no vino en el excerpt que me pasaste para esta
  // revisión. Si la seguís usando, restauro la versión anterior acá
  // (con CURDATE()/año actual) — avisame y la agrego con el mismo
  // criterio de usar getCurrentDateParts().
};
