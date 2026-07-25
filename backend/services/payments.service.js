import { db } from "../db.js";

export async function getPlanPriceAtDate(student_plan_id, date) {
  const [rows] = await db.execute(
    `
    SELECT pp.price
    FROM student_plans sp
    JOIN plan_prices pp ON sp.plan_id = pp.plan_id
    WHERE sp.id = ?
      AND pp.start_date <= ?
      AND (pp.end_date IS NULL OR pp.end_date >= ?)
    ORDER BY pp.start_date DESC
    LIMIT 1
    `,
    [student_plan_id, date, date],
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0].price;
}

export async function existingPayment(student_plan_id, date, excludeId = null) {
  const paymentDateObj = new Date(date);
  const yearMonth = paymentDateObj.toISOString().slice(0, 7);

  // Obtener el alumno y el plan del student_plan recibido
  const [studentPlanRows] = await db.execute(
    `
    SELECT student_id, plan_id
    FROM student_plans
    WHERE id = ?
    `,
    [student_plan_id],
  );

  if (studentPlanRows.length === 0) {
    return false;
  }

  const { student_id, plan_id } = studentPlanRows[0];

  let sql = `
    SELECT p.id
    FROM payments p
    JOIN student_plans sp
      ON p.student_plan_id = sp.id
    WHERE sp.student_id = ?
      AND sp.plan_id = ?
      AND DATE_FORMAT(p.payment_date, '%Y-%m') = ?
  `;

  const params = [student_id, plan_id, yearMonth];

  if (excludeId) {
    sql += " AND p.id != ?";
    params.push(excludeId);
  }

  const [rows] = await db.execute(sql, params);

  return rows.length > 0;
}
