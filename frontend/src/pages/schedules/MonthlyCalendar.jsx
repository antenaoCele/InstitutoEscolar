import { isAdmin } from "../../utils/auth";

import {
  PlusButton,
  NextButton,
  PreviousButton,
} from "../../components/ui/ActionButtons";

import FeedbackModal from "../../components/ui/FeedbackModal";

import MonthlyCalendarGrid from "../../components/page-schedules/page-monthlyCalendar/MonthlyCalendarGrid";
import MonthlyCalendarCreateModal from "../../components/page-schedules/page-monthlyCalendar/MonthlyCalendarCreateModal";
import MonthlyCalendarEditModal from "../../components/page-schedules/page-monthlyCalendar/MonthlyCalendarEditModal";
import MonthlyCalendarDeleteModal from "../../components/page-schedules/page-monthlyCalendar/MonthlyCalendarDeleteModal";

import { useMonthlyCalendar } from "../../hooks/pages/schedules/useMonthlyCalendar";

export default function MonthlyCalendar() {
  const {
    // ======================================================
    // DATOS
    // ======================================================
    events,
    holidays,
    birthdays,

    // ======================================================
    // CALENDARIO
    // ======================================================
    year,
    month,
    monthsNames,
    gridCells,

    // ======================================================
    // MODALES
    // ======================================================
    openCreateModal,
    setOpenCreateModal,
    openEditModal,
    setOpenEditModal,
    openDeleteModal,
    setOpenDeleteModal,

    // ======================================================
    // FEEDBACK
    // ======================================================
    feedbackModal,
    closeFeedback,

    // ======================================================
    // EVENTO SELECCIONADO
    // ======================================================
    selectedEvent,

    // ======================================================
    // FORMULARIO
    // ======================================================
    eventName,
    setEventName,
    eventDate,
    setEventDate,
    eventTime,
    setEventTime,

    // ======================================================
    // ERRORES
    // ======================================================
    errorsCreate,
    setErrorsCreate,
    errorsEdit,

    // ======================================================
    // HANDLES CRUD
    // ======================================================
    openCreate,
    handleCreate,
    handleEdit,
    handleUpdate,
    handleDelete,
    confirmDelete,

    // ======================================================
    // NAVEGACIÓN
    // ======================================================
    handlePreviousMonth,
    handleNextMonth,

    // ======================================================
    // RESETEO
    // ======================================================
    resetForm,
  } = useMonthlyCalendar();

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
      {/* ======================================================
          NAVEGACIÓN DEL MES
      ====================================================== */}
      <div className="flex justify-center items-center gap-4 mb-6">
        <PreviousButton title="Mes anterior" onClick={handlePreviousMonth} />

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

        <NextButton title="Mes siguiente" onClick={handleNextMonth} />
      </div>

      {/* ======================================================
          BOTÓN CREAR EVENTO
      ====================================================== */}
      {isAdmin() && (
        <div className="flex justify-end mb-6">
          <PlusButton title="Crear Evento" onClick={openCreate} />
        </div>
      )}

      {/* ======================================================
          CALENDARIO
      ====================================================== */}
      <MonthlyCalendarGrid
        year={year}
        month={month}
        gridCells={gridCells}
        events={events}
        holidays={holidays}
        birthdays={birthdays}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* ======================================================
          MODAL CREAR
      ====================================================== */}
      <MonthlyCalendarCreateModal
        isOpen={openCreateModal}
        onClose={() => {
          setOpenCreateModal(false);
          setErrorsCreate({});
        }}
        eventName={eventName}
        onEventNameChange={setEventName}
        eventDate={eventDate}
        onEventDateChange={setEventDate}
        eventTime={eventTime}
        onEventTimeChange={setEventTime}
        errors={errorsCreate}
        onConfirm={handleCreate}
      />

      {/* ======================================================
          MODAL EDITAR
      ====================================================== */}
      <MonthlyCalendarEditModal
        isOpen={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          resetForm();
        }}
        eventName={eventName}
        onEventNameChange={setEventName}
        eventDate={eventDate}
        onEventDateChange={setEventDate}
        eventTime={eventTime}
        onEventTimeChange={setEventTime}
        errors={errorsEdit}
        onConfirm={handleUpdate}
      />

      {/* ======================================================
          MODAL ELIMINAR
      ====================================================== */}
      <MonthlyCalendarDeleteModal
        isOpen={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
        }}
        event={selectedEvent}
        onConfirm={confirmDelete}
      />

      {/* ======================================================
          FEEDBACK
      ====================================================== */}
      <FeedbackModal feedback={feedbackModal} onClose={closeFeedback} />
    </div>
  );
}
