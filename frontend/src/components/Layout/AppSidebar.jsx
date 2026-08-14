import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useSidebar } from "../../context/SidebarContext";
import { useAuth } from "../../context/Auth";

import {
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  PageIcon,
  UserCircleIcon,
  GroupIcon,
  FileIcon,
  TutorIcon,
  TeacherIcon,
  SubjectIcon,
  PlansIcon,
  DollarBagIcon,
} from "../../icons";

const SidebarIcon = ({ children }) => (
  <span className="flex items-center justify-center w-6 h-6 shrink-0">
    {children}
  </span>
);

const SidebarPngIcon = ({ src, alt }) => (
  <SidebarIcon>
    <img src={src} alt={alt} className="w-5 h-5 object-contain" />
  </SidebarIcon>
);

const BRAND_COLOR = "#0cc0df";

// navItems ahora es una función: arma la estructura según si el usuario es docente
const getNavItems = (isTeacherRole) => [
  {
    icon: (
      <SidebarIcon>
        <GridIcon className="w-5 h-5" />
      </SidebarIcon>
    ),
    name: "Inicio",
    path: "/",
  },

  // "Ganancias" oculto para rol docente
  ...(isTeacherRole
    ? []
    : [
        {
          icon: (
            <SidebarIcon>
              <DollarBagIcon className="w-5 h-5" />
            </SidebarIcon>
          ),
          name: "Ganancias",
          path: "/gains",
        },
      ]),

  {
    icon: (
      <SidebarIcon>
        <GroupIcon className="w-5 h-5" />
      </SidebarIcon>
    ),
    name: "Estudiantes",
    // Docente: link directo a Estudiantes, sin "Pagos de estudiantes"
    ...(isTeacherRole
      ? { path: "/students" }
      : {
          subItems: [
            { name: "Estudiantes", path: "/students" },
            { name: "Pagos de estudiantes", path: "/students/payments" },
          ],
        }),
  },

  {
    icon: (
      <SidebarIcon>
        <TeacherIcon className="w-5 h-5" />
      </SidebarIcon>
    ),
    name: "Docentes",
    // Docente: link directo a Docentes, sin desplegable de "Sueldos"
    ...(isTeacherRole
      ? { path: "/teachers" }
      : {
          subItems: [
            { name: "Docentes", path: "/teachers" },
            { name: "Sueldos", path: "/teachers/liquidations" },
          ],
        }),
  },
  {
    icon: (
      <SidebarIcon>
        <FileIcon className="w-5 h-5" />
      </SidebarIcon>
    ),
    name: "Materias",
    path: "/subjects",
  },

  {
    icon: (
      <SidebarIcon>
        <PlansIcon className="w-5 h-5" />
      </SidebarIcon>
    ),
    name: "Planes",
    path: "/plans",
  },

  {
    icon: (
      <SidebarIcon>
        <CalenderIcon className="w-5 h-5" />
      </SidebarIcon>
    ),
    name: "Horarios",
    subItems: [
      { name: "Calendario Semanal", path: "/schedules?view=weekly" },
      { name: "Calendario Mensual", path: "/schedules?view=monthly" },
    ],
  },

  {
    icon: (
      <SidebarIcon>
        <TutorIcon className="w-5 h-5" />
      </SidebarIcon>
    ),
    name: "Tutores",
    path: "/tutors",
  },

  {
    icon: (
      <SidebarIcon>
        <UserCircleIcon className="w-5 h-5" />
      </SidebarIcon>
    ),
    name: "Usuarios",
    path: "/users",
  },
];

const AppSidebar = () => {
  const { user: currentUser } = useAuth();

  const role = currentUser?.role?.toLowerCase();
  const isCurrentUserAdmin = role === "admin";
  const isTeacherRole = role === "docente";

  const navItems = getNavItems(isTeacherRole);

  const filteredNavItems = isCurrentUserAdmin
    ? navItems
    : navItems.filter(
        (item) => item.name !== "Usuarios" && item.name !== "Planes",
      );

  const {
    isExpanded,
    isMobileOpen,
    isHovered,
    setIsHovered,
    toggleMobileSidebar,
  } = useSidebar();

  const { theme } = useTheme();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});

  const isActive = useCallback(
    (path) => location.pathname + location.search === path,
    [location.pathname, location.search],
  );

  useEffect(() => {
    let submenuMatched = false;

    filteredNavItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu(index);
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (openSubmenu !== null) {
      if (subMenuRefs.current[openSubmenu]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [openSubmenu]: subMenuRefs.current[openSubmenu]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index) => {
    setOpenSubmenu((prev) => (prev === index ? null : index));
  };

  const renderMenuItems = () => (
    <ul className="flex flex-col gap-2">
      {filteredNavItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <>
              <button
                onClick={() => handleSubmenuToggle(index)}
                className="flex items-center w-full px-4 py-3 rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
                style={
                  openSubmenu === index
                    ? {
                        backgroundColor: `${BRAND_COLOR}20`,
                        color: BRAND_COLOR,
                      }
                    : {}
                }
              >
                {nav.icon}

                {(isExpanded || isHovered || isMobileOpen) && (
                  <>
                    <span className="ml-3">{nav.name}</span>

                    <ChevronDownIcon
                      className={`ml-auto w-5 h-5 transition-transform ${
                        openSubmenu === index ? "rotate-180" : ""
                      }`}
                    />
                  </>
                )}
              </button>

              {(isExpanded || isHovered || isMobileOpen) && (
                <div
                  ref={(el) => (subMenuRefs.current[index] = el)}
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    height:
                      openSubmenu === index
                        ? `${subMenuHeight[index]}px`
                        : "0px",
                  }}
                >
                  <ul className="ml-10 mt-2 flex flex-col gap-2">
                    {nav.subItems.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.path}
                          onClick={() => isMobileOpen && toggleMobileSidebar()}
                          className="block py-2 text-sm transition-colors"
                          style={{
                            color: isActive(subItem.path)
                              ? BRAND_COLOR
                              : theme === "dark"
                                ? "#ffffff"
                                : "#6b7280",
                            fontWeight: isActive(subItem.path) ? "600" : "400",
                          }}
                        >
                          {subItem.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <Link
              to={nav.path}
              onClick={() => isMobileOpen && toggleMobileSidebar()}
              className="flex items-center px-4 py-3 rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
              style={
                isActive(nav.path)
                  ? {
                      backgroundColor: `${BRAND_COLOR}20`,
                      color: BRAND_COLOR,
                      fontWeight: "600",
                    }
                  : {}
              }
            >
              {nav.icon}

              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="ml-3">{nav.name}</span>
              )}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed top-0 left-0 z-50 h-screen bg-white dark:bg-black
      border-r border-gray-200 dark:border-gray-700
      transition-all duration-300 overflow-y-auto overflow-x-hidden
      ${
        isMobileOpen
          ? "translate-x-0 w-[290px]"
          : "-translate-x-full lg:translate-x-0"
      }
      ${isExpanded || isHovered ? "lg:w-[290px]" : "lg:w-[90px]"}`}
      onMouseEnter={() => {
        if (!isExpanded && !isMobileOpen) {
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => {
        if (!isExpanded) {
          setIsHovered(false);
        }
      }}
    >
      <Link
        to="/home"
        onClick={() => isMobileOpen && toggleMobileSidebar()}
        className="flex items-center justify-center py-8"
      >
        <img
          src={
            theme === "dark"
              ? "images/logo/logo 11.png"
              : "images/logo/logo 6.png"
          }
          alt="Matecitos"
          className={`rounded-full object-cover transition-all duration-300 hover:scale-110
          ${
            isExpanded || isHovered || isMobileOpen
              ? "w-[70px] h-[70px]"
              : "w-[38px] h-[38px]"
          }`}
        />
      </Link>

      <nav className="px-4 pb-6">{renderMenuItems()}</nav>
    </aside>
  );
};

export default AppSidebar;
