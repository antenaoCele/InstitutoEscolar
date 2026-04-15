import useForm from "../hooks/useForm";
import Input from "../components/form/Input";
import Select from "../components/form/Select";
import Button from "../components/ui/Button";
import { isAdmin } from "../utils/auth";
import { MonthlyFinanceService } from "../services/monthlyFinance.service";

export default function MonthlyFinanceForm({ initialData = {}, isEdit = false }) {
  if (!isAdmin()) {
    return <p className="text-red-500">No autorizado</p>;
  }

  const validate = (data) => {
    const errors = {};

    if (!data.year) errors.year = "Año requerido";
    if (!data.month) errors.month = "Mes requerido";

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
      year: initialData.year || "",
      month: initialData.month || "",
      other_expenses: initialData.other_expenses || "",
    },
    validate
  );

  const submitFn = async (data) => {
    if (isEdit) {
      return await MonthlyFinanceService.update(initialData.id, data);
    } else {
      return await MonthlyFinanceService.create(data);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, submitFn)}>
    
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
        options={[
          { value: 1, label: "Enero" },
          { value: 2, label: "Febrero" },
          { value: 3, label: "Marzo" },
          { value: 4, label: "Abril" },
          { value: 5, label: "Mayo" },
          { value: 6, label: "Junio" },
          { value: 7, label: "Julio" },
          { value: 8, label: "Agosto" },
          { value: 9, label: "Septiembre" },
          { value: 10, label: "Octubre" },
          { value: 11, label: "Noviembre" },
          { value: 12, label: "Diciembre" },
        ]}
        error={errors.month}
        hint={errors.month}
      />

      <Input
        label="Gastos adicionales"
        name="other_expenses"
        type="number"
        value={formData.other_expenses}
        onChange={handleChange}
      />

      <Button>
        loading={loading}
        text={isEdit ? "Actualizar Cierre" : "Generar Cierre Mensual"}
      </Button>
        
      

      {error && <p className="text-red-500">{error}</p>}
      {success && (
        <p className="text-green-500">
          {isEdit
            ? "Actualizado correctamente"
            : "Cierre generado correctamente"}
        </p>
      )}
    </form>
  );
}