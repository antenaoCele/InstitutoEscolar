import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import "swiper/swiper-bundle.css";
import "simplebar-react/dist/simplebar.min.css";

import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/Auth.jsx";
import { AppWrapper } from "./components/common/PageMeta.jsx";

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <AppWrapper>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AppWrapper>
    </ThemeProvider>
  </StrictMode>,
);
