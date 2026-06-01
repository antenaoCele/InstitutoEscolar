import React, { useEffect, useState } from "react";
import { eventService } from "../../services/event.service";
import { Modal } from "../../components/ui/Modal";
import { isAdmin } from "../../utils/auth";

export default function MonthlyCalendar() {
  const [currentDate, setCurrentDate] = useState(
    new Date()
  );

  const [openCreateModal, setOpenCreateModal] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState(null);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");

  const [events, setEvents] = useState([]);

  const [holidays, setHolidays] = useState([]);

  const [errorsCreate, setErrorsCreate] = useState({});
  const [errorsEdit, setErrorsEdit] = useState({});

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

  const fetchEvents = async () => {
    try {
      const response = await eventService.getAll();

      console.log(response.data.data);

      const normalizedEvents =
      (response.data.data || []).map(
        (event) => ({
          ...event,
          date: event.date?.slice(0, 10),
        })
      );

    setEvents(normalizedEvents);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchHolidays = async () => {
    try {
      const response = await fetch(
        `https://api.argentinadatos.com/v1/feriados/${year}`
      );

      const data = await response.json();

      setHolidays(data || []);
    } catch (error) {
      console.error(
        "Error al cargar feriados:",
        error
      );
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchHolidays();
  }, [year]);

  const resetForm = () => {
    setEventName("");
    setEventDate("");
    setEventTime("");

    setSelectedEvent(null);
  };

  const mapErrors = (errors) => {
    const formatted = {};

    errors.forEach((e) => {
      formatted[e.path] = e.msg;
    });
    return formatted;
  };

  const openCreate = () => {
    resetForm();
    setOpenCreateModal(true);
  };

  const handleCreate = async () => {
    try {
      setErrorsCreate({});

      const newErrors = {};

      if (!eventName.trim()) {
        newErrors.name =
          "Este campo no puede estar vacío.";
      }

      if (!eventDate) {
        newErrors.date =
          "Ingrese una fecha válida.";
      }

      if (!eventTime) {
        newErrors.hour =
          "Ingrese una hora válida.";
      }

      if (
        Object.keys(newErrors).length > 0
      ) {
        setErrorsCreate(newErrors);
        return;
      }

      const eventRes = await eventService.create({
        name: eventName,
        date: eventDate,
        hour: eventTime,
        
      });

      console.log(eventRes.data);

      setOpenCreateModal(false);

      resetForm();

      fetchEvents();
    } catch (error) {
      const backendErrors =
        error.response?.data?.errors;

          console.log(
              "BACKEND ERROR:"
            );

            console.log(
              error.response?.data
            );

      if (backendErrors) {
        setErrorsCreate(
          mapErrors(backendErrors)
        );
      }
    }
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);

    setEventName(event.name || "");
    setEventDate(event.date || "");
    setEventTime(
      event.hour
        ? event.hour.slice(0, 5)
        : ""
    );

    setErrorsEdit({});
    setOpenEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      setErrorsEdit({});

      const newErrors = {};

      if (!eventName.trim()) {
        newErrors.name =
          "Este campo no puede estar vacío.";
      }

      if (!eventDate) {
        newErrors.date =
          "Ingrese una fecha válida.";
      }

      if (!eventTime) {
        newErrors.hour =
          "Ingrese una hora válida.";
      }

      if (
        Object.keys(newErrors).length > 0
      ) {
        setErrorsEdit(newErrors);
        return;
      }

      await eventService.update(
        selectedEvent.id,
        {
          name: eventName,
          date: eventDate,
          hour: eventTime,
        }
      );

      setOpenEditModal(false);

      resetForm();

      fetchEvents();
    } catch (error) {
        const backendErrors = error.response?.data?.errors;

        console.log(
          "UPDATE ERROR:"
        );

        if (backendErrors) {
              setErrorsEdit(
                mapErrors(backendErrors)
              );
            }

        console.log(
          error.response?.data
        );

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
      
    } catch (error) {
        console.log(
          "DELETE ERROR:"
        );

        console.log(
          error.response?.data
        );

        console.error(error);

      alert(
        error.response?.data?.message ||
          "Error al eliminar"
      );
      }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(year, month - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(year, month + 1)
    );
  };

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const firstDayIndex =
    (new Date(year, month, 1).getDay() + 6) %
    7;

  const blanks = Array(firstDayIndex).fill(
    null
  );

  const days = Array.from(
    { length: daysInMonth },
    (_, i) => i + 1
  );

  const gridCells = [...blanks, ...days];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* Header */}

      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handlePreviousMonth}
          className="
            cursor-pointer transition transform hover:scale-105
            px-4
            py-2
            rounded-lg
            bg-[#0cc0df]
            text-white
            hover:opacity-90
            transition
          "
        >
          ←
        </button>

        <h2 className="text-2xl font-bold capitalize">
          {monthsNames[month]} {year}
        </h2>

        <button
          onClick={handleNextMonth}
          className="
            cursor-pointer transition transform hover:scale-105
            px-4
            py-2
            rounded-lg
            bg-[#0cc0df]
            text-white
            hover:opacity-90
            transition
          "
        >
         →
        </button>
      </div>

      
      {isAdmin() && (
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setOpenCreateModal(true)}
              className="
                cursor-pointer transition transform hover:scale-105
                px-4
                py-2
                rounded-lg
                bg-[#0cc0df]
                text-white
                hover:opacity-90
                transition
              "
            >
              Crear Evento
            </button>
          </div>
        )}


      {/* Tabla */}

      <div className="overflow-auto">
        <table className="w-full border border-gray-300 table-fixed">
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
                  className="border p-3 bg-gray-100"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({
              length: Math.ceil(
                gridCells.length / 7
              ),
            }).map((_, weekIndex) => (
              <tr key={weekIndex}>
                {gridCells
                  .slice(
                    weekIndex * 7,
                    weekIndex * 7 + 7
                  )
                  .map((day, dayIndex) => {
                    if (day === null) {
                      return (
                        <td
                          key={`blank-${weekIndex}-${dayIndex}`}
                          className="
                            border
                            bg-gray-50
                            h-40
                          "
                        />
                      );
                    }

                    const currentDateString =
                      `${year}-${String(
                        month + 1
                      ).padStart(
                        2,
                        "0"
                      )}-${String(day).padStart(
                        2,
                        "0"
                      )}`;

                    const holiday =
                      holidays.find(
                        (h) =>
                          h.fecha ===
                          currentDateString
                      );

                    const dayEvents = events.filter(
                      (event) => event.date === currentDateString
                    );

                    const isWeekend =
                      dayIndex === 5 ||
                      dayIndex === 6;

                    return (
                        <td
                          key={`day-${weekIndex}-${day}`}
                          className="
                            border
                            p-2
                            h-40
                            align-top
                          "
                        >
                        <div className="font-bold text-gray-700 mb-1">
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
                                  text-red-800
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
                                border
                                border-blue-300
                              "
                            >
                              <div className="text-xs font-semibold text-blue-800">
                                {event.name}
                              </div>

                              {event.hour && (
                                <div className="text-[10px] text-blue-600">
                                  {event.hour}
                                </div>
                              )}

                            {isAdmin() && (
                              <div className="flex gap-1 mt-1">
                                <button
                                onClick={() => handleEdit(event)}
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
                                  onClick={() => handleDelete(event)}
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
                        ))}
                        </div>
                      </td>
                    );
                  })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
      >
        <h2 className="text-xl font-bold mb-8 ">
          Crear Evento
        </h2>

        <div className="flex flex-col mb-6">
          <label className="font-semibold mb-2">
            Evento
          </label>

          <input
            value={eventName}
            onChange={(e) =>
              setEventName(e.target.value)
            }
            className="
              border
              border-gray-300
              rounded
              px-3
              py-2
            "
          />

          {errorsCreate.name && (
            <p className="mt-1 text-sm text-red-500">
              {errorsCreate.name}
            </p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <label className="font-semibold mb-2">
            Fecha
          </label>

          <input
            type="date"
            value={eventDate}
            onChange={(e) =>
              setEventDate(e.target.value)
            }
            className="
              border
              border-gray-300
              rounded
              px-3
              py-2
            "
          />

          {errorsCreate.date && (
            <p className="mt-1 text-sm text-red-500">
              {errorsCreate.date}
            </p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <label className="font-semibold mb-2">
            Hora
          </label>

          <input
            type="time"
            value={eventTime}
            onChange={(e) =>
              setEventTime(e.target.value)
            }
            className="
              border
              border-gray-300
              rounded
              px-3
              py-2
            "
          />

          {errorsCreate.hour && (
            <p className="mt-1 text-sm text-red-500">
              {errorsCreate.hour}
            </p>
          )}
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
          Editar Evento
        </h2>

        <div className="flex flex-col mb-6">
          <label className="font-semibold mb-2">
            Evento
          </label>

          <input
            value={eventName}
            onChange={(e) =>
              setEventName(e.target.value)
            }
            className="
              border
              border-gray-300
              rounded
              px-3
              py-2
            "
          />

          {errorsEdit.name && (
            <p className="mt-1 text-sm text-red-500">
              {errorsEdit.name}
            </p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <label className="font-semibold mb-2">
            Fecha
          </label>

          <input
            type="date"
            value={eventDate}
            onChange={(e) =>
              setEventDate(e.target.value)
            }
            className="
              border
              border-gray-300
              rounded
              px-3
              py-2
            "
          />

          {errorsEdit.date && (
            <p className="mt-1 text-sm text-red-500">
              {errorsEdit.date}
            </p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <label className="font-semibold mb-2">
            Hora
          </label>

          <input
            type="time"
            value={eventTime}
            onChange={(e) =>
              setEventTime(e.target.value)
            }
            className="
              border
              border-gray-300
              rounded
              px-3
              py-2
            "
          />

          {errorsEdit.hour && (
            <p className="mt-1 text-sm text-red-500">
              {errorsEdit.hour}
            </p>
          )}  
        </div>

        <div className="flex justify-end gap-4 mt-10">
          <button
            onClick={() => {
              setOpenEditModal(false);
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
          ¿Eliminar evento?
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
    </div>
  );
}