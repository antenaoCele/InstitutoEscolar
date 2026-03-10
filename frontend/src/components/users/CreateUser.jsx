import { useState } from "react";
import { useAuth } from "../../context/Auth.jsx";
import { useNavigate } from "react-router-dom";

export const CreateUser = () => {
  const { fetchAuth } = useAuth();
  const navigate = useNavigate();

  const [errors, setErrors] = useState(null);

  const [values, setValues] = useState({
    first_name: "",
    last_name: "",
    username: "",
    role: "",
    password: "",
  });

  const handleChange = (e) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors(null);

    try {
      const response = await fetchAuth("http://localhost:3000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      console.log("RESPUESTA BACKEND:", data);

      if (!response.ok || !data.success) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          window.alert(data.message || "Error al crear usuario");
        }
        return;
      }

      navigate("/users");
    } catch (error) {
      console.log(error);
      window.alert("Error de conexión con el servidor");
    }
  };

  const getError = (field) =>
    errors
      ?.filter((e) => e.path === field)
      .map((e) => e.msg)
      .join(", ");

  return (
    <article>
      <h2>Crear usuario</h2>

      <form onSubmit={handleSubmit}>
        <fieldset>
          <label>
            Nombre
            <input
              name="first_name"
              value={values.first_name}
              onChange={handleChange}
              required
              aria-invalid={errors?.some((e) => e.path === "first_name")}
            />
            {getError("first_name") && <small>{getError("first_name")}</small>}
          </label>
          <br />
          <br />
          <label>
            Apellido
            <input
              name="last_name"
              value={values.last_name}
              onChange={handleChange}
              required
              aria-invalid={errors?.some((e) => e.path === "last_name")}
            />
            {getError("last_name") && <small>{getError("last_name")}</small>}
          </label>
          <br />
          <br />
          <label>
            Nombre de usuario
            <input
              name="username"
              value={values.username}
              onChange={handleChange}
              required
              aria-invalid={errors?.some((e) => e.path === "username")}
            />
            {getError("username") && <small>{getError("username")}</small>}
          </label>
          <br />
          <br />
          <label>
            Rol
            <select
              name="role"
              value={values.role}
              onChange={handleChange}
              required
              aria-invalid={errors?.some((e) => e.path === "role")}
            >
              <option value="">Seleccione un rol</option>
              <option value="ADMIN">ADMIN</option>
              <option value="TEACHER">TEACHER</option>
            </select>
            {getError("role") && <small>{getError("role")}</small>}
          </label>
          <br />
          <br />
          <label>
            Contraseña
            <input
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              required
              aria-invalid={errors?.some((e) => e.path === "password")}
            />
            {getError("password") && <small>{getError("password")}</small>}
          </label>
          <br />
          <br />
        </fieldset>

        <button type="submit">Crear usuario</button>
      </form>
    </article>
  );
};
