import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/Auth.jsx";

import Login from "./pages/login/Login.jsx";
import UserProfiles from "./pages/me/UserProfiles.jsx";
import AppLayout from "./components/Layout/AppLayout.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";
import { Users } from "./pages/users/AllUsers.jsx";
import { Teachers } from "./pages/teachers/Teachers.jsx";
import { Students } from "./pages/students/Students.jsx";
import { Tutors } from "./pages/tutors/Tutors.jsx";
import { Schedules } from "./pages/schedules/Schedules.jsx";
import { Subjects } from "./pages/subjects/Subjects.jsx";
import { Plans } from "./pages/plans/Plans.jsx";

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* SI NO está logueado → login */}
        <Route
          path="/"
          element={
            !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : (
              <Navigate to="/me" replace />
            )
          }
        />

        {/* Login */}
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/me" replace />}
        />

        {/* Rutas protegidas */}
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/me" element={<UserProfiles />} />
            <Route path="/users" element={<Users />} />
            <Route path="/students" element={<Students />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/tutors" element={<Tutors />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
