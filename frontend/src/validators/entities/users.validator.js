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
    errors.first_name = "Campo obligatorio.";
  } else if (!isValidPersonName(first_name)) {
    errors.first_name = "Formato inválido.";
  }

  // Apellido
  if (isRequired(last_name)) {
    errors.last_name = "Campo obligatorio.";
  } else if (!isValidPersonName(last_name)) {
    errors.last_name = "Formato inválido.";
  }

  // Username
  if (isRequired(username)) {
    errors.username = "Campo obligatorio.";
  } else if (!isValidUsername(username)) {
    errors.username = "Formato inválido.";
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
      errors.password = "Campo obligatorio.";
    } else if (!isValidPassword(password)) {
      errors.password =
        "La contraseña debe contener 8 caracteres como mínimo, una mayúscula, una minúscula, un número y un símbolo.";
    }
  }

  // Rol
  if (isRequired(role)) {
    errors.role = "Seleccione una opción.";
  } else if (!isValidRole(role)) {
    errors.role = "Selección inválida.";
  }

  return errors;
};
