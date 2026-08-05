import { EditButton, DeleteButton } from "../ui/ActionButtons";

export function getSubjectsColumns({ isAdmin, handleEdit, handleDelete }) {
  const columns = [
    {
      header: "Materias",
      accessor: "name",
    },
    {
      header: "Planes",
      render: (row) => {
        const plans = row.plans || [];

        const containerClass =
          plans.length >= 3
            ? "h-20 overflow-y-auto pr-2"
            : "h-20 flex flex-col justify-center";

        return (
          <div className={containerClass}>
            {plans.length === 0 ? (
              <span className="text-gray-400 italic">Sin planes</span>
            ) : (
              plans.map((plan) => (
                <div key={plan.id} className="py-1">
                  {plan.name}
                </div>
              ))
            )}
          </div>
        );
      },
    },
  ];

  if (isAdmin) {
    columns.push({
      header: "Acciones",
      render: (row) => (
        <div className="flex gap-2">
          <EditButton title="Editar Materia" onClick={() => handleEdit(row)} />

          <DeleteButton
            title="Eliminar Materia"
            onClick={() => handleDelete(row)}
          />
        </div>
      ),
    });
  }

  return columns;
}
