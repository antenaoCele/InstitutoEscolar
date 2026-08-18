import Checkbox from "../form/Checkbox";
import Select from "../form/Select";

// Utilidades
import { sortByProperty } from "../../utils/sort";

export default function StudentPlansSelector({
  plans,
  formClasses,
  onTogglePlan,
  onClassRowChange,
}) {
  return (
    <div className="mt-6 border-t pt-4">
      <h2 className="text-xl font-bold mb-4">Asignar Clases</h2>

      <div className="grid grid-cols-2 gap-3">
        {[...plans].sort(sortByProperty("name")).map((plan) => {
          const row = formClasses.find((r) => r.plan_id === plan.id);

          return (
            <div
              key={plan.id}
              className="
                  border
                  border-gray-200
                  dark:border-gray-700
                  rounded-xl
                  p-3
                  bg-white
                  dark:bg-gray-800
                  shadow-sm
                "
            >
              <Checkbox
                label={plan.name}
                checked={!!row}
                onChange={(checked) => onTogglePlan(plan.id, checked)}
              />

              {row && (
                <>
                  <Select
                    className="mt-2"
                    value={row.teacher_id}
                    onChange={(e) =>
                      onClassRowChange(plan.id, "teacher_id", e.target.value)
                    }
                  >
                    <option value="">Seleccione un Docente</option>

                    {row.availableTeachers?.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.last_name}, {teacher.first_name}
                      </option>
                    ))}
                  </Select>

                  {/* Solo se solicita para planes nuevos.
                        Si el plan ya existe, el backend conserva
                        la modalidad de pago que tenía. */}
                  {!row.student_plan_id && (
                    <Select
                      className="mt-2"
                      value={row.first_payment_option || ""}
                      onChange={(e) =>
                        onClassRowChange(
                          plan.id,
                          "first_payment_option",
                          e.target.value,
                        )
                      }
                    >
                      <option value="">Primer pago</option>

                      <option value="FULL">Cuota completa</option>

                      <option value="HALF">Media cuota</option>

                      <option value="NEXT_MONTH">
                        Empieza a pagar el próximo mes
                      </option>
                    </Select>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
