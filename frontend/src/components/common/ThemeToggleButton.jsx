import { useTheme } from "../../context/ThemeContext";
import Switch from "../form/Switch";

export const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <Switch checked={isDark} onChange={toggleTheme}>
      {/* Sol */}
      <svg
        className={`absolute left-2 w-3 h-3 transition-opacity ${
          isDark ? "opacity-0" : "opacity-100 text-white"
        }`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M10 7a3 3 0 100 6 3 3 0 000-6z" />
      </svg>

      {/* Luna */}
      <svg
        className={`absolute right-2 w-3 h-3 transition-opacity ${
          isDark ? "opacity-100 text-yellow-400" : "opacity-0"
        }`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M17.293 13.293A8 8 0 016.707 2.707a.75.75 0 00-.98-.98A9.5 9.5 0 1018.273 14.27a.75.75 0 00-.98-.98z" />
      </svg>
    </Switch>
  );
};
