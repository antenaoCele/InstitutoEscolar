export function calculatePaymentAmount(planPrice, date) {
  const paymentDate = new Date(date);
  const yearMonth = paymentDate.toISOString().slice(0, 7);

  const dueDate = new Date(`${yearMonth}-15`);
  const hasInterest = paymentDate > dueDate;

  let interest = 0;
  let total = planPrice;

  if (hasInterest) {
    interest = planPrice * 0.15;
    total = planPrice + interest;
  }

  return {
    planPrice,
    interest,
    total,
    hasInterest,
    dueDate,
  };
}
