export function calculatePaymentAmount(planPrice, date) {
  //Obtengo la fecha que le mando por parametro
  const price = Number(planPrice);
  const paymentDate = new Date(date);
  const yearMonth = paymentDate.toISOString().slice(0, 7); //la corta en año y mes

  //establece el limite de el dia 15 del mes ingresado
  const dueDate = new Date(`${yearMonth}-15`);
  const hasInterest = paymentDate > dueDate; //devuelve true o false sobre si debe haber interes

  let interest = 0;
  let total = price;

  if (hasInterest) {
    interest = price * 0.15;
    interest = Math.round(interest * 100) / 100;

    total = price + interest;
    total = Math.round(total * 100) / 100;
  }

  return {
    price,
    interest,
    total,
    hasInterest,
    dueDate,
  };
}
