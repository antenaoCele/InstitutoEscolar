import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login/Login.jsx";
import UserProfiles from "./pages/UserProfiles.jsx";
import { Layout } from "./Layout.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="login" element={<Login />} />
          <Route path="profile" element={<UserProfiles />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}