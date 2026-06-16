export default function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
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
        placeholder={placeholder}
        className={`
          w-full rounded-lg border-2
          px-3 py-2
          focus:border-[#0cc0df]
          focus:ring-2 focus:ring-[#0cc0df]/30
          focus:outline-none
          dark:border-gray-600
          dark:bg-black
          dark:text-white
          placeholder-gray-400
          dark:placeholder-gray-500
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
