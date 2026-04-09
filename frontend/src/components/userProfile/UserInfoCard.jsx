import { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal.js";
import { Modal } from "../ui/modal.jsx";
import Button from "../ui/Button.jsx";
import Input from "../form/input/InputField";
import Label from "../form/Label";

export default function UserInfoCard({ userId }) {
  const { isOpen, openModal, closeModal } = useModal();

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:3000/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setUser(data.data);
          setForm(data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, [userId, token]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: null,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (form.username) {
      if (!/^[a-z0-9]+$/i.test(form.username)) {
        newErrors.username = "Solo caracteres alfanuméricos";
      }
      if (form.username.length < 3) {
        newErrors.username = "Mínimo 3 caracteres";
      }
      if (form.username.length > 45) {
        newErrors.username = "Máximo 45 caracteres";
      }
    }

    if (form.password && form.password.length < 6) {
      newErrors.password = "Mínimo 6 caracteres";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = { ...form };

      if (!payload.password) {
        delete payload.password;
      }

      const res = await fetch(
        `http://localhost:3000/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (data.success) {
        setUser(data.data);
        closeModal();
        setErrors({});
      } else {
        if (data.errors) {
          const backendErrors = {};
          data.errors.forEach((err) => {
            backendErrors[err.path] = err.msg;
          });
          setErrors(backendErrors);
        } else {
          console.error(data.message);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p>Cargando...</p>;

  return (
    <div className="p-5 border rounded-2xl">
      <h4 className="text-lg font-semibold mb-4">
        Información Personal
      </h4>

      <div className="grid grid-cols-2 gap-4">
        <Info label="Nombre" value={user.first_name} />
        <Info label="Apellido" value={user.last_name} />
        <Info label="Usuario" value={user.username} />
        <Info label="Rol" value={user.role} />
      </div>

      <button onClick={openModal} className="mt-4">
        Editar
      </button>

      <Modal isOpen={isOpen} onClose={closeModal}>
        <div className="p-6">
          <h4 className="text-xl mb-4">Editar usuario</h4>

          <div className="grid gap-4">

            <Field
              label="Nombre"
              name="first_name"
              value={form.first_name || ""}
              onChange={handleChange}
              error={errors.first_name}
            />

            <Field
              label="Apellido"
              name="last_name"
              value={form.last_name || ""}
              onChange={handleChange}
              error={errors.last_name}
            />

            <Field
              label="Username"
              name="username"
              value={form.username || ""}
              onChange={handleChange}
              error={errors.username}
            />

            <Field
              label="Nueva contraseña"
              name="password"
              value={form.password || ""}
              onChange={handleChange}
              error={errors.password}
            />

            <div>
              <Label>Rol</Label>
              <Input
                name="role"
                value={form.role || ""}
                disabled={user.role === "docente"}
              />
            </div>

          </div>

          <div className="flex gap-2 mt-6">
            <Button onClick={closeModal} variant="outline">
              Cancelar
            </Button>

            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function Field({ label, name, value, onChange, error }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        name={name}
        value={value}
        onChange={onChange}
        error={!!error}
        hint={error}
      />
    </div>
  );
}