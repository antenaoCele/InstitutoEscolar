import { useEffect, useState } from "react";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/users", {
      headers: {
        "Content-Type": "application/json",
    
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.data); 
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
      <PageMeta title="Usuarios" description="Lista de usuarios" />
      <PageBreadcrumb pageTitle="Usuarios" />

      <div className="p-6 bg-white rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Usuarios</h2>

        {users.length === 0 ? (
          <p className="text-gray-500">No hay usuarios</p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">ID</th>
                <th className="p-2">Nombre</th>
                <th className="p-2">Apellido</th>
                <th className="p-2">Username</th>
                <th className="p-2">Rol</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="text-center border-t">
                  <td className="p-2">{user.id}</td>
                  <td className="p-2">{user.first_name}</td>
                  <td className="p-2">{user.last_name}</td>
                  <td className="p-2">{user.username}</td>
                  <td className="p-2">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}