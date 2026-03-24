export function calculatePaymentAmount(planPrice, date) {
  //Obtengo la fecha que le mando por parametro
  const paymentDate = new Date(date);
  const yearMonth = paymentDate.toISOString().slice(0, 7); //la corta en año y mes

  //establece el limite de el dia 15 del mes ingresado
  const dueDate = new Date(`${yearMonth}-15`);
  const hasInterest = paymentDate > dueDate; //devuelve true o false sobre si debe haber interes

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
