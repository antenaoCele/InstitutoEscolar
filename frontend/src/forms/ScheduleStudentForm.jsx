import { useEffect, useState } from "react";
import useForm from "../hooks/useForm";
import Select from "../components/form/Select";
import Button from "../components/ui/Button";
import { isAdmin } from "../utils/auth";

import { scheduleService } from "../services/schedule.service";
import { studentService } from "../services/student.service";
import { ScheduleStudentService } from "../services/scheduleStudent.service";

export default function ScheduleStudentForm({
  initialData = {},
  isEdit = false,
}) {
  if (!isAdmin()) {
    return <p className="text-red-500">No autorizado</p>;
  }

  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sc, st] = await Promise.all([
          scheduleService.getAll(),
          studentService.getAll(),
        ]);

        setSchedules(sc.data);
        setStudents(st.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const validate = (data) => {
    const errors = {};

    if (!data.schedule_id) errors.schedule_id = "Horario requerido";
    if (!data.student_id) errors.student_id = "Alumno requerido";

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
      schedule_id: initialData.schedule_id || "",
      student_id: initialData.student_id || "",
    },
    validate,
  );

  const submitFn = async (data) => {
    if (isEdit) {
      return await ScheduleStudentService.update(initialData.id, data);
    } else {
      return await ScheduleStudentService.create(data);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, submitFn)}>
      <Select
        label="Horario"
        name="schedule_id"
        value={formData.schedule_id}
        onChange={handleChange}
        options={schedules.map((sc) => ({
          value: sc.id,
          label: `${sc.day} ${sc.start_time} - ${sc.end_time}`,
        }))}
        error={errors.schedule_id}
        hint={errors.schedule_id}
      />

      <Select
        label="Alumno"
        name="student_id"
        value={formData.student_id}
        onChange={handleChange}
        options={students.map((st) => ({
          value: st.id,
          label: `${st.first_name} ${st.last_name}`,
        }))}
        error={errors.student_id}
        hint={errors.student_id}
      />

      <Button>
        loading={loading}
        text={isEdit ? "Actualizar Asignación" : "Asignar Alumno"}
      </Button>

      {error && <p className="text-red-500">{error}</p>}
      {success && (
        <p className="text-green-500">
          {isEdit ? "Actualizado correctamente" : "Asignado correctamente"}
        </p>
      )}
    </form>
  );
}
