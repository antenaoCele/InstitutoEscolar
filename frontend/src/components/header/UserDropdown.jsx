import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Link } from "react-router-dom";

//  Item reutilizable
function MenuItem({ item, onClick }) {
  return (
    <DropdownItem
      onItemClick={onClick}
      tag="a"
      to={item.to}
      className="flex items-center gap-3 px-3 py-2 font-medium rounded-lg text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
    >
      {item.icon}
      {item.label}
    </DropdownItem>
  );
}

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      label: "Edit profile",
      to: "/profile",
      icon: <span>👤</span>,
    },
    {
      label: "Account settings",
      to: "/settings",
      icon: <span>⚙️</span>,
    },
    {
      label: "Support",
      to: "/support",
      icon: <span>❓</span>,
    },
  ];

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  return (
    <div className="relative">
      {/* Botón usuario */}
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dark:text-gray-400"
      >
        <span className="mr-3 w-11 h-11 rounded-full overflow-hidden">
          <img src="/images/user/owner.jpg" alt="User" />
        </span>

        <span className="mr-1 font-medium text-sm">Musharof</span>

        <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {/* Dropdown */}
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-4 w-[260px] flex flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-800 dark:bg-gray-900"
      >
        {/* Info usuario */}
        <div>
          <span className="block font-medium text-gray-700 dark:text-gray-400">
            Musharof Chowdhury
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            randomuser@pimjo.com
          </span>
        </div>

        {/* Menú */}
        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b dark:border-gray-800">
          {menuItems.map((item, index) => (
            <li key={index}>
              <MenuItem item={item} onClick={closeDropdown} />
            </li>
          ))}
        </ul>

        {/* Logout */}
        <Link
          to="/signin"
          className="flex items-center gap-3 px-3 py-2 mt-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
        >
          🚪 Sign out
        </Link>
      </Dropdown>
    </div>
  );
}
