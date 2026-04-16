import { useEffect, useState } from "react";
import useForm from "../hooks/useForm";
import Select from "../components/form/Select";
import Button from "../components/ui/Button";
import { isAdmin } from "../utils/auth";

import { studentPlanService } from "../services/studentPlan.service";
import { PaymentService } from "../services/payment.service";

export default function PaymentForm({ initialData = {}, isEdit = false }) {
  if (!isAdmin()) {
    return <p className="text-red-500">No autorizado</p>;
  }

  const [studentPlans, setStudentPlans] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await studentPlanService.getAll();
        setStudentPlans(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const validate = (data) => {
    const errors = {};

    if (!data.student_plan_id)
      errors.student_plan_id = "Plan requerido";

    if (!data.amount)
      errors.amount = "Monto requerido";

    if (!data.payment_date)
      errors.payment_date = "Fecha requerida";

    if (!data.payment_method)
      errors.payment_method = "Método requerido";

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
      student_plan_id: initialData.student_plan_id || "",
      amount: initialData.amount || "",
      payment_date: initialData.payment_date || "",
      payment_method: initialData.payment_method || "",
    },
    validate
  );

  const submitFn = async (data) => {
    if (isEdit) {
      return await PaymentService.update(initialData.id, data);
    } else {
      return await PaymentService.create(data);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, submitFn)}>
      
      <Select
        label="Plan del alumno"
        name="student_plan_id"
        value={formData.student_plan_id}
        onChange={handleChange}
        options={studentPlans.map((sp) => ({
          value: sp.id,
          label: `Alumno ${sp.student_id} - Profe ${sp.teacher_id}`,
        }))}
        error={errors.student_plan_id}
        hint={errors.student_plan_id}
      />

     
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Monto</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
        />
        {errors.amount && (
          <p className="text-xs text-red-500">{errors.amount}</p>
        )}
      </div>

      
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">
          Fecha de pago
        </label>
        <input
          type="date"
          name="payment_date"
          value={formData.payment_date}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
        />
        {errors.payment_date && (
          <p className="text-xs text-red-500">
            {errors.payment_date}
          </p>
        )}
      </div>

      
      <Select
        label="Método de pago"
        name="payment_method"
        value={formData.payment_method}
        onChange={handleChange}
        options={[
          { value: "cash", label: "Efectivo" },
          { value: "transfer", label: "Transferencia" },
          { value: "card", label: "Tarjeta" },
        ]}
        error={errors.payment_method}
        hint={errors.payment_method}
      />

      <Button>
        loading={loading}
        text={isEdit ? "Actualizar Pago" : "Registrar Pago"}
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