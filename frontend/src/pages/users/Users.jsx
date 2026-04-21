import { useEffect, useState } from "react";
import { useAuth } from "../../context/Auth.jsx";
import { Link } from "react-router-dom";

export function Users() {
  const { fetchAuth } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetchAuth("http://localhost:3000/users");
      const data = await response.json();
      if (!response.ok) {
        console.log("Error:", data.error);
        return;
      }

      setUsers(data.data || []);
    };

    fetchUsers();
  }, [fetchAuth]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este usuario?"))
      return;

    const response = await fetchAuth(`http://localhost:3000/users/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.log("Error al eliminar:", data.message || data.error);
      return;
    }

    setUsers(data.filter((u) => u.id !== id));
  };

  return (
    <article>
      <h2>Usuarios</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre y apellido</th>
            <th>Nombre de usuario</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>
                {u.first_name} {u.last_name}
              </td>
              <td>{u.username}</td>
              <td>{u.role}</td>
              <td>
                <Link
                  to={`/users/${u.id}/update`}
                  role="button"
                  className="secondary"
                >
                  Editar
                </Link>
              </td>
              <td>
                <Link to={`/users/${u.id}`} role="button" className="secondary">
                  Ver
                </Link>
              </td>
              <button
                onClick={() => handleEliminar(u.id)}
                className="secondary"
              >
                Eliminar
              </button>
            </tr>
          ))}
        </tbody>
      </table>
      <Link to="/users/create" role="button">
        Crear nuevo usuario
      </Link>
    </article>
  );
}
