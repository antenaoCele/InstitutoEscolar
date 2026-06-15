import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Auth.jsx";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";
import Input from "../form/Input.jsx";
import Label from "../form/Label.jsx";
import Select from "../form/Select.jsx";
import SubmitButton from "../form/SubmitButton.jsx";

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
      <div className="fixed z-50 hidden top-6 right-6 sm:block">
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
          <Label>Nombre de usuario</Label>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <Label>Contraseña</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {(errorLocal || error) && (
          <p className="text-red-500 text-sm">{errorLocal || error}</p>
        )}

        <SubmitButton loading={loading} text="Ingresar" />
      </form>
    </div>
  );
}
