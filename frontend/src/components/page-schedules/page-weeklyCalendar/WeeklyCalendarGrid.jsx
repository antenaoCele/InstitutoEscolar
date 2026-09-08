import { ViewButtonWeekWhite } from "../../ui/ActionButtons";

const WeeklyCalendarGrid = ({
  days,
  timeSlots,
  filteredSchedules,
  scheduleStudents,
  onInfo,
}) => {
  return (
    <div
      className="
        overflow-auto
        max-h-[700px]
        bg-white
        dark:bg-black
      "
    >
      <table
        className="
          w-full
          table-fixed
          bg-white
          dark:bg-black
          border
          border-gray-300
          dark:border-gray-700
        "
      >
        <thead
          className="
            sticky
            top-0
            z-20
            bg-gray-100
            dark:bg-black
            text-gray-800
            dark:text-white
          "
        >
          <tr>
            <th
              className="
                sticky
                top-0
                left-0
                z-30
                p-2
                border
                border-gray-300
                dark:border-gray-700
                bg-gray-100
                dark:bg-black
                text-gray-800
                dark:text-white
                font-semibold
              "
            >
              Horario
            </th>

            {days.map((day) => (
              <th
                key={day.value}
                className="
                  p-2
                  border
                  border-gray-300
                  dark:border-gray-700
                  bg-gray-100
                  dark:bg-black
                  text-gray-800
                  dark:text-white
                  font-semibold
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
                  w-[130px]
                  p-2
                  border
                  border-gray-300
                  dark:border-gray-700
                  bg-white
                  dark:bg-black
                  text-gray-800
                  dark:text-white
                  font-semibold
                "
              >
                {slot}
              </td>

              {days.map((day) => {
                const slotStart = slot.split(" - ")[0];

                const schedulesInSlot = filteredSchedules.filter(
                  (schedule) =>
                    Number(schedule.day) === Number(day.value) &&
                    schedule.start_time?.slice(0, 5) === slotStart,
                );

                return (
                  <td
                    key={`${day.value}-${slot}`}
                    className="
                      border
                      border-gray-300
                      dark:border-gray-700
                      p-2
                      align-top
                      w-[180px]
                      bg-white
                      dark:bg-black
                      transition-colors
                      hover:bg-cyan-50
                      dark:hover:bg-gray-900
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
                        const students = scheduleStudents.filter(
                          (ss) => ss.schedule_id === schedule.id,
                        );

                        const textColor =
                          schedule.classroom === "A"
                            ? "text-cyan-500"
                            : "text-[#8d5df4]";

                        return (
                          <div
                            key={schedule.id}
                            className={
                              schedule.classroom === "A"
                                ? `
                                  p-2
                                  rounded-lg
                                  border
                                  bg-cyan-100
                                  dark:bg-cyan-900/25
                                  border-cyan-300
                                  dark:border-cyan-700
                                  text-cyan-800
                                  dark:text-cyan-200
                                  shadow-sm
                                  hover:shadow-md
                                  transition-all
                                  duration-200
                                `
                                : `
                                  p-2
                                  rounded-lg
                                  border
                                  bg-violet-100
                                  dark:bg-violet-900/25
                                  border-violet-300
                                  dark:border-violet-700
                                  text-violet-800
                                  dark:text-violet-200
                                `
                            }
                          >
                            <div
                              className={`text-xs font-semibold ${textColor}`}
                            >
                              Docente:
                            </div>

                            <div className={`text-xs ml-2 ${textColor} mb-3`}>
                              • {schedule.last_name}, {schedule.first_name}
                            </div>

                            <div
                              className={`text-xs font-semibold ${textColor}`}
                            >
                              Estudiantes:
                            </div>

                            {students.map((student) => (
                              <div
                                key={student.student_id}
                                className={`ml-2 text-sm ${textColor}`}
                              >
                                • {student.last_name}, {student.first_name}.
                              </div>
                            ))}

                            <div className="flex justify-end mt-2">
                              <ViewButtonWeekWhite
                                title="Más información"
                                onClick={() => onInfo(schedule)}
                              />
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
  );
};

export default WeeklyCalendarGrid;
