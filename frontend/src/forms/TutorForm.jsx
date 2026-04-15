import useForm from "../hooks/useForm";
import Input from "../components/form/Input";
import SubmitButton from "../components/form/SubmitButton";
import { isAdmin } from "../utils/auth";

export default function TutorForm({ initialData = {}, isEdit = false }) {
  if (!isAdmin()) {
    return <p className="text-red-500">No autorizado</p>;
  }

  const validate = (data) => {
    const errors = {};

    if (!isEdit) {
      if (!data.first_name) errors.first_name = "Nombre requerido";
      if (!data.last_name) errors.last_name = "Apellido requerido";
      if (!data.phone) errors.phone = "Teléfono requerido";
      if (!data.dni) errors.dni = "DNI requerido";
    }

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
      first_name: initialData.first_name || "",
      last_name: initialData.last_name || "",
      phone: initialData.phone || "",
      dni: initialData.dni || "",
    },
    validate
  );

  const endpoint = isEdit
    ? `/tutors/${initialData.id}`
    : "/tutors";

  const method = isEdit ? "PUT" : "POST";

  return (
    <form onSubmit={(e) => handleSubmit(e, endpoint, method)}>
      
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
        label="DNI"
        name="dni"
        type="number"
        value={formData.dni}
        onChange={handleChange}
        error={errors.dni}
        hint={errors.dni}
      />

      <SubmitButton
        loading={loading}
        text={isEdit ? "Actualizar Tutor" : "Crear Tutor"}
      />

      {error && <p className="text-red-500">{error}</p>}

      {success && (
        <p className="text-green-500">
          {isEdit ? "Actualizado correctamente" : "Creado correctamente"}
        </p>
      )}
    </form>
  );
}