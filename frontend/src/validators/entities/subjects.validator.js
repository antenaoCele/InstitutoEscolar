import { isRequired, isValidSubjectName } from "../rules/formatRules";

export const validateSubjectForm = ({ name }) => {
  const errors = {};

  if (isRequired(name)) {
    errors.name = "Campo obligatorio.";
  } else if (!isValidSubjectName(name)) {
    errors.name = "Debe contener al menos 3 letras y solo caracteres válidos.";
  }

  return errors;
};
