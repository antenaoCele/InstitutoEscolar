import { Modal } from "../ui/Modal";
import { NoButton } from "../ui/ActionButtons";

export default function StudentViewModal({ isOpen, onClose, student }) {
  if (!student) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-8">Datos del Estudiante</h2>

      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <p className="text-sm text-gray-500">Nombre</p>

          <p className="font-medium">{student.first_name || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Apellido</p>

          <p className="font-medium">{student.last_name || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">DNI</p>

          <p className="font-medium">{student.dni || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Fecha de nacimiento</p>

          <p className="font-medium">{student.birth_date || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Colegio / Universidad</p>

          <p className="font-medium">{student.school || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Nivel</p>

          <p className="font-medium">{student.level || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Grado / Año</p>

          <p className="font-medium">{student.grade || "-"}</p>
        </div>
      </div>

      <div className="mt-8 border-t pt-5">
        <h3 className="text-lg font-semibold mb-4">Planes</h3>

        {student.activePlans?.length > 0 ? (
          <div className="flex flex-col gap-3">
            {student.activePlans.map((plan) => (
              <div
                key={plan.student_plan_id}
                className="
                  rounded-lg
                  border
                  border-gray-200
                  dark:border-gray-700
                  p-3
                "
              >
                <p className="font-medium">{plan.plan_name}</p>

                <p className="text-sm text-gray-500 mt-1">
                  Docente: {plan.teacher_name || "-"}
                </p>
              </div>
            ))}
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
