// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import { AuthProvider, AuthPage } from "./context/Auth.jsx";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { Home } from "./pages/Home.jsx";
// import { Users } from "./pages/users/Users.jsx";
// import { DetailsUser } from "./pages/users/DetailsUser.jsx";
// import { UpdateUser } from "./pages/users/UpdateUser.jsx";
// import { CreateUser } from "./pages/users/CreateUser.jsx";
// import App from "./App.jsx";
// import { Layout } from "./Layout.jsx";

// createRoot(document.getElementById("root")).render(
//   <StrictMode>
//     <AuthProvider>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<Layout />}>
//             <Route index element={<Home />} />

//             <Route
//               path="users"
//               element={
//                 <AuthPage>
//                   <Users />
//                 </AuthPage>
//               }
//             />

//             <Route
//               path="users/:id"
//               element={
//                 <AuthPage>
//                   <DetailsUser />
//                 </AuthPage>
//               }
//             />

//             <Route
//               path="users/:id/update"
//               element={
//                 <AuthPage>
//                   <UpdateUser />
//                 </AuthPage>
//               }
//             />

//             <Route
//               path="users/create"
//               element={
//                 <AuthPage>
//                   <CreateUser />
//                 </AuthPage>
//               }
//             />
//           </Route>
//         </Routes>
//       </BrowserRouter>
//     </AuthProvider>
//   </StrictMode>,
// );

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import "swiper/swiper-bundle.css";
import "simplebar-react/dist/simplebar.min.css";

import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/Auth.jsx";

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
