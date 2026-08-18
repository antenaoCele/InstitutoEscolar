import Input from "../form/Input";
import Select from "../form/Select";
import SearchableSelect from "../form/SearchableSelect";

export default function StudentFilters({
  searchFirstLastName,
  onSearchFirstLastNameChange,

  searchDNI,
  onSearchDNIChange,

  selectedStatus,
  onStatusChange,

  selectedTeacher,
  onTeacherChange,

  selectedPlan,
  onPlanChange,

  selectedPlanStatus,
  onPlanStatusChange,

  teachers,
  plans,
}) {
  return (
    <div className="flex gap-3 mb-4 flex-wrap">
      <Input
        placeholder="Nombre o apellido"
        value={searchFirstLastName}
        onChange={(e) => onSearchFirstLastNameChange(e.target.value)}
        className="min-w-56"
      />

      <Input
        placeholder="DNI"
        value={searchDNI}
        onChange={(e) => onSearchDNIChange(e.target.value)}
        className="min-w-56"
      />

      <Select
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className="p-2 border border-gray-300 rounded min-w-56"
      >
        <option value="">Todos los estudiantes</option>
        <option value="active">Activos</option>
        <option value="inactive">Inactivos</option>
        <option value="suspended">Suspendidos</option>
      </Select>

      <SearchableSelect
        value={selectedTeacher}
        onChange={(e) => onTeacherChange(e.target.value)}
        className="min-w-56"
        searchPlaceholder="Buscar docente..."
        emptyMessage="No se encontraron docentes"
      >
        <option value="">Todos los docentes</option>

        {[...teachers]
          .sort((a, b) =>
            `${a.last_name}, ${a.first_name}`.localeCompare(
              `${b.last_name}, ${b.first_name}`,
              "es",
            ),
          )
          .map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.last_name}, {teacher.first_name}
            </option>
          ))}
      </SearchableSelect>

      <SearchableSelect
        value={selectedPlan}
        onChange={(e) => onPlanChange(e.target.value)}
        className="min-w-56"
        searchPlaceholder="Buscar plan..."
        emptyMessage="No se encontraron planes"
      >
        <option value="">Todos los planes</option>

        {[...plans]
          .sort((a, b) => a.name.localeCompare(b.name, "es"))
          .map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name}
            </option>
          ))}
      </SearchableSelect>

      <Select
        value={selectedPlanStatus}
        onChange={(e) => onPlanStatusChange(e.target.value)}
        className="p-2 border border-gray-300 rounded min-w-56"
      >
        <option value="">Estado del plan</option>
        <option value="paid">Al día</option>
        <option value="pending">Pendiente</option>
        <option value="overdue">Debe</option>
        <option value="baja_deuda">Baja (con deuda)</option>
        <option value="not_due_yet">Aún no corresponde</option>
      </Select>
    </div>
  );
}
