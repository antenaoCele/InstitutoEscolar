import Button from "../ui/Button";

export default function Switch({
  checked = false,
  onChange,
  disabled = false,
  className = "",
  title = "",
  children,
}) {
  return (
    <Button
      type="button"
      title={title}
      aria-label={title}
      onClick={() => !disabled && onChange?.(!checked)}
      disabled={disabled}
      className={`
        relative flex items-center w-14 h-8 rounded-full transition-colors duration-300
        ${checked ? "bg-gray-700" : "bg-[#0cc0df]"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
    >
      <span
        className={`
          absolute left-1 top-1 w-6 h-6 rounded-full bg-white shadow-md
          transition-transform duration-300
          ${checked ? "translate-x-6" : "translate-x-0"}
        `}
      />

      {children}
    </Button>
  );
}
