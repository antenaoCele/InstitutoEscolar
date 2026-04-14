import useForm from "../hooks/useForm";
import Input from "../components/form/Input";
import SubmitButton from "../components/form/SubmitButton";
import Select from "../components/form/Select";
import { isAdmin } from "../utils/auth";

export default function StudentForm() {
  if (!isAdmin()) {
    return <p className="text-red-500">No autorizado</p>;
  }

  const validate = (data) => {
    const errors = {};

    if (!data.first_name) errors.first_name = "Nombre requerido";
    if (!data.last_name) errors.last_name = "Apellido requerido";
    if (!data.dni) errors.dni = "DNI requerido";
    if (!data.school) errors.school = "Escuela requerida";
    if (!data.birth_date) errors.birth_date = "Fecha requerida";
    if (!data.level) errors.level = "Nivel requerido";
    if (!data.grade) errors.grade = "Grado requerido";

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
      dni: "",
      school: "",
      birth_date: "",
      level: "",
      grade: "",
    },
    validate
  );

  return (
    <form onSubmit={(e) => handleSubmit(e, "/students")}>
      
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

      <Input
        label="Escuela"
        name="school"
        value={formData.school}
        onChange={handleChange}
        error={errors.school}
        hint={errors.school}
      />

      <Input
        label="Fecha de nacimiento"
        name="birth_date"
        type="date"
        value={formData.birth_date}
        onChange={handleChange}
        error={errors.birth_date}
        hint={errors.birth_date}
      />

      <Select
        label="Nivel"
        name="level"
        value={formData.level}
        onChange={handleChange}
        options={[
          { value: "inicial", label: "Inicial" },
          { value: "primario", label: "Primario" },
          { value: "secundario", label: "Secundario" },
          { value: "universitario", label: "Universitario" },
        ]}
        error={errors.level}
        hint={errors.level}
      />

      <Input
        label="Grado"
        name="grade"
        type="number"
        value={formData.grade}
        onChange={handleChange}
        error={errors.grade}
        hint={errors.grade}
      />

      <SubmitButton loading={loading} text="Guardar Alumno" />

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Guardado correctamente</p>}
    </form>
  );
}