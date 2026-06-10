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
  const [role, setRole] = useState("DOCENTE");

  const [errors, setErrors] = useState({});

  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const roleFilter = params.get("role") || "all";

  const showActions = isAdmin() && roleFilter === "all";

  const buttonClass = "cursor-pointer transition transform hover:scale-105";

  const inputClass = (error) =>
    `w-full p-2 border rounded mb-1 
    border-gray-300
    focus:outline-none focus:ring-1 focus:ring-[#0cc0df] focus:border-[#0cc0df]
    ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}`;

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
    setRole("DOCENTE");
    setSelectedUser(null);
    setErrors({});
  };

  const mapErrors = (errors) => {
    const formatted = {};
    errors.forEach((e) => {
      formatted[e.path] = e.msg;
    });
    return formatted;
  };

  const handleCreate = async () => {
    setErrors({});
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
      const backendErrors = error.response?.data?.errors;
      if (backendErrors) {
        setErrors(mapErrors(backendErrors));
      }
    }
  };

  const handleEdit = (user) => {
    setErrors({});
    setSelectedUser(user);

    setFirstName(user.first_name || "");
    setLastName(user.last_name || "");
    setUsername(user.username || "");
    setRole(user.role || "DOCENTE");
    setPassword("");

    setOpenEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;
    setErrors({});

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
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error(error);
      const backendErrors = error.response?.data?.errors;
      if (backendErrors) {
        setErrors(mapErrors(backendErrors));
      }
    }
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await userService.delete(selectedUser.id);

      setOpenDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
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

  if (showActions) {
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

      {showActions && (
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

      {showActions && (
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
        <h2 className="text-xl font-bold mb-8">Crear Usuario</h2>

        <div className="flex flex-col mb-6">
          <label className="font-semibold mb-2">Nombre</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass(errors.first_name)}
          />
          {errors.first_name && (
            <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <label className="font-semibold mb-2">Apellido</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass(errors.last_name)}
          />
          {errors.last_name && (
            <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <label className="font-semibold mb-2">Usuario</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClass(errors.username)}
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <label className="font-semibold mb-2">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass(errors.password)}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <label className="font-semibold mb-2">Rol</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={inputClass(errors.role)}
          >
            <option value="DOCENTE">Docente</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>

        <div className="flex justify-end gap-4 mt-10">
          <Button
            variant="outline"
            onClick={() => setOpenCreateModal(false)}
            className={buttonClass}
          >
            Cancelar
          </Button>

          <Button onClick={handleCreate} className={buttonClass}>
            Crear
          </Button>
        </div>
      </Modal>

      <Modal isOpen={openEditModal} onClose={() => setOpenEditModal(false)}>
        <h2 className="text-xl font-bold mb-8">Editar Usuario</h2>

        <div className="flex flex-col mb-6">
          <label className="font-semibold mb-2">Nombre</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass(errors.first_name)}
          />
          {errors.first_name && (
            <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <label className="font-semibold mb-2">Apellido</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass(errors.last_name)}
          />
          {errors.last_name && (
            <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <label className="font-semibold mb-2">Usuario</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClass(errors.username)}
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <label className="font-semibold mb-2">
            Nueva contraseña (opcional)
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass(errors.password)}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <label className="font-semibold mb-2">Rol</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={inputClass(errors.role)}
          >
            <option value="DOCENTE">Docente</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>

        <div className="flex justify-end gap-4 mt-10">
          <Button
            variant="outline"
            onClick={() => setOpenEditModal(false)}
            className={buttonClass}
          >
            Cancelar
          </Button>

          <Button onClick={handleUpdate} className={buttonClass}>
            Guardar
          </Button>
        </div>
      </Modal>

      <Modal isOpen={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <h2 className="text-lg font-semibold mb-4">¿Eliminar usuario?</h2>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpenDeleteModal(false)}
            className={buttonClass}
          >
            Cancelar
          </Button>

          <Button onClick={confirmDelete} className={buttonClass}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </>
  );
}
