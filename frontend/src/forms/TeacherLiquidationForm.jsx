import { useEffect, useState } from "react";
import useForm from "../hooks/useForm";
import Input from "../components/form/Input";
import Select from "../components/form/Select";
import SubmitButton from "../components/form/SubmitButton";
import { isAdmin } from "../utils/auth";

import { teacherService } from "../services/teacher.service";
import { teacherLiquidationService } from "../services/teacherLiquidation.service";

export default function TeacherLiquidationForm({
  initialData = {},
  isEdit = false,
}) {
  if (!isAdmin()) {
    return <p className="text-red-500">No autorizado</p>;
  }

  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await teacherService.getAll();
        setTeachers(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTeachers();
  }, []);

  const validate = (data) => {
    const errors = {};

    if (!isEdit) {
      if (!data.teacher_id) errors.teacher_id = "Docente requerido";
      if (!data.month) errors.month = "Mes requerido";
      if (!data.total_collected) errors.total_collected = "Requerido";
      if (!data.net_salary) errors.net_salary = "Requerido";
    }

    if (data.month) {
      const month = Number(data.month);
      if (month < 1 || month > 12) {
        errors.month = "Mes inválido (1-12)";
      }
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
      teacher_id: initialData.teacher_id || "",
      month: initialData.month || "",
      total_collected: initialData.total_collected || "",
      net_salary: initialData.net_salary || "",
    },
    validate,
  );

  const submitFn = async (data) => {
    if (isEdit) {
      return await teacherLiquidationService.update(initialData.id, data);
    } else {
      return await teacherLiquidationService.create(data);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, submitFn)}>
      <Select
        label="Docente"
        name="teacher_id"
        value={formData.teacher_id}
        onChange={handleChange}
        options={teachers.map((t) => ({
          value: t.id,
          label: `${t.first_name} ${t.last_name}`,
        }))}
        error={errors.teacher_id}
        hint={errors.teacher_id}
      />

      <Input
        label="Mes (1-12)"
        name="month"
        type="number"
        value={formData.month}
        onChange={handleChange}
        error={errors.month}
        hint={errors.month}
      />

      <Input
        label="Total Recaudado"
        name="total_collected"
        type="number"
        value={formData.total_collected}
        onChange={handleChange}
        error={errors.total_collected}
        hint={errors.total_collected}
      />

      <Input
        label="Salario Neto"
        name="net_salary"
        type="number"
        value={formData.net_salary}
        onChange={handleChange}
        error={errors.net_salary}
        hint={errors.net_salary}
      />

      <SubmitButton
        loading={loading}
        text={isEdit ? "Actualizar Liquidación" : "Guardar Liquidación"}
      />

      {error && <p className="text-red-500">{error}</p>}

      {success && (
        <p className="text-green-500">
          {isEdit ? "Actualizado correctamente" : "Guardado correctamente"}
        </p>
      )}
    </form>
  );
}
