import useForm from "../hooks/useForm";
import Input from "../components/form/Input";
import SubmitButton from "../components/form/SubmitButton";

export default function StudentForm() {
  const validate = (data, isEdit) => {
    const errors = {};

    if (!isEdit) {
      if (!data.first_name) errors.first_name = "Nombre requerido";
      if (!data.last_name) errors.last_name = "Apellido requerido";
      if (!data.dni) errors.dni = "DNI requerido";
      if (!data.school) errors.school = "Escuela requerida";
      if (!data.birth_date) errors.birth_date = "Fecha requerida";
      if (!data.level) errors.level = "Nivel requerido";
      if (!data.grade) errors.grade = "Grado requerido";
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
      first_name: "",
      last_name: "",
      dni: "",
      school: "",
      birth_date: "",
      level: "",
      grade: "",
    },
    validate,
    false
  );

  return (
    <form onSubmit={(e) => handleSubmit(e, "/students", "POST")}>
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
        label="Escuela"
        name="school"
        value={formData.school}
        onChange={handleChange}
      />

      <Input
        label="Fecha de nacimiento"
        name="birth_date"
        type="date"
        value={formData.birth_date}
        onChange={handleChange}
      />

      {/* 🔹 Nivel */}
      <div>
        <label className="block text-sm mb-1">Nivel</label>
        <select
          name="level"
          value={formData.level}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="">Seleccionar</option>
          <option value="inicial">Inicial</option>
          <option value="primario">Primario</option>
          <option value="secundario">Secundario</option>
          <option value="universitario">Universitario</option>
        </select>
      </div>

      {/* 🔹 Grado */}
      <div>
        <label className="block text-sm mb-1">Grado</label>
        <select
          name="grade"
          value={formData.grade}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="">Seleccionar</option>
          {[1, 2, 3, 4, 5, 6, 7].map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <SubmitButton loading={loading} text="Guardar Alumno" />

      {error && <p className="text-red-500">{error}</p>}
      {success && (
        <p className="text-green-500">Guardado correctamente</p>
      )}
    </form>
  );
}