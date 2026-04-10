import useForm from "../hooks/useForm";
import Input from "../components/form/Input";
import SubmitButton from "../components/form/SubmitButton";

const validateEnrollment = (data) => {
  const errors = {};
  if (!data.student_id) errors.student_id = "Requerido";
  if (!data.amount) errors.amount = "Requerido";
  if (!data.payment_date) errors.payment_date = "Requerido";
  return errors;
};

export default function EnrollmentForm() {
  const {
    formData,
    errors,
    handleChange,
    handleSubmit,
    loading,
    error,
    success,
  } = useForm(
    { student_id: "", amount: "", payment_date: "" },
    validateEnrollment
  );

  return (
    <form onSubmit={(e) => handleSubmit(e, "/enrollments")}>
      <Input label="ID Estudiante" name="student_id"
        value={formData.student_id} onChange={handleChange}
        error={errors.student_id} hint={errors.student_id} />

      <Input label="Monto" name="amount" type="number"
        value={formData.amount} onChange={handleChange}
        error={errors.amount} hint={errors.amount} />

      <Input label="Fecha" name="payment_date" type="date"
        value={formData.payment_date} onChange={handleChange}
        error={errors.payment_date} hint={errors.payment_date} />

      <SubmitButton loading={loading} text="Guardar Inscripción" />

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Guardado correctamente</p>}
    </form>
  );
}