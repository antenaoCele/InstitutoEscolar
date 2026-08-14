import { useCallback, useEffect, useState } from "react";

// Services
import { planService } from "../../services/plan.service";
import { PlanPriceService } from "../../services/PlanPrice.service";
import { PlanSubjectService } from "../../services/PlanSubject.service";
import { subjectService } from "../../services/subject.service";
import { teacherService } from "../../services/teacher.service";
import { teacherPlansService } from "../../services/teacherPlans.service";

// Validaciones
import { mapErrors } from "../../validators/helpers/errorHelpers";
import { validatePlanForm } from "../../validators/entities/plans.validator";

// Hooks compartidos
import { useFeedbackModal } from "../shared/useFeedBackModal";

export function usePlans() {
  // ======================================================
  // DATOS
  // ======================================================
  const [planPrices, setPlanPrices] = useState([]);
  const [currentPlans, setCurrentPlans] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [allPlanSubjects, setAllPlanSubjects] = useState([]);

  // ======================================================
  // MODALES
  // ======================================================
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);
  const [openTeachersModal, setOpenTeachersModal] = useState(false);

  // ======================================================
  // FORMULARIO
  // ======================================================
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [price, setPrice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ======================================================
  // PLAN SELECCIONADO PARA EDICIÓN
  // ======================================================
  const [selectedPlanPrice, setSelectedPlanPrice] = useState(null);

  // ======================================================
  // PLAN SELECCIONADO PARA HISTORIAL
  // ======================================================
  const [selectedPlanForHistory, setSelectedPlanForHistory] = useState(null);

  // ======================================================
  // PLAN SELECCIONADO PARA DOCENTES
  // ======================================================
  const [selectedPlanTeachers, setSelectedPlanTeachers] = useState(null);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);

  // ======================================================
  // ERRORES
  // ======================================================
  const [errorsCreate, setErrorsCreate] = useState({});
  const [errorsEdit, setErrorsEdit] = useState({});

  // ======================================================
  // FEEDBACK
  // ======================================================
  const { feedbackModal, showFeedback, closeFeedback } = useFeedbackModal();

  // ======================================================
  // FETCH
  // ======================================================

  const fetchPlanPrices = useCallback(async () => {
    try {
      const response = await PlanPriceService.getAll();

      setPlanPrices(response.data.data || []);
    } catch (error) {
      console.error(error);
      setPlanPrices([]);
    }
  }, []);

  const fetchCurrentPlans = useCallback(async () => {
    try {
      const response = await planService.getCurrent();

      setCurrentPlans(response.data.data || []);
    } catch (error) {
      console.error(error);
      setCurrentPlans([]);
    }
  }, []);

  const fetchSubjects = useCallback(async () => {
    try {
      const response = await subjectService.getAll();

      setSubjects(response.data.data || []);
    } catch (error) {
      console.error(error);
      setSubjects([]);
    }
  }, []);

  const fetchTeachers = useCallback(async () => {
    try {
      const response = await teacherService.getAll({
        active: true,
      });

      setTeachers(response.data.data || []);
    } catch (error) {
      console.error(error);
      setTeachers([]);
    }
  }, []);

  const fetchAllPlanSubjects = useCallback(async () => {
    try {
      const response = await PlanSubjectService.getAll();

      setAllPlanSubjects(response.data.data || []);
    } catch (error) {
      console.error(error);
      setAllPlanSubjects([]);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchPlanPrices(),
      fetchCurrentPlans(),
      fetchSubjects(),
      fetchTeachers(),
      fetchAllPlanSubjects(),
    ]);
  }, [
    fetchPlanPrices,
    fetchCurrentPlans,
    fetchSubjects,
    fetchTeachers,
    fetchAllPlanSubjects,
  ]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // ======================================================
  // FUNCIONES AUXILIARES
  // ======================================================
  const getActivePlanPrice = (planId) => {
    const pricesForPlan = planPrices.filter((pp) => pp.plan_id === planId);

    if (pricesForPlan.length === 0) {
      return null;
    }

    const activeWithoutEndDate = pricesForPlan.find((pp) => !pp.end_date);

    if (activeWithoutEndDate) {
      return activeWithoutEndDate;
    }

    return [...pricesForPlan].sort(
      (a, b) => new Date(b.start_date) - new Date(a.start_date),
    )[0];
  };

  // ======================================================
  // MATERIAS
  // ======================================================
  const handleSubjectCheckbox = (subjectId, checked) => {
    if (checked) {
      setSelectedSubjects((prev) => [...prev, subjectId]);
    } else {
      setSelectedSubjects((prev) => prev.filter((id) => id !== subjectId));
    }
  };

  // ======================================================
  // RESET
  // ======================================================
  const resetForm = () => {
    setSelectedPlan("");
    setSelectedSubjects([]);
    setPrice("");
    setStartDate("");
    setEndDate("");

    setSelectedPlanPrice(null);

    setErrorsCreate({});
    setErrorsEdit({});
  };

  // ======================================================
  // CERRAR MODALES
  // ======================================================
  const closeCreateModal = () => {
    setOpenCreateModal(false);
    resetForm();
  };

  const closeEditModal = () => {
    setOpenEditModal(false);
    resetForm();
  };

  const closeHistoryModal = () => {
    setOpenHistoryModal(false);
    setSelectedPlanForHistory(null);
  };

  const closeTeachersModal = () => {
    setOpenTeachersModal(false);
    setSelectedTeacherIds([]);
    setSelectedPlanTeachers(null);
  };

  // ======================================================
  // CREAR
  // ======================================================
  const openCreate = () => {
    resetForm();
    setOpenCreateModal(true);
  };

  const handleCreate = async () => {
    const errors = validatePlanForm({
      plan: selectedPlan,
      subjects: selectedSubjects,
      price,
      startDate,
      endDate,
    });

    if (Object.keys(errors).length > 0) {
      setErrorsCreate(errors);
      return;
    }

    try {
      setErrorsCreate({});

      const planResponse = await planService.create({
        name: selectedPlan,
      });

      const newPlanId = planResponse.data.data?.id || planResponse.data.id;

      if (!newPlanId) {
        throw new Error("No se pudo obtener el ID del nuevo plan");
      }

      for (const subjectId of selectedSubjects) {
        await PlanSubjectService.create({
          plan_id: newPlanId,
          subject_id: subjectId,
        });
      }

      await PlanPriceService.create({
        plan_id: newPlanId,
        price: Number(price),
        start_date: startDate,
        end_date: endDate.trim() || null,
      });

      closeCreateModal();

      await refreshAll();

      showFeedback("Plan creado correctamente.", "success");
    } catch (error) {
      console.error(error.response?.data || error.message);

      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        setErrorsCreate(mapErrors(backendErrors));
      } else {
        showFeedback(
          error.response?.data?.message || "Error al crear el plan.",
          "error",
        );
      }
    }
  };

  // ======================================================
  // EDITAR
  // ======================================================
  const handleEdit = (planPrice) => {
    setSelectedPlanPrice(planPrice);

    setSelectedPlan(planPrice.plan_name || "");
    setPrice(planPrice.price ? String(planPrice.price) : "");

    const subjectsForThisPlan = allPlanSubjects
      .filter((ps) => ps.plan_id === planPrice.plan_id)
      .map((ps) => ps.subject_id);

    setSelectedSubjects(subjectsForThisPlan);

    setErrorsEdit({});
    setOpenEditModal(true);
  };

  const handleEditPlan = (planRow) => {
    const activePrice = getActivePlanPrice(planRow.id);

    if (!activePrice) {
      alert("Este plan no tiene un precio activo registrado.");
      return;
    }

    handleEdit({
      ...activePrice,
      plan_name: activePrice.plan_name || planRow.name,
    });
  };

  const handleUpdate = async () => {
    const errors = validatePlanForm({
      plan: selectedPlan,
      subjects: selectedSubjects,
      price,
    });

    if (Object.keys(errors).length > 0) {
      setErrorsEdit(errors);
      return;
    }

    const priceChanged = Number(price) !== Number(selectedPlanPrice.price);

    try {
      setErrorsEdit({});

      // Actualizar nombre del plan
      await planService.update(selectedPlanPrice.plan_id, {
        name: selectedPlan,
      });

      // Actualizar precio si cambió
      if (priceChanged) {
        await PlanPriceService.changePrice(selectedPlanPrice.plan_id, {
          price: Number(price),
        });
      }

      // Materias actuales del plan
      const currentPlanSubjects = allPlanSubjects.filter(
        (ps) => ps.plan_id === selectedPlanPrice.plan_id,
      );

      const currentSubjectIds = currentPlanSubjects.map((ps) => ps.subject_id);

      // Materias nuevas
      const subjectsToAdd = selectedSubjects.filter(
        (subjectId) => !currentSubjectIds.includes(subjectId),
      );

      // Materias eliminadas
      const currentSelectedSubjectIds = new Set(selectedSubjects);

      const subjectsToRemove = currentSubjectIds.filter(
        (subjectId) => !currentSelectedSubjectIds.has(subjectId),
      );

      // Agregar materias
      for (const subjectId of subjectsToAdd) {
        await PlanSubjectService.create({
          plan_id: selectedPlanPrice.plan_id,
          subject_id: subjectId,
        });
      }

      // Eliminar materias
      for (const subjectId of subjectsToRemove) {
        const planSubjectRelation = currentPlanSubjects.find(
          (ps) => ps.subject_id === subjectId,
        );

        if (planSubjectRelation) {
          await PlanSubjectService.delete(planSubjectRelation.id);
        }
      }

      closeEditModal();

      await refreshAll();

      showFeedback(
        priceChanged
          ? "El plan fue actualizado correctamente.\n\n" +
              "Recuerde que podrá corregir el precio únicamente durante el día de hoy. " +
              "Desde mañana este precio quedará definitivo y las futuras actualizaciones " +
              "solo podrán efectuarse entre los días 1 y 5 de cada mes."
          : "El plan fue actualizado correctamente.",
        "success",
      );
    } catch (error) {
      console.error(error.response?.data || error.message);

      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        setErrorsEdit(mapErrors(backendErrors));
      } else {
        showFeedback(
          error.response?.data?.message || "Error al editar el plan.",
          "error",
        );
      }
    }
  };

  // ======================================================
  // DOCENTES
  // ======================================================
  const handleManageTeachers = async (plan) => {
    try {
      const { data } = await teacherPlansService.getByPlan(plan.id);

      setSelectedPlanTeachers(plan);

      setSelectedTeacherIds((data.data || []).map((row) => row.teacher_id));

      setOpenTeachersModal(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTeacherCheckbox = (teacherId, checked) => {
    if (checked) {
      setSelectedTeacherIds((prev) => [...prev, teacherId]);
    } else {
      setSelectedTeacherIds((prev) => prev.filter((id) => id !== teacherId));
    }
  };

  const handleSaveTeachers = async () => {
    try {
      await teacherPlansService.updateByPlan(selectedPlanTeachers.id, {
        teacher_ids: selectedTeacherIds,
      });

      await fetchCurrentPlans();

      closeTeachersModal();

      showFeedback("Docente/s asignado/s correctamente.", "success");
    } catch (error) {
      console.error(error);
    }
  };

  // ======================================================
  // HISTORIAL
  // ======================================================
  const handleOpenHistory = (planRow) => {
    setSelectedPlanForHistory(planRow);
    setOpenHistoryModal(true);
  };

  const historyForSelectedPlan = selectedPlanForHistory
    ? planPrices
        .filter((pp) => pp.plan_id === selectedPlanForHistory.id)
        .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
    : [];

  // ======================================================
  // HANDLES DEL FORMULARIO
  // ======================================================
  const handlePlanChange = (value) => {
    setSelectedPlan(value);
  };

  const handlePriceChange = (value) => {
    setPrice(value);
  };

  const handleStartDateChange = (value) => {
    setStartDate(value);
  };

  const handleEndDateChange = (value) => {
    setEndDate(value);
  };

  // ======================================================
  // RETURN
  // ======================================================
  return {
    // Datos
    currentPlans,
    subjects,
    teachers,
    allPlanSubjects,

    // Formulario
    selectedPlan,
    handlePlanChange,

    selectedSubjects,
    handleSubjectCheckbox,

    price,
    handlePriceChange,

    startDate,
    handleStartDateChange,

    endDate,
    handleEndDateChange,

    // Historial
    selectedPlanForHistory,
    historyForSelectedPlan,

    // Docentes
    selectedPlanTeachers,
    selectedTeacherIds,

    // Errores
    errorsCreate,
    errorsEdit,

    // Modales
    openCreateModal,
    openEditModal,
    openHistoryModal,
    openTeachersModal,

    closeCreateModal,
    closeEditModal,
    closeHistoryModal,
    closeTeachersModal,

    // Feedback
    feedbackModal,
    closeFeedback,

    // Crear
    openCreate,
    handleCreate,

    // Editar
    handleEditPlan,
    handleUpdate,

    // Docentes
    handleManageTeachers,
    handleTeacherCheckbox,
    handleSaveTeachers,

    // Historial
    handleOpenHistory,

    // General
    resetForm,
  };
}
