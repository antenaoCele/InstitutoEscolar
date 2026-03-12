import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/Auth.jsx";
import { useParams } from "react-router";

export const DetailsUser = () => {
  const { fetchAuth } = useAuth();
  const { id } = useParams();
  const [user, setUser] = useState(null);

  const fetchUser = useCallback(async () => {
    const response = await fetchAuth(`http://localhost:3000/users/${id}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      console.log("Error al consultar por el usuario:", data.error);
      return;
    }
    setUser(data.data);
  }, [fetchAuth, id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (!user) {
    return null;
  }

  return (
    <article>
      <h2>Detalles del usuario</h2>
      <p>
        Nombre: <b>{user.first_name}</b>
      </p>
      <p>
        Apellido: <b>{user.last_name}</b>
      </p>
      <p>
        Nombre de usuario: <b>{user.username}</b>
      </p>
      <p>
        Rol: <b>{user.role}</b>
      </p>
    </article>
  );
};
