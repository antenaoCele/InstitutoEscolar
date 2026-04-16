import useForm from "../hooks/useForm";
import Input from "../components/form/Input";
import SubmitButton from "../components/form/SubmitButton";
import { isAdmin } from "../utils/auth";
// No se debe importar el modal!

import { planService } from "../services/plan.service";

export default function PlanForm({
  initialData = {},
  isEdit = false,
  onSuccess, // Rama, se agregó esto
}) {
  if (!isAdmin()) {
    return <p className="text-red-500">No autorizado</p>;
  }

  const validate = (data) => {
    const errors = {};

    if (!data.name) {
      errors.name = "Nombre del plan requerido";
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
      ? await planService.update(initialData.id, data)
      : await planService.create(data);

    // Rama, se agregó esto. Es para cerrar el modal automáticamente...
    if (res.success && onSuccess) {
      onSuccess();
    }

    return res;
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, submitFn)}>
      
      <h2 className="text-lg font-semibold mb-4">
        {isEdit ? "Editar Plan" : "Nuevo Plan"}
      </h2>

      <Input
        label="Plan"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        hint={errors.name}
      />

      <SubmitButton
        loading={loading}
        text={isEdit ? "Actualizar Plan" : "Crear Plan"}
      />

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {success && (
        <p className="text-green-500 mt-2">
          {isEdit ? "Actualizado correctamente" : "Creado correctamente"}
        </p>
      )}
    </form>
  );
}