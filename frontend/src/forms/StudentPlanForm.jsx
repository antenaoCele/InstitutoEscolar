import { useEffect, useState } from "react";
import useForm from "../hooks/useForm";
import Input from "../components/form/Input";
import Select from "../components/form/Select";
import SubmitButton from "../components/form/SubmitButton";

//Rama, validamos de nuevo para mejorar experiencia de usuario.
//No es por seguridad, eso lo hacemos en el Backend.
//Aquí solo vamos a validar cosas simples, para no estar yendo a la base de datos.
const validateStudentPlan = (data) => {
  const errors = {};

  if (!data.student_id) errors.student_id = "Requerido";
  if (!data.plan_id) errors.plan_id = "Requerido";
  if (!data.teacher_id) errors.teacher_id = "Requerido";

  if (!data.start_date) errors.start_date = "Requerido";

  if (data.end_date && data.end_date < data.start_date) {
    errors.end_date = "Debe ser posterior a inicio";
  }

  return errors;
};

export default function StudentPlanForm() {
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
      student_id: "",
      plan_id: "",
      teacher_id: "",
      start_date: "",
      end_date: "",
    },
    validateStudentPlan
  );

  const [students, setStudents] = useState([]);
  const [plans, setPlans] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [s, p, t] = await Promise.all([
          fetch("http://localhost:3000/students", { headers }),
          fetch("http://localhost:3000/plans", { headers }),
          fetch("http://localhost:3000/teachers", { headers }),
        ]);

        const sData = await s.json();
        const pData = await p.json();
        const tData = await t.json();

        setStudents(sData.data || []);
        setPlans(pData.data || []);
        setTeachers(tData.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [token]);

  return (
    <form onSubmit={(e) => handleSubmit(e, "/student_plans")}>

      <Select
        label="Alumno"
        name="student_id"
        value={formData.student_id}
        onChange={handleChange}
        options={students}
        getLabel={(s) => `${s.first_name} ${s.last_name}`}
        error={errors.student_id}
      />

      <Select
        label="Plan"
        name="plan_id"
        value={formData.plan_id}
        onChange={handleChange}
        options={plans}
        getLabel={(p) => p.name || `Plan ${p.id}`}
        error={errors.plan_id}
      />

      <Select
        label="Profesor"
        name="teacher_id"
        value={formData.teacher_id}
        onChange={handleChange}
        options={teachers}
        getLabel={(t) => `${t.first_name} ${t.last_name}`}
        error={errors.teacher_id}
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
        error={errors.end_date}
        hint={errors.end_date}
      />

      <SubmitButton loading={loading} text="Guardar Plan del Alumno" />

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Guardado correctamente</p>}
    </form>
  );
}