// Hooks
import { useStudents } from "../../hooks/pages/useStudents";
import { usePagination } from "../../hooks/shared/usePagination";

// Componentes de la página
import { getStudentsColumns } from "../../components/page-students/StudentColumns";
import StudentCreateModal from "../../components/page-students/StudentCreateModal";
import StudentDeleteModal from "../../components/page-students/StudentDeleteModal";
import StudentEditModal from "../../components/page-students/StudentEditModal";
import StudentFilters from "../../components/page-students/StudentFilters";
import StudentViewModal from "../../components/page-students/StudentViewModal";

// Componentes compartidos
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import { PlusButton } from "../../components/ui/ActionButtons";
import FeedbackModal from "../../components/ui/FeedbackModal";
import Pagination from "../../components/ui/Pagination";
import TableTitle from "../../components/ui/TableTitle";

// Utilidades
import { isAdmin } from "../../utils/auth";

export function Students() {
  // ======================================================
  // HOOK
  // ======================================================
  const {
    filteredStudents,
    teachers,
    plans,

    // Filtros
    searchFirstLastName,
    setSearchFirstLastName,

    searchDNI,
    setSearchDNI,

    selectedTeacher,
    setSelectedTeacher,

    selectedPlan,
    setSelectedPlan,

    selectedStatus,
    setSelectedStatus,

    selectedPlanStatus,
    setSelectedPlanStatus,

    // Formulario
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

    formClasses,

    // Errores
    errorsCreate,
    errorsEdit,

    // Modales
    openCreateModal,
    openEditModal,
    openDeleteModal,
    openViewModal,

    closeCreateModal,
    closeEditModal,
    closeDeleteModal,
    closeViewModal,

    // Estudiante seleccionado
    selectedStudent,

    // Feedback
    feedbackModal,
    closeFeedback,

    // CRUD
    openCreate,
    handleCreate,
    handleView,
    handleEdit,
    handleUpdate,
    handleDelete,
    confirmDelete,

    // Planes
    togglePlan,
    updateClassRowByPlan,

    // Estado de planes
    getPlanStatusInfo,
  } = useStudents();

  // ======================================================
  // PAGINACIÓN
  // ======================================================
  const {
    currentPage,
    totalPages,
    currentData: currentStudents,
    setCurrentPage,
  } = usePagination({
    data: filteredStudents,
    itemsPerPage: 3,
    dependencies: [
      searchFirstLastName,
      searchDNI,
      selectedTeacher,
      selectedPlan,
      selectedStatus,
      selectedPlanStatus,
    ],
  });

  // ======================================================
  // TABLA
  // ======================================================
  const showCreateButtons = isAdmin();

  const columns = getStudentsColumns({
    isAdmin: showCreateButtons,
    handleView,
    handleEdit,
    handleDelete,
    getPlanStatusInfo,
  });

  const tableTitle = (
    <TableTitle
      title="Estudiantes"
      action={
        showCreateButtons && (
          <PlusButton title="Crear Estudiante" onClick={openCreate} />
        )
      }
    />
  );

  // ======================================================
  // RETURN
  // ======================================================
  return (
    <>
      <StudentFilters
        searchFirstLastName={searchFirstLastName}
        onSearchFirstLastNameChange={setSearchFirstLastName}
        searchDNI={searchDNI}
        onSearchDNIChange={setSearchDNI}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedTeacher={selectedTeacher}
        onTeacherChange={setSelectedTeacher}
        selectedPlan={selectedPlan}
        onPlanChange={setSelectedPlan}
        selectedPlanStatus={selectedPlanStatus}
        onPlanStatusChange={setSelectedPlanStatus}
        teachers={teachers}
        plans={plans}
      />

      <BasicTable title={tableTitle} columns={columns} data={currentStudents} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <StudentCreateModal
        isOpen={openCreateModal}
        onClose={closeCreateModal}
        firstName={firstName}
        onFirstNameChange={setFirstName}
        lastName={lastName}
        onLastNameChange={setLastName}
        dni={dni}
        onDniChange={setDni}
        school={school}
        onSchoolChange={setSchool}
        birthDate={birthDate}
        onBirthDateChange={setBirthDate}
        level={level}
        onLevelChange={setLevel}
        grade={grade}
        onGradeChange={setGrade}
        plans={plans}
        formClasses={formClasses}
        onTogglePlan={togglePlan}
        onClassRowChange={updateClassRowByPlan}
        errors={errorsCreate}
        onConfirm={handleCreate}
      />

      <StudentEditModal
        isOpen={openEditModal}
        onClose={closeEditModal}
        firstName={firstName}
        onFirstNameChange={setFirstName}
        lastName={lastName}
        onLastNameChange={setLastName}
        dni={dni}
        onDniChange={setDni}
        school={school}
        onSchoolChange={setSchool}
        birthDate={birthDate}
        onBirthDateChange={setBirthDate}
        level={level}
        onLevelChange={setLevel}
        grade={grade}
        onGradeChange={setGrade}
        plans={plans}
        formClasses={formClasses}
        onTogglePlan={togglePlan}
        onClassRowChange={updateClassRowByPlan}
        errors={errorsEdit}
        onConfirm={handleUpdate}
      />

      <StudentViewModal
        isOpen={openViewModal}
        onClose={closeViewModal}
        student={selectedStudent}
      />

      <StudentDeleteModal
        isOpen={openDeleteModal}
        onClose={closeDeleteModal}
        student={selectedStudent}
        onConfirm={confirmDelete}
      />

      <FeedbackModal feedback={feedbackModal} onClose={closeFeedback} />
    </>
  );
}
