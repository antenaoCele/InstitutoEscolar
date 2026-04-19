import { Outlet, Link } from "react-router-dom";

export const Layout = () => {
  const token = localStorage.getItem("token");

  return (
    <div className="flex min-h-screen">
      
      {/* Sidebar */}
      <aside className="w-64 p-4 border-r bg-gray-100 dark:bg-gray-900">
        <h2 className="mb-4 font-bold text-lg">Mi Sistema</h2>

        <nav className="flex flex-col gap-3">
          <Link to="/">Dashboard</Link>

          {!token && <Link to="/login">Login</Link>}

          {token && <Link to="/profile">Profile</Link>}

          {token && (
            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
              className="text-left text-red-500"
            >
              Logout
            </button>
          )}
        </nav>
      </aside>

      {/* Contenido */}
      <main className="flex-1 p-6 bg-white dark:bg-gray-800">
        <Outlet />
      </main>
    </div>
  );
};