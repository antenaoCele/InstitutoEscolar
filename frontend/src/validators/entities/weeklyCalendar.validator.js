import { isRequired, isEmptyArray } from "../rules/formatRules";

/**
 * Valida el formulario de horarios.
 * Usado tanto para crear como para editar.
 */
export const validateWeeklyCalendarForm = ({
  teacherId,
  selectedPlan,
  selectedDay,
  selectedTime,
  classroom,
  selectedStudents,
}) => {
  const errors = {};

  if (isRequired(teacherId)) {
    errors.teacher_id = "Seleccione una opción válida.";
  }

  if (isRequired(selectedPlan)) {
    errors.plan_id = "Seleccione una opción válida.";
  }

  if (isRequired(selectedDay)) {
    errors.day = "Seleccione una opción válida.";
  }

  if (isRequired(selectedTime)) {
    errors.start_time = "Seleccione una opción válida.";
  }

  if (isRequired(classroom)) {
    errors.classroom = "Seleccione una opción válida.";
  }

  if (isEmptyArray(selectedStudents)) {
    errors.students = "Seleccione al menos una opción válida.";
  }

  return errors;
};
