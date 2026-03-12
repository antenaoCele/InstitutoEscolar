import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/Auth.jsx";
import { useNavigate, useParams } from "react-router";

export const UpdateUser = () => {
  const { fetchAuth } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [errores, setErrores] = useState(null);
  const [values, setValues] = useState(null);

  const fetchUsuario = useCallback(async () => {
    const response = await fetchAuth(`http://localhost:3000/users/${id}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      3;
      console.log("Error al consultar por el usuario:", data.error);
      return;
    }
    setValues(data.data);
  }, [fetchAuth, id]);

  useEffect(() => {
    fetchUsuario();
  }, [fetchUsuario]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrores(null);

    const response = await fetchAuth(`http://localhost:3000/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok) {
      let errorMessage = "Error al modificar el usuario.";
      if (data.errores && data.errores.length > 0) {
        errorMessage = data.errores.map((err) => err.msg).join(", ");
        setErrores(data.errores);
      } else if (data.error) {
        setErrores([{ msg: data.error }]);
      }
      return;
    }

    navigate("/usuarios");
  };

  if (!values) {
    return null;
  }

  return (
    <article>
      <h2>Modificar usuario</h2>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <label>
            Nombre
            <input
              required
              value={values.nombre}
              onChange={(e) => setValues({ ...values, nombre: e.target.value })}
              aria-invalid={errores && errores.some((e) => e.path === "nombre")}
            />
          </label>
          <label>
            Email
            <input
              required
              value={values.email}
              onChange={(e) => setValues({ ...values, email: e.target.value })}
              aria-invalid={errores && errores.some((e) => e.path === "email")}
            />
          </label>
          <label>
            Nueva Contraseña
            <input
              type="password"
              onChange={(e) =>
                setValues({ ...values, password: e.target.value })
              }
              aria-invalid={
                errores && errores.some((e) => e.path === "password")
              }
            />
          </label>
        </fieldset>
        {errores && (
          <article style={{ color: "red" }}>
            <h4>Errores de validación:</h4>
            <ul>
              {errores.map((error, index) => (
                <li key={index}>
                  {error.path && <strong>{error.path}: </strong>}
                  {error.msg}
                </li>
              ))}
            </ul>
          </article>
        )}
        <input type="submit" value="Modificar usuario" />
      </form>
    </article>
  );
};
