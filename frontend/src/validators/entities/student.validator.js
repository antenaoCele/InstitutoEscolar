import {
  isRequired,
  isValidDNI,
  isValidPersonName,
  isValidName,
  isValidLevel,
  isValidGrade,
} from "../rules/formatRules";

/**
 * Valida el formulario de alumno (usado tanto en crear como en editar).
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
    errors.first_name = "Este campo no puede estar vacío.";
  } else if (!isValidPersonName(firstName)) {
    errors.first_name = "Nombre inválido.";
  }

  if (isRequired(lastName)) {
    errors.last_name = "Este campo no puede estar vacío.";
  } else if (!isValidPersonName(lastName)) {
    errors.last_name = "Apellido inválido.";
  }

  if (isRequired(dni)) {
    errors.dni = "Este campo no puede estar vacío.";
  } else if (!isValidDNI(dni)) {
    errors.dni = "Ingrese un DNI válido.";
  }

  if (isRequired(school)) {
    errors.school = "Este campo no puede estar vacío.";
  } else if (!isValidName(school)) {
    errors.school = "Ingrese un nombre de institución válido.";
  }

  if (isRequired(birth_date)) {
    errors.birth_date = "La fecha de nacimiento es obligatoria.";
  } else if (!isValidBirthDate(birth_date)) {
    errors.birth_date = "Ingrese una fecha de nacimiento válida.";
  }

  if (isRequired(level)) {
    errors.level = "Seleccione una opción válida.";
  } else if (!isValidLevel(level)) {
    errors.level = "Seleccione una opción válida.";
  }

  if (isRequired(grade)) {
    errors.grade = "Seleccione una opción válida.";
  } else if (!isValidGrade(grade)) {
    errors.grade = "Seleccione una opción válida.";
  }

  return errors;
};
