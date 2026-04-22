import { useEffect, useState } from "react";
import { useAuth } from "../../context/Auth.jsx";
import { useLocation } from "react-router-dom";

export function Students() {
  const { fetchAuth } = useAuth();
  const [students, setStudents] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const status = params.get("status") || "all";

        const response = await fetchAuth(
          `http://localhost:3000/students?status=${status}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          setStudents([]);
          return;
        }

        setStudents(data.data || []);
      } catch {
        setStudents([]);
      }
    };

    fetchStudents();
  }, [fetchAuth, location.search]);

  return (
    <article>
      <h2>Estudiantes</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Apellido</th>
            <th>Nombre</th>
            <th>DNI</th>
            <th>Escuela</th>
            <th>Fecha de nacimiento</th>
            <th>Nivel</th>
            <th>Grado</th>
          </tr>
        </thead>

        <tbody>
          {students.length > 0 ? (
            students.map((s) => (
              <tr key={s.student_id}>
                <td>{s.student_id}</td>
                <td>{s.last_name}</td>
                <td>{s.first_name}</td>
                <td>{s.dni}</td>
                <td>{s.school || "-"}</td>
                <td>{s.birth_date ? new Date(s.birth_date).toLocaleDateString("es-AR"): "-"}</td>
                <td>{s.level}</td>
                <td>{s.grade}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No hay estudiantes</td>
            </tr>
          )}
        </tbody>
      </table>
    </article>
  );
}