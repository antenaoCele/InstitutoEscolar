import { useEffect, useState } from "react";

// Services
import { tutorService } from "../../services/tutor.service";
import { studentService } from "../../services/student.service";
import { studentTutorService } from "../../services/studentTutor.service";

// Validaciones
import { mapErrors } from "../../validators/helpers/errorHelpers";
import { validateTutorForm } from "../../validators/entities/tutors.validator";

// Hooks compartidos
import { useFeedbackModal } from "../shared/useFeedBackModal";

import { sortByPersonName } from "../../utils/sort";

export function useTutors() {
  // ======================================================
  // DATOS
  // ======================================================
  const [tutors, setTutors] = useState([]);
  const [students, setStudents] = useState([]);

  // ======================================================
  // FILTROS
  // ======================================================
  const [filterStudentId, setFilterStudentId] = useState("");
  const [searchFirstLastName, setSearchFirstLastName] = useState("");
  const [searchDNI, setSearchDNI] = useState("");

  // ======================================================
  // MODALES
  // ======================================================
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  // ======================================================
  // TUTOR SELECCIONADO
  // ======================================================
  const [selectedTutor, setSelectedTutor] = useState(null);

  // ======================================================
  // FORMULARIO
  // ======================================================
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

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
  // FETCH TUTORES
  // ======================================================
  const fetchTutors = async () => {
    try {
      const [tutorsRes, studentTutorsRes] = await Promise.all([
        tutorService.getAll(),
        studentTutorService.getAll(),
      ]);

      const tutorsData = tutorsRes.data.data || [];
      const relations = studentTutorsRes.data.data || [];

      const merged = tutorsData.map((tutor) => {
        const tutorRelations = relations.filter(
          (relation) =>
            relation.tutor_id === tutor.id &&
            relation.student_tutor_id !== null,
        );

        return {
          ...tutor,

          student_relations: tutorRelations,

          student_ids: tutorRelations
            .filter((relation) => relation.student_id)
            .map((relation) => relation.student_id),

          student_names: tutorRelations
            .filter((relation) => relation.student_name)
            .map((relation) => relation.student_name),
        };
      });

      setTutors(merged);
    } catch (error) {
      console.error(error);
      setTutors([]);
    }
  };

  // ======================================================
  // FETCH ESTUDIANTES
  // ======================================================
  const fetchStudents = async () => {
    try {
      const response = await studentService.getAll();

      const uniqueStudents = Array.from(
        new Map(
          (response.data.data || []).map((student) => [student.id, student]),
        ).values(),
      );

      setStudents([...uniqueStudents].sort(sortByPersonName));
    } catch (error) {
      console.error(error);
      setStudents([]);
    }
  };

  // ======================================================
  // USE EFFECTS
  // ======================================================
  useEffect(() => {
    let cancelled = false;

    const loadInitialData = async () => {
      try {
        const [tutorsRes, studentTutorsRes, studentsRes] = await Promise.all([
          tutorService.getAll(),
          studentTutorService.getAll(),
          studentService.getAll(),
        ]);

        if (cancelled) return;

        // ==================================================
        // TUTORES
        // ==================================================
        const tutorsData = tutorsRes.data.data || [];
        const relations = studentTutorsRes.data.data || [];

        const mergedTutors = tutorsData.map((tutor) => {
          const tutorRelations = relations.filter(
            (relation) =>
              relation.tutor_id === tutor.id &&
              relation.student_tutor_id !== null,
          );

          return {
            ...tutor,

            student_relations: tutorRelations,

            student_ids: tutorRelations
              .filter((relation) => relation.student_id)
              .map((relation) => relation.student_id),

            student_names: tutorRelations
              .filter((relation) => relation.student_name)
              .map((relation) => relation.student_name),
          };
        });

        // ==================================================
        // ESTUDIANTES
        // ==================================================
        const uniqueStudents = Array.from(
          new Map(
            (studentsRes.data.data || []).map((student) => [
              student.id,
              student,
            ]),
          ).values(),
        );

        setTutors(mergedTutors);

        setStudents([...uniqueStudents].sort(sortByPersonName));
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setTutors([]);
          setStudents([]);
        }
      }
    };

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  // ======================================================
  // RESET
  // ======================================================
  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setDni("");
    setPhone("");
    setSelectedStudentIds([]);

    setSelectedTutor(null);

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
    setSelectedTutor(null);
  };

  // ======================================================
  // SELECCIÓN DE ESTUDIANTES
  // ======================================================
  const handleStudentCheckbox = (studentId, checked) => {
    if (checked) {
      setSelectedStudentIds((prev) => [...prev, studentId]);
    } else {
      setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId));
    }
  };

  // ======================================================
  // CREAR
  // ======================================================
  const openCreate = () => {
    resetForm();
    setOpenCreateModal(true);
  };

  const handleCreate = async () => {
    const errors = validateTutorForm({
      firstName,
      lastName,
      dni,
      phone,
    });

    if (Object.keys(errors).length > 0) {
      setErrorsCreate(errors);
      return;
    }

    try {
      setErrorsCreate({});

      const tutorResponse = await tutorService.create({
        first_name: firstName,
        last_name: lastName,
        dni,
        phone,
      });

      const tutorId = tutorResponse.data.data.id;

      if (selectedStudentIds.length > 0) {
        await Promise.all(
          selectedStudentIds.map((studentId) =>
            studentTutorService.create({
              student_id: studentId,
              tutor_id: tutorId,
            }),
          ),
        );
      }

      closeCreateModal();

      await fetchTutors();

      showFeedback("Tutor creado correctamente.", "success");
    } catch (error) {
      console.error("Error al crear:", error.response?.data || error.message);

      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        setErrorsCreate(mapErrors(backendErrors));
      } else {
        showFeedback(
          error.response?.data?.message || "Error al crear el tutor.",
          "error",
        );
      }
    }
  };

  // ======================================================
  // EDITAR
  // ======================================================
  const handleEdit = (tutor) => {
    setSelectedTutor(tutor);

    setFirstName(tutor.first_name || "");
    setLastName(tutor.last_name || "");
    setDni(tutor.dni || "");
    setPhone(tutor.phone || "");

    setSelectedStudentIds(tutor.student_ids || []);

    setErrorsEdit({});
    setOpenEditModal(true);
  };

  const handleUpdate = async () => {
    const errors = validateTutorForm({
      firstName,
      lastName,
      dni,
      phone,
    });

    if (Object.keys(errors).length > 0) {
      setErrorsEdit(errors);
      return;
    }

    try {
      setErrorsEdit({});

      await tutorService.update(selectedTutor.id, {
        first_name: firstName,
        last_name: lastName,
        dni,
        phone,
      });

      const currentRelations = selectedTutor.student_relations || [];

      await Promise.all(
        currentRelations.map((relation) =>
          studentTutorService.delete(relation.student_tutor_id),
        ),
      );

      if (selectedStudentIds.length > 0) {
        await Promise.all(
          selectedStudentIds.map((studentId) =>
            studentTutorService.create({
              student_id: studentId,
              tutor_id: selectedTutor.id,
            }),
          ),
        );
      }

      closeEditModal();

      await fetchTutors();

      showFeedback("Tutor actualizado correctamente.", "success");
    } catch (error) {
      console.error(error.response?.data || error.message);

      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        setErrorsEdit(mapErrors(backendErrors));
      } else {
        showFeedback(
          error.response?.data?.message || "Error al editar el tutor.",
          "error",
        );
      }
    }
  };

  // ======================================================
  // ELIMINAR
  // ======================================================
  const handleDelete = (tutor) => {
    setSelectedTutor(tutor);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await tutorService.delete(selectedTutor.id);

      closeDeleteModal();

      await fetchTutors();

      showFeedback("Tutor eliminado correctamente.", "success");
    } catch (error) {
      console.error(error.response?.data || error.message);

      closeDeleteModal();

      showFeedback(
        error.response?.data?.message || "Error al eliminar el tutor.",
        "error",
      );
    }
  };

  // ======================================================
  // DATOS DERIVADOS
  // ======================================================
  const filteredTutors = [...tutors]
    .filter((tutor) => {
      const textName = searchFirstLastName.toLowerCase();

      const matchName =
        !textName ||
        tutor.first_name?.toLowerCase().includes(textName) ||
        tutor.last_name?.toLowerCase().includes(textName);

      const matchDNI = !searchDNI || tutor.dni?.toString().includes(searchDNI);

      const matchStudent =
        !filterStudentId ||
        tutor.student_ids?.includes(Number(filterStudentId));

      return matchName && matchDNI && matchStudent;
    })
    .sort(sortByPersonName);

  // ======================================================
  // RETURN
  // ======================================================
  return {
    // Datos
    tutors,
    students,
    filteredTutors,

    // Filtros
    filterStudentId,
    setFilterStudentId,

    searchFirstLastName,
    setSearchFirstLastName,

    searchDNI,
    setSearchDNI,

    // Formulario
    firstName,
    setFirstName,

    lastName,
    setLastName,

    dni,
    setDni,

    phone,
    setPhone,

    selectedStudentIds,

    // Errores
    errorsCreate,
    errorsEdit,

    // Modales
    openCreateModal,
    openEditModal,
    openDeleteModal,

    // Tutor seleccionado
    selectedTutor,

    // Feedback
    feedbackModal,
    closeFeedback,

    // Reset
    resetForm,

    // Cerrar modales
    closeCreateModal,
    closeEditModal,
    closeDeleteModal,

    // Crear
    openCreate,
    handleCreate,

    // Editar
    handleEdit,
    handleUpdate,

    // Eliminar
    handleDelete,
    confirmDelete,

    // Estudiantes
    handleStudentCheckbox,

    // Fetch
    fetchTutors,
    fetchStudents,
  };
}
