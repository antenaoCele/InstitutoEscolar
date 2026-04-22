import { useEffect, useState } from "react";

export default function UserProfiles() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        console.log("TOKEN:", token);

        const res = await fetch("http://localhost:3000/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("STATUS:", res.status);

        const data = await res.json();
        console.log("DATA:", data);

        if (data.success) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <p>Cargando...</p>;

  if (!user) return <p>No se pudo cargar el usuario</p>;

  return (
    <div>
      <h1>Perfil</h1>
      <p><strong>Nombre:</strong> {user.first_name}</p>
      <p><strong>Apellido:</strong> {user.last_name}</p>
      <p><strong>Nombre de usuario:</strong> {user.username}</p>
      <p><strong>Rol:</strong> {user.role}</p>
    </div>
  );
}