import { db } from "../db.js";

export async function existingEnrollment(
  studentId,
  paymentDate,
  enrollmentId = null,
) {
  let query = `
    SELECT id
    FROM enrollments
    WHERE student_id = ?
      AND MONTH(payment_date) = MONTH(?)
      AND YEAR(payment_date) = YEAR(?)
  `;

  const params = [studentId, paymentDate, paymentDate];

  if (enrollmentId) {
    query += " AND id <> ?";
    params.push(enrollmentId);
  }

  const [rows] = await db.execute(query, params);

  return rows.length > 0;
}
