export default function Select({
  label,
  name,
  value,
  onChange,
  error,
  className = "",
  children,
}) {
  return (
    <div className="mb-4">
      {label && (
        <label className="mb-1 block text-black dark:text-white">{label}</label>
      )}

      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className={`
          w-full rounded-lg border-2 border-gray-300
          px-3 py-2
          bg-white text-black
          focus:border-[#0cc0df]
          focus:ring-2 focus:ring-[#0cc0df]/30
          focus:outline-none
          dark:bg-black
          dark:text-white
          dark:border-gray-600
          ${error ? "border-red-500" : ""}
          ${className}
        `}
      >
        {children}
      </select>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
