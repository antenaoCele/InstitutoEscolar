import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login/Login.jsx";
import UserProfiles from "./pages/UserProfiles.jsx";
import { Layout } from "./Layout.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*  Ruta SIN layout */}
        <Route path="/login" element={<Login />} />

        {/*  Rutas CON layout */}
        <Route path="/" element={<Layout />}>
          <Route path="profile" element={<UserProfiles />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
