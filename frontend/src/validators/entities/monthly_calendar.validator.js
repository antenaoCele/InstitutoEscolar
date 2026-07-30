import {
  isRequired,
  isValidName,
  isValidDateFormat,
} from "../rules/formatRules";

export const validateMonthlyCalendarForm = ({ name, date, hour }) => {
  const errors = {};

  if (isRequired(name)) {
    errors.name = "Campo obligatorio.";
  } else if (!isValidName(name)) {
    errors.name = "Debe contener entre 3 y 45 caracteres.";
  }

  if (isRequired(date)) {
    errors.date = "Campo obligatorio.";
  } else if (!isValidDateFormat(date)) {
    errors.date = "Fecha inválida.";
  }

  if (isRequired(hour)) {
    errors.hour = "Campo obligatorio.";
  }

  return errors;
};
