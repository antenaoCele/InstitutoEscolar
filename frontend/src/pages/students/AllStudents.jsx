import { useEffect, useState } from "react";
import { useAuth } from "../../context/Auth.jsx";

export function Students() {
  const { fetchAuth } = useAuth();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetchAuth("http://localhost:3000/students");
        const data = await response.json();

        if (!response.ok || !data.success) {
          console.log("Error:", data.message || data.error);
          setStudents([]);
          return;
        }

        setStudents(data.data || []);
      } catch (error) {
        console.log("Error de conexión:", error);
        setStudents([]);
      }
    };

    fetchStudents();
  }, [fetchAuth]);

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
          </tr>
        </thead>

        <tbody>
          {students.length > 0 ? (
            students.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.last_name}</td>
                <td>{s.first_name}</td>
                <td>{s.dni}</td>
                <td>{s.school}</td>
                <td>{new Date(s.birth_date).toISOString().slice(0, 10)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No hay estudiantes cargados</td>
            </tr>
          )}
        </tbody>
      </table>
    </article>
  );
}