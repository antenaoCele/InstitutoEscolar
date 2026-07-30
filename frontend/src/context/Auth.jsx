import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api.js";

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
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
      const response = await api.post("/login", { username, password });
      const session = response.data;

      // =========================
      // GUARDAR TOKEN + USER
      // =========================
      setToken(session.token);
      localStorage.setItem("token", session.token);

      if (session.user) {
        setUser(session.user);
        localStorage.setItem("user", JSON.stringify(session.user));
      }

      return { success: true };
    } catch (err) {
      let errorMessage = "Ocurrió un error inesperado.";

      const status = err.response?.status;
      const data = err.response?.data;

      if (status === 400) {
        errorMessage = data?.error || data?.message || errorMessage;
      } else if (status === 401) {
        errorMessage = data?.error || errorMessage;
      } else if (data?.message) {
        errorMessage = data.message;
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
    setError(null);
  };

  // =========================
  // SESIÓN EXPIRADA
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
        user,
        error,
        login,
        logout,
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

// import { createContext, useContext, useState, useEffect } from "react";

// const AuthContext = createContext(null);

// export const useAuth = () => {
//   return useContext(AuthContext);
// };

// export const AuthProvider = ({ children }) => {
//   const [token, setToken] = useState(() => {
//     return localStorage.getItem("token");
//   });

//   const [user, setUser] = useState(() => {
//     const storedUser = localStorage.getItem("user");
//     return storedUser ? JSON.parse(storedUser) : null;
//   });

//   const [error, setError] = useState(null);
//   const [sessionExpired, setSessionExpired] = useState(false);

//   // =========================
//   // LOGIN
//   // =========================
//   const login = async (username, password) => {
//     setError(null);

//     if (!username?.trim() || !password?.trim()) {
//       return { success: false, error: "Debes completar todos los campos" };
//     }

//     try {
//       const response = await fetch("http://localhost:3000/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ username, password }),
//       });

//       const session = await response.json();

//       if (!response.ok) {
//         let errorMessage = "Ocurrió un error inesperado.";

//         if (response.status === 400) {
//           errorMessage = session.error || session.message || errorMessage;
//         } else if (response.status === 401) {
//           errorMessage = session.error || errorMessage;
//         } else if (session.message) {
//           errorMessage = session.message;
//         }

//         throw new Error(errorMessage);
//       }

//       // =========================
//       // GUARDAR TOKEN + USER
//       // =========================
//       setToken(session.token);
//       localStorage.setItem("token", session.token);

//       if (session.user) {
//         setUser(session.user);
//         localStorage.setItem("user", JSON.stringify(session.user));
//       }

//       return { success: true };
//     } catch (error) {
//       setError(error.message);
//       return { success: false, error: error.message };
//     }
//   };

//   // =========================
//   // LOGOUT
//   // =========================
//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");

//     setToken(null);
//     setUser(null);
//     setError(null);
//   };

//   // =========================
//   // FETCH AUTH
//   // =========================
//   const fetchAuth = async (url, options = {}) => {
//     if (!token) {
//       throw new Error("Debes iniciar sesión");
//     }

//     const response = await fetch(url, {
//       ...options,
//       headers: {
//         ...options.headers,
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (response.status === 401) {
//       logout();
//       throw new Error("Sesión expirada");
//     }

//     return response;
//   };

//   // =========================
//   // SESIÓN EXPIRADA
//   // =========================
//   useEffect(() => {
//     const handleSessionExpired = () => {
//       setSessionExpired(true);
//     };

//     window.addEventListener("sessionExpired", handleSessionExpired);

//     return () => {
//       window.removeEventListener("sessionExpired", handleSessionExpired);
//     };
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{
//         token,
//         user,
//         error,
//         login,
//         logout,
//         fetchAuth,
//         isAuthenticated: !!token,
//         setError,
//         sessionExpired,
//         setSessionExpired,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // =========================
// // PROTECCIÓN DE RUTAS
// // =========================
// export const AuthPage = ({ children }) => {
//   const { isAuthenticated } = useAuth();

//   if (!isAuthenticated) {
//     return <h2>Ingrese para ver esta página</h2>;
//   }

//   return children;
// };
