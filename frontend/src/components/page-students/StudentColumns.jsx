import { ViewButton, EditButton, DeleteButton } from "../ui/ActionButtons";

export function getStudentsColumns({
  isAdmin,
  handleView,
  handleEdit,
  handleDelete,
}) {
  const getPlanStatusInfo = (plan) => {
    if (plan.academic_status === "INACTIVE") {
      return {
        text: "Baja (con deuda)",
        color: "text-red-700",
      };
    }

    if (plan.account_status === "OVERDUE") {
      return {
        text: "Debe",
        color: "text-orange-600",
      };
    }

    if (plan.current_period_status === "pending") {
      return {
        text: "Pendiente",
        color: "text-yellow-600",
      };
    }

    if (plan.current_period_status === "paid") {
      return {
        text: "Al día",
        color: "text-green-600",
      };
    }

    if (plan.current_period_status === "not_due_yet") {
      return {
        text: "Aún no corresponde",
        color: "text-gray-500",
      };
    }

    return {
      text: "-",
      color: "text-gray-400",
    };
  };

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
      render: (row) => {
        const plans = row.activePlans || [];

        if (!plans.length) {
          return <span className="font-medium text-red-600">● Inactivo</span>;
        }

        const hasActive = plans.some((p) => p.academic_status === "ACTIVE");

        if (!hasActive) {
          return (
            <span className="font-medium text-red-700">
              ● Inactivo (con deuda)
            </span>
          );
        }

        const suspended = plans.some(
          (p) =>
            p.academic_status === "ACTIVE" && p.account_status === "OVERDUE",
        );

        if (suspended) {
          return (
            <span className="font-medium text-orange-600">● Suspendido</span>
          );
        }

        return <span className="font-medium text-green-600">● Activo</span>;
      },
    },

    {
      header: "Planes",
      render: (row) => (
        <div className="flex flex-col gap-2">
          {row.activePlans?.length > 0 ? (
            row.activePlans.map((plan) => (
              <div
                key={plan.student_plan_id}
                className="text-sm font-medium h-6 flex items-center"
              >
                {plan.plan_name}
              </div>
            ))
          ) : (
            <span className="text-sm italic text-gray-500">
              Editar para asignar plan y docente
            </span>
          )}
        </div>
      ),
    },

    {
      header: "Docentes",
      render: (row) => (
        <div className="flex flex-col gap-2">
          {row.activePlans?.length > 0 ? (
            row.activePlans.map((plan) => (
              <div
                key={plan.student_plan_id}
                className="text-xs text-gray-500 h-6 flex items-center"
              >
                {plan.teacher_name}
              </div>
            ))
          ) : (
            <span className="text-xs text-gray-400">—</span>
          )}
        </div>
      ),
    },

    {
      header: "Estados de los planes",
      render: (row) => (
        <div className="flex flex-col gap-2">
          {row.activePlans?.length > 0 ? (
            row.activePlans.map((plan) => {
              const info = getPlanStatusInfo(plan);

              return (
                <div
                  key={plan.student_plan_id}
                  className={`text-sm font-medium h-6 flex items-center ${info.color}`}
                >
                  {info.text}
                </div>
              );
            })
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
        </div>
      ),
    },
  ];

  if (isAdmin) {
    columns.push({
      header: "Acciones",
      render: (row) => (
        <div className="flex gap-2">
          <ViewButton title="Ver Estudiante" onClick={() => handleView(row)} />

          <EditButton
            title="Editar Estudiante"
            onClick={() => handleEdit(row)}
          />

          <DeleteButton
            title="Eliminar Estudiante"
            onClick={() => handleDelete(row)}
          />
        </div>
      ),
    });
  }

  return columns;
}
