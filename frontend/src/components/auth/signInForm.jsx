import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Auth.jsx";

export default function SignInForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorLocal, setErrorLocal] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, error } = useAuth(); // usamos error del contexto

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLocal("");

    if (!username || !password) {
      setErrorLocal("Completá todos los campos");
      return;
    }

    setLoading(true);

    const result = await login(username, password); //  usamos el contexto

    if (result.success) {
      navigate("/me"); //  redirección
    } else {
      setErrorLocal(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col justify-center w-full lg:w-1/2 p-6">
      <h1 className="mb-2 text-2xl font-semibold">
        MATECITOS GRUPO DE ESTUDIO
      </h1>
      <h2 className="mb-6 text-xl text-gray-600">Ingresar</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* USERNAME */}
        <div>
          <label className="block mb-1 text-sm font-medium">
            Nombre de usuario
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#0cc0df]"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* PASSWORD */}
        <div>
          <label className="block mb-1 text-sm font-medium">Contraseña</label>
          <input
            type="password"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#0cc0df]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* ERROR */}
        {(errorLocal || error) && (
          <p className="text-red-500 text-sm">{errorLocal || error}</p>
        )}

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full p-2 text-white bg-[#0cc0df] hover:bg-[#0aa3bf] transition rounded shadow-md disabled:opacity-50"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
