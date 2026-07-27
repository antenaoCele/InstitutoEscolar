import {
  isRequired,
  isPositiveOrZeroNumber,
  isValidMonth,
  isCurrentYearPastOrCurrentMonth,
} from "../rules/formatRules";

/**
 * Valida el formulario de cierre mensual.
 * Devuelve un objeto { campo: mensaje }.
 */
export const validateMonthlyFinanceForm = ({ month, year, otherExpenses }) => {
  const errors = {};

  // ============================
  // Mes
  // ============================
  if (isRequired(month)) {
    errors.month = "Seleccione un mes.";
  } else if (!isValidMonth(month)) {
    errors.month = "Selección inválida.";
  }

  // ============================
  // Año
  // ============================
  if (isRequired(year)) {
    errors.year = "Solo puede generar cierres del año actual.";
  }

  // ============================
  // Otros gastos (opcional)
  // ============================
  if (!isRequired(otherExpenses) && !isPositiveOrZeroNumber(otherExpenses)) {
    errors.other_expenses = "Debe ser un número mayor o igual a cero.";
  }

  // ============================
  // Fecha futura y años anteriores
  // ============================
  if (
    !isRequired(month) &&
    !isRequired(year) &&
    !isCurrentYearPastOrCurrentMonth(month, year)
  ) {
    errors.month = "Solo puede generar cierres de meses del año actual.";
  }

  return errors;
};
