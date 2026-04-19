import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignInForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        console.log("Inicio de sesión exitoso");

        localStorage.setItem("token", data.token);

        // 🔥 redirige y fuerza render
        window.location.href = "/profile";
      } else {
        setError(data.error || "Error en login");
      }
    } catch (err) {
      console.error(err);
      setError("Error del servidor");
    }
  };

  return (
    <div className="flex flex-col justify-center w-full lg:w-1/2 p-6">
      <h2 className="mb-4 text-2xl font-semibold">Ingresar</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">Nombre de usuario</label>
          <input
            className="w-full p-2 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Contraseña</label>
          <input
            type="password"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <button
          type="submit"
          className="w-full p-2 text-white bg-blue-500 rounded"
        >
          Ingresar
        </button>
      </form>
    </div>
  );
}