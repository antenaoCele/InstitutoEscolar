import {
  isRequired,
  isValidPersonName,
  isValidUsername,
  isValidPassword,
  isValidRole,
} from "../rules/formatRules";

/**
 * Valida el formulario de usuario (usado tanto en crear como en editar).
 *
 * El único campo que se comporta distinto según el contexto es
 * "password": en creación es obligatorio, en edición es opcional
 * (dejarlo vacío significa "mantener la contraseña actual" — el
 * controller resuelve esto con "??" al armar el UPDATE).
 *
 * Nota: la unicidad del username la audita el backend contra la
 * base de datos (validateUnique), no se puede espejar en el front.
 */
export const validateUsersForm = (
  { first_name, last_name, username, password, role },
  isEdit = false,
) => {
  const errors = {};

  // Nombre
  if (isRequired(first_name)) {
    errors.first_name = "El nombre es obligatorio.";
  } else if (!isValidPersonName(first_name)) {
    errors.first_name = "Nombre inválido.";
  }

  // Apellido
  if (isRequired(last_name)) {
    errors.last_name = "El apellido es obligatorio.";
  } else if (!isValidPersonName(last_name)) {
    errors.last_name = "Apellido inválido.";
  }

  // Username
  if (isRequired(username)) {
    errors.username = "El nombre de usuario es obligatorio.";
  } else if (!isValidUsername(username)) {
    errors.username = "El nombre de usuario debe ser alfanumérico.";
  }

  // Password
  if (isEdit) {
    // Vacío = no cambiarla. Si mandó algo, se valida igual que en creación.
    if (!isRequired(password) && !isValidPassword(password)) {
      errors.password =
        "La contraseña debe contener 8 caracteres como mínimo, una mayúscula, una minúscula, un número y un símbolo.";
    }
  } else {
    if (isRequired(password)) {
      errors.password = "La contraseña es obligatoria.";
    } else if (!isValidPassword(password)) {
      errors.password =
        "La contraseña debe contener 8 caracteres como mínimo, una mayúscula, una minúscula, un número y un símbolo.";
    }
  }

  // Rol
  if (isRequired(role)) {
    errors.role = "Seleccione un rol válido.";
  } else if (!isValidRole(role)) {
    errors.role = "Rol inválido.";
  }

  return errors;
};
