import useForm from "../hooks/useForm";
import Input from "../components/form/Input";
import Button from "../components/ui/Button";
import { isAdmin } from "../utils/auth";

import { planService } from "../services/plan.service";

export default function PlanForm({ initialData = {}, isEdit = false }) {
  if (!isAdmin()) {
    return <p className="text-red-500">No autorizado</p>;
  }

  const validate = (data) => {
    const errors = {};

    if (!isEdit) {
      if (!data.name) errors.name = "Nombre del plan requerido";
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
    if (isEdit) {
      return await planService.update(initialData.id, data);
    } else {
      return await planService.create(data);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, submitFn)}>
      <Input
        label="Plan"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        hint={errors.name}
      />

      <Button type="submit" loading={loading} className="w-full">
        {isEdit ? "Actualizar Plan" : "Crear Plan"}
      </Button>

      {error && <p className="text-red-500">{error}</p>}

      {success && (
        <p className="text-green-500">
          {isEdit ? "Actualizado correctamente" : "Creado correctamente"}
        </p>
      )}
    </form>
  );
}