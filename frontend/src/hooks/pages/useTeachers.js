import { useCallback, useEffect, useState } from "react";

// Services
import { teacherService } from "../../services/teacher.service";
import { planService } from "../../services/plan.service";
import { userService } from "../../services/user.service";

// Validaciones
import { validateTeacher } from "../../validators/entities/teachers.validator";
import { mapErrors } from "../../validators/helpers/errorHelpers";

// Hooks compartidos
import { useFeedbackModal } from "../shared/useFeedBackModal";

// Utilidades
import { isAdmin } from "../../utils/auth";

export function useTeachers() {
  // ======================================================
  // DATOS
  // ======================================================
  const [teachers, setTeachers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);

  // ======================================================
  // FILTROS
  // ======================================================
  const [selectedPlan, setSelectedPlan] = useState("");
  const [searchFirstLastName, setSearchFirstLastName] = useState("");
  const [searchDNI, setSearchDNI] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // ======================================================
  // MODALES
  // ======================================================
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openNewUserModal, setOpenNewUserModal] = useState(false);

  // ======================================================
  // DOCENTE SELECCIONADO
  // ======================================================
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // ======================================================
  // ELIMINACIÓN
  // ======================================================
  const [deleteUserToo, setDeleteUserToo] = useState(false);

  // ======================================================
  // FORMULARIO
  // ======================================================
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");
  const [userId, setUserId] = useState("");

  // ======================================================
  // MODO DE USUARIO
  // ======================================================
  const [userMode, setUserMode] = useState("generate");

  // ======================================================
  // ERRORES
  // ======================================================
  const [errorsCreate, setErrorsCreate] = useState({});
  const [errorsEdit, setErrorsEdit] = useState({});

  // ======================================================
  // USUARIO GENERADO
  // ======================================================
  const [newUserCredentials, setNewUserCredentials] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // ======================================================
  // FEEDBACK
  // ======================================================
  const { feedbackModal, showFeedback, closeFeedback } = useFeedbackModal();

  // ======================================================
  // FETCH DOCENTES
  // ======================================================
  const fetchTeachers = useCallback(async () => {
    try {
      const queryParams = {};

      if (selectedPlan) {
        queryParams.plan_id = selectedPlan;
      }

      if (selectedStatus) {
        queryParams.active = selectedStatus;
      }

      const { data } = await teacherService.getAll(queryParams);

      setTeachers(data?.data || []);
    } catch (error) {
      console.error(error);
      setTeachers([]);
    }
  }, [selectedPlan, selectedStatus]);

  // ======================================================
  // FETCH PLANES
  // ======================================================
  const fetchPlans = useCallback(async () => {
    try {
      const response = await planService.getAll();

      setPlans(response.data.data || []);
    } catch (error) {
      console.error(error);
      setPlans([]);
    }
  }, []);

  // ======================================================
  // FETCH USUARIOS
  // ======================================================
  const fetchUsers = useCallback(async () => {
    if (!isAdmin()) return;

    try {
      const response = await userService.getAll();

      setUsers(response.data.data || []);
    } catch (error) {
      console.error(error);
      setUsers([]);
    }
  }, []);

  // ======================================================
  // CARGA INICIAL
  // ======================================================
  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  useEffect(() => {
    fetchPlans();
    fetchUsers();
  }, [fetchPlans, fetchUsers]);

  // ======================================================
  // RESET
  // ======================================================
  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setDni("");
    setPhone("");
    setUserId("");
    setUserMode("generate");

    setErrorsCreate({});
    setErrorsEdit({});
  };

  // ======================================================
  // ABRIR CREAR
  // ======================================================
  const openCreate = () => {
    resetForm();
    setOpenCreateModal(true);
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
    setDeleteUserToo(false);
  };

  const closeNewUserModal = () => {
    setOpenNewUserModal(false);
    setNewUserCredentials(null);
    setCopiedField(null);
  };

  // ======================================================
  // CREAR
  // ======================================================
  const handleCreate = async () => {
    setErrorsCreate({});

    const validationErrors = validateTeacher({
      first_name: firstName,
      last_name: lastName,
      dni,
      phone,
    });

    if (Object.keys(validationErrors || {}).length > 0) {
      setErrorsCreate(validationErrors);
      return;
    }

    if (userMode === "existing" && !userId) {
      setErrorsCreate({
        user_id: "Seleccioná un usuario existente",
      });
      return;
    }

    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        dni,
        phone,
        generate_user: userMode === "generate",
      };

      if (userMode === "existing") {
        payload.user_id = userId;
      }

      const response = await teacherService.create(payload);

      closeCreateModal();

      await fetchTeachers();

      if (response.data.generatedUser) {
        setNewUserCredentials(response.data.generatedUser);
        setOpenNewUserModal(true);
      } else {
        showFeedback("Docente creado correctamente.", "success");
      }
    } catch (error) {
      console.error(error.response?.data || error.message);

      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        setErrorsCreate(mapErrors(backendErrors));
      } else {
        showFeedback(
          error.response?.data?.message || "Error al crear el docente.",
          "error",
        );
      }
    }
  };

  // ======================================================
  // EDITAR
  // ======================================================
  const handleEdit = (teacher) => {
    setSelectedTeacher(teacher);

    setFirstName(teacher.first_name || "");
    setLastName(teacher.last_name || "");
    setDni(teacher.dni || "");
    setPhone(teacher.phone || "");
    setUserId(teacher.user_id || "");

    setErrorsEdit({});
    setOpenEditModal(true);
  };

  const handleUpdate = async () => {
    setErrorsEdit({});

    const validationErrors = validateTeacher({
      first_name: firstName,
      last_name: lastName,
      dni,
      phone,
    });

    if (Object.keys(validationErrors || {}).length > 0) {
      setErrorsEdit(validationErrors);
      return;
    }

    try {
      await teacherService.update(selectedTeacher.id, {
        first_name: firstName,
        last_name: lastName,
        dni,
        phone,
        user_id: userId || null,
      });

      closeEditModal();

      await fetchTeachers();

      showFeedback("Docente editado correctamente.", "success");
    } catch (error) {
      console.error(error.response?.data || error.message);

      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        setErrorsEdit(mapErrors(backendErrors));
      } else {
        showFeedback(
          error.response?.data?.message || "Error al editar el docente.",
          "error",
        );
      }
    }
  };

  // ======================================================
  // REACTIVAR
  // ======================================================
  const handleReactivate = async (teacher) => {
    try {
      await teacherService.reactivate(teacher.id);

      await fetchTeachers();

      showFeedback("Docente reactivado correctamente.", "success");
    } catch (error) {
      console.error(error);

      showFeedback(
        error.response?.data?.message || "Error al reactivar el docente.",
        "error",
      );
    }
  };

  // ======================================================
  // ELIMINAR / DESACTIVAR
  // ======================================================
  const handleDelete = (teacher) => {
    setSelectedTeacher(teacher);
    setDeleteUserToo(false);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedTeacher) return;

    try {
      await teacherService.delete(selectedTeacher.id);

      if (deleteUserToo && selectedTeacher.user_id) {
        try {
          await userService.delete(selectedTeacher.user_id);
        } catch (userError) {
          console.error(userError.response?.data || userError.message);

          closeDeleteModal();
          await fetchTeachers();

          showFeedback(
            "Docente eliminado, pero hubo un error al eliminar el usuario asignado.",
            "error",
          );

          return;
        }
      }

      closeDeleteModal();

      await fetchTeachers();

      showFeedback("Docente eliminado correctamente.", "success");
    } catch (error) {
      console.error(error.response?.data || error.message);

      closeDeleteModal();

      showFeedback(
        error.response?.data?.message || "Error al eliminar el docente.",
        "error",
      );
    }
  };

  // ======================================================
  // COPIAR AL PORTAPAPELES
  // ======================================================
  const copyToClipboard = async (text, field) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);

      setCopiedField(field);

      setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  const copyUserAndPassword = async () => {
    if (!newUserCredentials) return;

    const text = `Usuario: ${newUserCredentials.username}\nContraseña: ${newUserCredentials.password}`;

    await copyToClipboard(text, "both");
  };

  // ======================================================
  // USUARIOS ASIGNABLES
  // ======================================================
  const assignableUsers = users.filter(
    (user) => !user.teacher_id || user.id === Number(userId),
  );

  // ======================================================
  // FILTRADO LOCAL
  // ======================================================
  const filteredTeachers = teachers.filter((teacher) => {
    const textName = searchFirstLastName.trim().toLowerCase();
    const textDNI = searchDNI.trim();

    const fullName = `${teacher.first_name || ""} ${
      teacher.last_name || ""
    }`.toLowerCase();

    const matchName = !textName || fullName.includes(textName);

    const matchDNI = !textDNI || String(teacher.dni || "").includes(textDNI);

    return matchName && matchDNI;
  });

  return {
    // ====================================================
    // DATOS
    // ====================================================
    teachers,
    filteredTeachers,
    plans,
    users,
    assignableUsers,

    // ====================================================
    // FILTROS
    // ====================================================
    selectedPlan,
    setSelectedPlan,

    searchFirstLastName,
    setSearchFirstLastName,

    searchDNI,
    setSearchDNI,

    selectedStatus,
    setSelectedStatus,

    // ====================================================
    // FORMULARIO
    // ====================================================
    firstName,
    setFirstName,

    lastName,
    setLastName,

    dni,
    setDni,

    phone,
    setPhone,

    userId,
    setUserId,

    userMode,
    setUserMode,

    // ====================================================
    // ERRORES
    // ====================================================
    errorsCreate,
    errorsEdit,

    // ====================================================
    // DOCENTE SELECCIONADO
    // ====================================================
    selectedTeacher,

    // ====================================================
    // MODALES
    // ====================================================
    openCreateModal,
    openEditModal,
    openDeleteModal,
    openNewUserModal,

    closeCreateModal,
    closeEditModal,
    closeDeleteModal,
    closeNewUserModal,

    // ====================================================
    // ELIMINACIÓN
    // ====================================================
    deleteUserToo,
    setDeleteUserToo,

    // ====================================================
    // USUARIO GENERADO
    // ====================================================
    newUserCredentials,
    copiedField,

    // ====================================================
    // FEEDBACK
    // ====================================================
    feedbackModal,
    closeFeedback,

    // ====================================================
    // CRUD
    // ====================================================
    openCreate,
    handleCreate,
    handleEdit,
    handleUpdate,
    handleDelete,
    confirmDelete,
    handleReactivate,

    // ====================================================
    // PORTAPAPELES
    // ====================================================
    copyToClipboard,
    copyUserAndPassword,

    // ====================================================
    // RESET
    // ====================================================
    resetForm,
  };
}
