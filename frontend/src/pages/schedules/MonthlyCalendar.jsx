import React, { useEffect, useState } from "react";
import { Modal } from "../../components/ui/Modal";
import { isAdmin } from "../../utils/auth";

export default function MonthlyCalendar() {
  const [currentDate, setCurrentDate] = useState(
    new Date()
  );

  const [openCreateModal, setOpenCreateModal] = useState(false);

  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");

  const [events, setEvents] = useState([]);

  const [holidays, setHolidays] = useState([]);

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

  useEffect(() => {
    fetchHolidays();
  }, [year]);

  const handleCreateEvent = () => {
    if (!eventName || !eventDate) return;

    const newEvent = {
      id: Date.now(),
      title: eventName,
      date: eventDate,
      time: eventTime,
    };

    setEvents((prev) => [...prev, newEvent]);

    setEventName("");
    setEventDate("");
    setEventTime("");

    setOpenCreateModal(false);
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
                          key={`blank-${dayIndex}`}
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
                        className={`
                          border
                          p-2
                          h-40
                          align-top
                          overflow-hidden
                          hover:bg-blue-50
                          ${
                            holiday
                              ? "bg-red-100"
                              : isWeekend
                              ? "bg-orange-50"
                              : ""
                          }
                        `}
                      >
                        <div className="font-bold text-gray-700">
                          {day}
                        </div>

                        {holiday && (
                          <div className="mt-2 overflow-hidden">
                           <div
                              className="
                                text-xs
                                font-semibold
                                text-red-800
                                break-words
                                leading-tight
                                line-clamp-4
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
                              {event.title}
                            </div>

                            {event.time && (
                              <div className="text-[10px] text-blue-600">
                                {event.time}
                              </div>
                            )}

                            {isAdmin() && (
                              <div className="flex gap-1 mt-1">
                                <button
                                  className="
                                    cursor-pointer transition transform hover:scale-105
                                    text-[10px]
                                    px-2
                                    py-1
                                    rounded
                                    bg-yellow-500
                                    text-white
                                  "
                                >
                                  Editar
                                </button>

                                <button
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
            onClick={handleCreateEvent}
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
    </div>
  );
}