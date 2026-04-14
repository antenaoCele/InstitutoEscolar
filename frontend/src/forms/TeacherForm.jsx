import useForm from "../hooks/useForm";
import Input from "../components/form/Input";
import SubmitButton from "../components/form/SubmitButton";

const validateTeacher = (data) => {
  const errors = {};

  if (!data.first_name) errors.first_name = "Requerido";
  if (!data.last_name) errors.last_name = "Requerido";

  if (!data.dni) errors.dni = "Requerido";
  else if (data.dni.length < 7) errors.dni = "DNI inválido";

  if (!data.phone) errors.phone = "Requerido";

  return errors;
};

export default function TeacherForm() {
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
      dni: "",
      phone: "",
    },
    validateTeacher
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
        label="DNI"
        name="dni"
        value={formData.dni}
        onChange={handleChange}
        type="number"
        error={errors.dni}
        hint={errors.dni}
      />

      <Input
        label="Teléfono"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        error={errors.phone}
        hint={errors.phone}
      />

      <SubmitButton loading={loading} text="Guardar Docente" />

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Guardado correctamente</p>}
    </form>
  );
}