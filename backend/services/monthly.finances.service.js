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
// SUELDOS: suma de liquidaciones ya generadas para el mes
// NOTA: lee directo de teacher_liquidations. Si todavía no
// se generaron las liquidaciones de ese mes, esto da 0.
// ======================================================
const getTotalSalaries = async (monthString) => {
  const [salaries] = await db.execute(
    `
    SELECT COALESCE(SUM(net_salary), 0) AS total
    FROM teacher_liquidations
    WHERE month = ?
    `,
    [monthString],
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
  const totalSalaries = await getTotalSalaries(monthString);

  const netProfit = totalIncome - totalSalaries - Number(otherExpenses);

  return {
    monthString,
    totalIncome,
    totalSalaries,
    netProfit,
  };
};
