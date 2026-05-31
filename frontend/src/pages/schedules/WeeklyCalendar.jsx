import { useEffect, useState } from "react";
import { teacherService } from "../../services/teacher.service";

export default function WeeklyCalendar() {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await teacherService.getAll();

      setTeachers(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const timeSlots = [
    "15:00 - 16:30",
    "16:30 - 18:00",
    "18:00 - 19:30",
    "19:30 - 21:00",
    "21:00 - 22:30",
  ];

  const days = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
  ];

  return (
    <>
      <div className="mb-6">
        <select
          value={selectedTeacher}
          onChange={(e) =>
            setSelectedTeacher(e.target.value)
          }
          className="p-2 border border-gray-300 rounded w-72"
        >
          <option value="">
            👨‍🏫 Seleccionar docente
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
      </div>

      <div className="overflow-auto">
        <table className="w-full border border-gray-300">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-100">
                Horario
              </th>

              {days.map((day) => (
                <th
                  key={day}
                  className="border p-2 bg-gray-100"
                >
                  {day}
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

                {days.map((day) => (
                  <td
                    key={`${day}-${slot}`}
                    className="border p-2 align-top"
                  >
                    Celda
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}