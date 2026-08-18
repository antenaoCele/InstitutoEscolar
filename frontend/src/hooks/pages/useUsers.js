import { useCallback, useEffect, useState } from "react";

// Services
import { userService } from "../../services/user.service";

// Validaciones
import { mapErrors } from "../../validators/helpers/errorHelpers";
import { validateUsersForm } from "../../validators/entities/users.validator";

// Hooks compartidos
import { useFeedbackModal } from "../shared/useFeedBackModal";

// Utilidades
import { getCurrentUserId } from "../../utils/auth";

export function useUsers(selectedRole = "") {
  // ======================================================
  // DATOS
  // ======================================================
  const [users, setUsers] = useState([]);

  // ======================================================
  // MODALES
  // ======================================================
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  // ======================================================
  // USUARIO SELECCIONADO
  // ======================================================
  const [selectedUser, setSelectedUser] = useState(null);

  // ======================================================
  // FORMULARIO
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
  // FEEDBACK
  // ======================================================
  const { feedbackModal, showFeedback, closeFeedback } = useFeedbackModal();

  // ======================================================
  // USUARIO ACTUAL
  // ======================================================
  const currentUserId = getCurrentUserId();

  // ======================================================
  // FETCH
  // ======================================================
  const fetchUsers = useCallback(async () => {
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
  }, [selectedRole]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ======================================================
  // RESET
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
  // CERRAR MODALES
  // ======================================================
  const closeCreateModal = () => {
    setOpenCreateModal(false);
    resetForm();
  };

  const closeEditModal = () => {
    setOpenEditModal(false);
    resetForm();
  };

  const closeDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedUser(null);
  };

  // ======================================================
  // CREAR
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

      closeCreateModal();

      await fetchUsers();

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

  // ======================================================
  // EDITAR
  // ======================================================
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

      closeEditModal();

      await fetchUsers();

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

  // ======================================================
  // ELIMINAR
  // ======================================================
  const handleDelete = (user) => {
    // Protección adicional para impedir
    // que el usuario elimine su propia cuenta.
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

      closeDeleteModal();

      await fetchUsers();

      showFeedback("Usuario eliminado correctamente.", "success");
    } catch (error) {
      console.error(error.response?.data || error.message);

      closeDeleteModal();

      showFeedback(
        error.response?.data?.message || "Error al eliminar el usuario.",
        "error",
      );
    }
  };

  // ======================================================
  // RETURN
  // ======================================================
  return {
    // Datos
    users,

    // Usuario seleccionado
    selectedUser,
    currentUserId,

    // Formulario
    firstName,
    setFirstName,

    lastName,
    setLastName,

    username,
    setUsername,

    password,
    setPassword,

    role,
    setRole,

    // Errores
    errorsCreate,
    errorsEdit,

    // Modales
    openCreateModal,
    openEditModal,
    openDeleteModal,

    closeCreateModal,
    closeEditModal,
    closeDeleteModal,

    // Feedback
    feedbackModal,
    closeFeedback,

    // Fetch
    fetchUsers,

    // Reset
    resetForm,

    // Crear
    openCreate,
    handleCreate,

    // Editar
    handleEdit,
    handleUpdate,

    // Eliminar
    handleDelete,
    confirmDelete,
  };
}
