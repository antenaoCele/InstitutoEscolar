import useForm from "../hooks/useForm";
import Input from "../components/form/Input";
import SubmitButton from "../components/form/SubmitButton";
import { isAdmin } from "../utils/auth";

export default function TutorForm() {
  if (!isAdmin()) {
    return <p className="text-red-500">No autorizado</p>;
  }

  const validate = (data) => {
    const errors = {};

    if (!data.first_name) errors.first_name = "Nombre requerido";
    if (!data.last_name) errors.last_name = "Apellido requerido";
    if (!data.phone) errors.phone = "Teléfono requerido";
    if (!data.dni) errors.dni = "DNI requerido";

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
      first_name: "",
      last_name: "",
      phone: "",
      dni: "",
    },
    validate
  );

  return (
    <form onSubmit={(e) => handleSubmit(e, "/teachers")}>
      <Input
        label="Nombre"
        name="first_name"
        value={formData.first_name}
        onChange={handleChange}
        error={errors.first_name}
        hint={errors.first_name}
      />

      <Input
        label="Apellido"
        name="last_name"
        value={formData.last_name}
        onChange={handleChange}
        error={errors.last_name}
        hint={errors.last_name}
      />

      <Input
        label="Teléfono"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        error={errors.phone}
        hint={errors.phone}
      />

      <Input
        label="DNI"
        name="dni"
        type="number"
        value={formData.dni}
        onChange={handleChange}
        error={errors.dni}
        hint={errors.dni}
      />

      <SubmitButton loading={loading} text="Guardar Docente" />

      {error && <p className="text-red-500">{error}</p>}
      {success && (
        <p className="text-green-500">Guardado correctamente</p>
      )}
    </form>
  );
}