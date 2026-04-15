export default function Button({
  children,
  type = "button", // 🔥 clave para forms
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
  loading = false, // 🔥 reemplaza SubmitButton
}) {
  // Sizes
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
  };

  // Variants
  const variantClasses = {
    primary:
      "bg-brand-500 text-white hover:bg-brand-600 disabled:bg-brand-300",
    outline:
      "bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition 
      ${sizeClasses[size]} 
      ${variantClasses[variant]} 
      ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""} 
      ${className}`}
    >
      {/* Icono izquierdo */}
      {startIcon && !loading && (
        <span className="flex items-center">{startIcon}</span>
      )}

      {/* Texto */}
      {loading ? "Guardando..." : children}

      {/* Icono derecho */}
      {endIcon && !loading && (
        <span className="flex items-center">{endIcon}</span>
      )}
    </button>
  );
}