import {
  isRequired,
  isEmptyArray,
  isValidName,
  isPositiveNumber,
  isValidDateFormat,
} from "../rules/formatRules";

export const validatePlanForm = ({
  plan,
  subjects,
  price,
  startDate,
  endDate,
}) => {
  const errors = {};

  if (isRequired(plan)) {
    errors.name = "Campo obligatorio.";
  } else if (!isValidName(plan)) {
    errors.name = "Formato inválido.";
  }

  if (isEmptyArray(subjects)) {
    errors.subjects = "Seleccione al menos una opción.";
  }

  if (isRequired(price)) {
    errors.price = "Campo obligatorio.";
  } else if (!isPositiveNumber(price)) {
    errors.price = "Formato inválido.";
  }

  // Solo validar fechas si el formulario las posee
  if (startDate !== undefined) {
    if (isRequired(startDate)) {
      errors.start_date = "Campo obligatorio.";
    } else if (!isValidDateFormat(startDate)) {
      errors.start_date = "Formato inválido.";
    }
  }

  if (endDate !== undefined && endDate !== "") {
    if (!isValidDateFormat(endDate)) {
      errors.end_date = "Formato inválido.";
    }
  }

  return errors;
};
