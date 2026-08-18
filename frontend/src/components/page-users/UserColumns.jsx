import { EditButton, DeleteButton } from "../ui/ActionButtons";

export function getUsersColumns({
  isAdmin,
  currentUserId,
  handleEdit,
  handleDelete,
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
      header: "Usuarios",
      accessor: "username",
    },
    {
      header: "Roles",
      accessor: "role",
    },
  ];

  if (isAdmin) {
    columns.push({
      header: "Acciones",
      render: (row) => {
        const isSelf = row.id === currentUserId;

        return (
          <div className="flex gap-2">
            <EditButton
              title="Editar Usuario"
              onClick={() => handleEdit(row)}
            />

            <DeleteButton
              title={
                isSelf
                  ? "No podés eliminar tu propio usuario"
                  : "Eliminar Usuario"
              }
              disabled={isSelf}
              onClick={() => {
                if (isSelf) return;

                handleDelete(row);
              }}
            />
          </div>
        );
      },
    });
  }

  return columns;
}
