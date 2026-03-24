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

  // Si no hay precio, devolvemos null (NO error)
  if (rows.length === 0) {
    return null;
  }

  return rows[0].price;
}

export async function existingPayment(student_plan_id, date, excludeId = null) {
  const paymentDateObj = new Date(date);
  const yearMonth = paymentDateObj.toISOString().slice(0, 7);

  let sql = `
    SELECT id
    FROM payments
    WHERE student_plan_id = ?
    AND DATE_FORMAT(payment_date, '%Y-%m') = ?
  `;

  const params = [student_plan_id, yearMonth];

  if (excludeId) {
    sql += " AND id != ?";
    params.push(excludeId);
  }

  const [rows] = await db.execute(sql, params);

  return rows.length > 0;
}
