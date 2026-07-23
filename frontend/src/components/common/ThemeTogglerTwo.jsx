import { useTheme } from "../../context/ThemeContext";
import { SunFatIcon } from "../../icons";

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

      <SunFatIcon
        className={`absolute left-2 w-4 h-4 transition-opacity ${
          isDark ? "opacity-0" : "opacity-100 text-yellow-400"
        }`}
      />

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
