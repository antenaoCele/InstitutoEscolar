import { useEffect, useState } from "react";
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import Button from "../../components/ui/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/Input";
import Select from "../../components/form/Select";
import { Modal } from "../../components/ui/Modal";
import { userService } from "../../services/user.service";
import { isAdmin, getCurrentUserId } from "../../utils/auth";
import { validateUsersForm } from "../../validators/entities/users.validator";
import {
  ViewButton,
  EditButton,
  DeleteButton,
  PlusButton,
  YesButton,
  NoButton,
} from "../../components/ui/ActionButtons";
import { sortByProperty, sortByPersonName } from "../../utils/sort";
import { mapErrors } from "../../validators/helpers/errorHelpers";
import { useFeedbackModal } from "../../hooks/useFeedbackModal";

export function Users() {
  // ======================================================
  // DATOS
  // ======================================================
  const [users, setUsers] = useState([]);

  // ======================================================
  // FILTROS
  // ======================================================
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  // ======================================================
  // MODALES
  // ======================================================
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const { feedbackModal, showFeedback, closeFeedback } = useFeedbackModal();

  // ======================================================
  // USUARIO SELECCIONADO
  // ======================================================
  const [selectedUser, setSelectedUser] = useState(null);

  // ======================================================
  // FORMULARIO DEL USUARIO
  // ======================================================
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  // ======================================================
  // ERRORES
  // ======================================================
  const [errorsCreate, setErrorsCreate] = useState({});
  const [errorsEdit, setErrorsEdit] = useState({});

  // ======================================================
  // CONSTANTES
  // ======================================================
  const buttonClass = "cursor-pointer transition transform hover:scale-105";

  // Usuario actualmente logueado (para evitar que se elimine a sí mismo)
  const currentUserId = getCurrentUserId();

  // ======================================================
  // FETCH DATOS PRINCIPALES
  // ======================================================
  const fetchUsers = async () => {
    try {
      const params = {};

      if (selectedRole) {
        params.role = selectedRole;
      }

      const { data } = await userService.getAll(params);

      setUsers(data?.data || []);
    } catch (error) {
      console.error(error);
      setUsers([]);
    }
  };

  // ======================================================
  // RESETEO
  // ======================================================
  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setUsername("");
    setPassword("");
    setRole("");
    setSelectedUser(null);
    setErrorsCreate({});
    setErrorsEdit({});
  };

  // ======================================================
  // HANDLES CRUD
  // ======================================================
  const openCreate = () => {
    resetForm();
    setOpenCreateModal(true);
  };

  const handleCreate = async () => {
    const formErrors = validateUsersForm({
      first_name: firstName,
      last_name: lastName,
      username,
      password,
      role,
    });

    if (Object.keys(formErrors).length > 0) {
      setErrorsCreate(formErrors);
      return;
    }

    try {
      setErrorsCreate({});

      await userService.create({
        first_name: firstName,
        last_name: lastName,
        username,
        password,
        role,
      });

      setOpenCreateModal(false);
      fetchUsers();
      resetForm();

      showFeedback("Usuario creado correctamente.", "success");
    } catch (error) {
      console.error("Error al crear:", error.response?.data || error.message);

      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        setErrorsCreate(mapErrors(backendErrors));
      } else {
        showFeedback(
          error.response?.data?.message || "Error al crear el usuario.",
          "error",
        );
      }
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);

    setFirstName(user.first_name || "");
    setLastName(user.last_name || "");
    setUsername(user.username || "");
    setRole(user.role || "DOCENTE");
    setPassword("");

    setErrorsEdit({});
    setOpenEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    const formErrors = validateUsersForm(
      {
        first_name: firstName,
        last_name: lastName,
        username,
        password,
        role,
      },
      true,
    );

    if (Object.keys(formErrors).length > 0) {
      setErrorsEdit(formErrors);
      return;
    }

    try {
      setErrorsEdit({});

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
      resetForm();

      showFeedback("Usuario actualizado correctamente.", "success");
    } catch (error) {
      console.error(error.response?.data || error.message);

      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        setErrorsEdit(mapErrors(backendErrors));
      } else {
        showFeedback(
          error.response?.data?.message || "Error al editar el usuario.",
          "error",
        );
      }
    }
  };

  const handleDelete = (user) => {
    // Guarda extra por si el botón llega a dispararse igual (ej. sin soporte visual de disabled)
    if (user.id === currentUserId) {
      showFeedback("No podés eliminar tu propio usuario.", "error");
      return;
    }

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

      showFeedback("Usuario eliminado correctamente.", "success");
    } catch (error) {
      console.error(error.response?.data || error.message);

      setOpenDeleteModal(false);

      showFeedback(
        error.response?.data?.message || "Error al eliminar el usuario.",
        "error",
      );
    }
  };

  // ======================================================
  // USEEFFECTS
  // ======================================================
  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  // ======================================================
  // DATOS DERIVADOS
  // ======================================================
  const showActions = isAdmin();

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
      render: (row) => {
        const isSelf = row.id === currentUserId;

        return (
          <div className="flex gap-2">
            <EditButton title="Editar Tutor" onClick={() => handleEdit(row)} />

            <DeleteButton
              title={
                isSelf
                  ? "No podés eliminar tu propio usuario"
                  : "Eliminar Tutor"
              }
              disabled={isSelf}
              onClick={() => {
                if (isSelf) return;
                handleDelete(row);
              }}
            />
          </div>
        );
      },
    });
  }

  const tableTitle = (
    <div className="flex justify-between items-center">
      <span>Usuarios</span>

      {showActions && <PlusButton title="Crear Usuario" onClick={openCreate} />}
    </div>
  );

  // ======================================================
  // RETURN
  // ======================================================
  return (
    <>
      <div className="flex gap-3 mb-4 flex-wrap">
        <Input
          placeholder="Buscar por nombre, apellido o usuario"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border border-gray-300 rounded w-80"
        />

        <Select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="p-2 border border-gray-300 rounded min-w-56"
        >
          <option value="">Todos los roles</option>
          <option value="ADMIN">Administradores</option>
          <option value="DOCENTE">Docentes</option>
        </Select>
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

      <Modal
        isOpen={openCreateModal}
        onClose={() => {
          setOpenCreateModal(false);
          resetForm();
        }}
      >
        <h2 className="text-xl font-bold mb-8">Crear Usuario</h2>

        <Label>Nombre</Label>
        <Input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={errorsCreate.first_name}
        />

        <Label>Apellido</Label>
        <Input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          error={errorsCreate.last_name}
        />

        <Label>Usuario</Label>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={errorsCreate.username}
        />

        <Label>Contraseña</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errorsCreate.password}
        />

        <Label>Rol</Label>
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          error={errorsCreate.role}
        >
          <option value="">Seleccione un rol</option>
          <option value="DOCENTE">Docente</option>
          <option value="ADMIN">Administrador</option>
        </Select>

        <div className="flex justify-end gap-4 mt-10">
          <div className="flex justify-end gap-3">
            <NoButton
              title="Cancelar"
              onClick={() => setOpenCreateModal(false)}
            />

            <YesButton title="Aceptar" onClick={handleCreate} />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          resetForm();
        }}
      >
        <h2 className="text-xl font-bold mb-8">Editar Usuario</h2>

        <Label>Nombre</Label>
        <Input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={errorsEdit.first_name}
        />

        <Label>Apellido</Label>
        <Input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          error={errorsEdit.last_name}
        />

        <Label>Usuario</Label>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={errorsEdit.username}
        />

        <Label>Nueva contraseña (opcional)</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errorsEdit.password}
        />

        <Label>Rol</Label>
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          error={errorsEdit.role}
        >
          <option value="">Seleccione un rol</option>
          <option value="DOCENTE">Docente</option>
          <option value="ADMIN">Administrador</option>
        </Select>

        <div className="flex justify-end gap-4 mt-10">
          <NoButton title="Cancelar" onClick={() => setOpenEditModal(false)} />

          <YesButton title="Aceptar" onClick={handleUpdate} />
        </div>
      </Modal>

      <Modal isOpen={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <h2 className="text-lg font-semibold mb-4">¿Eliminar Usuario?</h2>

        <div className="flex justify-end gap-2">
          <NoButton
            title="Cancelar"
            onClick={() => setOpenDeleteModal(false)}
          />

          <YesButton title="Aceptar" onClick={confirmDelete} />
        </div>
      </Modal>

      <Modal isOpen={feedbackModal.open} onClose={closeFeedback}>
        <h2
          className={`text-lg font-semibold mb-4 ${
            feedbackModal.type === "error" ? "text-red-600" : "text-green-600"
          }`}
        >
          {feedbackModal.type === "error" ? "Error" : "Listo"}
        </h2>

        <p className="text-gray-600">{feedbackModal.message}</p>
      </Modal>
    </>
  );
}
