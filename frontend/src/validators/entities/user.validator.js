import {
  isRequired,
  isValidPersonName,
  isValidUsername,
  isValidPassword,
  doPasswordsMatch,
} from "../rules/formatRules";

export const validateUserForm = ({ first_name, last_name, username }) => {
  const errors = {};

  if (isRequired(first_name)) {
    errors.first_name = "Este campo no puede estar vacío.";
  } else if (!isValidPersonName(first_name)) {
    errors.first_name = "Nombre inválido.";
  }

  if (isRequired(last_name)) {
    errors.last_name = "Este campo no puede estar vacío.";
  } else if (!isValidPersonName(last_name)) {
    errors.last_name = "Apellido inválido.";
  }

  if (isRequired(username)) {
    errors.username = "Este campo no puede estar vacío.";
  } else if (!isValidUsername(username)) {
    errors.username = "El usuario debe ser alfanumérico (3-45 caracteres).";
  }

  return errors;
};

export const validateChangePasswordForm = ({
  currentPassword,
  newPassword,
  confirmPassword,
}) => {
  const errors = {};

  if (isRequired(currentPassword)) {
    errors.currentPassword = "Debes ingresar tu contraseña actual.";
  }

  if (isRequired(newPassword)) {
    errors.newPassword = "Este campo no puede estar vacío.";
  } else if (!isValidPassword(newPassword)) {
    errors.newPassword =
      "Debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.";
  }

  if (isRequired(confirmPassword)) {
    errors.confirmPassword = "Debes confirmar la nueva contraseña.";
  } else if (!doPasswordsMatch(newPassword, confirmPassword)) {
    errors.confirmPassword = "Las contraseñas no coinciden.";
  }

  return errors;
};
