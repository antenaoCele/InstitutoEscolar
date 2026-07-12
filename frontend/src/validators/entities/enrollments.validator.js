import {
  isEmptyArray,
  isPositiveNumber,
  isRequired,
} from "../rules/formatRules";

/**
 * Valida el formulario de registrar inscripción (permite varios
 * alumnos a la vez, para hermanos).
 * Devuelve un objeto { campo: mensaje }. Vacío = sin errores.
 */
export const validateEnrollmentForm = ({
  enrollmentStudents,
  enrollmentAmount,
  enrollmentDate,
}) => {
  const errors = {};

  if (isEmptyArray(enrollmentStudents)) {
    errors.students = "Seleccione al menos un alumno.";
  }

  if (!isPositiveNumber(enrollmentAmount)) {
    errors.amount = "Ingrese un monto válido.";
  }

  if (isRequired(enrollmentDate)) {
    errors.date = "Ingrese una fecha de pago.";
  }

  return errors;
};

/**
 * Valida el formulario de editar inscripción (un solo alumno).
 * Devuelve un objeto { campo: mensaje }. Vacío = sin errores.
 */
export const validateEditEnrollmentForm = ({
  enrollmentStudent,
  enrollmentAmount,
  enrollmentDate,
}) => {
  const errors = {};

  if (isRequired(enrollmentStudent)) {
    errors.student = "Seleccione un alumno.";
  }

  if (!isPositiveNumber(enrollmentAmount)) {
    errors.amount = "Ingrese un monto válido.";
  }

  if (isRequired(enrollmentDate)) {
    errors.date = "Ingrese una fecha de pago.";
  }

  return errors;
};
