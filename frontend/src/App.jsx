import { BrowserRouter, Routes, Route } from "react-router-dom";

// import { Home } from "./pages/Home.jsx";

// import { Users } from "./pages/users/Users.jsx";
// import { DetailsUser } from "./pages/users/DetailsUser.jsx";
// import { UpdateUser } from "./pages/users/UpdateUser.jsx";
// import { CreateUser } from "./pages/users/CreateUser.jsx";
import Login from "./pages/login/Login.jsx";

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
          <Route path="login" element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
