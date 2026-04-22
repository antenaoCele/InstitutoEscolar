import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/login/Login.jsx";
import UserProfiles from "./pages/UserProfiles.jsx";
import Users from "./pages/Users.jsx";
import { Layout } from "./Layout.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";
import { Teachers } from "./pages/users/Teachers.jsx";
import { Tutors } from "./pages/users/Tutors.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
<Route path="/" element={<Navigate to="/login" replace />} />

<Route
  path="/login"
  element={
    localStorage.getItem("token")
      ? <Navigate to="/me" replace />
      : <Login />
  }
/>

<Route element={<PrivateRoute />}>
  <Route path="/" element={<Layout />}>
    <Route path="me" element={<UserProfiles />} />
    <Route path="users" element={<Users />} />
    <Route path="teachers" element={<Teachers />} />
    <Route path="tutors" element={<Tutors />} />
  </Route>
</Route>
      </Routes>
    </BrowserRouter>
  );
}