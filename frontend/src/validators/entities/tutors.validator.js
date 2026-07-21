import {
  isRequired,
  isValidPersonName,
  isValidDNI,
  isValidPhone,
} from "../rules/formatRules";

export const validateTutorForm = ({ firstName, lastName, dni, phone }) => {
  const errors = {};

  if (isRequired(firstName)) {
    errors.first_name = "Campo obligatorio.";
  } else if (!isValidPersonName(firstName)) {
    errors.first_name = "Formato inválido.";
  }

  if (isRequired(lastName)) {
    errors.last_name = "Campo obligatorio.";
  } else if (!isValidPersonName(lastName)) {
    errors.last_name = "Formato inválido.";
  }

  if (isRequired(dni)) {
    errors.dni = "Campo obligatorio.";
  } else if (!isValidDNI(dni)) {
    errors.dni = "Formato inválido.";
  }

  if (isRequired(phone)) {
    errors.phone = "Campo obligatorio.";
  } else if (!isValidPhone(phone)) {
    errors.phone = "Formato inválido.";
  }

  return errors;
};
