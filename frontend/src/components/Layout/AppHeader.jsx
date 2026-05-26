import { useState } from "react";
import { useSidebar } from "../../context/SidebarContext";
import { ThemeToggleButton } from "../../components/common/ThemeToggleButton";
import NotificationDropdown from "../../components/header/NotificationDropdown";
import UserDropdown from "../../components/header/UserDropdown";

const AppHeader = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);

  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 991) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-200 bg-white dark:bg-black dark:border-gray-800">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* IZQUIERDA — HAMBURGUESA */}
        <button
          onClick={handleToggle}
          aria-label="Toggle Sidebar"
          className="
          flex items-center justify-center
          w-10 h-10
          rounded-lg
          border border-gray-300 dark:border-gray-700
          bg-white dark:bg-gray-900
          hover:bg-gray-50 dark:hover:bg-gray-800
          transition-all duration-200
          shadow-sm
          "
        >
          <div className="flex flex-col justify-between w-6 h-5">
            <span className="h-[2px] w-full rounded-full bg-[#0cc0df]"></span>
            <span className="h-[2px] w-full rounded-full bg-[#0cc0df]"></span>
            <span className="h-[2px] w-full rounded-full bg-[#0cc0df]"></span>
          </div>
        </button>

        {/* CENTRO — TITULO */}
        <div className="flex flex-col items-center flex-1">
          <h1 className="text-xl font-bold text-[#0cc0df]">Matecitos</h1>

          <span className="text-xs text-gray-500 dark:text-gray-400">
            Grupo de estudio
          </span>
        </div>

        {/* DERECHA */}
        <div
          className={`${
            isApplicationMenuOpen ? "flex" : "hidden lg:flex"
          } items-center gap-3`}
        >
          <ThemeToggleButton />

          {/* <NotificationDropdown /> */}

          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
