import Input from "../form/Input";

export default function PlanFilters({ searchName, onSearchChange }) {
  return (
    <div className="flex gap-3 mb-4 flex-wrap">
      <Input
        placeholder="Buscar por plan"
        value={searchName}
        onChange={(e) => onSearchChange(e.target.value)}
        className="p-2 border border-gray-300 rounded w-60"
      />
    </div>
  );
}
