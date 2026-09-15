// Hooks
import { useTeachers } from "../../hooks/pages/useTeachers";
import { usePagination } from "../../hooks/shared/usePagination";

// Componentes de la página
import { getTeachersColumns } from "../../components/page-teachers/TeacherColumns";
import TeacherCreateModal from "../../components/page-teachers/TeacherCreateModal";
import TeacherDeleteModal from "../../components/page-teachers/TeacherDeleteModal";
import TeacherEditModal from "../../components/page-teachers/TeacherEditModal";
import TeacherFilters from "../../components/page-teachers/TeacherFilters";
import TeacherNewUserModal from "../../components/page-teachers/TeacherNewUserModal";

// Componentes compartidos
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import { PlusButton } from "../../components/ui/ActionButtons";
import FeedbackModal from "../../components/ui/FeedbackModal";
import Pagination from "../../components/ui/Pagination";
import TableTitle from "../../components/ui/TableTitle";

// Utilidades
import { isAdmin } from "../../utils/auth";

export function Teachers() {
  // ======================================================
  // HOOK
  // ======================================================
  const {
    // Datos
    filteredTeachers,
    plans,
    assignableUsers,

    // Filtros
    searchFirstLastName,
    setSearchFirstLastName,

    searchDNI,
    setSearchDNI,

    selectedPlan,
    setSelectedPlan,

    selectedStatus,
    setSelectedStatus,

    // Docente seleccionado
    selectedTeacher,

    // Formulario
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

    // Errores
    errorsCreate,
    errorsEdit,

    // Modales
    openCreateModal,
    openEditModal,
    openDeleteModal,
    openNewUserModal,

    // Credenciales
    newUserCredentials,
    copiedField,

    // Delete
    deleteUserToo,
    setDeleteUserToo,

    // Cierres
    closeCreateModal,
    closeEditModal,
    closeDeleteModal,
    closeNewUserModal,

    // CRUD
    openCreate,
    handleCreate,
    handleEdit,
    handleUpdate,
    handleDelete,
    confirmDelete,
    handleReactivate,

    // Usuario
    handleUserModeChange,
    handleCopyCredentials,

    // Feedback
    feedbackModal,
    closeFeedback,
  } = useTeachers();

  // ======================================================
  // PAGINACIÓN
  // ======================================================
  const {
    currentPage,
    totalPages,
    currentData: currentTeachers,
    setCurrentPage,
  } = usePagination({
    data: filteredTeachers,
    itemsPerPage: 3,
    dependencies: [
      searchFirstLastName,
      searchDNI,
      selectedPlan,
      selectedStatus,
    ],
  });

  // ======================================================
  // TABLA
  // ======================================================
  const showCreateButtons = isAdmin();

  const columns = getTeachersColumns({
    isAdmin: showCreateButtons,
    handleEdit,
    handleDelete,
    handleReactivate,
  });

  const tableTitle = (
    <TableTitle
      title="Docentes"
      action={
        showCreateButtons && (
          <PlusButton title="Crear Docente" onClick={openCreate} />
        )
      }
    />
  );

  // ======================================================
  // RETURN
  // ======================================================
  return (
    <>
      <TeacherFilters
        searchFirstLastName={searchFirstLastName}
        onSearchFirstLastNameChange={setSearchFirstLastName}
        searchDNI={searchDNI}
        onSearchDNIChange={setSearchDNI}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedPlan={selectedPlan}
        onPlanChange={setSelectedPlan}
        plans={plans}
      />

      <BasicTable title={tableTitle} columns={columns} data={currentTeachers} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* ==================================================
          MODAL CREAR
          ================================================== */}
      <TeacherCreateModal
        isOpen={openCreateModal}
        onClose={closeCreateModal}
        firstName={firstName}
        onFirstNameChange={setFirstName}
        lastName={lastName}
        onLastNameChange={setLastName}
        dni={dni}
        onDniChange={setDni}
        phone={phone}
        onPhoneChange={setPhone}
        userMode={userMode}
        onUserModeChange={handleUserModeChange}
        userId={userId}
        onUserIdChange={setUserId}
        assignableUsers={assignableUsers}
        errors={errorsCreate}
        onConfirm={handleCreate}
      />

      {/* ==================================================
          MODAL EDITAR
          ================================================== */}
      <TeacherEditModal
        isOpen={openEditModal}
        onClose={closeEditModal}
        firstName={firstName}
        onFirstNameChange={setFirstName}
        lastName={lastName}
        onLastNameChange={setLastName}
        dni={dni}
        onDniChange={setDni}
        phone={phone}
        onPhoneChange={setPhone}
        userId={userId}
        onUserIdChange={setUserId}
        assignableUsers={assignableUsers}
        errors={errorsEdit}
        onConfirm={handleUpdate}
      />

      {/* ==================================================
          MODAL ELIMINAR
          ================================================== */}
      <TeacherDeleteModal
        isOpen={openDeleteModal}
        onClose={closeDeleteModal}
        teacher={selectedTeacher}
        deleteUserToo={deleteUserToo}
        onDeleteUserTooChange={setDeleteUserToo}
        onConfirm={confirmDelete}
      />

      {/* ==================================================
          MODAL NUEVO USUARIO
          ================================================== */}
      <TeacherNewUserModal
        isOpen={openNewUserModal}
        onClose={closeNewUserModal}
        credentials={newUserCredentials}
        copiedField={copiedField}
        onCopy={handleCopyCredentials}
      />

      {/* ==================================================
          FEEDBACK
          ================================================== */}
      <FeedbackModal feedback={feedbackModal} onClose={closeFeedback} />
    </>
  );
}
