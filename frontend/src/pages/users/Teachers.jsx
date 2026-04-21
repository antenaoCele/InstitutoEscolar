import { useEffect, useState } from "react";
import { useAuth } from "../../context/Auth.jsx";
import { Link } from "react-router-dom";

export function Teachers() {
  const { fetchAuth } = useAuth();
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await fetchAuth("http://localhost:3000/teachers");
        const data = await response.json();

        if (!response.ok || !data.success) {
          console.log("Error:", data.message || data.error);
          return;
        }

        setTeachers(data.data);
      } catch (error) {
        console.log("Error de conexión:", error);
      }
    };

    fetchTeachers();
  }, [fetchAuth]);

  return (
    <article>
      <h2>Docentes</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Apellido</th>
            <th>Nombre</th>
            <th>DNI</th>
            <th>Teléfono</th>
          </tr>
        </thead>

        <tbody>
          {teachers.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.last_name}</td>
              <td>{t.first_name}</td>
              <td>{t.dni}</td>
              <td>{t.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link to="/teachers/create" role="button">
        Crear nuevo docente
      </Link>
    </article>
  );
}