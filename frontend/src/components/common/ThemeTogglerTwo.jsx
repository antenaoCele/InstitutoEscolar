import { useTheme } from "../../context/ThemeContext";

export default function ThemeTogglerTwo() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative flex items-center w-16 h-9 rounded-full transition-colors duration-300
        ${isDark ? "bg-gray-700" : "bg-[#0cc0df]"}
      `}
    >
      {/* Círculo deslizante */}
      <span
        className={`
          absolute left-1 top-1 w-7 h-7 rounded-full bg-white shadow-md
          transform transition-transform duration-300
          ${isDark ? "translate-x-7" : "translate-x-0"}
        `}
      />

      {/* ICONO SOL */}
      <svg
        className={`absolute left-2 w-4 h-4 transition-opacity ${
          isDark ? "opacity-0" : "opacity-100 text-yellow-400"
        }`}
        viewBox="0 0 17 17"
        fill="currentColor"
      >
        <path d="M10 4.5a.75.75 0 01.75.75V6a.75.75 0 01-1.5 0v-.75A.75.75 0 0110 4.5zm0 8a.75.75 0 01.75.75V14a.75.75 0 01-1.5 0v-.75a.75.75 0 01.75-.75zm5.5-3.25a.75.75 0 010 1.5H14.75a.75.75 0 010-1.5h.75zm-8 0a.75.75 0 010 1.5H6a.75.75 0 010-1.5h.75zm6.364-3.114a.75.75 0 010 1.06l-.53.53a.75.75 0 01-1.06-1.06l.53-.53a.75.75 0 011.06 0zM7.226 12.774a.75.75 0 010 1.06l-.53.53a.75.75 0 11-1.06-1.06l.53-.53a.75.75 0 011.06 0zm6.138 1.06a.75.75 0 10-1.06-1.06l-.53.53a.75.75 0 101.06 1.06l.53-.53zM7.226 7.226a.75.75 0 10-1.06-1.06l-.53.53a.75.75 0 101.06 1.06l.53-.53zM10 7a3 3 0 100 6 3 3 0 000-6z" />
      </svg>

      {/* ICONO LUNA */}
      <svg
        className={`absolute right-2 w-4 h-4 transition-opacity ${
          isDark ? "opacity-100 text-yellow-400" : "opacity-0"
        }`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M17.293 13.293A8 8 0 016.707 2.707a.75.75 0 00-.98-.98A9.5 9.5 0 1018.273 14.27a.75.75 0 00-.98-.98z" />
      </svg>
    </button>
  );
}
