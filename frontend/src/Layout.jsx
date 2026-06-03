import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export const Layout = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [openStudents, setOpenStudents] = useState(false);
  const [openUsers, setOpenUsers] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-black overflow-x-hidden">
      {/* Overlay para móvil - bg-black/50 con opacidad evita que la pantalla se vea negra sólida */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Ahora es responsivo (se desliza en móvil, estático en escritorio) */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 p-4 border-r bg-gray-100 dark:bg-gray-900 transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:block
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Matecitos Grupo de Estudio</h2>
          <button
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
            onClick={() => setIsSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-3">
          {token && <Link to="/">Inicio</Link>}

          {!token && <Link to="/login">Login</Link>}

          {token && <Link to="/me">Mi perfil</Link>}

          {token && (
            <>
              <button
                onClick={() => setOpenStudents(!openStudents)}
                className="text-left cursor-pointer"
              >
                Alumnos ▾
              </button>
              {openStudents && (
                <div className="ml-4 flex flex-col gap-2">
                  <Link to="/students?status=all">Total de alumnos</Link>
                  <Link to="/students?status=active">Alumnos activos</Link>
                </div>
              )}
            </>
          )}

          {token && <Link to="/teachers">Docentes</Link>}

          {token && <Link to="/subjects">Materias</Link>}

          {token && <Link to="/plans">Planes</Link>}

          {token && <Link to="/schedules">Horarios</Link>}

          {token && <Link to="/tutors">Tutores</Link>}

          {token && (
            <>
              <button
                onClick={() => setOpenUsers(!openUsers)}
                className="text-left cursor-pointer"
              >
                Usuarios ▾
              </button>
              {openUsers && (
                <div className="ml-4 flex flex-col gap-2">
                  <Link to="/users/admins">Administradores (NO FUNCIONA)</Link>
                  <Link to="/users/teachers">Docentes (NO FUNCIONA)</Link>
                  <Link to="/users">Todos los usuarios</Link>
                </div>
              )}
            </>
          )}

          {token && (
            <button
              onClick={handleLogout}
              className="text-left text-red-500 cursor-pointer"
            >
              Logout
            </button>
          )}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header para móviles - Aparece cuando la pantalla es chica */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
          >
            <span className="text-2xl">☰</span>
          </button>
          <span className="font-bold dark:text-white">Matecitos</span>
          <div className="w-10" /> {/* Espaciador */}
        </header>

        <main className="flex-1 p-6 bg-white dark:bg-gray-800 transition-all duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
