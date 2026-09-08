import { useEffect, useState } from "react";

import { teacherService } from "../../../services/teacher.service";
import { ScheduleService } from "../../../services/schedule.service";
import { ScheduleStudentService } from "../../../services/scheduleStudent.service";
import { studentService } from "../../../services/student.service";

import { validateWeeklyCalendarForm } from "../../../validators/entities/weeklyCalendar.validator";

import { useFeedbackModal } from "../../shared/useFeedBackModal";

export default function useWeeklyCalendar() {
  // ======================================================
  // DATOS
  // ======================================================

  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [scheduleStudents, setScheduleStudents] = useState([]);

  // ======================================================
  // FILTROS DEL CALENDARIO
  // ======================================================

  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState("");

  // ======================================================
  // MODALES
  // ======================================================

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openInfoModal, setOpenInfoModal] = useState(false);

  const { feedbackModal, showFeedback, closeFeedback } = useFeedbackModal();

  // ======================================================
  // HORARIO SELECCIONADO
  // ======================================================

  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedScheduleInfo, setSelectedScheduleInfo] = useState(null);

  // ======================================================
  // FORMULARIO DEL HORARIO
  // ======================================================

  const [teacherId, setTeacherId] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [classroom, setClassroom] = useState("");

  // ======================================================
  // ESTUDIANTES DEL HORARIO
  // ======================================================

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [incompatibleStudents, setIncompatibleStudents] = useState([]);

  // ======================================================
  // ESTADO DEL COMPONENTE
  // ======================================================

  const [isEditing, setIsEditing] = useState(false);

  // ======================================================
  // ERRORES
  // ======================================================

  const [errorsCreate, setErrorsCreate] = useState({});
  const [errorsEdit, setErrorsEdit] = useState({});

  // ======================================================
  // CONSTANTES
  // ======================================================

  const days = [
    { name: "Lunes", value: 1 },
    { name: "Martes", value: 2 },
    { name: "Miércoles", value: 3 },
    { name: "Jueves", value: 4 },
    { name: "Viernes", value: 5 },
    { name: "Sábado", value: 6 },
  ];

  const classrooms = [
    { name: "Aula A", value: "A" },
    { name: "Aula B", value: "B" },
  ];

  const timeSlots = [
    "08:00 - 09:30",
    "09:30 - 11:00",
    "11:00 - 12:30",
    "15:00 - 16:30",
    "16:30 - 18:00",
    "18:00 - 19:30",
    "19:30 - 21:00",
    "21:00 - 22:30",
  ];

  // ======================================================
  // FETCH DATOS PRINCIPALES
  // ======================================================

  const fetchTeachers = async () => {
    try {
      const res = await teacherService.getAll({ active: true });

      const orderedTeachers = (res.data.data || []).sort(
        (a, b) =>
          a.last_name.localeCompare(b.last_name) ||
          a.first_name.localeCompare(b.first_name),
      );

      setTeachers(orderedTeachers);
    } catch (error) {
      console.error("ERROR TEACHERS", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await studentService.getActiveStudents();

      const uniqueStudents = [
        ...new Map(
          (res.data.data || []).map((student) => [student.id, student]),
        ).values(),
      ];

      const orderedStudents = uniqueStudents.sort(
        (a, b) =>
          a.last_name.localeCompare(b.last_name) ||
          a.first_name.localeCompare(b.first_name),
      );

      setStudents(orderedStudents);
    } catch (error) {
      console.error("ERROR STUDENTS", error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await ScheduleService.getAll();

      setSchedules(res.data.data || []);
    } catch (error) {
      console.error("ERROR SCHEDULES", error);
    }
  };

  const fetchScheduleStudents = async () => {
    try {
      const res = await ScheduleStudentService.getAll();

      setScheduleStudents(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  // ======================================================
  // FETCH AUXILIARES
  // ======================================================

  const fetchAvailableStudents = async (teacherId, planId) => {
    try {
      if (!teacherId) {
        setAvailableStudents([]);
        return;
      }

      const response = await teacherService.getAvailableStudents(
        teacherId,
        planId,
      );

      setAvailableStudents(
        (response.data.data || []).sort(
          (a, b) =>
            a.last_name.localeCompare(b.last_name) ||
            a.first_name.localeCompare(b.first_name),
        ),
      );
    } catch (error) {
      console.error(error);
      setAvailableStudents([]);
    }
  };

  const fetchAvailablePlans = async (teacherId) => {
    try {
      if (!teacherId) {
        setAvailablePlans([]);
        return;
      }

      const res = await teacherService.getAvailablePlans(teacherId);

      const orderedPlans = (res.data.data || []).sort((a, b) =>
        a.name.localeCompare(b.name),
      );

      setAvailablePlans(orderedPlans);
    } catch (error) {
      console.error(error);
      setAvailablePlans([]);
    }
  };

  const fetchScheduleInfo = async (id) => {
    try {
      const res = await ScheduleService.getInfo(id);

      setSelectedScheduleInfo(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  // ======================================================
  // RESETEO
  // ======================================================

  const resetForm = () => {
    // Formulario
    setTeacherId("");
    setSelectedPlan("");
    setSelectedDay("");
    setSelectedTime("");
    setClassroom("");

    // Estudiante
    setSelectedStudentId("");
    setSelectedStudents([]);

    // Datos auxiliares
    setAvailablePlans([]);
    setAvailableStudents([]);
    setIncompatibleStudents([]);

    // Errores
    setErrorsCreate({});
    setErrorsEdit({});
  };

  // ======================================================
  // FUNCIONES AUXILIARES
  // ======================================================

  const mapErrors = (errors) => {
    const formatted = {};

    errors.forEach((e) => {
      if (
        e.msg === "El horario se superpone con otro del mismo docente o aula."
      ) {
        formatted.start_time = e.msg;
      } else if (
        e.msg ===
        "El estudiante ya está inscripto en otra clase en ese mismo horario."
      ) {
        formatted.studentConflict = e.msg;
      } else if (e.msg === "La clase ya alcanzó el máximo de 5 estudiantes.") {
        formatted.general = e.msg;
      } else {
        formatted[e.path] = e.msg;
      }
    });

    return formatted;
  };

  // Valida el formulario y agrega el chequeo de plan por alumno
  const validateForm = () => {
    const newErrors = validateWeeklyCalendarForm({
      teacherId,
      selectedPlan,
      selectedDay,
      selectedTime,
      classroom,
      selectedStudents,
    });

    // El plan dejó de ser un campo del horario:
    // es solo un filtro.
    delete newErrors.plan_id;

    if (selectedStudents.some((student) => !student.plan_id)) {
      newErrors.students =
        "Hay estudiantes sin plan asignado. Quitalos y volvé a agregarlos.";
    }

    return newErrors;
  };

  // Devuelve el payload de estudiantes:
  // [{ id, plan_id }]
  const buildStudentsPayload = () =>
    selectedStudents.map((student) => ({
      id: student.id,
      plan_id: student.plan_id,
    }));

  // ======================================================
  // HANDLES CRUD
  // ======================================================

  const openCreate = () => {
    setIsEditing(false);

    resetForm();

    setOpenCreateModal(true);
  };

  const handleCreate = async () => {
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrorsCreate(newErrors);
      return;
    }

    try {
      setErrorsCreate({});

      await ScheduleService.create({
        teacher_id: teacherId,
        start_time: selectedTime,
        day: selectedDay,
        classroom,
        students: buildStudentsPayload(),
      });

      setOpenCreateModal(false);

      resetForm();

      await fetchSchedules();
      await fetchScheduleStudents();

      showFeedback("Horario creado correctamente.", "success");
    } catch (error) {
      console.error(error);

      const backendErrors = error.response?.data?.errors;

      if (backendErrors?.length) {
        setErrorsCreate(mapErrors(backendErrors));
      } else {
        showFeedback(
          error.response?.data?.message || "Error al crear el horario.",
          "error",
        );
      }
    }
  };

  const handleEdit = async (schedule) => {
    setIsEditing(true);
    setErrorsEdit({});
    setSelectedSchedule(schedule);

    // ======================================================
    // DATOS BÁSICOS DEL HORARIO
    // ======================================================

    const currentTeacherId = schedule.teacher_id;
    const currentDay = schedule.day;
    const currentStartTime = schedule.start_time?.slice(0, 5);
    const currentClassroom = schedule.classroom;

    // Docente
    setTeacherId(currentTeacherId);

    // Día
    setSelectedDay(currentDay);

    // Aula
    setClassroom(currentClassroom);

    // ======================================================
    // HORARIO
    // ======================================================

    // El Select trabaja con el bloque completo:
    // "08:00 - 09:30"
    //
    // El backend devuelve solamente la hora de inicio:
    // "08:00:00"
    //
    // Buscamos entonces el bloque correspondiente.

    const matchingTimeSlot = timeSlots.find(
      (slot) => slot.split(" - ")[0] === currentStartTime,
    );

    setSelectedTime(matchingTimeSlot || "");

    // ======================================================
    // ESTUDIANTES DEL HORARIO
    // ======================================================

    const studentsForSchedule = scheduleStudents.filter(
      (ss) => ss.schedule_id === schedule.id,
    );

    const loadedStudents = studentsForSchedule.map((student) => ({
      id: student.student_id,
      first_name: student.first_name,
      last_name: student.last_name,
      plan_id: student.plan_id,
      plan_name: student.plan_name,
    }));

    setSelectedStudents(loadedStudents);

    // ======================================================
    // PLAN
    // ======================================================

    // El plan ya no pertenece directamente al horario.
    // Cada estudiante tiene su propio plan.
    //
    // Si todos los estudiantes tienen el mismo plan,
    // podemos mostrarlo seleccionado en el filtro.
    //
    // Si tienen planes diferentes, dejamos el filtro vacío.

    const studentPlanIds = [
      ...new Set(
        loadedStudents
          .map((student) => student.plan_id)
          .filter((planId) => planId !== null && planId !== undefined),
      ),
    ];

    const currentPlanId =
      studentPlanIds.length === 1 ? String(studentPlanIds[0]) : "";

    setSelectedPlan(currentPlanId);

    // ======================================================
    // DATOS AUXILIARES DEL DOCENTE
    // ======================================================

    // Importante:
    // NO usamos handleTeacherChange() acá porque ese handler
    // limpia estudiantes y plan.
    //
    // Cargamos directamente lo necesario.

    await fetchAvailablePlans(currentTeacherId);

    await fetchAvailableStudents(currentTeacherId, currentPlanId);

    // ======================================================
    // ESTADO AUXILIAR
    // ======================================================

    setSelectedStudentId("");
    setIncompatibleStudents([]);

    // ======================================================
    // ABRIR MODAL
    // ======================================================

    setOpenEditModal(true);
  };

  const handleUpdate = async () => {
    if (incompatibleStudents.length > 0) {
      setErrorsEdit((prev) => ({
        ...prev,
        plans:
          "No es posible guardar mientras existan estudiantes incompatibles con el docente seleccionado.",
      }));

      return;
    }

    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrorsEdit(newErrors);
      return;
    }

    try {
      setErrorsEdit({});

      await ScheduleService.update(selectedSchedule.id, {
        teacher_id: teacherId,
        start_time: selectedTime,
        day: selectedDay,
        classroom,
        students: buildStudentsPayload(),
        schedule_id: selectedSchedule.id,
      });

      setOpenEditModal(false);
      setSelectedSchedule(null);
      setIsEditing(false);

      resetForm();

      await fetchSchedules();
      await fetchScheduleStudents();

      showFeedback("Horario actualizado correctamente.", "success");
    } catch (error) {
      console.error(error);

      const backendErrors = error.response?.data?.errors;

      if (backendErrors?.length) {
        setErrorsEdit(mapErrors(backendErrors));
      } else {
        showFeedback(
          error.response?.data?.message || "Error al actualizar el horario.",
          "error",
        );
      }
    }
  };

  const handleDelete = (schedule) => {
    setSelectedSchedule(schedule);

    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await ScheduleService.delete(selectedSchedule.id);

      setOpenDeleteModal(false);

      setSelectedSchedule(null);
      setSelectedScheduleInfo(null);

      await fetchSchedules();
      await fetchScheduleStudents();

      showFeedback("Horario eliminado correctamente.", "success");
    } catch (error) {
      console.error(error);

      const backendErrors = error.response?.data?.errors;

      if (backendErrors?.length) {
        setErrorsEdit({
          general: backendErrors[0].msg,
        });
      } else {
        showFeedback(
          error.response?.data?.message || "Error al eliminar el horario.",
          "error",
        );
      }
    }
  };

  const handleInfo = async (schedule) => {
    setSelectedSchedule(schedule);

    await fetchScheduleInfo(schedule.id);

    setOpenInfoModal(true);
  };

  // ======================================================
  // HANDLES AUXILIARES
  // ======================================================

  const handleAddStudent = async (isEdit = false) => {
    if (!selectedStudentId) return;

    const student = availableStudents.find(
      (s) => s.id === Number(selectedStudentId),
    );

    if (!student) return;

    const exists = selectedStudents.some((s) => s.id === student.id);

    if (exists) return;

    const setErrors = isEdit ? setErrorsEdit : setErrorsCreate;

    const { data } = await studentService.getPlans(student.id, teacherId);

    const plans = data.data || [];

    if (plans.length === 0) {
      setErrors((prev) => ({
        ...prev,
        plans: `${student.last_name}, ${student.first_name} no posee planes compatibles con el docente seleccionado.`,
      }));

      setSelectedStudentId("");

      return;
    }

    // Si hay filtro de plan, se usa ese.
    // Si no, solo se resuelve automáticamente
    // cuando el estudiante tiene un único plan.
    const matchedPlan =
      plans.find((p) => String(p.id) === String(selectedPlan)) ??
      (plans.length === 1 ? plans[0] : null);

    if (!matchedPlan) {
      setErrors((prev) => ({
        ...prev,
        plans: `${student.last_name}, ${student.first_name} tiene más de un plan con este docente. Elegí el plan en el filtro antes de agregarlo.`,
      }));

      setSelectedStudentId("");

      return;
    }

    // Limpiar mensajes de error
    setErrors((prev) => ({
      ...prev,
      plans: "",
      students: "",
      studentConflict: "",
    }));

    // Agregar estudiante con su plan
    setSelectedStudents((prev) => [
      ...prev,
      {
        ...student,
        plan_id: matchedPlan.id,
        plan_name: matchedPlan.name,
      },
    ]);

    setSelectedStudentId("");
  };

  const handleRemoveStudent = async (studentId) => {
    setSelectedStudents((prev) =>
      prev.filter((student) => student.id !== studentId),
    );

    setIncompatibleStudents((prev) => prev.filter((id) => id !== studentId));

    await fetchAvailableStudents(teacherId, selectedPlan);

    setErrorsCreate((prev) => ({
      ...prev,
      plans: "",
      students: "",
      studentConflict: "",
    }));

    setErrorsEdit((prev) => ({
      ...prev,
      plans: "",
      students: "",
      studentConflict: "",
    }));
  };

  const handleTeacherChange = async (e) => {
    const teacher = e.target.value;

    setTeacherId(teacher);

    // Limpiar datos dependientes
    setSelectedPlan("");
    setSelectedStudentId("");
    setSelectedStudents([]);
    setIncompatibleStudents([]);

    if (!teacher) {
      setAvailablePlans([]);
      setAvailableStudents([]);
      return;
    }

    await Promise.all([
      fetchAvailablePlans(teacher),
      fetchAvailableStudents(teacher, ""),
    ]);
  };

  const handlePlanChange = async (e) => {
    const plan = e.target.value;

    setSelectedPlan(plan);

    await fetchAvailableStudents(teacherId, plan);
  };

  // ======================================================
  // HANDLES DE CIERRE DE MODALES
  // ======================================================

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    resetForm();
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setIsEditing(false);
    setSelectedSchedule(null);
    resetForm();
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
  };

  const handleCloseInfoModal = () => {
    setOpenInfoModal(false);
    setSelectedScheduleInfo(null);
  };

  // ======================================================
  // USE EFFECTS
  // ======================================================

  useEffect(() => {
    if (isEditing || !openCreateModal) return;

    setSelectedStudentId("");

    setSelectedStudents([]);

    setErrorsCreate((prev) => ({
      ...prev,
      plans: "",
      studentConflict: "",
    }));
  }, [teacherId, isEditing, openCreateModal]);

  useEffect(() => {
    fetchTeachers();
    fetchSchedules();
    fetchScheduleStudents();
    fetchStudents();
  }, []);

  // Al cambiar de docente en edición,
  // verifica que el plan con el que quedó cargado
  // cada estudiante siga siendo válido.
  useEffect(() => {
    if (!isEditing || !teacherId || selectedStudents.length === 0) {
      return;
    }

    const checkCompatibility = async () => {
      const incompatible = [];

      for (const student of selectedStudents) {
        const response = await studentService.getPlans(student.id, teacherId);

        const plans = response.data.data || [];

        const stillValid = plans.some(
          (p) => String(p.id) === String(student.plan_id),
        );

        if (!stillValid) {
          incompatible.push(student.id);
        }
      }

      setIncompatibleStudents(incompatible);
    };

    checkCompatibility();
  }, [teacherId, selectedStudents, isEditing]);

  // ======================================================
  // DATOS DERIVADOS
  // ======================================================

  const studentScheduleIds = scheduleStudents
    .filter(
      (ss) =>
        !selectedStudent || Number(ss.student_id) === Number(selectedStudent),
    )
    .map((ss) => ss.schedule_id);

  const filteredSchedules = schedules.filter((schedule) => {
    const teacherOk =
      !selectedTeacher ||
      Number(schedule.teacher_id) === Number(selectedTeacher);

    const classroomOk =
      !selectedClassroom || schedule.classroom === selectedClassroom;

    const studentOk =
      !selectedStudent || studentScheduleIds.includes(schedule.id);

    return teacherOk && classroomOk && studentOk;
  });

  // ======================================================
  // RETURN
  // ======================================================

  return {
    // Datos
    teachers,
    students,
    schedules,
    scheduleStudents,

    // Datos derivados
    filteredSchedules,

    // Filtros
    selectedTeacher,
    selectedStudent,
    selectedClassroom,
    setSelectedTeacher,
    setSelectedStudent,
    setSelectedClassroom,

    // Modales
    openCreateModal,
    openEditModal,
    openDeleteModal,
    openInfoModal,

    // Horario seleccionado
    selectedSchedule,
    selectedScheduleInfo,

    // Formulario
    teacherId,
    selectedPlan,
    selectedDay,
    selectedTime,
    classroom,
    setSelectedPlan,
    setSelectedDay,
    setSelectedTime,
    setClassroom,

    // Estudiantes
    selectedStudentId,
    selectedStudents,
    availableStudents,
    availablePlans,
    incompatibleStudents,
    setSelectedStudentId,

    // Estado
    isEditing,

    // Errores
    errorsCreate,
    errorsEdit,

    // Constantes
    days,
    classrooms,
    timeSlots,

    // Feedback
    feedbackModal,
    showFeedback,
    closeFeedback,

    // CRUD
    openCreate,
    handleCreate,
    handleEdit,
    handleUpdate,
    handleDelete,
    confirmDelete,
    handleInfo,

    // Estudiantes
    handleAddStudent,
    handleRemoveStudent,

    // Cambios
    handleTeacherChange,
    handlePlanChange,

    // Cierres
    handleCloseCreateModal,
    handleCloseEditModal,
    handleCloseDeleteModal,
    handleCloseInfoModal,

    // Utilidades
    resetForm,
  };
}
