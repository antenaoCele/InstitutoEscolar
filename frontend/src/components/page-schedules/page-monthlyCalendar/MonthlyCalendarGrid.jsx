import MonthlyCalendarCell from "./MonthlyCalendarCell";

export default function MonthlyCalendarGrid({
  year,
  month,
  gridCells,
  events,
  holidays,
  birthdays,
  onEdit,
  onDelete,
}) {
  // ======================================================
  // DÍAS DE LA SEMANA
  // ======================================================

  const weekDays = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  return (
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
        {/* ==================================================
            ENCABEZADO
            ================================================== */}
        <thead>
          <tr>
            {weekDays.map((day) => (
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

        {/* ==================================================
            CUERPO
            ================================================== */}
        <tbody>
          {Array.from({
            length: Math.ceil(gridCells.length / 7),
          }).map((_, weekIndex) => (
            <tr key={weekIndex}>
              {gridCells
                .slice(weekIndex * 7, weekIndex * 7 + 7)
                .map((day, dayIndex) => {
                  // ------------------------------------------
                  // CELDA VACÍA
                  // ------------------------------------------

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

                  // ------------------------------------------
                  // FECHA ACTUAL
                  // ------------------------------------------

                  const currentDateString = `${year}-${String(
                    month + 1,
                  ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

                  // ------------------------------------------
                  // FERIADO
                  // ------------------------------------------

                  const holiday = holidays.find(
                    (holiday) => holiday.fecha === currentDateString,
                  );

                  // ------------------------------------------
                  // EVENTOS
                  // ------------------------------------------

                  const dayEvents = events.filter(
                    (event) => event.date === currentDateString,
                  );

                  // ------------------------------------------
                  // CUMPLEAÑOS
                  // ------------------------------------------

                  const dayBirthdays = birthdays.filter((student) => {
                    const birth = new Date(student.birth_date);

                    return (
                      birth.getMonth() === month && birth.getDate() === day
                    );
                  });

                  // ------------------------------------------
                  // CELDA
                  // ------------------------------------------

                  return (
                    <MonthlyCalendarCell
                      key={`${year}-${month}-${day}`}
                      day={day}
                      month={month}
                      year={year}
                      events={dayEvents}
                      holiday={holiday}
                      birthdays={dayBirthdays}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  );
                })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
