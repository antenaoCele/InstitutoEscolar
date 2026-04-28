import { useEffect, useState } from "react";
import { subjectService } from "../../services/subject.service";

export function Subjects() {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data } = await subjectService.getAll();

        if (!data.success) {
          setSubjects([]);
          return;
        }

        setSubjects(data.data || []);
      } catch (error) {
        console.error("Error al obtener materias:", error);
        setSubjects([]);
      }
    };

    fetchSubjects();
  }, []);

  return (
    <article>
      <h2>Materias</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Materia</th>
          </tr>
        </thead>

        <tbody>
          {subjects.length > 0 ? (
            subjects.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.name}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2">No hay materias</td>
            </tr>
          )}
        </tbody>
      </table>
    </article>
  );
}