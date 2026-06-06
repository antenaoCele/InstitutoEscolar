import { useEffect, useState } from "react";
import { teacherService } from "../../services/teacher.service";
import { ScheduleService } from "../../services/schedule.service";
import { ScheduleStudentService } from "../../services/scheduleStudent.service";
import { studentService } from "../../services/student.service";
import { Modal } from "../../components/ui/Modal";
import { teacherSubjectService }
from "../../services/teacherSubject.service";
import { isAdmin } from "../../utils/auth";

export default function WeeklyCalendar() {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");

  const [schedules, setSchedules] = useState([]);
  const [scheduleStudents, setScheduleStudents] = useState([]);

  const [openCreateModal, setOpenCreateModal] = useState(false);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [teacherId, setTeacherId] = useState("");
  const [classroom, setClassroom] = useState("");

  const [selectedStudents, setSelectedStudents] = useState([]);

  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [students, setStudents] = useState([]);

  const [teacherSubjects, setTeacherSubjects] = useState([]);

  const [subjectId, setSubjectId] = useState("");

  const [errorsCreate, setErrorsCreate] = useState({});
  const [errorsEdit, setErrorsEdit] = useState({});
  

  const fetchTeachers = async () => {
    try {
      const res = await teacherService.getAll();

      setTeachers(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

    const fetchSchedules = async () => {
      try {
        const res = await ScheduleService.getAll();

        console.log("SCHEDULE RESPONSE:");
        console.log(res.data);

        setSchedules(res.data.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchScheduleStudents = async () => {
      try {
        const res =
          await ScheduleStudentService.getAll();

        console.log("SCHEDULE STUDENTS RESPONSE:");
        console.log(res.data);

        setScheduleStudents(
          res.data.data || []
        );
      } catch (error) {
        console.error(error);
      }
    };

    const fetchStudents = async () => {
      try {
        const res = await studentService.getAll();

        const uniqueStudents = [
          ...new Map(
            (res.data.data || []).map(student => [
              student.id,
              student,
            ])
          ).values(),
        ];

        setStudents(uniqueStudents);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchTeacherSubjects =
      async () => {
        try {

          const res =
            await teacherSubjectService.getAll();

          setTeacherSubjects(
            res.data.data || []
          );

        } catch (error) {
          console.error(error);
        }
      };

    console.table(
      students.map((s) => ({
        id: s.id,
        apellido: s.last_name,
        nombre: s.first_name,
      }))
    );

    const handleAddStudent = () => {
        if (!selectedStudentId) return;

        const student = students.find(
          (s) => s.id === Number(selectedStudentId)
        );

        if (!student) return;

        const exists = selectedStudents.some(
          (s) => s.id === student.id
        );

        if (exists) return;

        setSelectedStudents((prev) => [
           ...prev,
           student,
        ]);

        setSelectedStudentId("");
    };

    const handleRemoveStudent = (id) => {
      setSelectedStudents((prev) =>
        prev.filter((s) => s.id !== id)
      );
    };

    useEffect(() => {
      fetchTeachers();
      fetchSchedules();
      fetchScheduleStudents();
      fetchStudents();
      fetchTeacherSubjects();
    }, []);

    const resetForm = () => {

    };

   const mapErrors = (errors) => {
    const formatted = {};

    errors.forEach((e) => {
      formatted[e.path] = e.msg;
    });
    return formatted;
  };

  const openCreate = () => {

  };

  const handleCreate = async () => {
    try {
        
    } catch (error) {
        const backendErrors = error.response?.data?.errors;

        if (backendErrors) {
          setErrorsCreate(
            mapErrors(backendErrors)
          );
       }
    };
  }

  const handleEdit = (schedule) => {
  setSelectedSchedule(schedule);

  setTeacherId(schedule.teacher_id);
  setSubjectId(schedule.subject_id);
  setSelectedDay(schedule.day);
  setSelectedTime(
    schedule.start_time.slice(0, 5)
  );
  setClassroom(schedule.classroom);

  setErrorsEdit({});

  setOpenEditModal(true);
};

   const handleUpdate = async () => {
    try {
      setErrorsEdit({});

      const newErrors = {};
        
    } catch (error) { 
        const backendErrors = error.response?.data?.errors;

        if (backendErrors) {
          setErrorsEdit(
          mapErrors(backendErrors)
          );
        }

        console.error(error);
      }
  }

  const handleDelete = (schedule) => {
    setSelectedSchedule(schedule);

    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
        
    } catch (error) {
        console.error(error);
  
        alert(error.response?.data?.message || "Error al eliminar");
      }
  };

    console.log("SCHEDULES:");
    console.log("SCHEDULES");
    console.table(schedules);

    console.log("SCHEDULE STUDENTS");
    console.table(scheduleStudents);

    console.log("SCHEDULE STUDENTS:");
    console.log(scheduleStudents);

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

  console.log("STUDENTS:");
  console.table(
    students.map((s) => ({
      id: s.id,
      apellido: s.last_name,
      nombre: s.first_name,
    }))
  );

  console.log(
    "PRIMER HORARIO",
    schedules[0]
  );

  console.log(
    "PRIMER SCHEDULE_STUDENT",
    scheduleStudents[0]
  );

  const availableSubjects =
  teacherSubjects.filter(
    (ts) =>
      Number(ts.teacher_id) ===
      Number(teacherId)
  );

  return (
    <>
      {/* Encabezado */}
      <div className="flex justify-between mb-6">
        <select
          value={selectedTeacher}
          onChange={(e) =>
            setSelectedTeacher(e.target.value)
          }
          className="p-2 border border-gray-300 rounded w-72"
        >
          <option value="">
            Seleccionar docente
          </option>

          {teachers.map((teacher) => (
            <option
              key={teacher.id}
              value={teacher.id}
            >
              {teacher.last_name}, {teacher.first_name}
            </option>
          ))}
        </select>

        {isAdmin() && (
          <button
            onClick={() => setOpenCreateModal(true)}
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
      <div className="overflow-auto">
        <table className="w-full border border-gray-300">
          
          <thead>
            <tr>
              <th className="border p-2 bg-gray-100">
                Horario
              </th>

              {days.map((day) => (
                <th key={day.value}>
                  {day.name}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {timeSlots.map((slot) => (
              <tr key={slot}>
                <td className="border p-2 font-semibold">
                  {slot}
                </td>

                {days.map((day) => {

                  const slotStart =
                    slot.split(" - ")[0];

                  const schedule = schedules.find(
                    (s) =>
                      Number(s.day) === day.value &&
                      s.start_time.slice(0, 5) === slotStart
                  );

                  const students =
                    scheduleStudents.filter(
                      (ss) =>
                        ss.schedule_id === schedule?.id
                    );

                  return (
                    <td
                      key={`${day.value}-${slot}`}
                      className="
                        border
                        p-2
                        align-top
                        h-40
                      "
                    >
                      {schedule && (
                        <div
                          className="
                            mt-2
                            p-2
                            rounded
                            bg-blue-100
                            border
                            border-blue-300
                          "
                        >
                          <div className="text-xs mb-2">
                            Docente: {schedule.last_name}, {schedule.first_name}
                          </div>

                          <div className="text-xs mb-2">
                            Materia: {schedule.subject_name}
                          </div>

                          <div className="text-xs mb-2">
                            Aula: {schedule.classroom}
                          </div>

                          {students.map((student) => (
                            <div
                              key={student.student_id}
                              className="text-xs mb-2"
                            >
                              Alumnos: {student.last_name}, {student.first_name}
                            </div>
                          ))}

                          {isAdmin() && (
                            <div className="flex gap-1 mt-1">
                              <button
                              onClick={() => handleEdit(schedule)}
                              className="
                                cursor-pointer transition transform hover:scale-105
                                text-[10px]
                                px-2
                                py-1
                                rounded
                                bg-[#0cc0df]
                                text-white
                                "
                                >
                                  Editar
                                </button>
                          
                                <button
                                onClick={() => handleDelete(schedule)}
                                className="
                                  cursor-pointer transition transform hover:scale-105
                                  text-[10px]
                                  px-2
                                  py-1
                                  rounded
                                  bg-red-500
                                  text-white
                                  "
                                >
                                  Eliminar
                                </button>
                            </div>
                      )}
                        </div>
                        
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mt-6">
          <button
            onClick={() => setOpenCreateModal(true)}
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
        </div>
      </div>

      <Modal
        isOpen={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
      >
        <h2 className="text-xl font-bold mb-8">
          Crear Horario
        </h2>

        {/* Docente */}

        <div className="flex flex-col mb-4">
          <label className="font-semibold mb-2">
            Docente
          </label>

          <select
            value={teacherId}
            onChange={(e) =>
              setTeacherId(e.target.value)
            }
            className="
              border
              border-gray-300
              rounded
              px-3
              py-2
            "
          >
            <option value="">
              Seleccionar docente
            </option>

            {teachers.map((teacher) => (
              <option
                key={teacher.id}
                value={teacher.id}
              >
                {teacher.last_name},{" "}
                {teacher.first_name}
              </option>
            ))}
          </select>

          {errorsCreate.teacher_id && (
            <p className="mt-1 text-sm text-red-500">
              {errorsCreate.teacher_id}
            </p>
          )}
        </div>

        {/* Materia */}

        <div className="flex flex-col mb-4">
          <label className="font-semibold mb-2">
            Materia
          </label>

          <select
            value={subjectId}
            onChange={(e) =>
              setSubjectId(e.target.value)
            }
            className="
              border
              border-gray-300
              rounded
              px-3
              py-2
            "
          >
            <option value="">
              Seleccionar materia
            </option>

            {availableSubjects.map((subject) => (
              <option
                key={subject.id}
                value={subject.subject_id}
              >
                {subject.subject_name}
              </option>
            ))}
          </select>

          {errorsCreate.subject_id && (
            <p className="mt-1 text-sm text-red-500">
              {errorsCreate.subject_id}
            </p>
          )}
        </div>

        {/* Día */}

        <div className="flex flex-col mb-4">
          <label className="font-semibold mb-2">
            Día
          </label>

          <select
            value={selectedDay}
            onChange={(e) =>
              setSelectedDay(e.target.value)
            }
            className="
              border
              border-gray-300
              rounded
              px-3
              py-2
            "
          >
            <option value="">
              Seleccionar día
            </option>

            {days.map((day) => (
              <option
                key={day.value}
                value={day.value}
              >
                {day.name}
              </option>
            ))}
          </select>

          {errorsCreate.day && (
            <p className="mt-1 text-sm text-red-500">
              {errorsCreate.day}
            </p>
          )}
        </div>

        {/* Horario */}

        <div className="flex flex-col mb-4">
          <label className="font-semibold mb-2">
            Horario
          </label>

          <select
            value={selectedTime}
            onChange={(e) =>
              setSelectedTime(e.target.value)
            }
            className="
              border
              border-gray-300
              rounded
              px-3
              py-2
            "
          >
            <option value="">
              Seleccionar horario
            </option>

            {timeSlots.map((slot) => (
              <option
                key={slot}
                value={slot.split(" - ")[0]}
              >
                {slot}
              </option>
            ))}
          </select>

          {errorsCreate.start_time && (
            <p className="mt-1 text-sm text-red-500">
              {errorsCreate.start_time}
            </p>
          )}
        </div>

        {/* Aula */}

        <div className="flex flex-col mb-4">
          <label className="font-semibold mb-2">
            Aula
          </label>

          <select
            value={classroom}
            onChange={(e) =>
              setClassroom(e.target.value)
            }
            className="
              border
              border-gray-300
              rounded
              px-3
              py-2
            "
          >
            <option value="">
              Seleccionar aula
            </option>

            {classrooms.map((room) => (
              <option
                key={room.value}
                value={room.value}
              >
                {room.name}
              </option>
            ))}
          </select>

          {errorsCreate.classroom && (
            <p className="mt-1 text-sm text-red-500">
              {errorsCreate.classroom}
            </p>
          )}
        </div>

        {/* Alumno */}

        <div className="flex flex-col mb-2">
          <label className="font-semibold mb-2">
            Alumno
          </label>

          <div className="flex gap-2">
            <select
              value={selectedStudentId}
              onChange={(e) =>
                setSelectedStudentId(
                  e.target.value
                )
              }
              className="
                flex-1
                border
                border-gray-300
                rounded
                px-3
                py-2
              "
            >
              <option value="">
                Seleccionar alumno
              </option>

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
              onClick={handleAddStudent}
              className="
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

          {/* {errorsCreate.selectedStudent && (
            <p className="mt-1 text-sm text-red-500">
              {errorsCreate.selectedStudent}
            </p>
          )} */}
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
                {student.last_name},{" "}
                {student.first_name}
              </span>

              <button
                type="button"
                onClick={() =>
                  handleRemoveStudent(student.id)
                }
                className="
                  text-red-500
                  font-bold
                "
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 mt-10">
          <button
            onClick={() =>
              setOpenCreateModal(false)
            }
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
          resetForm();
        }}
      >
        <h2 className="text-xl font-bold mb-8">
          Editar Horario
        </h2>

        {/* Docente */}

        <div className="flex flex-col mb-4">
          <label className="font-semibold mb-2">
            Docente
          </label>

          <select
            value={teacherId}
            onChange={(e) =>
              setTeacherId(e.target.value)
            }
            className="
              border
              border-gray-300
              rounded
              px-3
              py-2
            "
          >
            <option value="">
              Seleccionar docente
            </option>

            {teachers.map((teacher) => (
              <option
                key={teacher.id}
                value={teacher.id}
              >
                {teacher.last_name},{" "}
                {teacher.first_name}
              </option>
            ))}
          </select>

          {errorsEdit.teacher_id && (
            <p className="mt-1 text-sm text-red-500">
              {errorsEdit.teacher_id}
            </p>
          )}
        </div>

        {/* Materia */}

        <div className="flex flex-col mb-4">
          <label className="font-semibold mb-2">
            Materia
          </label>

          <select
            value={subjectId}
            onChange={(e) =>
              setSubjectId(e.target.value)
            }
            className="
              border
              border-gray-300
              rounded
              px-3
              py-2
            "
          >
            <option value="">
              Seleccionar materia
            </option>

            {availableSubjects.map((subject) => (
              <option
                key={subject.id}
                value={subject.subject_id}
              >
                {subject.subject_name}
              </option>
            ))}
          </select>

          {errorsEdit.subject_id && (
            <p className="mt-1 text-sm text-red-500">
              {errorsEdit.subject_id}
            </p>
          )}
        </div>

        {/* Día */}

        <div className="flex flex-col mb-4">
          <label className="font-semibold mb-2">
            Día
          </label>

          <select
            value={selectedDay}
            onChange={(e) =>
              setSelectedDay(e.target.value)
            }
            className="
              border
              border-gray-300
              rounded
              px-3
              py-2
            "
          >
            <option value="">
              Seleccionar día
            </option>

            {days.map((day) => (
              <option
                key={day.value}
                value={day.value}
              >
                {day.name}
              </option>
            ))}
          </select>

          {errorsEdit.day && (
            <p className="mt-1 text-sm text-red-500">
              {errorsEdit.day}
            </p>
          )}
        </div>

        {/* Horario */}

        <div className="flex flex-col mb-4">
          <label className="font-semibold mb-2">
            Horario
          </label>

          <select
            value={selectedTime}
            onChange={(e) =>
              setSelectedTime(e.target.value)
            }
            className="
              border
              border-gray-300
              rounded
              px-3
              py-2
            "
          >
            <option value="">
              Seleccionar horario
            </option>

            {timeSlots.map((slot) => (
              <option
                key={slot}
                value={slot.split(" - ")[0]}
              >
                {slot}
              </option>
            ))}
          </select>

          {errorsEdit.start_time && (
            <p className="mt-1 text-sm text-red-500">
              {errorsEdit.start_time}
            </p>
          )}
        </div>

        {/* Aula */}

        <div className="flex flex-col mb-4">
          <label className="font-semibold mb-2">
            Aula
          </label>

          <select
            value={classroom}
            onChange={(e) =>
              setClassroom(e.target.value)
            }
            className="
              border
              border-gray-300
              rounded
              px-3
              py-2
            "
          >
            <option value="">
              Seleccionar aula
            </option>

            {classrooms.map((room) => (
              <option
                key={room.value}
                value={room.value}
              >
                {room.name}
              </option>
            ))}
          </select>

          {errorsEdit.classroom && (
            <p className="mt-1 text-sm text-red-500">
              {errorsEdit.classroom}
            </p>
          )}
        </div>

        {/* Alumno */}

        <div className="flex flex-col mb-2">
          <label className="font-semibold mb-2">
            Alumno
          </label>

          <div className="flex gap-2">
            <select
              value={selectedStudentId}
              onChange={(e) =>
                setSelectedStudentId(
                  e.target.value
                )
              }
              className="
                flex-1
                border
                border-gray-300
                rounded
                px-3
                py-2
              "
            >
              <option value="">
                Seleccionar alumno
              </option>

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
              onClick={handleAddStudent}
              className="
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

          {/* {errorsEdit.selectedStudent && (
            <p className="mt-1 text-sm text-red-500">
              {errorsEdit.selectedStudent}
            </p>
          )} */}
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
                {student.last_name},{" "}
                {student.first_name}
              </span>

              <button
                type="button"
                onClick={() =>
                  handleRemoveStudent(student.id)
                }
                className="
                  text-red-500
                  font-bold
                "
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 mt-10">
          <button
            onClick={() =>
              setOpenEditModal(false)
            }
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
        </div>
      </Modal>
      
      <Modal
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
      >
        <h2 className="text-lg font-semibold mb-4">
          ¿Eliminar horario?
        </h2>

        <div className="flex justify-end gap-2">
          <button
            onClick={() =>
              setOpenDeleteModal(false)
            }
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
    </>
  );
}