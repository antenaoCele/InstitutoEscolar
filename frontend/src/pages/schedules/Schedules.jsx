import { useEffect, useState } from "react";
import { useAuth } from "../../context/Auth.jsx";
import { Link } from "react-router-dom";

export function Schedules() {
  const { fetchAuth } = useAuth();
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetchAuth("http://localhost:3000/schedules");
        const data = await response.json();

        if (!response.ok || !data.success) {
          console.log("Error:", data.message || data.error);
          return;
        }

        setSchedules(data.data);
      } catch (error) {
        console.log("Error de conexión:", error);
      }
    };

    fetchSchedules();
  }, [fetchAuth]);

  // Mapeo simple para mostrar el nombre del día en lugar del número
  const getDayName = (dayNumber) => {
    const days = {
      1: "Lunes",
      2: "Martes",
      3: "Miércoles",
      4: "Jueves",
      5: "Viernes",
      6: "Sábado",
    };
    return days[dayNumber] || dayNumber;
  };

  return (
    <article>
      <h2>Horarios</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Docente</th>
            <th>Día</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Aula</th>
          </tr>
        </thead>

        <tbody>
          {schedules.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>
                {s.last_name}, {s.first_name}
              </td>
              <td>{getDayName(s.day)}</td>
              <td>{s.start_time?.slice(0, 5)}</td>
              <td>{s.end_time?.slice(0, 5)}</td>
              <td>{s.classroom}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* <Link to="/schedules/create" role="button">
        Crear nuevo horario
      </Link> */}
    </article>
  );
}