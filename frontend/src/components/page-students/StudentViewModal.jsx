import { Modal } from "../ui/Modal";
import { NoButton } from "../ui/ActionButtons";

export default function StudentViewModal({ isOpen, onClose, student }) {
  if (!student) return null;

  const studentData = student.student || student;

  // ======================================================
  // PLANES
  // ======================================================
  const plans = student.plans || student.activePlans || [];

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    const day = String(parsedDate.getUTCDate()).padStart(2, "0");
    const month = String(parsedDate.getUTCMonth() + 1).padStart(2, "0");
    const year = parsedDate.getUTCFullYear();

    return `${day}-${month}-${year}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-8">Datos del Estudiante</h2>

      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <p className="text-sm text-gray-500">Nombre</p>

          <p className="font-medium">{studentData.first_name || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Apellido</p>

          <p className="font-medium">{studentData.last_name || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">DNI</p>

          <p className="font-medium">{studentData.dni || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Fecha de nacimiento</p>
          <p className="font-medium">
            {formatDate(studentData.birth_date)}
          </p>{" "}
        </div>

        <div>
          <p className="text-sm text-gray-500">Colegio / Universidad</p>

          <p className="font-medium">{studentData.school || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Nivel</p>

          <p className="font-medium">{studentData.level || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Grado / Año</p>

          <p className="font-medium">{studentData.grade || "-"}</p>
        </div>
      </div>

      <div className="mt-8 border-t pt-5">
        <h3 className="text-lg font-semibold mb-4">Planes</h3>

        {plans.length > 0 ? (
          <div className="flex flex-col gap-3">
            {plans.map((plan) => {
              const teacherName =
                plan.teacher_name ||
                (plan.last_name || plan.first_name
                  ? `${plan.last_name || ""}${
                      plan.last_name && plan.first_name ? ", " : ""
                    }${plan.first_name || ""}`
                  : "-");

              return (
                <div
                  key={plan.student_plan_id || plan.id || plan.plan_id}
                  className="
                    rounded-lg
                    border
                    border-gray-200
                    dark:border-gray-700
                    p-3
                  "
                >
                  <p className="font-medium">{plan.plan_name || "-"}</p>

                  <p className="text-sm text-gray-500 mt-1">
                    Docente: {teacherName}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm italic text-gray-500">Sin planes asignados.</p>
        )}
      </div>

      <div className="flex justify-end mt-10">
        <NoButton title="Cerrar" onClick={onClose} />
      </div>
    </Modal>
  );
}
