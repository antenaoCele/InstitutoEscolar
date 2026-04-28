
import { useEffect, useState } from "react";
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import { subjectService } from "../../services/subject.service";

export function Subjects() {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data } = await subjectService.getAll();

        if (!data?.success) {
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

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Nombre", accessor: "name" },
  ];

  return (
    <BasicTable
      title="Materias"
      columns={columns}
      data={subjects}
    />
  );
}
