import useForm from "../hooks/useForm";
import Input from "../components/form/Input";
import Select from "../components/form/Select";
import SubmitButton from "../components/form/SubmitButton";

const validatePayment = (data) => {
  const errors = {};
  if (!data.student_plan_id) errors.student_plan_id = "Requerido";
  if (!data.amount) errors.amount = "Requerido";
  if (!data.payment_date) errors.payment_date = "Requerido";
  if (!data.payment_method) errors.payment_method = "Requerido";
  return errors;
};

export default function PaymentForm() {
  const {
    formData,
    errors,
    handleChange,
    handleSubmit,
    loading,
    error,
    success,
  } = useForm(
    { student_plan_id: "", amount: "", payment_date: "", payment_method: "" },
    validatePayment
  );

  const methods = [
    { id: "efectivo", name: "Efectivo" },
    { id: "transferencia", name: "Transferencia" },
    { id: "tarjeta", name: "Tarjeta" },
  ];

  return (
    <form onSubmit={(e) => handleSubmit(e, "/payments")}>

      <Input
        label="Student Plan ID"
        name="student_plan_id"
        value={formData.student_plan_id}
        onChange={handleChange}
        error={errors.student_plan_id}
        hint={errors.student_plan_id}
      />

      <Input
        label="Monto"
        name="amount"
        type="number"
        value={formData.amount}
        onChange={handleChange}
        error={errors.amount}
        hint={errors.amount}
      />

      <Input
        label="Fecha"
        name="payment_date"
        type="date"
        value={formData.payment_date}
        onChange={handleChange}
        error={errors.payment_date}
        hint={errors.payment_date}
      />

      <Select
        label="Método de Pago"
        name="payment_method"
        value={formData.payment_method}
        onChange={handleChange}
        options={methods}
        error={errors.payment_method}
      />

      <SubmitButton loading={loading} text="Registrar Pago" />

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Pago registrado</p>}
    </form>
  );
}