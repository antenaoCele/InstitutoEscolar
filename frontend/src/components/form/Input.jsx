export default function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  error,
  className = "",
}) {
  return (
    <div className="mb-4">
      {label && (
        <label className="mb-1 block text-black dark:text-white">{label}</label>
      )}

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`
          w-full rounded-lg border-2
          px-3 py-2
          focus:border-[#0cc0df]
          focus:ring-2 focus:ring-[#0cc0df]/30
          focus:outline-none
          dark:border-gray-600
          dark:bg-gray-900
          dark:text-white
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
              : "border-gray-300"
          }
          ${className}
        `}
      />

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
