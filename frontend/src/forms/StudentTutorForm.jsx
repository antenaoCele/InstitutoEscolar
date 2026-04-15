import { useEffect, useState } from "react";
import useForm from "../hooks/useForm";
import Select from "../components/form/Select";
import SubmitButton from "../components/form/SubmitButton";
import api from "../utils/api";
import { isAdmin } from "../utils/auth";

export default function StudentTutorForm({ initialData = {}, isEdit = false }) {
  if (!isAdmin()) {
    return <p className="text-red-500">No autorizado</p>;
  }

  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, t] = await Promise.all([
          api.get("/students"),
          api.get("/tutors"),
        ]);

        setStudents(s.data);
        setTutors(t.data);
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
      if (!data.tutor_id) errors.tutor_id = "Tutor requerido";
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
      tutor_id: initialData.tutor_id || "",
    },
    validate
  );

  const endpoint = isEdit
    ? `/student_tutors/${initialData.id}`
    : "/student_tutors";

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
        label="Tutor"
        name="tutor_id"
        value={formData.tutor_id}
        onChange={handleChange}
        options={tutors.map((t) => ({
          value: t.id,
          label: `${t.first_name} ${t.last_name}`,
        }))}
        error={errors.tutor_id}
        hint={errors.tutor_id}
      />

      <SubmitButton
        loading={loading}
        text={isEdit ? "Actualizar Tutor" : "Asignar Tutor"}
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