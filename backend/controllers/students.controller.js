import { createCrudController } from "../utils/crudFactory.js";

export const baseController = createCrudController("students");
import { calculateAccountStatus } from "../utils/accountStatus.js";
import { db } from "../db.js";

export const studentsController = {
  ...baseController,

  getAllWithStatus: async (req, res) => {
    try {
      const { teacher_id } = req.query;

      // Mes actual
      const today = new Date();
      const yearMonth = today.toISOString().slice(0, 7);

      let query = `
      SELECT 
        s.id AS student_id,
        s.first_name,
        s.last_name,
        s.dni,

        -- plan activo
        sp.id AS student_plan_id,
        sp.teacher_id,

        -- precio actual
        pp.price,

        -- pagos del mes
        IFNULL(SUM(p.amount), 0) AS total_paid,

        -- tutor
        t.id AS tutor_id,
        t.first_name AS tutor_first_name,
        t.last_name AS tutor_last_name,
        t.dni AS tutor_dni,
        t.phone AS tutor_phone

      FROM students s

      -- tutor (tabla intermedia)
      LEFT JOIN student_tutors st ON st.student_id = s.id
      LEFT JOIN tutors t ON t.id = st.tutor_id

      -- plan activo
      LEFT JOIN student_plans sp 
        ON sp.student_id = s.id
        AND sp.start_date <= CURDATE()
        AND (sp.end_date IS NULL OR sp.end_date >= CURDATE())

      -- precio vigente HOY
      LEFT JOIN plan_prices pp 
        ON pp.plan_id = sp.plan_id
        AND pp.start_date <= CURDATE()
        AND (pp.end_date IS NULL OR pp.end_date >= CURDATE())

      -- pagos del mes actual
      LEFT JOIN payments p 
        ON p.student_plan_id = sp.id
        AND DATE_FORMAT(p.payment_date, '%Y-%m') = ?

      WHERE 1=1
    `;

      const params = [yearMonth];

      if (teacher_id) {
        query += ` AND sp.teacher_id = ? `;
        params.push(teacher_id);
      }

      query += `
      GROUP BY 
        s.id,
        sp.id,
        pp.price,
        t.id
    `;

      const [rows] = await db.execute(query, params);
      console.log(rows);

      // Procesamiento
      const result = rows.map((row) => {
        const { interest, total_paid, price, expected_total, debt, status } =
          calculateAccountStatus({
            price: row.price,
            total_paid: row.total_paid,
            today,
            yearMonth,
          });

        return {
          student_id: row.student_id,
          first_name: row.first_name,
          last_name: row.last_name,
          dni: row.dni,

          teacher_id: row.teacher_id,

          tutor: row.tutor_id
            ? {
                id: row.tutor_id,
                first_name: row.tutor_first_name,
                last_name: row.tutor_last_name,
                dni: row.tutor_dni,
                phone: row.tutor_phone,
              }
            : null,

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
};

/*
getByIdWithStatusPayments
obtener los datos del alumno ppor el id,
estado de la cuenta al dia de la fecha,
campo calculado, basandose en la fecha actual,
fecha de vencimiento del plan del mes en curso, monto del plan,
% de interes

claculateDiscount

planid studentId discountPercentage

buscas el plan
buscas el alumno
calculas el interes


con el precio del plan + interes
le descontas el %

return result
*/
