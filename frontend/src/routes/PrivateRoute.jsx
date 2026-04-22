// import { Navigate, Outlet } from "react-router-dom";

// export default function PrivateRoute() {
//   const token = localStorage.getItem("token");

//   return token ? <Outlet /> : <Navigate to="/login" replace />;
// }

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/Auth.jsx";

export default function PrivateRoute() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}
