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
    errors.first_name = "Campo obligatorio.";
  } else if (!isValidPersonName(first_name)) {
    errors.first_name = "Nombre inválido.";
  }

  if (isRequired(last_name)) {
    errors.last_name = "Campo obligatorio.";
  } else if (!isValidPersonName(last_name)) {
    errors.last_name = "Apellido inválido.";
  }

  if (isRequired(username)) {
    errors.username = "Campo obligatorio.";
  } else if (!isValidUsername(username)) {
    errors.username =
      "El nombre de usuario solo debe contener letras o números (3 a 45 caracteres).";
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
    errors.newPassword = "Campo obligatorio.";
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
