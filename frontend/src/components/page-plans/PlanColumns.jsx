import {
  EditButton,
  ViewButton,
  AssignTeacherButton,
} from "../ui/ActionButtons";

export function getPlansColumns({
  isAdmin,
  allPlanSubjects,
  handleOpenHistory,
  handleEditPlan,
  handleManageTeachers,
}) {
  const columns = [
    {
      header: "Planes",
      accessor: "name",
    },
    {
      header: "Materias",
      render: (row) => {
        const subjects = row.subjects || [];

        const containerClass =
          subjects.length >= 3
            ? "h-20 overflow-y-auto pr-2"
            : "h-20 flex flex-col justify-center";

        return (
          <div className={containerClass}>
            {subjects.length === 0 ? (
              <span className="text-gray-400 italic">Sin materias</span>
            ) : (
              subjects.map((subject) => (
                <div key={subject} className="py-1">
                  {subject}
                </div>
              ))
            )}
          </div>
        );
      },
    },
    {
      header: "Docentes",
      render: (row) => {
        const teachers = row.teachers || [];

        const containerClass =
          teachers.length >= 3
            ? "h-20 overflow-y-auto pr-2"
            : "h-20 flex flex-col justify-center";

        return (
          <div className={containerClass}>
            {teachers.length === 0 ? (
              <span className="text-sm italic text-gray-500">Sin docentes</span>
            ) : (
              teachers.map((teacher) => (
                <div key={teacher} className="py-1">
                  {teacher}
                </div>
              ))
            )}
          </div>
        );
      },
    },
    {
      header: "Precios Actuales",
      accessor: "current_price",
    },

    ...(isAdmin
      ? [
          {
            header: "Acciones",
            render: (row) => {
              const hasSubjects = allPlanSubjects.some(
                (ps) => ps.plan_id === row.id,
              );

              return (
                <div className="flex gap-2">
                  <ViewButton
                    title="Ver Historial"
                    onClick={() => handleOpenHistory(row)}
                  />

                  <EditButton
                    title="Editar Plan"
                    onClick={() => handleEditPlan(row)}
                  />

                  <AssignTeacherButton
                    disabled={!hasSubjects}
                    title={
                      hasSubjects
                        ? "Asignar Docente"
                        : "Primero agregue una o más materias al plan"
                    }
                    onClick={() => handleManageTeachers(row)}
                  />
                </div>
              );
            },
          },
        ]
      : []),
  ];
  return columns;
}
