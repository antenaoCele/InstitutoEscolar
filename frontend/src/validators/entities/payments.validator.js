import { isRequired, isValidPaymentMethod } from "../rules/formatRules";

/**
 * Valida el formulario de registrar pago.
 * Devuelve un objeto { campo: mensaje }. Vacío = sin errores.
 */
export const validatePaymentForm = ({
  selectedStudent,
  selectedStudentPlan,
  paymentDate,
  paymentMethod,
}) => {
  const errors = {};

  if (isRequired(selectedStudent)) {
    errors.student = "Seleccione un alumno.";
  }

  if (isRequired(selectedStudentPlan)) {
    errors.plan = "Seleccione un plan.";
  }

  if (isRequired(paymentDate)) {
    errors.date = "Ingrese una fecha de pago.";
  }

  if (isRequired(paymentMethod)) {
    errors.method = "Seleccione un método de pago.";
  } else if (!isValidPaymentMethod(paymentMethod)) {
    errors.method = "Método de pago no válido.";
  }

  return errors;
};
