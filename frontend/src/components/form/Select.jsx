export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  getLabel = (opt) => opt.name,
  error,
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-1">
          {label}
        </label>
      )}

      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full border rounded-lg p-2"
      >
        <option value="">Seleccionar</option>

        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {getLabel(opt)}
          </option>
        ))}
      </select>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}