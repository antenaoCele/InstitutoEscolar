import { isAdmin } from "../../../utils/auth";
import { EditButtonMonth, DeleteButtonMonth } from "../../ui/ActionButtons";
import { BirthdayIcon } from "../../../icons";

export default function MonthlyCalendarCell({
  day,
  year,
  holiday,
  events = [],
  birthdays = [],
  onEdit,
  onDelete,
}) {
  if (day === null) {
    return (
      <td
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

  return (
    <td
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
      {/* ==================================================
          NÚMERO DEL DÍA
          ================================================== */}

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

      {/* ==================================================
          CONTENIDO DEL DÍA
          ================================================== */}

      <div className="h-[100px] overflow-y-auto pr-1">
        {/* ==================================================
            FERIADO
            ================================================== */}

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

        {/* ==================================================
            EVENTOS
            ================================================== */}

        {events.map((event) => (
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

            {/* ==================================================
                ACCIONES
                ================================================== */}

            {isAdmin() && (
              <div className="flex gap-1 mt-1">
                <EditButtonMonth
                  title="Editar Evento"
                  onClick={() => onEdit(event)}
                />

                <DeleteButtonMonth
                  title="Eliminar Evento"
                  onClick={() => onDelete(event)}
                />
              </div>
            )}
          </div>
        ))}

        {/* ==================================================
            CUMPLEAÑOS
            ================================================== */}

        {birthdays.map((student) => {
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
              <div
                className="
                  flex
                  items-center
                  gap-1
                  text-xs
                  font-semibold
                  text-pink-700
                "
              >
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
}
