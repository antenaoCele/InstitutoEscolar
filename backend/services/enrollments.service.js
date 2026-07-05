import { db } from "../db.js";

export async function existingEnrollment(
  studentId,
  paymentDate,
  excludeId = null,
) {
  const year = new Date(paymentDate).getFullYear();

  let sql = `
    SELECT id
    FROM enrollments
    WHERE student_id = ?
    AND YEAR(payment_date) = ?
  `;

  const params = [studentId, year];

  if (excludeId) {
    sql += " AND id != ?";
    params.push(excludeId);
  }

  const [rows] = await db.execute(sql, params);
  return rows.length > 0;
}

export async function needsEnrollment(studentId, paymentDate) {
  const year = new Date(paymentDate).getFullYear();

  const [rows] = await db.execute(
    `SELECT id FROM enrollments WHERE student_id = ? AND YEAR(payment_date) = ?`,
    [studentId, year],
  );

  return rows.length === 0;
}
