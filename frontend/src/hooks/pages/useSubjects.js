import { useEffect, useState } from "react";
import { subjectService } from "../../services/subject.service";
import { mapErrors } from "../../validators/helpers/errorHelpers";
import { validateSubjectForm } from "../../validators/entities/subjects.validator";
import { useFeedbackModal } from "../shared/useFeedBackModal";

export function useSubjects() {
  // ======================================================
  // DATOS
  // ======================================================
  const [subjects, setSubjects] = useState([]);

  // ======================================================
  // MODALES
  // ======================================================
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  // ======================================================
  // FORMULARIO
  // ======================================================
  const [name, setName] = useState("");

  // ======================================================
  // MATERIA SELECCIONADA
  // ======================================================
  const [selectedSubject, setSelectedSubject] = useState(null);

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
  // FETCH
  // ======================================================
  const fetchSubjects = async () => {
    try {
      const response = await subjectService.getAll();

      setSubjects(response.data.data || []);
    } catch (error) {
      console.error(error);
      setSubjects([]);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // ======================================================
  // RESET
  // ======================================================
  const resetForm = () => {
    setName("");
    setSelectedSubject(null);
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
  };

  // ======================================================
  // CREAR
  // ======================================================
  const openCreate = () => {
    resetForm();
    setOpenCreateModal(true);
  };

  const handleCreate = async () => {
    const errors = validateSubjectForm({ name });

    if (Object.keys(errors).length > 0) {
      setErrorsCreate(errors);
      return;
    }

    try {
      setErrorsCreate({});

      await subjectService.create({ name });

      closeCreateModal();

      fetchSubjects();

      showFeedback("Materia creada correctamente.", "success");
    } catch (error) {
      console.error(error.response?.data || error.message);

      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        setErrorsCreate(mapErrors(backendErrors));
      } else {
        showFeedback(
          error.response?.data?.message || "Error al crear la materia.",
          "error",
        );
      }
    }
  };

  // ======================================================
  // EDITAR
  // ======================================================
  const handleEdit = (subject) => {
    setSelectedSubject(subject);
    setName(subject.name);
    setOpenEditModal(true);
  };

  const handleUpdate = async () => {
    const errors = validateSubjectForm({ name });

    if (Object.keys(errors).length > 0) {
      setErrorsEdit(errors);
      return;
    }

    try {
      setErrorsEdit({});

      await subjectService.update(selectedSubject.id, {
        name,
      });

      closeEditModal();

      fetchSubjects();

      showFeedback("Materia actualizada correctamente.", "success");
    } catch (error) {
      console.error(error.response?.data || error.message);

      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        setErrorsEdit(mapErrors(backendErrors));
      } else {
        showFeedback(
          error.response?.data?.message || "Error al editar la materia.",
          "error",
        );
      }
    }
  };

  // ======================================================
  // ELIMINAR
  // ======================================================
  const handleDelete = (subject) => {
    setSelectedSubject(subject);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await subjectService.delete(selectedSubject.id);

      closeDeleteModal();

      fetchSubjects();

      showFeedback("Materia eliminada correctamente.", "success");
    } catch (error) {
      console.error(error.response?.data || error.message);

      closeDeleteModal();

      showFeedback(
        error.response?.data?.message || "Error al eliminar la materia.",
        "error",
      );
    }
  };

  return {
    subjects,

    name,
    setName,

    errorsCreate,
    errorsEdit,

    openCreateModal,
    openEditModal,
    openDeleteModal,

    closeCreateModal,
    closeEditModal,
    closeDeleteModal,

    feedbackModal,
    closeFeedback,

    resetForm,

    openCreate,

    handleCreate,
    handleEdit,
    handleUpdate,
    handleDelete,
    confirmDelete,
  };
}
