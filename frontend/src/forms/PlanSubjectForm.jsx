import { useEffect, useState } from "react";
import useForm from "../hooks/useForm";
import Select from "../components/form/Select";
import Button from "../components/ui/Button";
import { isAdmin } from "../utils/auth";

import { planService } from "../services/plan.service";
import { subjectService } from "../services/subject.service";
import { PlanSubjectService } from "../services/planSubject.service";

export default function PlanSubjectForm({ initialData = {}, isEdit = false }) {
  if (!isAdmin()) {
    return <p className="text-red-500">No autorizado</p>;
  }

  const [plans, setPlans] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, s] = await Promise.all([
          planService.getAll(),
          subjectService.getAll(),
        ]);

        setPlans(p.data);
        setSubjects(s.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const validate = (data) => {
    const errors = {};

    if (!data.plan_id) errors.plan_id = "Plan requerido";
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
      plan_id: initialData.plan_id || "",
      subject_id: initialData.subject_id || "",
    },
    validate
  );

  const submitFn = async (data) => {
    if (isEdit) {
      return await PlanSubjectService.update(initialData.id, data);
    } else {
      return await PlanSubjectService.create(data);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, submitFn)}>
      
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

      <Button>
         loading={loading}
        text={isEdit ? "Actualizar Relación" : "Asignar Materia"}
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