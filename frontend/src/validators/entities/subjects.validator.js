import { isRequired, isValidName } from "../rules/formatRules";

export const validateSubjectForm = ({ name }) => {
  const errors = {};

  if (isRequired(name)) {
    errors.name = "Campo obligatorio.";
  } else if (!isValidName(name)) {
    errors.name = "Formato inválido.";
  }

  return errors;
};
