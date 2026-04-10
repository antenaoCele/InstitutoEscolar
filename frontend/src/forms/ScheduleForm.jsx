import useForm from "../hooks/useForm";
import Input from "../components/form/Input";
import Select from "../components/form/Select";
import SubmitButton from "../components/form/SubmitButton";

const validateSchedule = (data) => {
  const errors = {};
  if (!data.teacher_id) errors.teacher_id = "Requerido";
  if (!data.start_time) errors.start_time = "Requerido";
  if (!data.day) errors.day = "Requerido";
  if (!data.classroom) errors.classroom = "Requerido";
  return errors;
};

export default function ScheduleForm() {
  const {
    formData,
    errors,
    handleChange,
    handleSubmit,
    loading,
    error,
    success,
  } = useForm(
    { teacher_id: "", start_time: "", day: "", classroom: "" },
    validateSchedule
  );

  const days = [
    { id: "lunes", name: "Lunes" },
    { id: "martes", name: "Martes" },
    { id: "miércoles", name: "Miércoles" },
  ];

  return (
    <form onSubmit={(e) => handleSubmit(e, "/schedules")}>

      <Input
        label="Teacher ID"
        name="teacher_id"
        value={formData.teacher_id}
        onChange={handleChange}
        error={errors.teacher_id}
        hint={errors.teacher_id}
      />

      <Input
        label="Hora Inicio"
        name="start_time"
        type="time"
        value={formData.start_time}
        onChange={handleChange}
        error={errors.start_time}
        hint={errors.start_time}
      />

      <Select
        label="Día"
        name="day"
        value={formData.day}
        onChange={handleChange}
        options={days}
        error={errors.day}
      />

      <Input
        label="Aula"
        name="classroom"
        value={formData.classroom}
        onChange={handleChange}
        error={errors.classroom}
        hint={errors.classroom}
      />

      <SubmitButton loading={loading} text="Crear Horario" />

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Horario creado</p>}
    </form>
  );
}