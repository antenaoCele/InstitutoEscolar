import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Auth.jsx";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function SignInForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorLocal, setErrorLocal] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLocal("");

    if (!username || !password) {
      setErrorLocal("Completá todos los campos");
      return;
    }

    try {
      setLoading(true);

      const result = await login(username, password);

      if (result?.success) {
        navigate("/me");
      } else {
        setErrorLocal(result?.error || "Error al iniciar sesión");
      }
    } catch (err) {
      console.error(err);
      setErrorLocal("Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center w-full lg:w-1/2 p-6 bg-white dark:bg-black transition-colors">
      <div className="fixed z-50 hidden top-6 left-6 sm:block">
        <ThemeTogglerTwo />
      </div>

      <h1 className="mb-2 text-2xl font-semibold text-black dark:text-white">
        MATECITOS GRUPO DE ESTUDIO
      </h1>

      <h2 className="mb-6 text-xl text-gray-600 dark:text-gray-300">
        Ingresar
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-black dark:text-white">
            Nombre de usuario
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded bg-white text-black border-gray-300 
            dark:bg-gray-800 dark:text-white dark:border-gray-600
            focus:outline-none focus:ring-1 focus:ring-[#0cc0df] focus:border-[#0cc0df]"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-black dark:text-white">
            Contraseña
          </label>
          <input
            type="password"
            className="w-full p-2 border rounded bg-white text-black border-gray-300 
            dark:bg-gray-800 dark:text-white dark:border-gray-600
            focus:outline-none focus:ring-1 focus:ring-[#0cc0df] focus:border-[#0cc0df]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {(errorLocal || error) && (
          <p className="text-red-500 text-sm">{errorLocal || error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full p-2 text-white rounded bg-[#0cc0df] hover:bg-[#0aa3bf] disabled:opacity-50"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
