import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/Auth";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // estados
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // contexto
  const { login, error, setError } = useAuth();

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("El nombre de usuario y la contraseña son obligatorios.");
      return;
    }

    const result = await login(username.trim(), password);

    if (result.success) {
      console.log("Login exitoso");
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeftIcon className="size-5" />
          Volver
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800">Ingresar</h1>
            <p className="text-sm text-gray-500">
              Ingresa tu nombre de usuario y contraseña
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* USERNAME */}
              <div>
                <Label>
                  Nombre de usuario <span className="text-error-500">*</span>
                </Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              {/* PASSWORD */}
              <div>
                <Label>
                  Contraseña <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    {showPassword ? <EyeIcon /> : <EyeCloseIcon />}
                  </span>
                </div>
              </div>

              {/* CHECKBOX */}
              <div className="flex items-center gap-3">
                <Checkbox checked={isChecked} onChange={setIsChecked} />
                <span className="text-sm text-gray-700">
                  Mantener mi sesión iniciada
                </span>
              </div>

              {/* BOTÓN */}
              <div>
                <Button type="submit" className="w-full">
                  Ingresar
                </Button>
              </div>

              {/* ERROR */}
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
