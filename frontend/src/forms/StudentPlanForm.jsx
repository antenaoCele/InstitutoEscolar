import { useEffect, useState } from "react";
import useForm from "../hooks/useForm";
import Select from "../components/form/Select";
import Input from "../components/form/Input";
import SubmitButton from "../components/form/SubmitButton";
import api from "../utils/api";
import { isAdmin } from "../utils/auth";

export default function StudentPlanForm({ initialData = {}, isEdit = false }) {
  if (!isAdmin()) {
    return <p className="text-red-500">No autorizado</p>;
  }

  const [students, setStudents] = useState([]);
  const [plans, setPlans] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, p, t] = await Promise.all([
          api.get("/students"),
          api.get("/plans"),
          api.get("/teachers"),
        ]);

        setStudents(s.data);
        setPlans(p.data);
        setTeachers(t.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const validate = (data) => {
    const errors = {};

    if (!isEdit) {
      if (!data.student_id) errors.student_id = "Alumno requerido";
      if (!data.plan_id) errors.plan_id = "Plan requerido";
      if (!data.teacher_id) errors.teacher_id = "Docente requerido";
      if (!data.start_date) errors.start_date = "Fecha de inicio requerida";
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
      student_id: initialData.student_id || "",
      plan_id: initialData.plan_id || "",
      teacher_id: initialData.teacher_id || "",
      start_date: initialData.start_date || "",
      end_date: initialData.end_date || "",
    },
    validate
  );

  const endpoint = isEdit
    ? `/student_plans/${initialData.id}`
    : "/student_plans";

  const method = isEdit ? "PUT" : "POST";

  return (
    <form onSubmit={(e) => handleSubmit(e, endpoint, method)}>
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
        label="Fecha de inicio"
        name="start_date"
        type="date"
        value={formData.start_date}
        onChange={handleChange}
        error={errors.start_date}
        hint={errors.start_date}
      />

      <Input
        label="Fecha de fin"
        name="end_date"
        type="date"
        value={formData.end_date}
        onChange={handleChange}
      />

      <SubmitButton
        loading={loading}
        text={isEdit ? "Actualizar Plan del Alumno" : "Asignar Plan"}
      />

      {error && <p className="text-red-500">{error}</p>}
      {success && (
        <p className="text-green-500">
          {isEdit ? "Actualizado correctamente" : "Creado correctamente"}
        </p>
      )}
    </form>
  );
}