import { db } from "../db.js";

// ======================================================
// HELPERS DE FECHAS
// ======================================================
const getMonthBounds = (year, month) => {
  const monthPadded = String(month).padStart(2, "0");
  const monthString = `${year}-${monthPadded}`;

  const startDate = `${year}-${monthPadded}-01`;

  // Date(year, month, 0) da el último día del mes anterior al indicado,
  // que es justo el último día de "month". Solo usamos el Date para
  // sacar ese número, nunca lo convertimos con toISOString.
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${monthPadded}-${String(lastDay).padStart(2, "0")}`;

  return { monthString, startDate, endDate };
};

// ======================================================
// INGRESOS: pagos + inscripciones del mes
// ======================================================
const getTotalIncome = async (startDate, endDate) => {
  const [payments] = await db.execute(
    `
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM payments
    WHERE payment_date BETWEEN ? AND ?
    `,
    [startDate, endDate],
  );

  const [enrollments] = await db.execute(
    `
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM enrollments
    WHERE payment_date BETWEEN ? AND ?
    `,
    [startDate, endDate],
  );

  return Number(payments[0].total) + Number(enrollments[0].total);
};

// ======================================================
// SUELDOS: se calculan en el momento a partir de los pagos
// del mes (mismo criterio que teacherLiquidationsController.getMonthly),
// en vez de leer de teacher_liquidations, que nunca se persiste.
// Como los pagos guardan el monto fijo al momento de pagar (y hay
// historial de precios), este cálculo no se ve afectado por cambios
// de precio posteriores.
// ======================================================
const getTotalSalaries = async (year, month) => {
  const [salaries] = await db.execute(
    `
    SELECT COALESCE(SUM(p.amount), 0) * 0.75 AS total
    FROM payments p
    JOIN student_plans sp ON sp.id = p.student_plan_id
    WHERE MONTH(p.payment_date) = ?
      AND YEAR(p.payment_date) = ?
    `,
    [month, year],
  );

  return Number(salaries[0].total);
};

// ======================================================
// CÁLCULO COMPLETO DEL CIERRE MENSUAL
// ======================================================
export const calculateMonthlyFinance = async (
  year,
  month,
  otherExpenses = 0,
) => {
  const { monthString, startDate, endDate } = getMonthBounds(year, month);

  const totalIncome = await getTotalIncome(startDate, endDate);
  const totalSalaries = await getTotalSalaries(year, month);

  const netProfit = totalIncome - totalSalaries - Number(otherExpenses);

  return {
    monthString,
    totalIncome,
    totalSalaries,
    netProfit,
  };
};
