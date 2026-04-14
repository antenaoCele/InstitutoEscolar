import { useEffect, useState } from "react";
import useForm from "../hooks/useForm";
import Select from "../components/form/Select";
import SubmitButton from "../components/form/SubmitButton";
import api from "../utils/api";
import { isAdmin } from "../utils/auth";

export default function TeacherSubjectForm() {
  if (!isAdmin()) {
    return <p className="text-red-500">No autorizado</p>;
  }

  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [t, s] = await Promise.all([
          api.get("/teachers"),
          api.get("/subjects"),
        ]);

        setTeachers(t.data);
        setSubjects(s.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const validate = (data) => {
    const errors = {};

    if (!data.teacher_id) errors.teacher_id = "Docente requerido";
    if (!data.subject_id) errors.subject_id = "Materia requerida";

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
      teacher_id: "",
      subject_id: "",
    },
    validate
  );

  return (
    <form onSubmit={(e) => handleSubmit(e, "/teacher_subjects")}>
      
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

      <Select
        label="Materia"
        name="subject_id"
        value={formData.subject_id}
        onChange={handleChange}
        options={subjects.map((s) => ({
          value: s.id,
          label: s.name,
        }))}
        error={errors.subject_id}
        hint={errors.subject_id}
      />

      <SubmitButton loading={loading} text="Asignar Materia" />

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Guardado correctamente</p>}
    </form>
  );
}