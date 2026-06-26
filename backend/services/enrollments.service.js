import { db } from "../db.js";

export async function existingEnrollment(
  studentId,
  paymentDate,
  excludeId = null,
) {
  const dateObj = new Date(paymentDate);
  const yearMonth = dateObj.toISOString().slice(0, 7);

  let sql = `
    SELECT id
    FROM enrollments
    WHERE student_id = ?
    AND DATE_FORMAT(payment_date, '%Y-%m') = ?
  `;

  const params = [studentId, yearMonth];

  if (excludeId) {
    sql += " AND id != ?";
    params.push(excludeId);
  }

  const [rows] = await db.execute(sql, params);

  return rows.length > 0;
}

export async function needsEnrollment(studentId, paymentDate) {
  // Última inscripción
  const [enrollmentRows] = await db.execute(
    `
    SELECT MAX(payment_date) AS last_enrollment
    FROM enrollments
    WHERE student_id = ?
    `,
    [studentId],
  );

  const lastEnrollment = enrollmentRows[0].last_enrollment;

  // Nunca se inscribió
  if (!lastEnrollment) {
    return true;
  }

  // Último pago realizado
  const [paymentRows] = await db.execute(
    `
    SELECT MAX(p.payment_date) AS last_payment
    FROM payments p
    JOIN student_plans sp
      ON p.student_plan_id = sp.id
    WHERE sp.student_id = ?
    `,
    [studentId],
  );

  const lastPayment = paymentRows[0].last_payment;

  // Se acaba de inscribir y todavía no pagó ninguna cuota
  if (!lastPayment) {
    return false;
  }

  const previous = new Date(lastPayment);
  const current = new Date(paymentDate);

  const monthDiff =
    (current.getFullYear() - previous.getFullYear()) * 12 +
    (current.getMonth() - previous.getMonth());

  // Cambio de año
  if (current.getFullYear() > previous.getFullYear()) {
    return true;
  }

  // Dejó pasar un mes completo
  if (monthDiff >= 2) {
    return true;
  }

  return false;
}
