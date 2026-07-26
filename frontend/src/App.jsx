import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/Auth.jsx";

import Login from "./pages/login/Login.jsx";
import UserProfiles from "./pages/me/UserProfiles.jsx";
import AppLayout from "./components/Layout/AppLayout.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";

import SessionExpiredModal from "./components/modal/SessionExpiredModal.jsx";

import { Users } from "./pages/users/Users.jsx";
import { Teachers } from "./pages/teachers/Teachers.jsx";
import { Students } from "./pages/students/Students.jsx";
import StudentPayments from "./pages/students/StudentPayments";
import { Tutors } from "./pages/tutors/Tutors.jsx";
import { Schedules } from "./pages/schedules/Schedules.jsx";
import { Subjects } from "./pages/subjects/Subjects.jsx";
import { Plans } from "./pages/plans/Plans.jsx";
import { Home } from "./pages/home/Home.jsx";
import TeacherLiquidations from "./pages/teachers/TeacherLiquidations.jsx";
import MonthlyFinances from "./pages/gains/MonthlyFinances.jsx";

export default function App() {
  const { isAuthenticated, sessionExpired, setSessionExpired, logout } =
    useAuth();

  return (
    <BrowserRouter>
      {/* Modal global de sesión expirada */}
      <SessionExpiredModal
        isOpen={sessionExpired}
        onConfirm={() => {
          setSessionExpired(false);
          logout();
        }}
      />

      <Routes>
        {/* Login */}
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
        />

        {/* Rutas protegidas */}
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />

            <Route path="/home" element={<Navigate to="/" replace />} />

            <Route path="/me" element={<UserProfiles />} />

            <Route path="/users" element={<Users />} />

            <Route path="/students" element={<Students />} />

            <Route path="/teachers" element={<Teachers />} />

            <Route path="/plans" element={<Plans />} />

            <Route path="/subjects" element={<Subjects />} />

            <Route path="/schedules" element={<Schedules />} />

            <Route path="/tutors" element={<Tutors />} />

            <Route path="/students/payments" element={<StudentPayments />} />
            <Route
              path="/teachers/liquidations"
              element={<TeacherLiquidations />}
            />
            <Route path="/gains" element={<MonthlyFinances />} />
          </Route>
        </Route>

        {/* Cualquier ruta inexistente */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
