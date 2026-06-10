import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/Auth.jsx";

export default function PrivateRoute() {
  const { isAuthenticated } = useAuth();
  console.log("AUTH:", isAuthenticated);

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}
