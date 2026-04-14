import useForm from "../hooks/useForm";
import Input from "../components/form/Input";
import SubmitButton from "../components/form/SubmitButton";
import { isAdmin } from "../utils/auth";

export default function SubjectForm() {
  if (!isAdmin()) {
    return <p className="text-red-500">No autorizado</p>;
  }

  const validate = (data) => {
    const errors = {};

    if (!data.name) errors.name = "Nombre requerido";

    return errors;
  };

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
    validate
  );

  return (
    <form onSubmit={(e) => handleSubmit(e, "/subjects")}>
      <Input
        label="Materia"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        hint={errors.name}
      />

      <SubmitButton loading={loading} text="Guardar Materia" />

      {error && <p className="text-red-500">{error}</p>}
      {success && (
        <p className="text-green-500">Guardado correctamente</p>
      )}
    </form>
  );
}