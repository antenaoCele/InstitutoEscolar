import useForm from "../hooks/useForm";
import Input from "../components/form/Input";
import SubmitButton from "../components/form/SubmitButton";

const validatePlanPrice = (data) => {
  const errors = {};
  if (!data.plan_id) errors.plan_id = "Requerido";
  if (!data.price) errors.price = "Requerido";
  if (!data.start_date) errors.start_date = "Requerido";
  return errors;
};

export default function PlanPriceForm() {
  const {
    formData,
    errors,
    handleChange,
    handleSubmit,
    loading,
    error,
    success,
  } = useForm(
    { plan_id: "", price: "", start_date: "", end_date: "" },
    validatePlanPrice
  );

  return (
    <form onSubmit={(e) => handleSubmit(e, "/plan-prices")}>
      <Input label="Plan ID" name="plan_id"
        value={formData.plan_id} onChange={handleChange}
        error={errors.plan_id} hint={errors.plan_id} />

      <Input label="Precio" name="price" type="number"
        value={formData.price} onChange={handleChange}
        error={errors.price} hint={errors.price} />

      <Input label="Inicio" name="start_date" type="date"
        value={formData.start_date} onChange={handleChange}
        error={errors.start_date} hint={errors.start_date} />

      <Input label="Fin" name="end_date" type="date"
        value={formData.end_date} onChange={handleChange} />

      <SubmitButton loading={loading} text="Guardar Precio" />

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Guardado</p>}
    </form>
  );
}