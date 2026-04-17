// // import { Outlet, Link } from "react-router";
// import { useAuth } from "./context/Auth.jsx";
// import { Login } from "./pages/Login.jsx";
// import { Link, Outlet } from "react-router-dom";

// export const Layout = () => {
//   const { isAuthenticated, logout } = useAuth();

//   return (
//     <main className="container">
//       <nav>
//         <ul>
//           <li>
//             <Link to="/">Home</Link>
//           </li>
//           <li>
//             <Link to="/users">Usuarios</Link>
//           </li>
//         </ul>
//         <li>
//           {isAuthenticated ? (
//             <button onClick={() => logout()}>Salir</button>
//           ) : (
//             <Login />
//           )}
//         </li>
//       </nav>
//       <Outlet />
//     </main>
//   );
// };

import { Outlet, Link } from "react-router-dom";

export function Layout() {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r">
        <div className="p-4 font-bold text-lg">Mi Sistema</div>

        <nav className="p-4 space-y-2">
          <Link to="/" className="block hover:text-blue-500">
            Dashboard
          </Link>

          <Link to="/users" className="block hover:text-blue-500">
            Usuarios
          </Link>
        </nav>
      </aside>

      {/* CONTENIDO */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b flex items-center px-6">
          <h1 className="font-semibold text-lg">Panel de Administración</h1>
        </header>

        {/* MAIN */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
