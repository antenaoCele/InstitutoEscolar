import useForm from "../hooks/useForm";
import Input from "../components/form/Input";
import SubmitButton from "../components/form/SubmitButton";

export default function TeacherForm() {
  const {
    formData,
    handleChange,
    handleSubmit,
    loading,
    error,
    success,
  } = useForm({
    first_name: "",
    last_name: "",
    dni: "",
    phone: "",
  });

  return (
    <form onSubmit={(e) => handleSubmit(e, "/teachers")}>
      <Input
        label="Nombre"
        name="first_name"
        value={formData.first_name}
        onChange={handleChange}
      />

      <Input
        label="Apellido"
        name="last_name"
        value={formData.last_name}
        onChange={handleChange}
      />

      <Input
        label="DNI"
        name="dni"
        value={formData.dni}
        onChange={handleChange}
        type="number"
      />

      <Input
        label="Teléfono"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
      />

      <SubmitButton loading={loading} text="Guardar Docente" />

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Guardado correctamente</p>}
    </form>
  );
}