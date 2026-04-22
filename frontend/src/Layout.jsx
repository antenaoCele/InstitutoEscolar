import { Outlet, Link } from "react-router-dom";
import { useState } from "react";

export const Layout = () => {
  const token = localStorage.getItem("token");
  const [openStudents, setOpenStudents] = useState(false);
  const [openUsers, setOpenUsers] = useState(false);

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 p-4 border-r bg-gray-100 dark:bg-gray-900">
        <h2 className="mb-4 font-bold text-lg">Matecitos Grupo de Estudio</h2>

        <nav className="flex flex-col gap-3">

          {token && <Link to="/">Inicio</Link>}

          {!token && <Link to="/login">Login</Link>}

          {token && <Link to="/me">Mi perfil</Link>}

          {token && <Link to="/teachers">Docentes</Link>}

          {token && (
            <>
              <button
                onClick={() => setOpenStudents(!openStudents)}
                className="text-left cursor-pointer">
                Estudiantes ▾
              </button>
              {openStudents && (
                <div className="ml-4 flex flex-col gap-2">
                  <Link to="/students/active">Alumnos activos (NO FUNCIONA)</Link> 
                  <Link to="/students">Alumnos inscriptos</Link>
                </div>
              )}
            </>
          )}

          {token && <Link to="/tutors">Tutores</Link>}

          {token && (
            <>
              <button
                onClick={() => setOpenUsers(!openUsers)}
                className="text-left cursor-pointer">
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
            onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
            }}
            className="text-left text-red-500 cursor-pointer">
            Logout
           </button>
          )}
        </nav>
      </aside>

      <main className="flex-1 p-6 bg-white dark:bg-gray-800">
        <Outlet />
      </main>
    </div>
  );
};