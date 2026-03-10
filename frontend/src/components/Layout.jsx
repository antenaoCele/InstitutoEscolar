// import { Outlet, Link } from "react-router";
import { useAuth } from "../context/Auth";
import { Login } from "./Login.jsx";
import { Link, Outlet } from "react-router-dom";

export const Layout = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <main className="container">
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/users">Usuarios</Link>
          </li>
        </ul>
        <li>
          {isAuthenticated ? (
            <button onClick={() => logout()}>Salir</button>
          ) : (
            <Login />
          )}
        </li>
      </nav>
      <Outlet />
    </main>
  );
};
