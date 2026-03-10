import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/Auth.jsx";
import { useParams } from "react-router";

export const DetailsUser = () => {
  const { fetchAuth } = useAuth();
  const { id } = useParams();
  const [usuario, setUsuario] = useState(null);

  const fetchUsuario = useCallback(async () => {
    const response = await fetchAuth(`http://localhost:4000/usuarios/${id}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      console.log("Error al consultar por el usuario:", data.error);
      return;
    }
    setUsuario(data.data);
  }, [fetchAuth, id]);

  useEffect(() => {
    fetchUsuario();
  }, [fetchUsuario]);

  if (!usuario) {
    return null;
  }

  return (
    <article>
      <h2>Detalles del usuario</h2>
      <p>
        Nombre: <b>{usuario.nombre}</b>
      </p>
      <p>
        Email: <b>{usuario.email}</b>
      </p>
    </article>
  );
};
