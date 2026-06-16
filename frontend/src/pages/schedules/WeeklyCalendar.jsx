import { useEffect, useState } from "react";
import { teacherService } from "../../services/teacher.service";
import { ScheduleService } from "../../services/schedule.service";
import { ScheduleStudentService } from "../../services/scheduleStudent.service";
import { studentService } from "../../services/student.service";
import { Modal } from "../../components/ui/Modal";
import { isAdmin } from "../../utils/auth";

export default function WeeklyCalendar() {
  // Datos
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [scheduleStudents, setScheduleStudents] = useState([]);

  // Filtros del calendario
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState("");

  // Modales
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openInfoModal, setOpenInfoModal] = useState(false);

  // Horario seleccionado
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedScheduleInfo, setSelectedScheduleInfo] = useState(null);

  // Formulario
  const [teacherId, setTeacherId] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [classroom, setClassroom] = useState("");

  // Alumno a agregar
  const [selectedStudentId, setSelectedStudentId] = useState("");

  // Alumnos agregados al horario
  const [selectedStudents, setSelectedStudents] = useState([]);

  // Planes y materias de esos alumnos
  const [selectedStudentPlans, setSelectedStudentPlans] = useState([]);

  // Errores
  const [errorsCreate, setErrorsCreate] = useState({});
  const [errorsEdit, setErrorsEdit] = useState({});

  // Funciones
  const [isEditing, setIsEditing] = useState(false);

  const [incompatibleStudents, setIncompatibleStudents] = useState([]);

  const fetchTeachers = async () => {
    try {
      const res = await teacherService.getAll();

      setTeachers(res.data.data || []);
    } catch (error) {
      console.error("ERROR TEACHERS", error);
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

  const fetchStudents = async () => {
    try {
      const res = await studentService.getAll();

      const uniqueStudents = [
        ...new Map(
          (res.data.data || []).map((student) => [student.id, student]),
        ).values(),
      ];

      setStudents(uniqueStudents);
    } catch (error) {
      console.error("ERROR STUDENTS", error);
    }
  };

  const handleAddStudent = async (isEdit = false) => {
    if (!selectedStudentId) return;

    const student = students.find((s) => s.id === Number(selectedStudentId));

    if (!student) return;

    const exists = selectedStudents.some((s) => s.id === student.id);

    if (exists) return;

    const response = await studentService.getPlans(student.id, teacherId);

    if (response.data.data.length === 0) {
      if (isEdit) {
        setErrorsEdit((prev) => ({
          ...prev,
          plans: `${student.last_name}, ${student.first_name} no posee planes compatibles con el docente seleccionado.`,
        }));
      } else {
        setErrorsCreate((prev) => ({
          ...prev,
          plans: `${student.last_name}, ${student.first_name} no posee planes compatibles con el docente seleccionado.`,
        }));
      }

      setSelectedStudentId("");

      return;
    }

    // Limpiar el mensaje de error
    if (isEdit) {
      setErrorsEdit((prev) => ({
        ...prev,
        plans: "",
        studentConflict: "",
      }));
    } else {
      setErrorsCreate((prev) => ({
        ...prev,
        plans: "",
        studentConflict: "",
      }));
    }

    // Agregar alumno
    setSelectedStudents((prev) => [...prev, student]);

    const alreadyExists = selectedStudentPlans.some(
      (s) => s.studentId === student.id,
    );

    if (!alreadyExists) {
      setSelectedStudentPlans((prev) => [
        ...prev,
        {
          studentId: student.id,
          studentName: `${student.last_name}, ${student.first_name}`,
          plans: response.data.data,
          selectedPlans:
            response.data.data.length === 1 ? [response.data.data[0]] : [],
        },
      ]);
    }

    setSelectedStudentId("");
  };

  const handleRemoveStudent = (studentId) => {
    setSelectedStudents((prev) =>
      prev.filter((student) => student.id !== studentId),
    );

    setSelectedStudentPlans((prev) =>
      prev.filter((student) => student.studentId !== studentId),
    );

    setErrorsCreate((prev) => ({
      ...prev,
      plans: "",
      studentConflict: "",
    }));

    setErrorsEdit((prev) => ({
      ...prev,
      plans: "",
      studentConflict: "",
    }));
  };

  const handlePlanToggle = (studentId, plan) => {
    setSelectedStudentPlans((prev) =>
      prev.map((student) => {
        if (student.studentId !== studentId) {
          return student;
        }

        const exists = student.selectedPlans.some((p) => p.id === plan.id);

        return {
          ...student,
          selectedPlans: exists
            ? student.selectedPlans.filter((p) => p.id !== plan.id)
            : [...student.selectedPlans, plan],
        };
      }),
    );
  };

  useEffect(() => {
    if (isEditing || !openCreateModal) return;

    setSelectedStudentId("");

    setSelectedStudents([]);
    setSelectedStudentPlans([]);

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

  useEffect(() => {
    if (!isEditing || !teacherId || selectedStudents.length === 0) return;

    const checkCompatibility = async () => {
      const incompatible = [];
      const updatedPlans = [];

      for (const student of selectedStudents) {
        const response = await studentService.getPlans(student.id, teacherId);

        if (response.data.data.length === 0) {
          incompatible.push(student.id);
        }

        updatedPlans.push({
          studentId: student.id,
          studentName: `${student.last_name}, ${student.first_name}`,
          plans: response.data.data,
          selectedPlans: response.data.data,
        });
      }

      setSelectedStudentPlans(updatedPlans);
      setIncompatibleStudents(incompatible);
    };

    checkCompatibility();
  }, [teacherId, selectedStudents, isEditing]);

  const resetForm = () => {
    setTeacherId("");
    setSelectedDay("");
    setSelectedTime("");
    setClassroom("");

    setSelectedStudentId("");

    setSelectedStudents([]);
    setSelectedStudentPlans([]);

    setErrorsCreate({});
    setErrorsEdit({});

    setIncompatibleStudents([]);
  };

  const mapErrors = (errors) => {
    const formatted = {};

    errors.forEach((e) => {
      formatted[e.path] = e.msg;
    });
    return formatted;
  };

  const openCreate = () => {
    setIsEditing(false);

    resetForm();

    setOpenCreateModal(true);
  };

  const handleCreate = async () => {
    try {
      setErrorsCreate({});

      const newErrors = {};

      if (!teacherId) {
        newErrors.teacher_id = "Seleccione una opción válida.";
      }

      if (!selectedDay) {
        newErrors.day = "Seleccione una opción válida.";
      }

      if (!selectedTime) {
        newErrors.start_time = "Seleccione una opción válida.";
      }

      if (!classroom) {
        newErrors.classroom = "Seleccione una opción válida.";
      }

      if (selectedStudents.length === 0) {
        newErrors.students = "Seleccione al menos una opción válida.";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrorsCreate(newErrors);
        return;
      }

      await ScheduleService.create({
        teacher_id: teacherId,
        start_time: selectedTime,
        day: selectedDay,
        classroom,
        students: selectedStudents.map((student) => student.id),
      });

      setOpenCreateModal(false);

      resetForm();

      fetchSchedules();
      fetchScheduleStudents();
    } catch (error) {
      console.error(error);

      alert(JSON.stringify(error.response?.data, null, 2));

      const backendErrors = error.response?.data?.errors;

      if (backendErrors?.length) {
        const formatted = {};

        backendErrors.forEach((e) => {
          if (
            e.msg ===
            "El horario se superpone con otro del mismo docente o aula."
          ) {
            formatted.start_time = e.msg;
          } else if (
            e.msg ===
            "El alumno ya está inscripto en otra clase en ese mismo horario."
          ) {
            formatted.studentConflict = e.msg;
          } else if (e.msg === "La clase ya alcanzó el máximo de 5 alumnos.") {
            formatted.general = e.msg;
          } else {
            formatted[e.path] = e.msg;
          }
        });

        setErrorsCreate(formatted);
      }
    }
  };

  const handleEdit = async (schedule) => {
    setIsEditing(true);

    setErrorsEdit({});

    setSelectedSchedule(schedule);

    setTeacherId(schedule.teacher_id);
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
      })),
    );

    const plans = await Promise.all(
      studentsForSchedule.map(async (student) => {
        const response = await studentService.getPlans(
          student.student_id,
          schedule.teacher_id,
        );

        return {
          studentId: student.student_id,
          studentName: `${student.last_name}, ${student.first_name}`,
          plans: response.data.data,
          selectedPlans: response.data.data,
        };
      }),
    );

    setSelectedStudentPlans(plans);

    setIncompatibleStudents([]);

    setOpenEditModal(true); // ← mover esto acá
  };

  const fetchScheduleInfo = async (id) => {
    try {
      const res = await ScheduleService.getInfo(id);

      setSelectedScheduleInfo(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleInfo = async (schedule) => {
    setSelectedSchedule(schedule);

    await fetchScheduleInfo(schedule.id);

    setOpenInfoModal(true);
  };

  const handleUpdate = async () => {
    if (incompatibleStudents.length > 0) {
      setErrorsEdit((prev) => ({
        ...prev,
        plans:
          "No es posible guardar mientras existan alumnos incompatibles con el docente seleccionado.",
      }));

      return;
    }

    try {
      setErrorsEdit({});

      const newErrors = {};

      if (!teacherId) {
        newErrors.teacher_id = "Seleccione una opción válida.";
      }

      if (!selectedDay) {
        newErrors.day = "Seleccione una opción válida.";
      }

      if (!selectedTime) {
        newErrors.start_time = "Seleccione una opción válida.";
      }

      if (!classroom) {
        newErrors.classroom = "Seleccione una opción válida.";
      }

      if (selectedStudents.length === 0) {
        newErrors.students = "Seleccione al menos una opción válida.";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrorsEdit(newErrors);
        return;
      }

      await ScheduleService.update(selectedSchedule.id, {
        teacher_id: teacherId,
        start_time: selectedTime,
        day: selectedDay,
        classroom,
        students: selectedStudents.map((student) => student.id),
        schedule_id: selectedSchedule.id,
      });

      setOpenEditModal(false);

      resetForm();

      fetchSchedules();
      fetchScheduleStudents();
    } catch (error) {
      console.error(error);

      alert(JSON.stringify(error.response?.data, null, 2));

      const backendErrors = error.response?.data?.errors;

      if (backendErrors?.length) {
        const formatted = {};

        backendErrors.forEach((e) => {
          if (
            e.msg ===
            "El horario se superpone con otro del mismo docente o aula."
          ) {
            formatted.start_time = e.msg;
          } else if (
            e.msg ===
            "El alumno ya está inscripto en otra clase en ese mismo horario."
          ) {
            formatted.studentConflict = e.msg;
          } else if (e.msg === "La clase ya alcanzó el máximo de 5 alumnos.") {
            formatted.general = e.msg;
          } else {
            formatted[e.path] = e.msg;
          }
        });

        setErrorsEdit(formatted);
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

      fetchSchedules();
      fetchScheduleStudents();
    } catch (error) {
      console.error(error);

      const backendErrors = error.response?.data?.errors;

      if (backendErrors?.length) {
        setErrorsEdit({
          general: backendErrors[0].msg,
        });
      }
    }
  };

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

  return (
    <>
      {/* Encabezado */}
      <div className="flex justify-between mb-6">
        <select
          value={selectedTeacher}
          onChange={(e) => setSelectedTeacher(e.target.value)}
          className="p-2 border border-gray-300 rounded w-72"
        >
          <option value="">Todos los docentes</option>

          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.last_name}, {teacher.first_name}
            </option>
          ))}
        </select>

        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="p-2 border border-gray-300 rounded w-72"
        >
          <option value="">Todos los alumnos</option>

          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.last_name}, {student.first_name}
            </option>
          ))}
        </select>

        <select
          value={selectedClassroom}
          onChange={(e) => setSelectedClassroom(e.target.value)}
          className="p-2 border border-gray-300 rounded w-72"
        >
          <option value="">Todas las aulas</option>

          <option value="A">Aula A</option>

          <option value="B">Aula B</option>
        </select>

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
            +
          </button>
        )}
      </div>

      {/* Tabla */}
      <div
        className="
          overflow-auto
          max-h-[700px]
        "
      >
        <table
          className="
            w-full
            table-fixed
            border
            border-gray-300
          "
        >
          <thead className="sticky top-0 z-20 bg-gray-100">
            <tr>
              <th
                className="
                  sticky
                  top-0
                  left-0
                  z-30
                  bg-gray-100
                  border
                  p-2
                "
              >
                Horario
              </th>

              {days.map((day) => (
                <th
                  key={day.value}
                  className="
                    border
                    p-2
                    bg-gray-100
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
                    bg-white
                    border
                    p-2
                    font-semibold
                    w-[130px]
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
                        p-2
                        align-top
                        w-[180px]
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
                          const cardColor =
                            schedule.classroom === "A"
                              ? `
                                    bg-blue-200
                                    border-blue-600
                                  `
                              : `
                                    bg-red-200
                                    border-red-600
                                  `;

                          const students = scheduleStudents.filter(
                            (ss) => ss.schedule_id === schedule.id,
                          );

                          return (
                            <div
                              key={schedule.id}
                              className={
                                schedule.classroom === "A"
                                  ? `
                                    p-2
                                    rounded
                                    border
                                    bg-blue-200
                                    border-blue-800
                                    text-blue-800
                                  `
                                  : `
                                    p-2
                                    rounded
                                    border
                                    bg-red-200
                                    border-red-800
                                    text-red-800
                                  `
                              }
                            >
                              <div className="text-xs mb-1">
                                <span className="font-semibold">
                                  Docente:
                                </span>{" "}
                              </div>
                              <div className="text-xs ml-2">
                                {schedule.last_name}, {schedule.first_name}.
                              </div>

                              <div className="text-xs mb-1">
                                <span className="font-semibold">
                                  <br />
                                  Alumnos:
                                </span>
                              </div>

                              {students.map((student) => (
                                <div
                                  key={student.student_id}
                                  className="text-xs ml-2"
                                >
                                  {student.last_name}, {student.first_name}.
                                </div>
                              ))}

                              <div className="flex gap-1 mt-1">
                                <button
                                  onClick={() => handleInfo(schedule)}
                                  className="cursor-pointer ml-auto text-[10px] px-2 py-1 rounded bg-[#0cc0df] text-white"
                                  title="Más Info"
                                >
                                  ⓘ
                                </button>
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
          <label className="font-semibold mb-2">Docente</label>

          <select
            value={teacherId}
            onChange={(e) => {
              setTeacherId(e.target.value);
            }}
            className="
              border
              border-gray-300
              rounded
              px-3
              py-2
            "
          >
            <option value="">Seleccionar docente</option>

            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.last_name}, {teacher.first_name}
              </option>
            ))}
          </select>

          {errorsCreate.teacher_id && (
            <p className="text-red-500 text-sm mt-1">
              {errorsCreate.teacher_id}
            </p>
          )}
        </div>

        {/* Día */}

        <div className="flex flex-col mb-4">
          <label className="font-semibold mb-2">Día</label>

          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="
              border
              border-gray-300
              rounded
              px-3
              py-2
            "
          >
            <option value="">Seleccionar día</option>

            {days.map((day) => (
              <option key={day.value} value={day.value}>
                {day.name}
              </option>
            ))}
          </select>

          {errorsCreate.day && (
            <p className="text-red-500 text-sm mt-1">{errorsCreate.day}</p>
          )}
        </div>

        {/* Horario */}

        <div className="flex flex-col mb-4">
          <label className="font-semibold mb-2">Horario</label>

          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="
              border
              border-gray-300
              rounded
              px-3
              py-2
            "
          >
            <option value="">Seleccionar horario</option>

            {timeSlots.map((slot) => (
              <option key={slot} value={slot.split(" - ")[0]}>
                {slot}
              </option>
            ))}
          </select>

          {errorsCreate.start_time && (
            <p className="text-red-500 text-sm mt-1">
              {errorsCreate.start_time}
            </p>
          )}
        </div>

        {/* Aula */}

        <div className="flex flex-col mb-4">
          <label className="font-semibold mb-2">Aula</label>

          <select
            value={classroom}
            onChange={(e) => setClassroom(e.target.value)}
            className="
              border
              border-gray-300
              rounded
              px-3
              py-2
            "
          >
            <option value="">Seleccionar aula</option>

            {classrooms.map((room) => (
              <option key={room.value} value={room.value}>
                {room.name}
              </option>
            ))}
          </select>

          {errorsCreate.classroom && (
            <p className="text-red-500 text-sm mt-1">
              {errorsCreate.classroom}
            </p>
          )}
        </div>

        {/* Alumno */}

        <div className="flex flex-col mb-2">
          <label className="font-semibold mb-2">Alumno</label>

          <div className="flex gap-2">
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="
                flex-1
                border
                border-gray-300
                rounded
                px-3
                py-2
              "
            >
              <option value="">Seleccionar alumno</option>

              {students.map((student) => (
                <option
                  key={`${student.id}-${student.first_name}-${student.last_name}`}
                  value={student.id}
                >
                  {student.last_name}, {student.first_name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => handleAddStudent(false)}
              className="
                cursor-pointer
                px-4
                py-2
                rounded
                bg-[#0cc0df]
                text-white
              "
            >
              Agregar
            </button>
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

          {selectedStudentPlans.map((student) => (
            <div key={student.studentId}>
              <div
                className="
                  cursor-pointer
                  border
                  rounded-lg
                  p-4
                  mb-2
                  bg-gray-50
                "
              >
                <div className="flex justify-between items-center">
                  <div className="font-semibold">{student.studentName}</div>

                  <button
                    type="button"
                    className="cursor-pointer text-red-500 font-bold"
                    onClick={() => handleRemoveStudent(student.studentId)}
                  >
                    ✕
                  </button>
                </div>
                <div className="mt-4 font-semibold">Planes disponibles</div>
                <div className="space-y-2 mt-2">
                  {student.plans.map((plan) => (
                    <div key={plan.id}>
                      <label>
                        <input
                          type="checkbox"
                          checked={student.selectedPlans.some(
                            (p) => p.id === plan.id,
                          )}
                          onChange={() =>
                            handlePlanToggle(student.studentId, plan)
                          }
                        />{" "}
                        {plan.name}
                      </label>
                    </div>
                  ))}
                </div>
                {student.selectedPlans.length > 0 && (
                  <>
                    <div className="mt-4 font-semibold">Materias</div>

                    <div
                      className="
                      border
                      rounded
                      p-3
                      mt-2
                      space-y-1
                    "
                    >
                      {[
                        ...new Set(
                          student.selectedPlans.flatMap(
                            (plan) => plan.subjects,
                          ),
                        ),
                      ].map((subject) => (
                        <div key={subject}>• {subject}</div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {errorsCreate.studentConflict && (
                <div className="mt-4 text-sm text-red-500">
                  {errorsCreate.studentConflict}
                </div>
              )}
              {incompatibleStudents.includes(student.studentId) && (
                <div className="mt-4 text-sm text-red-500">
                  {student.studentName} no posee planes compatibles con el
                  docente seleccionado.
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 mt-10">
          <button
            onClick={() => {
              setOpenCreateModal(false);
              resetForm();
            }}
            className="
              cursor-pointer transition transform hover:scale-105
              px-4
              py-2
              border
              rounded
            "
          >
            Cancelar
          </button>

          {/* {errorsCreate.general && (
            <p className="text-red-500 text-sm mb-2">{errorsCreate.general}</p>
          )} */}
          <button
            onClick={handleCreate}
            className="
              cursor-pointer transition transform hover:scale-105
              px-4
              py-2
              rounded
              bg-[#0cc0df]
              text-white
            "
          >
            Crear
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          setSelectedSchedule(null);
          setIsEditing(false);
          resetForm();
        }}
      >
        <h2 className="text-xl font-bold mb-8">Editar Horario</h2>

        {/* Docente */}

        <div className="flex flex-col mb-4">
          <label className="font-semibold mb-2">Docente</label>

          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="
              border
              border-gray-300
              rounded
              px-3
              py-2
            "
          >
            <option value="">Seleccionar docente</option>

            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.last_name}, {teacher.first_name}
              </option>
            ))}
          </select>

          {errorsEdit.teacher_id && (
            <p className="mt-1 text-sm text-red-500">{errorsEdit.teacher_id}</p>
          )}
        </div>

        {/* Día */}

        <div className="flex flex-col mb-4">
          <label className="font-semibold mb-2">Día</label>

          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="
              border
              border-gray-300
              rounded
              px-3
              py-2
            "
          >
            <option value="">Seleccionar día</option>

            {days.map((day) => (
              <option key={day.value} value={day.value}>
                {day.name}
              </option>
            ))}
          </select>

          {errorsEdit.day && (
            <p className="mt-1 text-sm text-red-500">{errorsEdit.day}</p>
          )}
        </div>

        {/* Horario */}

        <div className="flex flex-col mb-4">
          <label className="font-semibold mb-2">Horario</label>

          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="
              border
              border-gray-300
              rounded
              px-3
              py-2
            "
          >
            <option value="">Seleccionar horario</option>

            {timeSlots.map((slot) => (
              <option key={slot} value={slot.split(" - ")[0]}>
                {slot}
              </option>
            ))}
          </select>

          {errorsEdit.start_time && (
            <p className="mt-1 text-sm text-red-500">{errorsEdit.start_time}</p>
          )}
        </div>

        {/* Aula */}

        <div className="flex flex-col mb-4">
          <label className="font-semibold mb-2">Aula</label>

          <select
            value={classroom}
            onChange={(e) => setClassroom(e.target.value)}
            className="
              border
              border-gray-300
              rounded
              px-3
              py-2
            "
          >
            <option value="">Seleccionar aula</option>

            {classrooms.map((room) => (
              <option key={room.value} value={room.value}>
                {room.name}
              </option>
            ))}
          </select>

          {errorsEdit.classroom && (
            <p className="mt-1 text-sm text-red-500">{errorsEdit.classroom}</p>
          )}
        </div>

        {/* Alumno */}

        <div className="flex flex-col mb-2">
          <label className="font-semibold mb-2">Alumno</label>

          <div className="flex gap-2">
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="
                flex-1
                border
                border-gray-300
                rounded
                px-3
                py-2
              "
            >
              <option value="">Seleccionar alumno</option>

              {students.map((student) => (
                <option
                  key={`${student.id}-${student.first_name}-${student.last_name}`}
                  value={student.id}
                >
                  {student.last_name}, {student.first_name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => handleAddStudent(true)}
              className="
                cursor-pointer
                px-4
                py-2
                rounded
                bg-[#0cc0df]
                text-white
              "
            >
              Agregar
            </button>
          </div>

          {errorsEdit.students && (
            <p className="mt-1 text-sm text-red-500">{errorsEdit.students}</p>
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

          {errorsEdit.plans && (
            <div className="mt-4 text-sm text-red-500">{errorsEdit.plans}</div>
          )}

          {selectedStudentPlans.map((student) => (
            <div key={student.studentId}>
              <div
                className="
                  border
                  rounded-lg
                  p-4
                  mb-2
                  bg-gray-50
                "
              >
                <div className="flex justify-between items-center">
                  <div className="font-semibold">{student.studentName}</div>

                  <button
                    type="button"
                    className="cursor-pointer text-red-500 font-bold"
                    onClick={() => handleRemoveStudent(student.studentId)}
                  >
                    ✕
                  </button>
                </div>
                <div className="mt-4 font-semibold">Planes disponibles</div>
                <div className="space-y-2 mt-2">
                  {student.plans.map((plan) => (
                    <div key={plan.id}>
                      <label>
                        <input
                          className="cursor-pointer"
                          type="checkbox"
                          checked={student.selectedPlans.some(
                            (p) => p.id === plan.id,
                          )}
                          onChange={() =>
                            handlePlanToggle(student.studentId, plan)
                          }
                        />{" "}
                        {plan.name}
                      </label>
                    </div>
                  ))}
                </div>
                {student.selectedPlans.length > 0 && (
                  <>
                    <div className="mt-4 font-semibold">Materias</div>

                    <div
                      className="
                      border
                      rounded
                      p-3
                      mt-2
                      space-y-1
                    "
                    >
                      {[
                        ...new Set(
                          student.selectedPlans.flatMap(
                            (plan) => plan.subjects,
                          ),
                        ),
                      ].map((subject) => (
                        <div key={subject}>• {subject}</div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {errorsEdit.studentConflict && (
                <div className="mt-4 text-sm text-red-500">
                  {errorsEdit.studentConflict}
                </div>
              )}
              {incompatibleStudents.includes(student.studentId) && (
                <div className="mt-4 text-sm text-red-500">
                  {student.studentName} no posee planes compatibles con el
                  docente seleccionado.
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 mt-10">
          <button
            onClick={() => {
              setOpenEditModal(false);
              setSelectedSchedule(null);
              resetForm();
            }}
            className="
              cursor-pointer transition transform hover:scale-105
              px-4
              py-2
              border
              rounded
            "
          >
            Cancelar
          </button>

          {/* {errorsEdit.general && (
            <p className="text-red-500 text-sm mb-2">{errorsEdit.general}</p>
          )} */}
          <button
            onClick={handleUpdate}
            className="
              cursor-pointer transition transform hover:scale-105
              px-4
              py-2
              rounded
              bg-[#0cc0df]
              text-white
            "
          >
            Guardar
          </button>
          {/* {errorsEdit.plans && (
            <div className="mt-2 text-sm text-red-500">{errorsEdit.plans}</div>
          )} */}
        </div>
      </Modal>

      <Modal isOpen={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <h2 className="text-lg font-semibold mb-4">¿Eliminar horario?</h2>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => setOpenDeleteModal(false)}
            className="
              cursor-pointer transition transform hover:scale-105
              px-4
              py-2
              border
              rounded
            "
          >
            Cancelar
          </button>

          <button
            onClick={confirmDelete}
            className="
              cursor-pointer transition transform hover:scale-105
              px-4
              py-2
              rounded
              bg-red-500
              text-white
            "
          >
            Eliminar
          </button>
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
                "
              >
                <div className="font-semibold text-black">
                  {selectedScheduleInfo.teacher}
                </div>

                <div className="mt-2 text-sm text-gray-600">
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
        "
                  >
                    <div className="font-semibold text-black">{plan.name}</div>

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

            {/* Alumnos */}
            <div className="space-y-3 mb-8">
              <h3 className="font-bold text-lg">Alumnos</h3>

              {selectedScheduleInfo.students.length === 0 ? (
                <div
                  className="
                    border
                    rounded-lg
                    p-4
                    bg-gray-50
                    text-gray-500
                  "
                >
                  No hay alumnos asignados.
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
                    "
                  >
                    <div className="font-semibold">{student.name}</div>

                    <div className="mt-2 text-sm text-gray-600">
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
              <button
                onClick={() => {
                  setOpenInfoModal(false);
                  setSelectedScheduleInfo(null);
                }}
                className="
                  cursor-pointer
                  w-28
                  px-4
                  py-2
                  border
                  rounded
                "
              >
                Cerrar
              </button>

              {isAdmin() && (
                <>
                  <button
                    onClick={() => {
                      setOpenInfoModal(false);

                      if (selectedSchedule) {
                        handleEdit(selectedSchedule);
                      }
                    }}
                    className="
                      cursor-pointer
                      w-28
                      px-4
                      py-2
                      rounded
                      bg-[#0cc0df]
                      text-white
                    "
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => {
                      setOpenInfoModal(false);

                      if (selectedSchedule) {
                        handleDelete(selectedSchedule);
                      }
                    }}
                    className="
                      cursor-pointer
                      w-28
                      px-4
                      py-2
                      rounded
                      bg-red-500
                      text-white
                    "
                  >
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
