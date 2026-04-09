import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Link } from "react-router-dom";

// Componente reutilizable
function NotificationItem({ data, onClick }) {
  return (
    <DropdownItem
      onItemClick={onClick}
      className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
    >
      <span className="relative block w-full h-10 rounded-full max-w-10">
        <img src={data.image} alt={data.name} className="w-full rounded-full" />
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-[1.5px] border-white bg-success-500 dark:border-gray-900"></span>
      </span>

      <span className="block">
        <span className="block mb-1.5 text-sm text-gray-500 dark:text-gray-400 space-x-1">
          <span className="font-medium text-gray-800 dark:text-white/90">
            {data.name}
          </span>
          <span>{data.action}</span>
          <span className="font-medium text-gray-800 dark:text-white/90">
            {data.project}
          </span>
        </span>

        <span className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Project</span>
          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
          <span>{data.time}</span>
        </span>
      </span>
    </DropdownItem>
  );
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);

  const notifications = [
    {
      name: "Terry Franci",
      action: "requests permission to change",
      project: "Nganter App",
      time: "5 min ago",
      image: "/images/user/user-02.jpg",
    },
    {
      name: "Alena Franci",
      action: "requests permission to change",
      project: "Nganter App",
      time: "8 min ago",
      image: "/images/user/user-03.jpg",
    },
    {
      name: "Jocelyn Kenter",
      action: "requests permission to change",
      project: "Nganter App",
      time: "15 min ago",
      image: "/images/user/user-04.jpg",
    },
    {
      name: "Brandon Philips",
      action: "requests permission to change",
      project: "Nganter App",
      time: "1 hr ago",
      image: "/images/user/user-05.jpg",
    },
  ];

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const handleClick = () => {
    toggleDropdown();
    setNotifying(false);
  };

  return (
    <div className="relative">
      {/* Botón */}
      <button
        onClick={handleClick}
        aria-label="Open notifications"
        className="relative flex items-center justify-center w-11 h-11 rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      >
        {/* Indicador */}
        {notifying && (
          <span className="absolute right-0 top-0.5 h-2 w-2 rounded-full bg-orange-400">
            <span className="absolute w-full h-full rounded-full bg-orange-400 opacity-75 animate-ping"></span>
          </span>
        )}

        {/* Icono */}
        <svg width="20" height="20" className="fill-current">
          <path d="M10 2.5a6.5 6.5 0 00-6.5 6.5v5h13v-5A6.5 6.5 0 0010 2.5zm0 16a2 2 0 002-2H8a2 2 0 002 2z" />
        </svg>
      </button>

      {/* 📦 Dropdown */}
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-4 w-[350px] flex flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-800 dark:bg-gray-900"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-3 mb-3 border-b dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notifications
          </h5>

          <button onClick={closeDropdown}>✕</button>
        </div>

        {/* Lista */}
        <ul className="flex flex-col overflow-y-auto max-h-[300px]">
          {notifications.map((item, index) => (
            <li key={index}>
              <NotificationItem data={item} onClick={closeDropdown} />
            </li>
          ))}
        </ul>

        {/* Footer */}
        <Link
          to="/"
          className="mt-3 block text-center text-sm font-medium px-4 py-2 border rounded-lg bg-white hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          View All Notifications
        </Link>
      </Dropdown>
    </div>
  );
}
