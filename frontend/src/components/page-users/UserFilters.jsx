import Input from "../form/Input";
import Select from "../form/Select";

export default function UserFilters({
  search,
  onSearchChange,
  selectedRole,
  onRoleChange,
}) {
  return (
    <div className="flex gap-3 mb-4 flex-wrap">
      <Input
        placeholder="Buscar por nombre, apellido o usuario"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="p-2 border border-gray-300 rounded w-80"
      />

      <Select
        value={selectedRole}
        onChange={(e) => onRoleChange(e.target.value)}
        className="p-2 border border-gray-300 rounded min-w-56"
      >
        <option value="">Todos los roles</option>
        <option value="ADMIN">Administradores</option>
        <option value="DOCENTE">Docentes</option>
      </Select>
    </div>
  );
}
