export default function Select({
  label,
  name,
  value,
  onChange,
  error,
  disabled = false,
  className = "",
  children,
  noMargin = false,
}) {
  return (
    <div className={noMargin ? "" : "mb-4"}>
      {label && (
        <label className="mb-1 block text-black dark:text-white">{label}</label>
      )}

      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className={`
          w-full
          rounded-lg
          border-2

          h-11 px-3

          bg-white
          text-black

          border-gray-300

          focus:border-[#0cc0df]
          focus:ring-2
          focus:ring-[#0cc0df]/30
          focus:outline-none

          dark:bg-black
          dark:text-white
          dark:border-gray-600

          disabled:bg-gray-100
          disabled:text-gray-400
          disabled:cursor-not-allowed
          dark:disabled:bg-gray-900
          dark:disabled:text-gray-500

          ${error ? "border-red-500" : ""}

          ${className}
        `}
      >
        {children}
      </select>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
