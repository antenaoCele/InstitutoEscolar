import useForm from "../hooks/useForm";
import Input from "../components/form/Input";
import Select from "../components/form/Select";
import SubmitButton from "../components/form/SubmitButton";

const validateMonthlyFinance = (data) => {
  const errors = {};
  if (!data.year) errors.year = "Requerido";
  if (!data.month) errors.month = "Requerido";
  return errors;
};

export default function MonthlyFinanceForm() {
  const {
    formData,
    errors,
    handleChange,
    handleSubmit,
    loading,
    error,
    success,
  } = useForm(
    { year: "", month: "", other_expenses: "" },
    validateMonthlyFinance
  );

  const months = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `${i + 1}`,
  }));

  return (
    <form onSubmit={(e) => handleSubmit(e, "/monthly-finances")}>

      <Input
        label="Año"
        name="year"
        type="number"
        value={formData.year}
        onChange={handleChange}
        error={errors.year}
        hint={errors.year}
      />

      <Select
        label="Mes"
        name="month"
        value={formData.month}
        onChange={handleChange}
        options={months}
        error={errors.month}
      />

      <Input
        label="Otros Gastos"
        name="other_expenses"
        type="number"
        value={formData.other_expenses}
        onChange={handleChange}
      />

      <SubmitButton loading={loading} text="Generar Cierre" />

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Cierre generado</p>}
    </form>
  );
}