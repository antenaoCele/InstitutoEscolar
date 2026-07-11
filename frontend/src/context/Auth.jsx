import { createContext, useContext, useState } from "react";
import { useEffect } from "react";

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  const [error, setError] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  // =========================
  // LOGIN
  // =========================
  const login = async (username, password) => {
    setError(null);

    if (!username?.trim() || !password?.trim()) {
      return { success: false, error: "Debes completar todos los campos" };
    }

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const session = await response.json();

      if (!response.ok) {
        let errorMessage = "Ocurrió un error inesperado.";

        if (response.status === 400) {
          errorMessage = session.error || session.message || errorMessage;
        } else if (response.status === 401) {
          errorMessage = session.error || errorMessage;
        } else if (session.message) {
          errorMessage = session.message;
        }

        throw new Error(errorMessage);
      }

      // =========================
      // 🔥 GUARDAR TOKEN + USER
      // =========================
      setToken(session.token);
      localStorage.setItem("token", session.token);

      if (session.user) {
        localStorage.setItem("user", JSON.stringify(session.user));
      } else {
        console.warn("⚠️ El backend no envía el user");
      }

      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // 🔥 importante
    setToken(null);
    setError(null);
  };

  // =========================
  // FETCH AUTH
  // =========================
  const fetchAuth = async (url, options = {}) => {
    if (!token) {
      throw new Error("Debes iniciar sesión");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      logout();
      throw new Error("Sesión expirada");
    }

    return response;
  };

  // =========================
  // SESION EXPIRADA
  // =========================
  useEffect(() => {
    const handleSessionExpired = () => {
      setSessionExpired(true);
    };

    window.addEventListener("sessionExpired", handleSessionExpired);

    return () => {
      window.removeEventListener("sessionExpired", handleSessionExpired);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        error,
        login,
        logout,
        fetchAuth,
        isAuthenticated: !!token,
        setError,
        sessionExpired,
        setSessionExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// =========================
// PROTECCIÓN DE RUTAS
// =========================
export const AuthPage = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <h2>Ingrese para ver esta página</h2>;
  }

  return children;
};
