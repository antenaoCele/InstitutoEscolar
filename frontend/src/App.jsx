import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login/Login.jsx";
import UserProfiles from "./pages/UserProfiles.jsx";
import { Layout } from "./Layout.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login sin layout */}
        <Route path="/login" element={<Login />} />

        {/* Con layout */}
        <Route path="/" element={<Layout />}>
          <Route path="me" element={<UserProfiles />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}