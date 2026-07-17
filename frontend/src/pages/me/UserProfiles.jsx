import { useEffect, useState } from "react";
import { profileService } from "../../services/profile.service";
import { UserIcon } from "../../icons";
import {
  validateUserForm,
  validateChangePasswordForm,
} from "../../validators/entities/user.validator";
import { mapErrors, hasErrors } from "../../validators/helpers/errorHelpers";
import Button from "../../components/ui/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/Input";
import { YesButton, NoButton } from "../../components/ui/ActionButtons";

export default function UserProfiles() {
  const [formData, setFormData] = useState({
    id: "",
    first_name: "",
    last_name: "",
    username: "",
    role: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: "", message: "" });

  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordStatus, setPasswordStatus] = useState({
    type: "",
    message: "",
  });

  // Mismo estilo de input que se usa en Plans
  const inputClass = (error) =>
    `w-full p-2 border rounded mb-1 
    border-gray-300
    focus:outline-none focus:ring-1 focus:ring-[#0cc0df] focus:border-[#0cc0df]
    ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}`;

  const fieldLabels = {
    first_name: "Nombre",
    last_name: "Apellido",
    username: "Usuario",
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await profileService.getMe();
        if (res.data.success) {
          setFormData(res.data.user);
        }
      } catch (error) {
        setStatus({
          type: "error",
          message: "Error al cargar los datos del perfil.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setErrors({});

    const validationErrors = validateUserForm(formData);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    try {
      const res = await profileService.updateMe({
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
      });

      if (res.data.success) {
        setFormData((prev) => ({ ...prev, ...res.data.user }));
        setStatus({
          type: "success",
          message: "Perfil actualizado con éxito.",
        });
      }
    } catch (error) {
      const backendErrors = error?.response?.data?.errors;
      if (backendErrors) {
        setErrors(mapErrors(backendErrors));
      } else {
        setStatus({
          type: "error",
          message:
            error?.response?.data?.message ||
            "Error de conexión con el servidor.",
        });
      }
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordStatus({ type: "", message: "" });
    setPasswordErrors({});

    const validationErrors = validateChangePasswordForm(passwordData);
    if (hasErrors(validationErrors)) {
      setPasswordErrors(validationErrors);
      return;
    }

    try {
      const res = await profileService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (res.data.success) {
        setPasswordStatus({
          type: "success",
          message: "Contraseña actualizada con éxito.",
        });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordFields(false);
      }
    } catch (error) {
      const backendErrors = error?.response?.data?.errors;
      if (backendErrors) {
        setPasswordErrors(mapErrors(backendErrors));
      } else {
        setPasswordStatus({
          type: "error",
          message:
            error?.response?.data?.message ||
            "No se pudo actualizar la contraseña.",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Cargando perfil...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-black">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <UserIcon className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Mi Perfil: {formData.username}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Rol: {formData.role}
            </p>
          </div>
        </div>

        {status.message && (
          <div
            className={`mb-6 rounded-lg p-4 text-sm ${
              status.type === "success"
                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
            }`}
          >
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["first_name", "last_name", "username"].map((field) => (
              <div key={field} className="flex flex-col">
                <Label className="font-semibold mb-2">
                  {fieldLabels[field]}
                </Label>
                <Input
                  type="text"
                  name={field}
                  value={formData[field] || ""}
                  onChange={handleChange}
                  className={inputClass(errors[field])}
                />
                {errors[field] && (
                  <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
                )}
              </div>
            ))}

            <div className="flex flex-col">
              <Label className="font-semibold mb-2">Contraseña</Label>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer transition transform hover:scale-105 w-full"
                onClick={() => {
                  setShowPasswordFields((prev) => !prev);
                  setPasswordStatus({ type: "", message: "" });
                  setPasswordErrors({});
                }}
              >
                {showPasswordFields ? "Cancelar" : "Cambiar contraseña"}
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <YesButton title="Guardar" onClick={handleSubmit} />
          </div>
        </form>

        <div className="mt-6">
          {showPasswordFields && (
            <form
              onSubmit={handlePasswordSubmit}
              className="mt-4 space-y-4"
              noValidate
            >
              {passwordStatus.message && (
                <div
                  className={`rounded-lg p-4 text-sm ${
                    passwordStatus.type === "success"
                      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                  }`}
                >
                  {passwordStatus.message}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: "currentPassword", label: "Contraseña actual" },
                  { name: "newPassword", label: "Nueva contraseña" },
                  {
                    name: "confirmPassword",
                    label: "Confirmar nueva contraseña",
                  },
                ].map(({ name, label }) => (
                  <div key={name} className="flex flex-col">
                    <Label className="font-semibold mb-2">{label}</Label>
                    <Input
                      type="password"
                      name={name}
                      value={passwordData[name]}
                      onChange={handlePasswordChange}
                      className={inputClass(passwordErrors[name])}
                    />
                    {passwordErrors[name] && (
                      <p className="text-red-500 text-sm mt-1">
                        {passwordErrors[name]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <NoButton
                  title="Cancelar"
                  onClick={() => setShowPasswordFields(false)}
                />
                <YesButton
                  title="Guardar contraseña"
                  onClick={handlePasswordSubmit}
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
