import { useEffect, useState } from "react";
import useForm from "../hooks/useForm";
import Select from "../components/form/Select";
import Input from "../components/form/Input";
import Button from "../components/ui/Button";
import { isAdmin } from "../utils/auth";

import { teacherService } from "../services/teacher.service";
import { ScheduleService } from "../services/schedule.service";

export default function ScheduleForm({ initialData = {}, isEdit = false }) {
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

    if (!data.teacher_id) errors.teacher_id = "Profesor requerido";
    if (!data.start_time) errors.start_time = "Hora requerida";
    if (!data.day) errors.day = "Día requerido";
    if (!data.classroom) errors.classroom = "Aula requerida";

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
      start_time: initialData.start_time || "",
      day: initialData.day || "",
      classroom: initialData.classroom || "",
    },
    validate
  );

  const submitFn = async (data) => {
    if (isEdit) {
      return await ScheduleService.update(initialData.id, data);
    } else {
      return await ScheduleService.create(data);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, submitFn)}>
  
      <Select
        label="Profesor"
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
        label="Hora inicio"
        name="start_time"
        type="time"
        value={formData.start_time}
        onChange={handleChange}
        error={errors.start_time}
        hint={errors.start_time}
      />

      
      <Select
        label="Día"
        name="day"
        value={formData.day}
        onChange={handleChange}
        options={[
          { value: "lunes", label: "Lunes" },
          { value: "martes", label: "Martes" },
          { value: "miercoles", label: "Miércoles" },
          { value: "jueves", label: "Jueves" },
          { value: "viernes", label: "Viernes" },
          { value: "sabado", label: "Sábado" },
        ]}
        error={errors.day}
        hint={errors.day}
      />

      
      <Input
        label="Aula"
        name="classroom"
        value={formData.classroom}
        onChange={handleChange}
        error={errors.classroom}
        hint={errors.classroom}
      />

      <Button>
        loading={loading}
        text={isEdit ? "Actualizar Horario" : "Crear Horario"}
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