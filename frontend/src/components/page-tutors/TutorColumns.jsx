import { EditButton, DeleteButton } from "../ui/ActionButtons";

export function getTutorsColumns({ isAdmin, handleEdit, handleDelete }) {
  const columns = [
    {
      header: "Apellidos",
      accessor: "last_name",
    },
    {
      header: "Nombres",
      accessor: "first_name",
    },
    {
      header: "Teléfonos",
      accessor: "phone",
    },
  ];

  if (isAdmin) {
    columns.push({
      header: "DNI",
      accessor: "dni",
    });
  }

  columns.push({
    header: "Estudiantes",
    render: (row) => {
      const students = row.student_names || [];

      const containerClass =
        students.length > 3
          ? "h-20 overflow-y-auto pr-2"
          : "h-20 flex flex-col justify-center";

      return (
        <div className={containerClass}>
          {students.length === 0 ? (
            <span className="text-sm italic text-gray-500">
              Sin estudiantes
            </span>
          ) : (
            students.map((name, index) => (
              <div key={index} className="py-1">
                {name}
              </div>
            ))
          )}
        </div>
      );
    },
  });

  if (isAdmin) {
    columns.push({
      header: "Acciones",
      render: (row) => (
        <div className="flex gap-2">
          <EditButton title="Editar Tutor" onClick={() => handleEdit(row)} />

          <DeleteButton
            title="Eliminar Tutor"
            onClick={() => handleDelete(row)}
          />
        </div>
      ),
    });
  }

  return columns;
}
