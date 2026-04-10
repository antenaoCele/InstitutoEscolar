import useForm from "../hooks/useForm";
import Select from "../components/form/Select";
import SubmitButton from "../components/form/SubmitButton";

const validatePlanSubject = (data) => {
  const errors = {};
  if (!data.plan_id) errors.plan_id = "Requerido";
  if (!data.subject_id) errors.subject_id = "Requerido";
  return errors;
};

export default function PlanSubjectForm() {
  const {
    formData,
    errors,
    handleChange,
    handleSubmit,
    loading,
    error,
    success,
  } = useForm(
    { plan_id: "", subject_id: "" },
    validatePlanSubject
  );

  return (
    <form onSubmit={(e) => handleSubmit(e, "/plan-subjects")}>

      <Select
        label="Plan"
        name="plan_id"
        value={formData.plan_id}
        onChange={handleChange}
        options={[]}
        error={errors.plan_id}
      />

      <Select
        label="Materia"
        name="subject_id"
        value={formData.subject_id}
        onChange={handleChange}
        options={[]}
        error={errors.subject_id}
      />

      <SubmitButton loading={loading} text="Asignar Materia" />

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Asignado correctamente</p>}
    </form>
  );
}