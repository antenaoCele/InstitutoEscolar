import useForm from "../hooks/useForm";
import Select from "../components/form/Select";
import SubmitButton from "../components/form/SubmitButton";

const validateScheduleStudent = (data) => {
  const errors = {};
  if (!data.schedule_id) errors.schedule_id = "Requerido";
  if (!data.student_id) errors.student_id = "Requerido";
  return errors;
};

export default function ScheduleStudentForm() {
  const {
    formData,
    errors,
    handleChange,
    handleSubmit,
    loading,
    error,
    success,
  } = useForm(
    { schedule_id: "", student_id: "" },
    validateScheduleStudent
  );

  return (
    <form onSubmit={(e) => handleSubmit(e, "/schedule-students")}>

      <Select
        label="Horario"
        name="schedule_id"
        value={formData.schedule_id}
        onChange={handleChange}
        options={[]}
        error={errors.schedule_id}
      />

      <Select
        label="Estudiante"
        name="student_id"
        value={formData.student_id}
        onChange={handleChange}
        options={[]}
        error={errors.student_id}
      />

      <SubmitButton loading={loading} text="Asignar" />

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Asignado correctamente</p>}
    </form>
  );
}