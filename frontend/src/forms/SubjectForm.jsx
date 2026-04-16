import useForm from "../hooks/useForm";
import Input from "../components/form/Input";
import SubmitButton from "../components/form/SubmitButton";
import { isAdmin } from "../utils/auth";

import { subjectService } from "../services/subject.service";

export default function SubjectForm({ 
  initialData = {}, 
  isEdit = false, 
  onSuccess,
}) {
  if (!isAdmin()) {
    return <p className="text-red-500">No autorizado</p>;
  }

  const validate = (data) => {
    const errors = {};

    if (!isEdit) {
      if (!data.name) errors.name = "Nombre de la materia requerido";
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
      name: initialData.name || "",
    },
    validate
  );

  const submitFn = async (data) => {
    const res = isEdit
      ? await subjectService.update(initialData.id, data)
      : await subjectService.create(data);

    if (res.success && onSuccess) {
      onSuccess();
    }

    return res;
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, submitFn)}>

      <h2 className="text-lg font-semibold mb-4">
        {isEdit ? "Editar Materia" : "Nueva Materia"}
      </h2>

      <Input
        label="Materia"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        hint={errors.name}
      />

      <SubmitButton
        loading={loading}
        text={isEdit ? "Actualizar Materia" : "Crear Materia"}
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