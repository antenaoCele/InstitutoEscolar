import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/login/Login.jsx";
import UserProfiles from "./pages/me/UserProfiles.jsx";
import { Users } from "./pages/users/AllUsers.jsx";
// import { Layout } from "./Layout.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";
import { Teachers } from "./pages/teachers/Teachers.jsx";
import { Students } from "./pages/students/Students.jsx";
import { Tutors } from "./pages/tutors/Tutors.jsx";
import { Schedules } from "./pages/schedules/Schedules.jsx";
import AppLayout from "./components/Layout/AppLayout.jsx";

import { useAuth } from "./context/Auth";

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/me" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/me" replace /> : <Login />}
        />

        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/me" element={<UserProfiles />} />
            <Route path="/users" element={<Users />} />
            <Route path="/students" element={<Students />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/tutors" element={<Tutors />} />
            <Route path="/schedules" element={<Schedules />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
