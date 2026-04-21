import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/login/Login.jsx";
import UserProfiles from "./pages/UserProfiles.jsx";
import Users from "./pages/Users.jsx";
import { Layout } from "./Layout.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Ruta inicial → login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Layout />}>
            <Route path="me" element={<UserProfiles />} />
            <Route path="/users" element={<Users />} />
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}