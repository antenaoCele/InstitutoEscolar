import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useSidebar } from "../../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import Button from "../ui/Button";

import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  ListIcon,
  PageIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../../icons";

const BRAND_COLOR = "#0cc0df";

const navItems = [
  {
    icon: <GridIcon />,
    name: "Inicio",
    path: "/me",
  },
  // {
  //   icon: <UserCircleIcon />,
  //   name: "Mi Perfil",
  //   path: "/me",
  // },
  {
    icon: <ListIcon />,
    name: "Alumnos",
    subItems: [
      {
        name: "Total de alumnos",
        path: "/students?status=all",
      },
      {
        name: "Alumnos activos",
        path: "/students?status=active",
      },
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "Docentes",
    path: "/teachers",
  },
  {
    icon: <TableIcon />,
    name: "Materias",
    path: "/subjects",
  },
  {
    icon: <PageIcon />,
    name: "Planes",
    path: "/plans",
  },
  {
    icon: <CalenderIcon />,
    name: "Horarios",
    path: "/schedules",
  },
  {
    icon: <BoxCubeIcon />,
    name: "Tutores",
    path: "/tutors",
  },
  {
    icon: <PlugInIcon />,
    name: "Usuarios",
    subItems: [
      {
        name: "Administradores",
        path: "/users/admins",
      },
      {
        name: "Docentes",
        path: "/users/teachers",
      },
      {
        name: "Todos los usuarios",
        path: "/users",
      },
    ],
  },
];

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
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

    navItems.forEach((nav, index) => {
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
  }, [location, isActive]);

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
      {navItems.map((nav, index) => (
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
                <span>{nav.icon}</span>

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
              <span>{nav.icon}</span>

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
      className={`fixed top-0 left-0 h-screen bg-white dark:bg-black border-r dark:border-gray-800 transition-all duration-300 ${
        isExpanded || isMobileOpen ? "w-[290px]" : "w-[90px]"
      }`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        to="/home"
        className={`flex items-center transition-all duration-300 py-8
    ${
      isExpanded || isHovered || isMobileOpen
        ? "justify-center"
        : "justify-center"
    }
  `}
      >
        <img
          src={
            theme === "dark"
              ? "images/logo/logo 11.png"
              : "images/logo/logo 6.png"
          }
          alt="Matecitos"
          className={`rounded-full object-cover transition-all duration-300
      ${
        isExpanded || isHovered || isMobileOpen
          ? "w-[70px] h-[70px]"
          : "w-[38px] h-[38px]"
      }
    `}
        />
      </Link>

      <nav className="px-4">{renderMenuItems()}</nav>
    </aside>
  );
};

export default AppSidebar;
