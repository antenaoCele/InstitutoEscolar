export const calculateAccountStatus = ({
  price,
  total_paid,
  today,
  yearMonth,
}) => {
  const safePrice = Number(price) || 0;

  const dueDate = new Date(`${yearMonth}-15`);

  let expectedTotal = safePrice;
  let interest = 0;
  let hasInterest = false;

  // interés
  if (today > dueDate) {
    const calc = calculatePaymentAmount(safePrice, `${yearMonth}-16`);
    expectedTotal = calc.total;
    interest = calc.interest;
    hasInterest = calc.hasInterest;
  }

  // redondeo consistente
  const roundedExpected = Math.round(expectedTotal * 100) / 100;

  const roundedPaid = Math.round(Number(total_paid) * 100) / 100;

  const debt = roundedExpected - roundedPaid;

  return {
    price: safePrice,
    total_paid: roundedPaid,
    interest,
    expected_total: roundedExpected,
    debt: debt > 0 ? debt : 0,
    status: safePrice === 0 ? "SIN_PRECIO" : debt <= 0 ? "PAGADO" : "DEBE",
  };
};
