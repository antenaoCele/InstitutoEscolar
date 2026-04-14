import useForm from "../hooks/useForm";
import Input from "../components/form/Input";
import SubmitButton from "../components/form/SubmitButton";

const validatePlan = (data) => {
  const errors = {};

  if (!data.name) errors.name = "Requerido";
  if (data.name && data.name.length < 3)
    errors.name = "Muy corto";

  return errors;
};

export default function PlanForm() {
  const {
    formData,
    errors,
    handleChange,
    handleSubmit,
    loading,
    error,
    success,
  } = useForm(
    {
      name: "",
    },
    validatePlan
  );

  return (
    <form onSubmit={(e) => handleSubmit(e, "/plans")}>

      <Input
        label="Nombre del Plan"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        hint={errors.name}
      />

      <SubmitButton loading={loading} text="Guardar Plan" />

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Guardado correctamente</p>}
    </form>
  );
}