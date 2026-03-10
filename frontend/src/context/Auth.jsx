import { createContext, useContext } from "react";
import { useState } from "react";

//contexto para compartir el estado de auth
const AuthContext = createContext(null);
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  const login = async (username, password) => {
    setError(null);
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const session = await response.json();
      if (!response.ok) {
        let errorMessage = "Ocurrió un error inesperado.";
        if (response.status === 401 && session.error) {
          errorMessage = session.error;
        } else if (
          response.status === 400 &&
          session.errores &&
          session.errores.length > 0
        ) {
          errorMessage = session.errores.map((err) => err.msg).join(", ");
        } else if (session.message) {
          errorMessage = session.message;
        }
        throw new Error(errorMessage);
      }

      setToken(session.token);
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setToken(null);
    setError(null);
  };

  const fetchAuth = async (url, options = {}) => {
    if (!token) {
      throw new Error("Debes iniciar sesion");
    }

    return fetch(url, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });
  };

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const AuthPage = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <h2>Ingrese para ver esta pagina</h2>;
  }

  return children;
};
