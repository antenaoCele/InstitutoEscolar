import useForm from "../hooks/useForm";
import Input from "../components/form/Input";
import Select from "../components/form/Select";
import Button from "../components/ui/Button";
import { useEffect, useState } from "react";
import { isAdmin } from "../utils/auth";

import { planService } from "../services/plan.service";
import { PlanPriceService } from "../services/planPrice.service";

export default function PlanPriceForm({ initialData = {}, isEdit = false }) {
  if (!isAdmin()) {
    return <p className="text-red-500">No autorizado</p>;
  }

  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await planService.getAll();
        setPlans(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPlans();
  }, []);

  const validatePlanPrice = (data) => {
    const errors = {};

    if (!data.plan_id) errors.plan_id = "Plan requerido";
    if (!data.price) errors.price = "Precio requerido";
    if (!data.start_date) errors.start_date = "Fecha inicio requerida";

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
      plan_id: initialData.plan_id || "",
      price: initialData.price || "",
      start_date: initialData.start_date || "",
      end_date: initialData.end_date || "",
    },
    validatePlanPrice
  );

  const submitFn = async (data) => {
    if (isEdit) {
      return await PlanPriceService.update(initialData.id, data);
    } else {
      return await PlanPriceService.create(data);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, submitFn)}>
      
      <Select
        label="Plan"
        name="plan_id"
        value={formData.plan_id}
        onChange={handleChange}
        options={plans.map((p) => ({
          value: p.id,
          label: p.name,
        }))}
        error={errors.plan_id}
        hint={errors.plan_id}
      />

      <Input
        label="Precio"
        name="price"
        type="number"
        value={formData.price}
        onChange={handleChange}
        error={errors.price}
        hint={errors.price}
      />

      <Input
        label="Fecha inicio"
        name="start_date"
        type="date"
        value={formData.start_date}
        onChange={handleChange}
        error={errors.start_date}
        hint={errors.start_date}
      />

      <Input
        label="Fecha fin"
        name="end_date"
        type="date"
        value={formData.end_date}
        onChange={handleChange}
      />

      <Button>
        loading={loading}
        text={isEdit ? "Actualizar Precio" : "Guardar Precio"}
      </Button>
        
    

      {error && <p className="text-red-500">{error}</p>}
      {success && (
        <p className="text-green-500">
          {isEdit ? "Actualizado correctamente" : "Guardado correctamente"}
        </p>
      )}
    </form>
  );
}