import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import Button from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";

import { userService } from "../../services/user.service";
import { isAdmin } from "../../utils/auth";

export function Users() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [search, setSearch] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("docente");

  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const roleFilter = params.get("role") || "all";

  const buttonClass = "cursor-pointer transition transform hover:scale-105";

  const fetchUsers = async () => {
    try {
      const { data } = await userService.getAll({
        role: roleFilter,
      });

      setUsers(data?.data || []);
    } catch (error) {
      console.error(error);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [location.search]);

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setUsername("");
    setPassword("");
    setRole("docente");
  };

  const handleCreate = async () => {
    try {
      await userService.create({
        first_name: firstName,
        last_name: lastName,
        username,
        password,
        role,
      });

      setOpenCreateModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);

    setFirstName(user.first_name || "");
    setLastName(user.last_name || "");
    setUsername(user.username || "");
    setRole(user.role || "docente");
    setPassword("");

    setOpenEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        username,
        role,
      };

      if (password.trim()) {
        payload.password = password;
      }

      await userService.update(selectedUser.id, payload);

      setOpenEditModal(false);
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await userService.delete(selectedUser.id);

      setOpenDeleteModal(false);
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredUsers = users.filter((u) => {
    const text = search.toLowerCase();

    return (
      u.first_name?.toLowerCase().includes(text) ||
      u.last_name?.toLowerCase().includes(text) ||
      u.username?.toLowerCase().includes(text)
    );
  });

  let columns = [
    {
      header: "ID",
      accessor: "id",
    },
    {
      header: "Apellido",
      accessor: "last_name",
    },
    {
      header: "Nombre",
      accessor: "first_name",
    },
    {
      header: "Usuario",
      accessor: "username",
    },
    {
      header: "Rol",
      accessor: "role",
    },
  ];

  if (isAdmin()) {
    columns.push({
      header: "Acciones",
      render: (row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleEdit(row)}
            className={buttonClass}
          >
            Editar
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(row)}
            className={buttonClass}
          >
            Eliminar
          </Button>
        </div>
      ),
    });
  }

  const tableTitle = (
    <div className="flex justify-between items-center">
      <span>Usuarios</span>

      {isAdmin() && (
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setOpenCreateModal(true);
          }}
          className={buttonClass}
        >
          +
        </Button>
      )}
    </div>
  );

  return (
    <>
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          placeholder="Buscar por nombre, apellido o usuario"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border border-gray-300 rounded w-80"
        />
      </div>

      <BasicTable title={tableTitle} columns={columns} data={filteredUsers} />

      {isAdmin() && (
        <div className="mt-8">
          <Button
            onClick={() => {
              resetForm();
              setOpenCreateModal(true);
            }}
            className={buttonClass}
          >
            Crear Usuario
          </Button>
        </div>
      )}

      <Modal isOpen={openCreateModal} onClose={() => setOpenCreateModal(false)}>
        <h2 className="text-xl font-bold mb-6">Crear Usuario</h2>

        <div className="flex flex-col gap-4">
          <input
            placeholder="Nombre"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="p-2 border rounded"
          />

          <input
            placeholder="Apellido"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="p-2 border rounded"
          />

          <input
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-2 border rounded"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 border rounded"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="docente">Docente</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="outline" onClick={() => setOpenCreateModal(false)}>
            Cancelar
          </Button>

          <Button onClick={handleCreate}>Crear</Button>
        </div>
      </Modal>

      <Modal isOpen={openEditModal} onClose={() => setOpenEditModal(false)}>
        <h2 className="text-xl font-bold mb-6">Editar Usuario</h2>

        <div className="flex flex-col gap-4">
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="p-2 border rounded"
          />

          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="p-2 border rounded"
          />

          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-2 border rounded"
          />

          <input
            type="password"
            placeholder="Nueva contraseña (opcional)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 border rounded"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="docente">Docente</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="outline" onClick={() => setOpenEditModal(false)}>
            Cancelar
          </Button>

          <Button onClick={handleUpdate}>Guardar</Button>
        </div>
      </Modal>

      <Modal isOpen={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <h2 className="text-lg font-semibold mb-4">¿Eliminar usuario?</h2>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpenDeleteModal(false)}>
            Cancelar
          </Button>

          <Button onClick={confirmDelete}>Eliminar</Button>
        </div>
      </Modal>
    </>
  );
}
