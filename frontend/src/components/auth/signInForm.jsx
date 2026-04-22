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

    setLoading(true);
    const result = await login(username, password);

    if (result.success) {
      navigate("/me");
    } else {
      setErrorLocal(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col justify-center w-full lg:w-1/2 p-6 bg-white dark:bg-black transition-colors">
      <div className="fixed z-50 hidden top-6 left-6 sm:block">
        <ThemeTogglerTwo />
      </div>
      {/* TITULOS */}
      <h1 className="mb-2 text-2xl font-semibold text-black dark:text-white">
        MATECITOS GRUPO DE ESTUDIO
      </h1>

      <h2 className="mb-6 text-xl text-gray-600 dark:text-gray-300">
        Ingresar
      </h2>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* USERNAME */}
        <div>
          <label className="block mb-1 text-sm font-medium text-black dark:text-white">
            Nombre de usuario
          </label>
          <input
            type="text"
            className="
              w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#0cc0df]
              bg-white text-black border-gray-300
              dark:bg-gray-800 dark:text-white dark:border-gray-600
            "
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* PASSWORD */}
        <div>
          <label className="block mb-1 text-sm font-medium text-black dark:text-white">
            Contraseña
          </label>
          <input
            type="password"
            className="
              w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#0cc0df]
              bg-white text-black border-gray-300
              dark:bg-gray-800 dark:text-white dark:border-gray-600
            "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* ERROR */}
        {(errorLocal || error) && (
          <p className="text-red-500 text-sm dark:text-red-400">
            {errorLocal || error}
          </p>
        )}

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="
            w-full p-2 text-white rounded shadow-md transition disabled:opacity-50
            bg-[#0cc0df] hover:bg-[#0aa3bf]
            dark:bg-[#0aa3bf] dark:hover:bg-[#08879e]
          "
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
