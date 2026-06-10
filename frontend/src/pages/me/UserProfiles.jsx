import { useEffect, useState } from "react";
import { useAuth } from "../../context/Auth.jsx";
import Button from "../../components/ui/Button";
import { UserIcon } from "../../icons";

export default function UserProfiles() {
  const { fetchAuth } = useAuth();
  const [formData, setFormData] = useState({
    id: "",
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const loggedUser = JSON.parse(localStorage.getItem("user"));
        const userId = loggedUser?.id;

        const res = await fetchAuth(`http://localhost:3000/users/${userId}`);
        const data = await res.json();

        if (data.success) {
          setFormData({
            ...data.data,
            email: data.data.email || "",
          });
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
  }, [fetchAuth]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    try {
      const res = await fetchAuth(
        `http://localhost:3000/users/${formData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );
      const data = await res.json();
      if (data.success) {
        setStatus({
          type: "success",
          message: "Perfil actualizado con éxito.",
        });
      } else {
        setStatus({
          type: "error",
          message: data.message || "Error al actualizar el perfil.",
        });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Error de conexión con el servidor.",
      });
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
              Mi Perfil
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gestiona tu información personal y configuración de cuenta.
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["first_name", "last_name", "username", "email", "role"].map(
              (field) => (
                <div key={field}>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {field.replace("_", " ")}
                  </label>
                  <input
                    type="text"
                    name={field}
                    value={formData[field] || ""}
                    onChange={handleChange}
                    disabled={field === "role"}
                    className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2 text-sm outline-none transition focus:border-primary-500 dark:border-gray-700 dark:text-white dark:focus:border-primary-500 disabled:bg-gray-50 dark:disabled:bg-gray-800/50"
                    required={field !== "role"}
                  />
                </div>
              ),
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
            <Button
              type="button"
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              onClick={() => window.history.back()}
            >
              Volver
            </Button>
            <Button type="submit" className="px-8">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
