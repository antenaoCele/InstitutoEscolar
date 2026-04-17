import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Home } from "./pages/Home.jsx";

import { Users } from "./pages/users/Users.jsx";
import { DetailsUser } from "./pages/users/DetailsUser.jsx";
import { UpdateUser } from "./pages/users/UpdateUser.jsx";
import { CreateUser } from "./pages/users/CreateUser.jsx";

import { Layout } from "./Layout.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";

import { ScrollToTop } from "./components/common/ScrollToTop.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        {/* Layout general */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />

          {/* RUTAS PROTEGIDAS */}
          <Route element={<PrivateRoute />}>
            <Route path="users" element={<Users />} />
            <Route path="users/:id" element={<DetailsUser />} />
            <Route path="users/:id/update" element={<UpdateUser />} />
            <Route path="users/create" element={<CreateUser />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
