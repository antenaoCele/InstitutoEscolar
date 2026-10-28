import { Modal } from "../../ui/Modal";
import Button from "../../ui/Button";
import { NoButton } from "../../ui/ActionButtons";
import { formatDate } from "../../../utils/dateFormat";
import { isAdmin } from "../../../utils/auth";

const formatMoney = (value) =>
  `$${Number(value).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function StudentViewModal({ isOpen, onClose, student, onForgiveDebt }) {
  if (!student) return null;

  const studentData = student.student || student;

  // ======================================================
  // PLANES
  // Solo los que vienen de /students/:id/info (student.plans) traen
  // academic_status y deuda: son los que puede dar de baja con deuda
  // pendiente. student.activePlans (lista general) no la trae, así
  // que ahí no se ofrece "olvidar deuda".
  // ======================================================
  const plans = student.plans || student.activePlans || [];

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

          <p className="font-medium">{formatDate(studentData.birth_date)}</p>
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

              // Dado de baja con deuda pendiente: es lo único que
              // habilita "olvidar deuda" en el backend (ver
              // forgiveDebt en student_plans.controller.js). Solo
              // viene con este dato student.plans (/students/:id/info);
              // esas filas aparecen ahí precisamente porque tienen
              // deuda, nunca se filtran las de baja ya resueltas.
              const isInactiveWithDebt = plan.academic_status === "INACTIVE";
              const studentPlanId = plan.id || plan.student_plan_id;

              return (
                <div
                  key={studentPlanId || plan.plan_id}
                  className="
                    rounded-lg
                    border
                    border-gray-200
                    dark:border-gray-700
                    p-3
                  "
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{plan.plan_name || "-"}</p>

                    {isInactiveWithDebt && (
                      <span className="text-xs font-medium text-red-700">
                        Baja (con deuda)
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mt-1">
                    Docente: {teacherName}
                  </p>

                  {plan.total_debt > 0 && (
                    <p className="text-sm text-orange-600 mt-1">
                      Deuda: {formatMoney(plan.total_debt)}
                    </p>
                  )}

                  {isInactiveWithDebt && isAdmin() && onForgiveDebt && (
                    <div className="mt-3">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => onForgiveDebt(studentPlanId)}
                      >
                        Olvidar deuda
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm italic text-gray-500">Sin planes asignados.</p>
        )}
      </div>
    </Modal>
  );
}
