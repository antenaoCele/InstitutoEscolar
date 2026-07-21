import {
  isRequired,
  isValidDNI,
  isNumericDNI,
  isValidPersonName,
  isValidName,
  isValidLevel,
  isValidGrade,
  isValidBirthDate,
} from "../rules/formatRules";

/**
 * Valida el formulario de estudiante (usado tanto en crear como en editar).
 * Devuelve un objeto { campo: mensaje }. Vacío = sin errores.
 */
export const validateStudentForm = ({
  firstName,
  lastName,
  dni,
  school,
  birthDate,
  level,
  grade,
}) => {
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
  } else if (!isNumericDNI(dni)) {
    errors.dni = "Formato inválido.";
  } else if (!isValidDNI(dni)) {
    errors.dni = "Formato inválido.";
  }

  if (isRequired(school)) {
    errors.school = "Campo obligatorio.";
  } else if (!isValidName(school)) {
    errors.school = "Formato inválido.";
  }

  if (isRequired(birthDate)) {
    errors.birth_date = "Campo obligatorio.";
  } else if (!isValidBirthDate(birthDate)) {
    errors.birth_date = "Formato inválido.";
  }

  if (isRequired(level)) {
    errors.level = "Seleccione una opción válida.";
  } else if (!isValidLevel(level)) {
    errors.level = "Selección inválida.";
  }

  if (isRequired(grade)) {
    errors.grade = "Seleccione una opción válida.";
  } else if (!isValidGrade(grade)) {
    errors.grade = "Selección inválida.";
  }

  return errors;
};
