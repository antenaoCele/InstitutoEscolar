import useForm from "../hooks/useForm";
import Input from "../components/form/Input";
import Select from "../components/form/Select";
import SubmitButton from "../components/form/SubmitButton";
import { isAdmin } from "../utils/auth";

import { userService } from "../services/user.service";

export default function UserForm({
  initialData = {},
  isEdit = false,
  onSuccess,
}) {

  const validate = (data) => {
    const errors = {};

    if (!data.first_name) {
      errors.first_name = "Nombre requerido";
    }

    if (!data.last_name) {
      errors.last_name = "Apellido requerido";
    }

    if (!data.username) {
      errors.username = "Username requerido";
    }

    // ⚠️ SOLO obligatorio en create
    if (!isEdit && !data.password) {
      errors.password = "Contraseña requerida";
    }

    if (isAdmin() && !data.role) {
      errors.role = "Rol requerido";
    }

    return errors;
  };

  const {
    formData,
    errors,
    handleChange,
    handleSubmit,
    loading,
    error,
    success,
  } = useForm(
    {
      first_name: initialData.first_name || "",
      last_name: initialData.last_name || "",
      username: initialData.username || "",
      password: "", // nunca precargar
      role: initialData.role || "DOCENTE",
    },
    validate
  );

  const submitFn = async (data) => {
    const payload = { ...data };

    // ⚠️ no mandar password vacío en edición
    if (isEdit && !payload.password) {
      delete payload.password;
    }

    // ⚠️ no admin no puede tocar rol
    if (!isAdmin()) {
      delete payload.role;
    }

    let res;

    if (isEdit) {
      res = await userService.update(initialData.id, payload);
    } else {
      res = await userService.create(payload);
    }

    if (res.success && onSuccess) {
      onSuccess();
    }

    return res;
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, submitFn)}>

      <Input
        label="Nombre"
        name="first_name"
        value={formData.first_name}
        onChange={handleChange}
        error={errors.first_name}
        hint={errors.first_name}
      />

      <Input
        label="Apellido"
        name="last_name"
        value={formData.last_name}
        onChange={handleChange}
        error={errors.last_name}
        hint={errors.last_name}
      />

      <Input
        label="Username"
        name="username"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
        hint={errors.username}
      />

      <Input
        label="Contraseña"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        hint={
          errors.password ||
          (isEdit ? "Dejar vacío para no cambiar" : "")
        }
      />

      {isAdmin() && (
        <Select
          label="Rol"
          name="role"
          value={formData.role}
          onChange={handleChange}
          options={[
            { value: "ADMIN", label: "Administrador" },
            { value: "DOCENTE", label: "Docente" },
          ]}
          error={errors.role}
          hint={errors.role}
        />
      )}

      <SubmitButton
        loading={loading}
        text={isEdit ? "Actualizar Usuario" : "Crear Usuario"}
      />

      {error && <p className="text-red-500">{error}</p>}

      {success && (
        <p className="text-green-500">
          {isEdit ? "Actualizado correctamente" : "Creado correctamente"}
        </p>
      )}
    </form>
  );
}