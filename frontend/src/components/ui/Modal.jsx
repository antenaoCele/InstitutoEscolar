import { useEffect } from "react";

export const Modal = ({
  isOpen,
  onClose,
  children,
  className = "",
  showCloseButton = true,
  isFullscreen = false,
}) => {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const contentClasses = isFullscreen
    ? "w-full h-full"
    : "relative w-full max-w-lg mx-4 p-6 rounded-2xl bg-white dark:bg-gray-900 shadow-xl";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {!isFullscreen && (
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div
        className={`
          ${contentClasses}
          max-h-[90vh] overflow-y-auto
          transform transition-all duration-200 scale-100 opacity-100
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            ✕
          </button>
        )}

        {children}
      </div>
    </div>
  );
};
