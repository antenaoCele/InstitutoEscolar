import { useEffect, useState } from "react";
import { profileService } from "../../services/profile.service";
import Button from "../../components/ui/Button";
import { UserIcon } from "../../icons";
import { YesButton } from "../../components/ui/ActionButtons";
import {
  validateUserForm,
  validateChangePasswordForm,
} from "../../validators/entities/user.validator";
import { mapErrors, hasErrors } from "../../validators/helpers/errorHelpers";

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
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
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
              <div key={field}>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {field.replace("_", " ")}
                </label>
                <input
                  type="text"
                  name={field}
                  value={formData[field] || ""}
                  onChange={handleChange}
                  className={`w-full rounded-lg border bg-transparent px-4 py-2 text-sm outline-none transition dark:text-white ${
                    errors[field]
                      ? "border-red-400 focus:border-red-500"
                      : "border-gray-200 focus:border-primary-500 dark:border-gray-700 dark:focus:border-primary-500"
                  }`}
                />
                {errors[field] && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors[field]}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
              <button
                type="button"
                onClick={handleSubmit}
                className="cursor-pointer transition transform hover:scale-105 flex items-center justify-center w-12 h-12 rounded-full bg-green-500 text-white hover:bg-green-600"
                title="Guardar"
              >
                ✓
              </button>
            </div>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-semibold text-gray-800 dark:text-white">
              Contraseña
            </h3>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="cursor-pointer transition transform hover:scale-105"
              onClick={() => {
                setShowPasswordFields((prev) => !prev);
                setPasswordStatus({ type: "", message: "" });
                setPasswordErrors({});
              }}
            >
              {showPasswordFields ? "Cancelar" : "Cambiar contraseña"}
            </Button>
          </div>

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
                  <div key={name}>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {label}
                    </label>
                    <input
                      type="password"
                      name={name}
                      value={passwordData[name]}
                      onChange={handlePasswordChange}
                      className={`w-full rounded-lg border bg-transparent px-4 py-2 text-sm outline-none transition dark:text-white ${
                        passwordErrors[name]
                          ? "border-red-400 focus:border-red-500"
                          : "border-gray-200 focus:border-primary-500 dark:border-gray-700 dark:focus:border-primary-500"
                      }`}
                    />
                    {passwordErrors[name] && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {passwordErrors[name]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handlePasswordSubmit}
                    className="cursor-pointer transition transform hover:scale-105 flex items-center justify-center w-12 h-12 rounded-full bg-green-500 text-white hover:bg-green-600"
                    title="Guardar contraseña"
                  >
                    ✓
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
