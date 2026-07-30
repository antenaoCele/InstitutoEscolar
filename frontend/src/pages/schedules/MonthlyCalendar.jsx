import React, { useEffect, useState } from "react";
import axios from "axios";
import { eventService } from "../../services/event.service";
import { Modal } from "../../components/ui/Modal";
import { isAdmin } from "../../utils/auth";
import Button from "../../components/ui/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/Input";
import Select from "../../components/form/Select";
import { studentService } from "../../services/student.service";
import {
  ViewButton,
  EditButtonMonth,
  DeleteButtonMonth,
  PlusButton,
  YesButton,
  NoButton,
  AddButton,
  AssignTeacherButton,
  NextButton,
  PreviousButton,
} from "../../components/ui/ActionButtons";
import { BirthdayIcon } from "../../icons";
import { validateMonthlyCalendarForm } from "../../validators/entities/monthly_calendar.validator";
import { useFeedbackModal } from "../../hooks/useFeedbackModal";

export default function MonthlyCalendar() {
  // ======================================================
  // DATOS
  // ======================================================
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [birthdays, setBirthdays] = useState([]);

  // ======================================================
  // ESTADO DEL CALENDARIO
  // ======================================================
  const [currentDate, setCurrentDate] = useState(new Date());

  // ======================================================
  // MODALES
  // ======================================================
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const { feedbackModal, showFeedback, closeFeedback } = useFeedbackModal();

  // ======================================================
  // EVENTO SELECCIONADO
  // ======================================================
  const [selectedEvent, setSelectedEvent] = useState(null);

  // ======================================================
  // FORMULARIO DEL EVENTO
  // ======================================================
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");

  // ======================================================
  // ERRORES
  // ======================================================
  const [errorsCreate, setErrorsCreate] = useState({});
  const [errorsEdit, setErrorsEdit] = useState({});

  // ======================================================
  // CONSTANTES
  // ======================================================
  const year = currentDate.getFullYear();

  const month = currentDate.getMonth();

  const monthsNames = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  // ======================================================
  // FETCH DATOS PRINCIPALES
  // ======================================================
  const fetchEvents = async () => {
    try {
      const response = await eventService.getAll();

      const normalizedEvents = (response.data.data || []).map((event) => ({
        ...event,
        date: event.date?.slice(0, 10),
      }));

      setEvents(normalizedEvents);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchHolidays = async () => {
    try {
      const { data } = await axios.get(
        `https://api.argentinadatos.com/v1/feriados/${year}`,
      );

      setHolidays(data || []);
    } catch (error) {
      console.error("Error al cargar feriados:", error);
    }
  };

  const fetchBirthdays = async () => {
    try {
      const response = await studentService.getActiveStudents();

      setBirthdays(response.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  // ======================================================
  // RESETEO
  // ======================================================
  const resetForm = () => {
    setEventName("");
    setEventDate("");
    setEventTime("");

    setSelectedEvent(null);
  };

  // ======================================================
  // FUNCIONES AUXILARES
  // ======================================================
  const mapErrors = (errors) => {
    const formatted = {};

    errors.forEach((e) => {
      formatted[e.path] = e.msg;
    });
    return formatted;
  };

  // ======================================================
  // HANDLES CRUD
  // ======================================================
  const openCreate = () => {
    resetForm();
    setOpenCreateModal(true);
  };

  const handleCreate = async () => {
    try {
      setErrorsCreate({});

      const newErrors = validateMonthlyCalendarForm({
        name: eventName,
        date: eventDate,
        hour: eventTime,
      });

      if (Object.keys(newErrors).length > 0) {
        setErrorsCreate(newErrors);
        return;
      }

      const eventRes = await eventService.create({
        name: eventName,
        date: eventDate,
        hour: eventTime,
      });

      setOpenCreateModal(false);

      resetForm();

      fetchEvents();

      showFeedback("Evento creado correctamente.", "success");
    } catch (error) {
      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        setErrorsCreate(mapErrors(backendErrors));
      } else {
        showFeedback(
          error.response?.data?.message || "Error al crear el evento.",
          "error",
        );
      }
    }
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);

    setEventName(event.name || "");
    setEventDate(event.date || "");
    setEventTime(event.hour ? event.hour.slice(0, 5) : "");

    setErrorsEdit({});
    setOpenEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      setErrorsEdit({});

      const newErrors = validateMonthlyCalendarForm({
        name: eventName,
        date: eventDate,
        hour: eventTime,
      });

      if (Object.keys(newErrors).length > 0) {
        setErrorsEdit(newErrors);
        return;
      }
      await eventService.update(selectedEvent.id, {
        name: eventName,
        date: eventDate,
        hour: eventTime,
      });

      setOpenEditModal(false);

      resetForm();

      fetchEvents();

      showFeedback("Evento actualizado correctamente.", "success");
    } catch (error) {
      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        setErrorsEdit(mapErrors(backendErrors));
      } else {
        showFeedback(
          error.response?.data?.message || "Error al actualizar el evento.",
          "error",
        );
      }
      console.error(error);
    }
  };

  const handleDelete = (event) => {
    setSelectedEvent(event);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await eventService.delete(selectedEvent.id);

      setOpenDeleteModal(false);

      fetchEvents();

      showFeedback("Evento eliminado correctamente.", "success");
    } catch (error) {
      console.error(error);

      setOpenDeleteModal(false);

      showFeedback(
        error.response?.data?.message || "Error al eliminar el evento.",
        "error",
      );
    }
  };

  // ======================================================
  // HANDLES AUXILIARES
  // ======================================================
  const handlePreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
  };

  // ======================================================
  // USEEFFECTS
  // ======================================================
  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchHolidays();
  }, [year]);

  useEffect(() => {
    fetchBirthdays();
  }, []);

  // ======================================================
  // DATOS DERIVADOS
  // ======================================================

  // Obtenenemos la cantidad de días del mes
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Sabemos  en qué día de la semana comienza el mes
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;

  // Creamos las celdas vacías
  const blanks = Array(firstDayIndex).fill(null);

  // Creamos todos los días del mes
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Construimos la grilla del calendario
  const gridCells = [...blanks, ...days];

  // ======================================================
  // RETURN
  // ======================================================
  return (
    <div
      className="
        bg-white
        dark:bg-black

        border
        border-gray-200
        dark:border-gray-700

        rounded-xl
        p-5
      "
    >
      {/* Encabezado */}

      <div className="flex justify-center items-center gap-4 mb-6">
        <PreviousButton
          title="Mes anterior"
          onClick={handlePreviousMonth}
        ></PreviousButton>

        <h2
          className="
            text-2xl
            font-bold
            capitalize
            text-gray-900
            dark:text-white
          "
        >
          {monthsNames[month]} {year}
        </h2>

        <NextButton
          title="Mes siguiente"
          onClick={handleNextMonth}
        ></NextButton>
      </div>

      {isAdmin() && (
        <div className="flex justify-end mb-6">
          <PlusButton title="Crear Evento" onClick={openCreate} />
        </div>
      )}

      {/* Tabla */}
      <div
        className="
          overflow-auto

          bg-white
          dark:bg-black
        "
      >
        <table
          className="
            w-full
            border
            border-gray-300
            dark:border-gray-700
            table-fixed

            bg-white
            dark:bg-black
          "
        >
          <thead>
            <tr>
              {[
                "Lunes",
                "Martes",
                "Miércoles",
                "Jueves",
                "Viernes",
                "Sábado",
                "Domingo",
              ].map((day) => (
                <th
                  key={day}
                  className="
                    border
                    border-gray-300
                    dark:border-gray-700

                    bg-gray-100
                    dark:bg-black

                    text-gray-700
                    dark:text-gray-200

                    p-3
                  "
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({
              length: Math.ceil(gridCells.length / 7),
            }).map((_, weekIndex) => (
              <tr key={weekIndex}>
                {gridCells
                  .slice(weekIndex * 7, weekIndex * 7 + 7)
                  .map((day, dayIndex) => {
                    if (day === null) {
                      return (
                        <td
                          key={`blank-${weekIndex}-${dayIndex}`}
                          className="
                            border
                            border-gray-300
                            dark:border-gray-700

                            bg-gray-50
                            dark:bg-black

                            h-40
                          "
                        />
                      );
                    }

                    const currentDateString = `${year}-${String(
                      month + 1,
                    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

                    const holiday = holidays.find(
                      (h) => h.fecha === currentDateString,
                    );

                    const dayEvents = events.filter(
                      (event) => event.date === currentDateString,
                    );

                    const dayBirthdays = birthdays.filter((student) => {
                      const birth = new Date(student.birth_date);

                      return (
                        birth.getMonth() === month && birth.getDate() === day
                      );
                    });

                    const isWeekend = dayIndex === 5 || dayIndex === 6;

                    return (
                      <td
                        key={`day-${weekIndex}-${day}`}
                        className="
                          border
                          border-gray-300
                          dark:border-gray-700

                          bg-white
                          dark:bg-black

                          p-2
                          h-40
                          align-top

                          transition-colors
                          duration-150

                          hover:bg-cyan-50
                          dark:hover:bg-gray-900
                        "
                      >
                        <div
                          className="
                            font-bold
                            mb-1
                            text-gray-700
                            dark:text-gray-200
                            "
                        >
                          {day}
                        </div>

                        <div
                          className="
                            h-[100px]
                            overflow-y-auto
                            pr-1
                          "
                        >
                          {holiday && (
                            <div className="mb-2">
                              <div
                                className="
                                  text-xs
                                  font-semibold
                                  text-red-700
                                  dark:text-red-400
                                  break-words
                                  leading-tight
                                "
                              >
                                {holiday.nombre}
                              </div>
                            </div>
                          )}

                          {dayEvents.map((event) => (
                            <div
                              key={event.id}
                              className="
                                mt-2
                                p-1
                                rounded

                                bg-blue-100
                                dark:bg-blue-900/25

                                border
                                border-blue-300
                                dark:border-blue-700
                              "
                            >
                              <div
                                className="
                                  text-xs
                                  font-semibold

                                  text-blue-800
                                  dark:text-blue-200
                                  "
                              >
                                {event.name}
                              </div>

                              {event.hour && (
                                <div
                                  className="
                                    text-[10px]

                                    text-blue-600
                                    dark:text-blue-300
                                    "
                                >
                                  {event.hour.slice(0, 5)}
                                </div>
                              )}

                              {isAdmin() && (
                                <div className="flex gap-1 mt-1">
                                  <EditButtonMonth
                                    title="Editar Evento"
                                    onClick={() => handleEdit(event)}
                                  />

                                  <DeleteButtonMonth
                                    title="Eliminar Evento"
                                    onClick={() => handleDelete(event)}
                                  />
                                </div>
                              )}
                            </div>
                          ))}

                          {dayBirthdays.map((student) => {
                            const birth = new Date(student.birth_date);

                            const age = year - birth.getFullYear();

                            return (
                              <div
                                key={`birthday-${student.id}`}
                                className="
                                  mt-2
                                  p-1
                                  rounded

                                  bg-[#8d5df4]/15
                                  dark:bg-[#8d5df4]/20

                                  border
                                  border-[#8d5df4]
                                "
                              >
                                <div className="flex items-center gap-1 text-xs font-semibold text-pink-700">
                                  <BirthdayIcon className="w-4 h-4 text-[#8d5df4]" />

                                  <span
                                    className="
                                      text-xs
                                      font-semibold
                                      text-[#8d5df4]
                                      "
                                  >
                                    {student.last_name}, {student.first_name}
                                  </span>
                                </div>

                                <div
                                  className="
                                    text-[10px]
                                    text-[#8d5df4]
                                    "
                                >
                                  {age} años
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

      <Modal isOpen={openCreateModal} onClose={() => setOpenCreateModal(false)}>
        <h2 className="text-xl font-bold mb-8 ">Crear Evento</h2>

        <div className="flex flex-col mb-6">
          <Label>Evento</Label>

          <Input
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />

          {errorsCreate.name && (
            <p className="mt-1 text-sm text-red-500">{errorsCreate.name}</p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <Label>Fecha</Label>

          <Input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />

          {errorsCreate.date && (
            <p className="mt-1 text-sm text-red-500">{errorsCreate.date}</p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <Label className="font-semibold mb-2">Hora</Label>

          <Input
            type="time"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
          />

          {errorsCreate.hour && (
            <p className="mt-1 text-sm text-red-500">{errorsCreate.hour}</p>
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
          resetForm();
        }}
      >
        <h2 className="text-xl font-bold mb-8">Editar Evento</h2>

        <div className="flex flex-col mb-6">
          <Label>Evento</Label>

          <Input
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />

          {errorsEdit.name && (
            <p className="mt-1 text-sm text-red-500">{errorsEdit.name}</p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <Label>Fecha</Label>

          <Input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />

          {errorsEdit.date && (
            <p className="mt-1 text-sm text-red-500">{errorsEdit.date}</p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <Label>Hora</Label>

          <Input
            type="time"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
          />

          {errorsEdit.hour && (
            <p className="mt-1 text-sm text-red-500">{errorsEdit.hour}</p>
          )}
        </div>

        <div className="flex justify-end gap-4 mt-10">
          <NoButton title="Cancelar" onClick={() => setOpenEditModal(false)} />

          <YesButton title="Aceptar" onClick={handleUpdate} />
        </div>
      </Modal>

      <Modal isOpen={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <h2 className="text-lg font-semibold mb-4">¿Eliminar evento?</h2>

        <div className="flex justify-end gap-2">
          <NoButton
            title="Cancelar"
            onClick={() => setOpenDeleteModal(false)}
          />

          <YesButton title="Aceptar" onClick={confirmDelete} />
        </div>
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
    </div>
  );
}
