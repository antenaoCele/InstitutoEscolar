import { useEffect, useState } from "react";
import { useAuth } from "../../context/Auth.jsx";

export function Tutors() {
  const { fetchAuth } = useAuth();
  const [tutors, setTutors] = useState([]);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const response = await fetchAuth("http://localhost:3000/tutors");
        const data = await response.json();

        if (!response.ok || !data.success) {
          console.log("Error:", data.message || data.error);
          setTutors([]);
          return;
        }

        setTutors(data.data || []);
      } catch (error) {
        console.log("Error de conexión:", error);
        setTutors([]);
      }
    };

    fetchTutors();
  }, [fetchAuth]);

  return (
    <article>
      <h2>Tutores</h2>

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
          {tutors.length > 0 ? (
            tutors.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.last_name}</td>
                <td>{t.first_name}</td>
                <td>{t.dni}</td>
                <td>{t.phone}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No hay tutores cargados</td>
            </tr>
          )}
        </tbody>
      </table>
    </article>
  );
}