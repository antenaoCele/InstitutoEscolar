import { useEffect, useState } from "react";
import useForm from "../hooks/useForm";
import Select from "../components/form/Select";
import Button from "../components/ui/Button";
import { isAdmin } from "../utils/auth";

import { studentService } from "../services/student.service";
import { EnrollmentService } from "../services/enrollment.service";

export default function EnrollmentForm({ initialData = {}, isEdit = false }) {
  if (!isAdmin()) {
    return <p className="text-red-500">No autorizado</p>;
  }

  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await studentService.getAll();
        setStudents(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const validate = (data) => {
    const errors = {};

    if (!data.student_id) errors.student_id = "Alumno requerido";
    if (!data.amount) errors.amount = "Monto requerido";
    if (!data.payment_date) errors.payment_date = "Fecha requerida";

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
      student_id: initialData.student_id || "",
      amount: initialData.amount || "",
      payment_date: initialData.payment_date || "",
    },
    validate
  );

  const submitFn = async (data) => {
    if (isEdit) {
      return await EnrollmentService.update(initialData.id, data);
    } else {
      return await EnrollmentService.create(data);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, submitFn)}>
     
      <Select
        label="Alumno"
        name="student_id"
        value={formData.student_id}
        onChange={handleChange}
        options={students.map((s) => ({
          value: s.id,
          label: `${s.first_name} ${s.last_name}`,
        }))}
        error={errors.student_id}
        hint={errors.student_id}
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
          <p className="text-xs text-red-500">{errors.payment_date}</p>
        )}
      </div>

      <Button>
          loading={loading}
        text={isEdit ? "Actualizar Inscripción" : "Crear Inscripción"}
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