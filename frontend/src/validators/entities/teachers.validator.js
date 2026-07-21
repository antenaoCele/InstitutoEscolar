import {
  isRequired,
  isValidPersonName,
  isValidDNI,
  isValidPhone,
} from "../rules/formatRules";

export const validateTeacher = ({ first_name, last_name, dni, phone }) => {
  const errors = {};

  // Nombre
  if (isRequired(first_name)) {
    errors.first_name = "Campo obligatorio.";
  } else if (!isValidPersonName(first_name)) {
    errors.first_name = "Ingrese un nombre válido.";
  }

  // Apellido
  if (isRequired(last_name)) {
    errors.last_name = "Campo obligatorio.";
  } else if (!isValidPersonName(last_name)) {
    errors.last_name = "Ingrese un apellido válido.";
  }

  // DNI
  if (isRequired(dni)) {
    errors.dni = "Campo obligatorio.";
  } else if (!isValidDNI(dni)) {
    errors.dni = "Ingrese un DNI válido.";
  }

  // Teléfono
  if (isRequired(phone)) {
    errors.phone = "Campo obligatorio.";
  } else if (!isValidPhone(phone)) {
    errors.phone = "Ingrese un teléfono válido.";
  }

  return errors;
};
