import { useEffect, useState } from "react";
import { teacherService } from "../../services/teacher.service";
import { ScheduleService } from "../../services/schedule.service";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";
import { ScheduleStudentService } from "../../services/scheduleStudent.service";
import { studentService } from "../../services/student.service";
import { Modal } from "../../components/ui/Modal";
import { isAdmin } from "../../utils/auth";
import {
  EditButton,
  DeleteButton,
  PlusButton,
  YesButton,
  NoButton,
  ViewButtonWeekWhite,
} from "../../components/ui/ActionButtons";
import { validateWeeklyCalendarForm } from "../../validators/entities/weeklyCalendar.validator";
import { useFeedbackModal } from "../../hooks/shared/useFeedBackModal";

export default function WeeklyCalendar() {
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
  const [selectedPlan, setSelectedPlan] = useState(""); // Filtro, no se guarda
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

    // El plan dejó de ser un campo del horario: es solo un filtro
    delete newErrors.plan_id;

    if (selectedStudents.some((s) => !s.plan_id)) {
      newErrors.students =
        "Hay estudiantes sin plan asignado. Quitalos y volvé a agregarlos.";
    }

    return newErrors;
  };

  // Devuelve el payload de estudiantes: [{ id, plan_id }]
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

      fetchSchedules();
      fetchScheduleStudents();

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

    setTeacherId(schedule.teacher_id);

    // El plan es solo un filtro: arranca vacío
    setSelectedPlan("");

    await fetchAvailablePlans(schedule.teacher_id);

    setSelectedDay(schedule.day);
    setSelectedTime(schedule.start_time.slice(0, 5));
    setClassroom(schedule.classroom);

    const studentsForSchedule = scheduleStudents.filter(
      (ss) => ss.schedule_id === schedule.id,
    );

    setSelectedStudents(
      studentsForSchedule.map((student) => ({
        id: student.student_id,
        first_name: student.first_name,
        last_name: student.last_name,
        plan_id: student.plan_id,
        plan_name: student.plan_name,
      })),
    );

    setIncompatibleStudents([]);

    await fetchAvailableStudents(schedule.teacher_id, "");

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

      fetchSchedules();
      fetchScheduleStudents();

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

      fetchSchedules();
      fetchScheduleStudents();

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

    // Si hay filtro de plan, se usa ese. Si no, solo se resuelve
    // automáticamente cuando el estudiante tiene un único plan.
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

    // Limpiar el mensaje de error
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

    // limpiar datos dependientes
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

  // ======================================================
  // USEEFFECTS
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

  // Al cambiar de docente en edición, verifica que el plan con el
  // que quedó cargado cada estudiante siga siendo válido.
  useEffect(() => {
    if (!isEditing || !teacherId || selectedStudents.length === 0) return;

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

  const filteredSchedules = schedules.filter((s) => {
    const teacherOk =
      !selectedTeacher || Number(s.teacher_id) === Number(selectedTeacher);

    const classroomOk = !selectedClassroom || s.classroom === selectedClassroom;

    const studentOk = !selectedStudent || studentScheduleIds.includes(s.id);

    return teacherOk && classroomOk && studentOk;
  });

  // ======================================================
  // RETURN
  // ======================================================
  return (
    <>
      {/* Encabezado */}
      <div className="flex justify-between mb-6">
        <Select
          value={selectedTeacher}
          onChange={(e) => setSelectedTeacher(e.target.value)}
          className="w-72"
        >
          <option value="">Todos los docentes</option>

          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.last_name}, {teacher.first_name}
            </option>
          ))}
        </Select>

        <Select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="w-72"
        >
          <option value="">Todos los estudiantes</option>

          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.last_name}, {student.first_name}
            </option>
          ))}
        </Select>

        <Select
          value={selectedClassroom}
          onChange={(e) => setSelectedClassroom(e.target.value)}
          className="w-72"
        >
          <option value="">Todas las aulas</option>

          <option value="A">🟦 Aula A</option>

          <option value="B">🟪 Aula B</option>
        </Select>

        {isAdmin() && <PlusButton title="Crear Horario" onClick={openCreate} />}
      </div>

      {/* Tabla */}
      <div
        className="
          overflow-auto
          max-h-[700px]

          bg-white
          dark:bg-black
        "
      >
        <table
          className="
            w-full
            table-fixed

            bg-white
            dark:bg-black

            border
            border-gray-300
            dark:border-gray-700
        "
        >
          <thead
            className="
              sticky
              top-0
              z-20

              bg-gray-100
              dark:bg-black

              text-gray-800
              dark:text-white
            "
          >
            <tr>
              <th
                className="
                  sticky
                  top-0
                  left-0
                  z-30

                  p-2

                  border
                  border-gray-300
                  dark:border-gray-700

                  bg-gray-100
                  dark:bg-black

                  text-gray-800
                  dark:text-white
                "
              >
                Horario
              </th>

              {days.map((day) => (
                <th
                  key={day.value}
                  className="
                    p-2

                    border
                    border-gray-300
                    dark:border-gray-700

                    bg-gray-100
                    dark:bg-black

                    text-gray-800
                    dark:text-white

                    font-semibold
                "
                >
                  {day.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot) => (
              <tr key={slot}>
                <td
                  className="
                    sticky
                    left-0
                    z-10

                    w-[130px]

                    p-2

                    border
                    border-gray-300
                    dark:border-gray-700

                    bg-white
                    dark:bg-black

                    text-gray-800
                    dark:text-white

                    font-semibold
                "
                >
                  {slot}
                </td>

                {days.map((day) => {
                  const slotStart = slot.split(" - ")[0];

                  const schedulesInSlot = filteredSchedules.filter(
                    (s) =>
                      Number(s.day) === day.value &&
                      s.start_time.slice(0, 5) === slotStart,
                  );

                  return (
                    <td
                      key={`${day.value}-${slot}`}
                      className="
                        border
                        border-gray-300
                        dark:border-gray-700

                        p-2
                        align-top

                        w-[180px]

                        bg-white
                        dark:bg-black

                        transition-colors

                        hover:bg-cyan-50
                        dark:hover:bg-gray-900
                    "
                    >
                      <div
                        className="
                          h-[160px]
                          overflow-y-auto
                          space-y-2
                        "
                      >
                        {schedulesInSlot.map((schedule) => {
                          const students = scheduleStudents.filter(
                            (ss) => ss.schedule_id === schedule.id,
                          );

                          const textColor =
                            schedule.classroom === "A"
                              ? "text-cyan-500"
                              : "text-[#8d5df4]";

                          return (
                            <div
                              key={schedule.id}
                              className={
                                schedule.classroom === "A"
                                  ? `
                                    p-2
                                    rounded-lg
                                    border

                                    bg-cyan-100
                                    dark:bg-cyan-900/25

                                    border
                                    border-cyan-300
                                    dark:border-cyan-700

                                    text-cyan-800
                                    dark:text-cyan-200

                                    shadow-sm
                                    hover:shadow-md
                                    transition-all
                                    duration-200                                  `
                                  : `
                                    p-2

                                    rounded-lg

                                    border

                                    bg-violet-100
                                    dark:bg-violet-900/25

                                    border-violet-300
                                    dark:border-violet-700

                                    text-violet-800
                                    dark:text-violet-200
                                  `
                              }
                            >
                              <div
                                className={`text-xs font-semibold ${textColor}`}
                              >
                                Docente:
                              </div>

                              <div className={`text-xs ml-2 ${textColor} mb-3`}>
                                • {schedule.last_name}, {schedule.first_name}
                              </div>

                              <div
                                className={`text-xs font-semibold ${textColor}`}
                              >
                                Estudiantes:
                              </div>

                              {students.map((student) => (
                                <div
                                  key={student.student_id}
                                  className={`ml-2 text-sm ${textColor}`}
                                >
                                  • {student.last_name}, {student.first_name}.
                                </div>
                              ))}

                              <div className="flex justify-end mt-2">
                                <ViewButtonWeekWhite
                                  title="Más información"
                                  onClick={() => handleInfo(schedule)}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-start mt-6">
        {isAdmin() && (
          <button
            onClick={openCreate}
            className="
              cursor-pointer
              px-4
              py-2
              rounded-lg
              bg-[#0cc0df]
              text-white
            "
          >
            Crear Horario
          </button>
        )}
      </div>

      <Modal
        isOpen={openCreateModal}
        onClose={() => {
          setOpenCreateModal(false);
          resetForm();
        }}
      >
        <h2 className="text-xl font-bold mb-8">Crear Horario</h2>

        {/* Docente */}
        <div className="flex flex-col mb-4">
          <Label>Docente</Label>

          <Select value={teacherId} onChange={handleTeacherChange}>
            <option value="">Seleccionar docente</option>

            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.last_name}, {teacher.first_name}
              </option>
            ))}
          </Select>

          {errorsCreate.teacher_id && (
            <p className="text-red-500 text-sm mt-1">
              {errorsCreate.teacher_id}
            </p>
          )}
        </div>

        {/* Día */}
        <div className="flex flex-col mb-4">
          <Label>Día</Label>

          <Select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
          >
            <option value="">Seleccionar día</option>

            {days.map((day) => (
              <option key={day.value} value={day.value}>
                {day.name}
              </option>
            ))}
          </Select>

          {errorsCreate.day && (
            <p className="text-red-500 text-sm mt-1">{errorsCreate.day}</p>
          )}
        </div>

        {/* Horario */}
        <div className="flex flex-col mb-4">
          <Label>Horario</Label>

          <Select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          >
            <option value="">Seleccionar horario</option>

            {timeSlots.map((slot) => (
              <option key={slot} value={slot.split(" - ")[0]}>
                {slot}
              </option>
            ))}
          </Select>

          {errorsCreate.start_time && (
            <p className="text-red-500 text-sm mt-1">
              {errorsCreate.start_time}
            </p>
          )}
        </div>

        {/* Aula */}
        <div className="flex flex-col mb-4">
          <Label>Aula</Label>

          <Select
            value={classroom}
            onChange={(e) => setClassroom(e.target.value)}
          >
            <option value="">Seleccionar aula</option>

            {classrooms.map((room) => (
              <option key={room.value} value={room.value}>
                {room.name}
              </option>
            ))}
          </Select>

          {errorsCreate.classroom && (
            <p className="text-red-500 text-sm mt-1">
              {errorsCreate.classroom}
            </p>
          )}
        </div>

        {/* Plan (filtro) */}
        <div className="flex flex-col mb-4">
          <Label>Filtrar por plan (opcional)</Label>

          <Select
            disabled={!teacherId}
            value={selectedPlan}
            onChange={async (e) => {
              const plan = e.target.value;

              setSelectedPlan(plan);

              await fetchAvailableStudents(teacherId, plan);
            }}
          >
            <option value="">
              {teacherId ? "Todos los planes" : "Seleccione primero un docente"}
            </option>

            {availablePlans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </Select>

          <p className="text-xs text-gray-500 mt-1">
            El plan queda registrado por estudiante. Podés cambiar el filtro y
            seguir agregando alumnos de otros planes.
          </p>
        </div>

        {/* Estudiante */}
        <div className="flex flex-col mb-2">
          <Label>Estudiante</Label>

          <div className="flex gap-2">
            <Select
              disabled={!teacherId}
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="flex-1"
            >
              <option value="">
                {teacherId
                  ? "Seleccionar estudiante"
                  : "Seleccione primero un docente"}
              </option>

              {availableStudents
                .filter(
                  (student) =>
                    !selectedStudents.some((s) => s.id === student.id),
                )
                .map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.last_name}, {student.first_name}
                  </option>
                ))}
            </Select>

            <PlusButton
              title="Agregar estudiante"
              onClick={() => handleAddStudent(false)}
            />
          </div>

          {errorsCreate.students && (
            <p className="text-red-500 text-sm mt-1">{errorsCreate.students}</p>
          )}
        </div>

        {/* Lista */}
        <div className="space-y-2 mt-4">
          {selectedStudents.map((student) => (
            <div
              key={student.id}
              className="
                flex
                justify-between
                items-center
                border
                rounded
                px-3
                py-2
              "
            >
              <span>
                {student.last_name}, {student.first_name}
                <span className="ml-2 text-xs text-gray-500">
                  {student.plan_name}
                </span>
              </span>

              <button
                type="button"
                onClick={() => handleRemoveStudent(student.id)}
                className="
                  cursor-pointer
                  text-red-500
                  font-bold
                "
              >
                ✕
              </button>
            </div>
          ))}

          {errorsCreate.plans && (
            <div className="mt-4 text-sm text-red-500">
              {errorsCreate.plans}
            </div>
          )}

          {errorsCreate.studentConflict && (
            <div className="mt-4 text-sm text-red-500">
              {errorsCreate.studentConflict}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 mt-10">
          <div className="flex justify-end gap-3">
            <NoButton
              title="Cancelar"
              onClick={() => setOpenCreateModal(false)}
            />

            <YesButton title="Aceptar" onClick={handleCreate} />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          setIsEditing(false);
          setSelectedSchedule(null);
          resetForm();
        }}
      >
        <h2 className="text-xl font-bold mb-8">Editar Horario</h2>

        {/* Docente */}
        <div className="flex flex-col mb-4">
          <Label>Docente</Label>

          <Select value={teacherId} onChange={handleTeacherChange}>
            <option value="">Seleccionar docente</option>

            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.last_name}, {teacher.first_name}
              </option>
            ))}
          </Select>

          {errorsEdit.teacher_id && (
            <p className="mt-1 text-sm text-red-500">{errorsEdit.teacher_id}</p>
          )}
        </div>

        {/* Día */}
        <div className="flex flex-col mb-4">
          <Label>Día</Label>

          <Select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
          >
            <option value="">Seleccionar día</option>

            {days.map((day) => (
              <option key={day.value} value={day.value}>
                {day.name}
              </option>
            ))}
          </Select>

          {errorsEdit.day && (
            <p className="mt-1 text-sm text-red-500">{errorsEdit.day}</p>
          )}
        </div>

        {/* Horario */}
        <div className="flex flex-col mb-4">
          <Label>Horario</Label>

          <Select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          >
            <option value="">Seleccionar horario</option>

            {timeSlots.map((slot) => (
              <option key={slot} value={slot.split(" - ")[0]}>
                {slot}
              </option>
            ))}
          </Select>

          {errorsEdit.start_time && (
            <p className="mt-1 text-sm text-red-500">{errorsEdit.start_time}</p>
          )}
        </div>

        {/* Aula */}
        <div className="flex flex-col mb-4">
          <Label>Aula</Label>

          <Select
            value={classroom}
            onChange={(e) => setClassroom(e.target.value)}
          >
            <option value="">Seleccionar aula</option>

            {classrooms.map((room) => (
              <option key={room.value} value={room.value}>
                {room.name}
              </option>
            ))}
          </Select>

          {errorsEdit.classroom && (
            <p className="mt-1 text-sm text-red-500">{errorsEdit.classroom}</p>
          )}
        </div>

        {/* Plan (filtro) */}
        <div className="flex flex-col mb-4">
          <Label>Filtrar por plan (opcional)</Label>

          <Select
            disabled={!teacherId}
            value={selectedPlan}
            onChange={async (e) => {
              const plan = e.target.value;

              setSelectedPlan(plan);

              await fetchAvailableStudents(teacherId, plan);
            }}
          >
            <option value="">
              {teacherId ? "Todos los planes" : "Seleccione primero un docente"}
            </option>

            {availablePlans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </Select>

          <p className="text-xs text-gray-500 mt-1">
            El plan queda registrado por estudiante. Podés cambiar el filtro y
            seguir agregando alumnos de otros planes.
          </p>
        </div>

        {/* Estudiante */}
        <div className="flex flex-col mb-2">
          <Label>Estudiante</Label>

          <div className="flex gap-2">
            <Select
              disabled={!teacherId}
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="flex-1"
            >
              <option value="">
                {teacherId
                  ? "Seleccionar estudiante"
                  : "Seleccione primero un docente"}
              </option>

              {availableStudents
                .filter(
                  (student) =>
                    !selectedStudents.some((s) => s.id === student.id),
                )
                .map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.last_name}, {student.first_name}
                  </option>
                ))}
            </Select>

            <PlusButton
              title="Agregar estudiante"
              onClick={() => handleAddStudent(true)}
            />
          </div>

          {errorsEdit.students && (
            <p className="mt-1 text-sm text-red-500">{errorsEdit.students}</p>
          )}
        </div>

        {/* Lista */}
        <div className="space-y-2 mt-4">
          {selectedStudents.map((student) => (
            <div key={student.id}>
              <div
                className="
                  flex
                  justify-between
                  items-center
                  border
                  rounded
                  px-3
                  py-2
                "
              >
                <span>
                  {student.last_name}, {student.first_name}
                  <span className="ml-2 text-xs text-gray-500">
                    {student.plan_name}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => handleRemoveStudent(student.id)}
                  className="
                    cursor-pointer
                    text-red-500
                    font-bold
                  "
                >
                  ✕
                </button>
              </div>

              {incompatibleStudents.includes(student.id) && (
                <div className="mt-1 text-sm text-red-500">
                  {`${student.last_name}, ${student.first_name}`} no tiene ese
                  plan con el docente seleccionado.
                </div>
              )}
            </div>
          ))}

          {errorsEdit.plans && (
            <div className="mt-4 text-sm text-red-500">{errorsEdit.plans}</div>
          )}

          {errorsEdit.studentConflict && (
            <div className="mt-4 text-sm text-red-500">
              {errorsEdit.studentConflict}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 mt-10">
          <NoButton title="Cancelar" onClick={() => setOpenEditModal(false)} />

          <YesButton title="Aceptar" onClick={handleUpdate} />
        </div>
      </Modal>

      <Modal isOpen={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <h2 className="text-lg font-semibold mb-4">¿Eliminar Horario?</h2>

        <div className="flex justify-end gap-2">
          <NoButton
            title="Cancelar"
            onClick={() => setOpenDeleteModal(false)}
          />

          <YesButton title="Aceptar" onClick={confirmDelete} />
        </div>
      </Modal>

      <Modal
        isOpen={openInfoModal}
        onClose={() => {
          setOpenInfoModal(false);
          setSelectedScheduleInfo(null);
        }}
      >
        {selectedScheduleInfo && (
          <>
            <h2 className="text-xl font-bold mb-6">Información del horario</h2>

            {/* Docente */}
            <div className="space-y-3 mb-8">
              <h3 className="font-bold text-lg">Docente</h3>

              <div
                className="
                  border
                  rounded-lg
                  p-4
                  bg-gray-50
                  dark:bg-black

                  border
                  border-gray-200
                  dark:border-gray-700
                "
              >
                <div
                  className="
                    font-semibold 
                    text-gray-900
                    dark:text-white
                  "
                >
                  {selectedScheduleInfo.teacher}
                </div>

                <div
                  className="
                    mt-2 text-sm 
                    text-gray-600
                    dark:text-gray-300
                  "
                >
                  Aula: {selectedScheduleInfo.classroom}
                </div>
              </div>
            </div>

            {/* Planes */}
            <div className="space-y-3 mb-8">
              <h3 className="font-bold text-lg">Planes</h3>

              {selectedScheduleInfo.plans.length === 0 ? (
                <div
                  className="
                    border
                    rounded-lg
                    p-4
                    bg-gray-50
                    dark:bg-black

                    border
                    border-gray-200
                    dark:border-gray-700
                    text-gray-500
                  "
                >
                  No hay planes asignados.
                </div>
              ) : (
                selectedScheduleInfo.plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="
                      border
                      rounded-lg
                      p-4
                      bg-gray-50
                      dark:bg-black
                      border
                      border-gray-200
                      dark:border-gray-700
                    "
                  >
                    <div
                      className="
                        font-semibold 
                        text-gray-900
                        dark:text-white
                      "
                    >
                      {plan.name}
                    </div>

                    <div className="mt-2 text-sm">Materias:</div>

                    <ul className="ml-5 list-disc text-sm">
                      {plan.subjects.map((subject) => (
                        <li key={subject}>{subject}</li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>

            {/* Estudiantes */}
            <div className="space-y-3 mb-8">
              <h3 className="font-bold text-lg">Estudiantes</h3>

              {selectedScheduleInfo.students.length === 0 ? (
                <div
                  className="
                    border
                    rounded-lg
                    p-4
                    bg-gray-50
                    dark:bg-black

                    border
                    border-gray-200
                    dark:border-gray-700
                    text-gray-500
                  "
                >
                  No hay estudiantes asignados.
                </div>
              ) : (
                selectedScheduleInfo.students.map((student) => (
                  <div
                    key={student.id}
                    className="
                      border
                      rounded-lg
                      p-4
                      bg-gray-50
                      dark:bg-black

                      border
                      border-gray-200
                      dark:border-gray-700
                    "
                  >
                    <div className="font-semibold">{student.name}</div>

                    <div
                      className="
                        mt-2 text-sm 
                        text-gray-600
                        dark:text-gray-300
                      "
                    >
                      Plan: {student.plan}
                    </div>

                    <div className="mt-2 text-sm">Materias:</div>

                    <ul className="ml-5 list-disc text-sm">
                      {student.subjects.map((subject) => (
                        <li key={subject}>{subject}</li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 mt-8">
              {isAdmin() && (
                <>
                  <EditButton
                    title="Editar Horario"
                    onClick={() => {
                      setOpenInfoModal(false);

                      if (selectedSchedule) {
                        handleEdit(selectedSchedule);
                      }
                    }}
                  />

                  <DeleteButton
                    title="Eliminar Horario"
                    onClick={() => {
                      setOpenInfoModal(false);
                      if (selectedSchedule) {
                        handleDelete(selectedSchedule);
                      }
                    }}
                  />
                </>
              )}
            </div>
          </>
        )}
      </Modal>

      <Modal isOpen={feedbackModal.open} onClose={closeFeedback}>
        <h2
          className={`text-lg font-semibold mb-4 ${
            feedbackModal.type === "error" ? "text-red-600" : "text-green-600"
          }`}
        >
          {feedbackModal.type === "error" ? "Error" : "Listo"}
        </h2>

        <p className="text-gray-600">{feedbackModal.message}</p>
      </Modal>
    </>
  );
}
