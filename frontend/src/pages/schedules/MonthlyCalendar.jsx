import React, { useEffect, useState } from "react";

export default function MonthlyCalendar() {
  const [currentDate, setCurrentDate] = useState(
    new Date()
  );

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
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          ⬅️
        </button>

        <h2 className="text-2xl font-bold capitalize">
          {monthsNames[month]} {year}
        </h2>

        <button
          onClick={handleNextMonth}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
         ➡️
        </button>
      </div>

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
                          className="border bg-gray-50 h-32"
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

                    const isWeekend =
                      dayIndex === 5 ||
                      dayIndex === 6;

                    return (
                      <td
                        className="
                          border
                          p-2
                          h-40
                          align-top
                          overflow-hidden
                          hover:bg-blue-50
                        "
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
                                text-red-700
                                break-words
                                leading-tight
                                line-clamp-4
                              "
                            >
                               {holiday.nombre}
                            </div>

                            {/* <div className="text-[10px] text-red-500 mt-1">
                              {holiday.tipo}
                            </div> */}
                          </div>
                        )}
                      </td>
                    );
                  })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}