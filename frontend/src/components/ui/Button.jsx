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
  title = "",
}) {
  const sizeClasses = {
    xs: "h-8 px-2 text-xs",
    sm: "h-10 px-3 text-sm",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-5 text-base",
    xl: "h-14 px-6 text-lg",
    icon: "",
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
      title={title}
      className={`
        inline-flex items-center justify-center gap-2
        rounded transition
        ${fullWidth ? "w-full" : ""}
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
