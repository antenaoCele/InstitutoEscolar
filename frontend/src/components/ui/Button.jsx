export default function Button({
  children,
  type = "button",
  size = "md",
  variant = "primary",
  fullWidth = false,
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
}) {
  const sizeClasses = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-base",
    xl: "px-6 py-4 text-lg",
  };

  const variantClasses = {
    primary: "bg-[#0cc0df] text-white hover:bg-[#0aa3bf]",
    outline: "bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2
        rounded transition
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {startIcon && <span>{startIcon}</span>}
      {children}
      {endIcon && <span>{endIcon}</span>}
    </button>
  );
}
