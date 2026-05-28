import { useState } from "react";
import { Link } from "react-router-dom";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { UserIcon, ChevronDownIcon } from "../../icons";
import Button from "../ui/Button";

function MenuItem({ item, onClick }) {
  return (
    <DropdownItem
      onItemClick={onClick}
      tag={Link}
      to={item.to}
      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
    >
      {item.icon}
      {item.label}
    </DropdownItem>
  );
}

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };
  const closeDropdown = () => setIsOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const menuItems = [
    {
      label: "Editar perfil",
      to: "/me",
      icon: <UserIcon />,
    },
  ];

  return (
    <div className="relative">
      {/* BOTÓN PERFIL */}
      <button
        onClick={toggleDropdown}
        className="dropdown-toggle flex items-center gap-2 text-gray-700 dark:text-gray-300"
      >
        <UserIcon />
        <span className="flex flex-col gap-2">Mi perfil</span>

        <ChevronDownIcon
          className={`w-5 h-5 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* DROPDOWN */}
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-4 w-[240px] rounded-2xl border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-800 dark:bg-gray-900"
      >
        <ul className="flex flex-col gap-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <MenuItem item={item} onClick={closeDropdown} />
            </li>
          ))}
        </ul>

        {/* LOGOUT */}

        <Button
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium"
        >
          Cerrar sesión
        </Button>
      </Dropdown>
    </div>
  );
}
