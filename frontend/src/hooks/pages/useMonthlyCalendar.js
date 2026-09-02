import { useEffect, useState } from "react";
import axios from "axios";

import { eventService } from "../../services/event.service";
import { studentService } from "../../services/student.service";

import { validateMonthlyCalendarForm } from "../../validators/entities/monthly_calendar.validator";

import { useFeedbackModal } from "../shared/useFeedBackModal";

export function useMonthlyCalendar() {
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
  // FUNCIONES AUXILIARES
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
    setErrorsCreate({});
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

      await eventService.create({
        name: eventName,
        date: eventDate,
        hour: eventTime,
      });

      setOpenCreateModal(false);

      resetForm();

      await fetchEvents();

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

      await fetchEvents();

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
      setSelectedEvent(null);

      await fetchEvents();

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
  // HANDLES DEL CALENDARIO
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
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;

  const blanks = Array(firstDayIndex).fill(null);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const gridCells = [...blanks, ...days];

  // ======================================================
  // RETURN
  // ======================================================
  return {
    // ====================================================
    // DATOS
    // ====================================================
    events,
    holidays,
    birthdays,

    // ====================================================
    // CALENDARIO
    // ====================================================
    year,
    month,
    monthsNames,
    gridCells,

    // ====================================================
    // MODALES
    // ====================================================
    openCreateModal,
    setOpenCreateModal,

    openEditModal,
    setOpenEditModal,

    openDeleteModal,
    setOpenDeleteModal,

    // ====================================================
    // FEEDBACK
    // ====================================================
    feedbackModal,
    closeFeedback,

    // ====================================================
    // EVENTO SELECCIONADO
    // ====================================================
    selectedEvent,

    // ====================================================
    // FORMULARIO
    // ====================================================
    eventName,
    setEventName,

    eventDate,
    setEventDate,

    eventTime,
    setEventTime,

    // ====================================================
    // ERRORES
    // ====================================================
    errorsCreate,
    setErrorsCreate,

    errorsEdit,
    setErrorsEdit,

    // ====================================================
    // CRUD
    // ====================================================
    openCreate,
    handleCreate,
    handleEdit,
    handleUpdate,
    handleDelete,
    confirmDelete,

    // ====================================================
    // NAVEGACIÓN
    // ====================================================
    handlePreviousMonth,
    handleNextMonth,

    // ====================================================
    // UTILIDADES
    // ====================================================
    resetForm,
    fetchEvents,
    fetchHolidays,
    fetchBirthdays,
  };
}
