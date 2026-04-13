import { useEffect, useState } from "react";
import useForm from "../hooks/useForm";
import Select from "../components/form/Select";
import SubmitButton from "../components/form/SubmitButton";

export default function StudentTutorForm() {
  const {
    formData,
    setFormData,
    handleSubmit,
    loading,
    error,
    success,
  } = useForm({
    student_id: "",
    tutor_id: "",
  });

  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetchTutors();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch("http://localhost:3000/students");
      const data = await res.json();
      setStudents(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTutors = async () => {
    try {
      const res = await fetch("http://localhost:3000/tutors");
      const data = await res.json();
      setTutors(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, "/student_tutors")}>
      
      <Select
        label="Alumno"
        value={formData.student_id}
        onChange={(value) =>
          setFormData((prev) => ({ ...prev, student_id: value }))
        }
        options={students}
        getOptionLabel={(s) => `${s.first_name} ${s.last_name}`}
        getOptionValue={(s) => s.id}
      />

      <Select
        label="Tutor"
        value={formData.tutor_id}
        onChange={(value) =>
          setFormData((prev) => ({ ...prev, tutor_id: value }))
        }
        options={tutors}
        getOptionLabel={(t) => `${t.first_name} ${t.last_name}`}
        getOptionValue={(t) => t.id}
      />

      <SubmitButton loading={loading} text="Asignar Tutor" />

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Guardado correctamente</p>}
    </form>
  );
}