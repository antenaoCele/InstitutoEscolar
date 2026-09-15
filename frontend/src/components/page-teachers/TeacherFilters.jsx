import Input from "../form/Input";
import Select from "../form/Select";
import SearchableSelect from "../form/SearchableSelect";

export default function TeacherFilters({
  searchFirstLastName,
  onSearchFirstLastNameChange,

  searchDNI,
  onSearchDNIChange,

  selectedStatus,
  onStatusChange,

  selectedPlan,
  onPlanChange,

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
        <option value="">Todos los docentes</option>
        <option value="true">Activos</option>
        <option value="false">Inactivos</option>
      </Select>

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
    </div>
  );
}
