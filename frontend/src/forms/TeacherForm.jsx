import useForm from "../hooks/useForm";
import Input from "../components/form/Input";
import SubmitButton from "../components/form/SubmitButton";
import { isAdmin } from "../utils/auth";

import { teacherService } from "../services/teacher.service";

export default function TeacherForm({ 
  initialData = {}, 
  isEdit = false,
  onSuccess, }) {
  if (!isAdmin()) {
    return <p className="text-red-500">No autorizado</p>;
  }

  const validate = (data) => {
    const errors = {};

    if (!data.first_name) {
      errors.nafirst_nameme = "Nombre requerido";
    }
    if (!data.last_name) {
      errors.last_name = "Apellido requerido";
    }
    if (!data.dni) {
      errors.dni = "DNI requerido";
    }
    if (!data.phone) {
      errors.phone = "Teléfono requerido";
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
      dni: initialData.dni || "",
      phone: initialData.phone || "",
    },
    validate
  );

  const submitFn = async (data) => {
    const res = isEdit
      ? await teacherService.update(initialData.id, data)
      : await teacherService.create(data);

    if (res.success && onSuccess) {
      onSuccess();
    }

    return res;
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, submitFn)}>
      <h2 className="text-lg font-semibold mb-4">
        {isEdit ? "Editar Docente" : "Nuevo Docente"}
      </h2>

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
        label="Teléfono"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        error={errors.phone}
        hint={errors.phone}
      />

      <SubmitButton
        loading={loading}
        text={isEdit ? "Actualizar Docente" : "Crear Docente"}
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