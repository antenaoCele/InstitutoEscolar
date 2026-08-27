import {
  EditButton,
  DeleteButton,
  ActivationButton,
} from "../ui/ActionButtons";

export function getTeachersColumns({
  isAdmin,
  handleEdit,
  handleDelete,
  handleReactivate,
}) {
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
      header: "Estados",
      render: (row) => (
        <span
          className={`font-medium ${
            row.active ? "text-green-600" : "text-red-600"
          }`}
        >
          ● {row.active ? "Activo" : "Inactivo"}
        </span>
      ),
    },

    {
      header: "Teléfonos",
      accessor: "phone",
    },
  ];

  if (isAdmin) {
    columns.splice(3, 0, {
      header: "DNI",
      accessor: "dni",
    });

    columns.push({
      header: "Usuarios",
      render: (row) =>
        row.has_user ? (
          row.username
        ) : (
          <span className="text-gray-400 italic">Sin usuario</span>
        ),
    });

    columns.push({
      header: "Acciones",
      render: (row) => (
        <div className="flex gap-2">
          <EditButton title="Editar Docente" onClick={() => handleEdit(row)} />

          {row.active ? (
            <DeleteButton
              title="Desactivar Docente"
              onClick={() => handleDelete(row)}
            />
          ) : (
            <ActivationButton
              title="Reactivar Docente"
              onClick={() => handleReactivate(row)}
              className="w-9 h-9 flex items-center justify-center rounded-lg border hover:bg-gray-100"
            />
          )}
        </div>
      ),
    });
  }

  return columns;
}
