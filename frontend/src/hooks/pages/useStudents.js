// React
import { useCallback, useEffect, useState } from "react";

// Services
import { studentService } from "../../services/student.service";
import { teacherService } from "../../services/teacher.service";
import { planService } from "../../services/plan.service";
import { studentPlanService } from "../../services/studenPlan.service";

// Hooks compartidos
import { useFeedbackModal } from "../shared/useFeedBackModal";

// Validaciones
import { mapErrors } from "../../validators/helpers/errorHelpers";
import { validateStudentForm } from "../../validators/entities/student.validator";

// Utilidades
import { sortByPersonName } from "../../utils/sort";
import { getTodayLocal } from "../../utils/date.js";

export function useStudents() {
  // ======================================================
  // DATOS
  // ======================================================
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [plans, setPlans] = useState([]);

  // ======================================================
  // FILTROS
  // ======================================================
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPlanStatus, setSelectedPlanStatus] = useState("");

  const [searchFirstLastName, setSearchFirstLastName] = useState("");
  const [searchDNI, setSearchDNI] = useState("");

  // ======================================================
  // MODALES
  // ======================================================
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);

  // ======================================================
  // FEEDBACK
  // ======================================================
  const { feedbackModal, showFeedback, closeFeedback } = useFeedbackModal();

  // ======================================================
  // ESTUDIANTE SELECCIONADO
  // ======================================================
  const [selectedStudent, setSelectedStudent] = useState(null);

  // ======================================================
  // FORMULARIO
  // ======================================================
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dni, setDni] = useState("");
  const [school, setSchool] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [level, setLevel] = useState("");
  const [grade, setGrade] = useState("");

  // ======================================================
  // PLANES DEL ESTUDIANTE
  // ======================================================
  const [formClasses, setFormClasses] = useState([]);
  const [removedClasses, setRemovedClasses] = useState([]);

  // ======================================================
  // ERRORES
  // ======================================================
  const [errorsCreate, setErrorsCreate] = useState({});
  const [errorsEdit, setErrorsEdit] = useState({});

  // ======================================================
  // FETCH ESTUDIANTES
  // ======================================================
  const fetchStudents = useCallback(async () => {
    try {
      const params = {};

      if (selectedTeacher) {
        params.teacher_id = selectedTeacher;
      }

      if (selectedPlan) {
        params.plan_id = selectedPlan;
      }

      if (selectedStatus) {
        params.status = selectedStatus;
      }

      if (selectedPlanStatus) {
        params.plan_status = selectedPlanStatus;
      }

      const { data } = await studentService.getAll(params);

      const rawData = data?.data || [];

      // ======================================================
      // AGRUPAR PLANES POR ESTUDIANTE
      // ======================================================
      const studentMap = new Map();

      rawData.forEach((row) => {
        if (!studentMap.has(row.id)) {
          studentMap.set(row.id, {
            ...row,
            activePlans: [],
          });
        }

        if (row.student_plan_id) {
          const student = studentMap.get(row.id);

          const exists = student.activePlans.some(
            (plan) => plan.student_plan_id === row.student_plan_id,
          );

          if (!exists) {
            student.activePlans.push({
              student_plan_id: row.student_plan_id,

              teacher_id: row.teacher_id,

              teacher_name: row.teacher_last_name
                ? `${row.teacher_last_name}, ${row.teacher_first_name}`
                : "-",

              plan_id: row.plan_id,
              plan_name: row.plan_name,

              start_date: row.start_date,

              academic_status: row.academic_status,
              account_status: row.account_status,

              overdue_period: row.overdue_period,

              current_period_status: row.current_period?.status,
            });
          }
        }
      });

      setStudents(Array.from(studentMap.values()));
    } catch (error) {
      console.error(error);
      setStudents([]);
    }
  }, [selectedTeacher, selectedPlan, selectedStatus, selectedPlanStatus]);

  // ======================================================
  // FETCH FILTROS
  // ======================================================
  const fetchFilters = useCallback(async () => {
    try {
      const teachersRes = await teacherService.getAll({
        active: true,
      });

      const plansRes = await planService.getAll();

      setTeachers(teachersRes.data.data || []);
      setPlans(plansRes.data.data || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  // ======================================================
  // CARGA INICIAL
  // ======================================================
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  // ======================================================
  // RESET
  // ======================================================
  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setDni("");
    setSchool("");
    setBirthDate("");
    setLevel("");
    setGrade("");

    setFormClasses([]);
    setRemovedClasses([]);

    setSelectedStudent(null);

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
    setSelectedStudent(null);
  };

  const closeViewModal = () => {
    setOpenViewModal(false);
    setSelectedStudent(null);
  };

  // ======================================================
  // CREAR
  // ======================================================
  const openCreate = () => {
    resetForm();
    setOpenCreateModal(true);
  };

  const handleCreate = async () => {
    const errors = validateStudentForm({
      firstName,
      lastName,
      dni,
      school,
      birthDate,
      level,
      grade,
    });

    if (Object.keys(errors).length > 0) {
      setErrorsCreate(errors);
      return;
    }

    // Solo planes completos:
    // plan + docente.
    const activeRows = formClasses.filter(
      (plan) => plan.teacher_id && plan.plan_id,
    );

    // Todos los planes de un alta son nuevos.
    const missingOption = activeRows.some((plan) => !plan.first_payment_option);

    if (missingOption) {
      showFeedback(
        "Seleccione la opción de primer pago para cada plan asignado.",
        "error",
      );
      return;
    }

    try {
      setErrorsCreate({});

      await studentService.createWithPlan({
        first_name: firstName,
        last_name: lastName,
        dni,
        school,
        birth_date: birthDate,
        level,
        grade,
        formClasses: activeRows,
      });

      closeCreateModal();

      await fetchStudents();

      showFeedback("Estudiante creado correctamente.", "success");
    } catch (error) {
      console.error("Error al crear:", error.response?.data || error.message);

      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        setErrorsCreate(mapErrors(backendErrors));
      } else {
        showFeedback(
          error.response?.data?.message || "Error al crear el estudiante.",
          "error",
        );
      }
    }
  };

  // ======================================================
  // VER
  // ======================================================
  const handleView = async (student) => {
    try {
      const { data } = await studentService.getInfo(student.id);

      setSelectedStudent(data.data);
      setOpenViewModal(true);
    } catch (error) {
      console.error(error);

      showFeedback(
        error.response?.data?.message ||
          "Error al obtener la información del estudiante.",
        "error",
      );
    }
  };

  // ======================================================
  // EDITAR
  // ======================================================
  const handleEdit = async (student) => {
    try {
      setSelectedStudent(student);

      setFirstName(student.first_name || "");
      setLastName(student.last_name || "");
      setDni(student.dni ? String(student.dni) : "");
      setSchool(student.school || "");
      setBirthDate(student.birth_date?.split("T")[0] || "");
      setLevel(student.level || "");
      setGrade(student.grade || "");

      // ======================================================
      // CARGAR PLANES ACTIVOS
      // ======================================================
      const rows = await Promise.all(
        (student.activePlans || [])
          .filter((plan) => plan.academic_status === "ACTIVE")
          .map(async (plan) => {
            const response = await teacherService.getTeachersByPlan(
              plan.plan_id,
            );

            return {
              plan_id: plan.plan_id,

              teacher_id: plan.teacher_id,

              // Se guarda para detectar cambio de docente.
              original_teacher_id: plan.teacher_id,

              student_plan_id: plan.student_plan_id,

              start_date: plan.start_date?.split("T")[0],

              // Las filas existentes no vuelven a
              // solicitar la modalidad de primer pago.
              first_payment_option: null,

              availableTeachers: (response.data.data || []).sort(
                sortByPersonName,
              ),
            };
          }),
      );

      setFormClasses(rows);
      setErrorsEdit({});
      setRemovedClasses([]);
      setOpenEditModal(true);
    } catch (error) {
      console.error(error);

      showFeedback(
        error.response?.data?.message || "Error al cargar el estudiante.",
        "error",
      );
    }
  };

  // ======================================================
  // ACTUALIZAR
  // ======================================================
  const handleUpdate = async () => {
    const errors = validateStudentForm({
      firstName,
      lastName,
      dni,
      school,
      birthDate,
      level,
      grade,
    });

    if (Object.keys(errors).length > 0) {
      setErrorsEdit(errors);
      return;
    }

    const activeRows = formClasses.filter(
      (plan) => plan.teacher_id && plan.plan_id,
    );

    // Solo los planes nuevos necesitan modalidad de
    // primer pago.
    const missingOption = activeRows.some(
      (plan) => !plan.student_plan_id && !plan.first_payment_option,
    );

    if (missingOption) {
      showFeedback(
        "Seleccione la opción de primer pago para los planes nuevos.",
        "error",
      );
      return;
    }

    try {
      setErrorsEdit({});

      // ======================================================
      // ACTUALIZAR DATOS DEL ESTUDIANTE
      // ======================================================
      await studentService.update(selectedStudent.id, {
        first_name: firstName,
        last_name: lastName,
        dni,
        school,
        birth_date: birthDate,
        level,
        grade,
      });

      // ======================================================
      // ACTUALIZAR / CREAR PLANES
      // ======================================================
      await Promise.all(
        activeRows.map(async (plan) => {
          // --------------------------------------------------
          // CAMBIO DE DOCENTE EN PLAN EXISTENTE
          // --------------------------------------------------
          if (
            plan.student_plan_id &&
            plan.teacher_id !== plan.original_teacher_id
          ) {
            return studentPlanService.changeTeacher(
              plan.student_plan_id,
              plan.teacher_id,
            );
          }

          // --------------------------------------------------
          // PLAN EXISTENTE SIN CAMBIO DE DOCENTE
          // --------------------------------------------------
          if (plan.student_plan_id) {
            return studentPlanService.update(plan.student_plan_id, {
              student_id: selectedStudent.id,
              teacher_id: plan.teacher_id,
              plan_id: plan.plan_id,
              start_date: plan.start_date,
            });
          }

          // --------------------------------------------------
          // PLAN NUEVO
          // --------------------------------------------------
          return studentPlanService.create({
            student_id: selectedStudent.id,
            teacher_id: plan.teacher_id,
            plan_id: plan.plan_id,
            start_date: getTodayLocal(),
            first_payment_option: plan.first_payment_option,
          });
        }),
      );

      // ======================================================
      // ELIMINAR PLANES QUITADOS
      // ======================================================
      await Promise.all(
        removedClasses.map((id) => studentPlanService.delete(id)),
      );

      closeEditModal();

      await fetchStudents();

      setRemovedClasses([]);

      showFeedback("Estudiante actualizado correctamente.", "success");
    } catch (error) {
      console.error(error.response?.data || error.message);

      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        setErrorsEdit(mapErrors(backendErrors));
      } else {
        showFeedback(
          error.response?.data?.message || "Error al editar el estudiante.",
          "error",
        );
      }
    }
  };

  // ======================================================
  // ELIMINAR / DAR DE BAJA
  // ======================================================
  const handleDelete = (student) => {
    setSelectedStudent(student);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      // Solo se dan de baja los planes actualmente activos.
      const plansToDeactivate = (selectedStudent?.activePlans || []).filter(
        (plan) => plan.academic_status === "ACTIVE",
      );

      for (const plan of plansToDeactivate) {
        await studentPlanService.delete(plan.student_plan_id);
      }

      closeDeleteModal();

      await fetchStudents();

      showFeedback("Estudiante dado de baja.", "success");
    } catch (error) {
      console.error(error.response?.data || error.message);

      closeDeleteModal();

      showFeedback(
        error.response?.data?.message || "Error al dar de baja.",
        "error",
      );
    }
  };

  // ======================================================
  // PLANES - CHECKBOXES
  // ======================================================
  const togglePlan = async (planId, checked) => {
    // ======================================================
    // QUITAR PLAN
    // ======================================================
    if (!checked) {
      const row = formClasses.find((item) => item.plan_id === planId);

      // Si ya existe en BD, lo marcamos para eliminar.
      if (row?.student_plan_id) {
        setRemovedClasses((prev) => [...prev, row.student_plan_id]);
      }

      setFormClasses((prev) => prev.filter((item) => item.plan_id !== planId));

      return;
    }

    // ======================================================
    // AGREGAR PLAN
    // ======================================================
    try {
      const response = await teacherService.getTeachersByPlan(planId);

      const availableTeachers = (response.data.data || []).sort(
        sortByPersonName,
      );

      setFormClasses((prev) => [
        ...prev,
        {
          plan_id: planId,
          teacher_id: "",
          first_payment_option: "",
          availableTeachers,
        },
      ]);
    } catch (error) {
      console.error(error);
    }
  };

  // ======================================================
  // ACTUALIZAR FILA DE PLAN
  // ======================================================
  const updateClassRowByPlan = (planId, field, value) => {
    setFormClasses((prev) =>
      prev.map((row) =>
        row.plan_id === planId
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    );
  };

  // ======================================================
  // DATOS DERIVADOS
  // ======================================================
  const getPlanStatusInfo = (plan) => {
    if (plan.academic_status === "INACTIVE") {
      return {
        text: "Baja (con deuda)",
        color: "text-red-700",
      };
    }

    if (plan.account_status === "OVERDUE") {
      return {
        text: "Debe",
        color: "text-orange-600",
      };
    }

    if (plan.current_period_status === "pending") {
      return {
        text: "Pendiente",
        color: "text-yellow-600",
      };
    }

    if (plan.current_period_status === "paid") {
      return {
        text: "Al día",
        color: "text-green-600",
      };
    }

    if (plan.current_period_status === "not_due_yet") {
      return {
        text: "Aún no corresponde",
        color: "text-gray-500",
      };
    }

    return {
      text: "-",
      color: "text-gray-400",
    };
  };

  const filteredStudents = [...students]
    .filter((student) => {
      const textName = searchFirstLastName.toLowerCase();

      const textDNI = searchDNI;

      const matchName =
        !textName ||
        student.first_name?.toLowerCase().includes(textName) ||
        student.last_name?.toLowerCase().includes(textName);

      const matchDNI = !textDNI || student.dni?.toString().includes(textDNI);

      return matchName && matchDNI;
    })
    .sort(sortByPersonName);

  // ======================================================
  // RETURN
  // ======================================================
  return {
    // ====================================================
    // DATOS
    // ====================================================
    students,
    filteredStudents,
    teachers,
    plans,

    // ====================================================
    // FILTROS
    // ====================================================
    selectedTeacher,
    setSelectedTeacher,

    selectedPlan,
    setSelectedPlan,

    selectedStatus,
    setSelectedStatus,

    selectedPlanStatus,
    setSelectedPlanStatus,

    searchFirstLastName,
    setSearchFirstLastName,

    searchDNI,
    setSearchDNI,

    // ====================================================
    // FORMULARIO
    // ====================================================
    firstName,
    setFirstName,

    lastName,
    setLastName,

    dni,
    setDni,

    school,
    setSchool,

    birthDate,
    setBirthDate,

    level,
    setLevel,

    grade,
    setGrade,

    // ====================================================
    // PLANES
    // ====================================================
    formClasses,
    removedClasses,

    togglePlan,
    updateClassRowByPlan,

    // ====================================================
    // ERRORES
    // ====================================================
    errorsCreate,
    errorsEdit,

    // ====================================================
    // MODALES
    // ====================================================
    openCreateModal,
    openEditModal,
    openDeleteModal,
    openViewModal,

    closeCreateModal,
    closeEditModal,
    closeDeleteModal,
    closeViewModal,

    // ====================================================
    // ESTUDIANTE SELECCIONADO
    // ====================================================
    selectedStudent,

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
    handleView,
    handleEdit,
    handleUpdate,
    handleDelete,
    confirmDelete,

    // ====================================================
    // OTROS
    // ====================================================
    resetForm,
    getPlanStatusInfo,
    fetchStudents,
  };
}
