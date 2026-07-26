import {
  isNotFutureDate,
  isRequired,
  isValidPaymentMethod,
  isValidPeriod,
} from "../rules/formatRules";

/**
 * Valida el formulario de registrar pago.
 * Devuelve un objeto { campo: mensaje }. Vacío = sin errores.
 */
export const validatePaymentForm = ({
  selectedStudent,
  selectedStudentPlan,
  paymentDate,
  paymentPeriod,
  paymentMethod,
}) => {
  const errors = {};

  if (isRequired(selectedStudent)) {
    errors.student = "Seleccione un estudiante.";
  }

  if (isRequired(selectedStudentPlan)) {
    errors.plan = "Seleccione un plan.";
  }

  if (isRequired(paymentDate)) {
    errors.date = "Ingrese una fecha de pago.";
  } else if (!isNotFutureDate(paymentDate)) {
    errors.date = "La fecha no puede ser futura.";
  }

  if (isRequired(paymentPeriod)) {
    errors.period = "Seleccione el período a pagar.";
  } else if (!isValidPeriod(paymentPeriod)) {
    errors.period = "Período inválido.";
  }

  if (isRequired(paymentMethod)) {
    errors.method = "Seleccione un método de pago.";
  } else if (!isValidPaymentMethod(paymentMethod)) {
    errors.method = "Método de pago no válido.";
  }

  return errors;
};
