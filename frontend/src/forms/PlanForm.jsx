import useForm from "../hooks/useForm";
import Input from "../components/form/Input";
import SubmitButton from "../components/form/SubmitButton";

export default function PlanForm() {
  const validate = (data, isEdit) => {
    const errors = {};

    if (!isEdit) {
      if (!data.name) errors.name = "Nombre requerido";
    }

    return errors;
  };

  const {
    formData,
    handleChange,
    handleSubmit,
    loading,
    error,
    success,
  } = useForm(
    {
      name: "",
    },
    validate,
    false
  );

  return (
    <form onSubmit={(e) => handleSubmit(e, "/plans", "POST")}>
      <Input
        label="Nombre del Plan"
        name="name"
        value={formData.name}
        onChange={handleChange}
      />

      <SubmitButton loading={loading} text="Guardar Plan" />

      {error && <p className="text-red-500">{error}</p>}
      {success && (
        <p className="text-green-500">Guardado correctamente</p>
      )}
    </form>
  );
}