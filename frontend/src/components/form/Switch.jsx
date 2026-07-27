export default function Switch({
  checked = false,
  onChange,
  disabled = false,
  className = "",
  title = "",
  children,
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={() => !disabled && onChange?.(!checked)}
      disabled={disabled}
      className={`
        relative flex h-8 w-14 items-center rounded-full
        transition-colors duration-300
        ${checked ? "bg-gray-700" : "bg-[#0cc0df]"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
    >
      <span
        className={`
          absolute left-1 top-1
          h-6 w-6 rounded-full bg-white shadow-md
          transition-transform duration-300
          ${checked ? "translate-x-6" : "translate-x-0"}
        `}
      />

      {children}
    </button>
  );
}
