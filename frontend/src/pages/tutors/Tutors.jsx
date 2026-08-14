// Hooks
import { useTutors } from "../../hooks/pages/useTutors";
import { usePagination } from "../../hooks/shared/usePagination";

// Componentes de la página
import { getTutorsColumns } from "../../components/page-tutors/TutorColumns";
import TutorCreateModal from "../../components/page-tutors/TutorCreateModal";
import TutorDeleteModal from "../../components/page-tutors/TutorDeleteModal";
import TutorEditModal from "../../components/page-tutors/TutorEditModal";
import TutorFilters from "../../components/page-tutors/TutorFilters";

// Componentes compartidos
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import { PlusButton } from "../../components/ui/ActionButtons";
import FeedbackModal from "../../components/ui/FeedbackModal";
import Pagination from "../../components/ui/Pagination";
import TableTitle from "../../components/ui/TableTitle";

// Utilidades
import { isAdmin } from "../../utils/auth";

export function Tutors() {
  // ======================================================
  // HOOK
  // ======================================================
  const {
    students,
    filteredTutors,

    filterStudentId,
    setFilterStudentId,

    searchFirstLastName,
    setSearchFirstLastName,

    searchDNI,
    setSearchDNI,

    firstName,
    setFirstName,

    lastName,
    setLastName,

    dni,
    setDni,

    phone,
    setPhone,

    selectedStudentIds,

    errorsCreate,
    errorsEdit,

    openCreateModal,
    openEditModal,
    openDeleteModal,

    selectedTutor,

    feedbackModal,
    closeFeedback,

    closeCreateModal,
    closeEditModal,
    closeDeleteModal,

    openCreate,

    handleCreate,
    handleEdit,
    handleUpdate,

    handleDelete,
    confirmDelete,

    handleStudentCheckbox,
  } = useTutors();

  // ======================================================
  // TABLA
  // ======================================================
  const showCreateButtons = isAdmin();

  const {
    currentPage,
    totalPages,
    currentData: currentTutors,
    setCurrentPage,
  } = usePagination({
    data: filteredTutors,
    itemsPerPage: 3,
    dependencies: [
      searchFirstLastName,
      searchDNI,
      filterStudentId,
      filteredTutors.length,
    ],
  });

  const columns = getTutorsColumns({
    isAdmin: showCreateButtons,
    handleEdit,
    handleDelete,
  });

  const tableTitle = (
    <TableTitle
      title="Tutores"
      action={
        showCreateButtons && (
          <PlusButton title="Crear Tutor" onClick={openCreate} />
        )
      }
    />
  );

  // ======================================================
  // RETURN
  // ======================================================
  return (
    <>
      <TutorFilters
        searchFirstLastName={searchFirstLastName}
        onSearchFirstLastNameChange={setSearchFirstLastName}
        searchDNI={searchDNI}
        onSearchDNIChange={setSearchDNI}
        filterStudentId={filterStudentId}
        onStudentChange={setFilterStudentId}
        students={students}
      />

      <BasicTable title={tableTitle} columns={columns} data={currentTutors} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <TutorCreateModal
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
        students={students}
        selectedStudentIds={selectedStudentIds}
        onStudentChange={handleStudentCheckbox}
        errors={errorsCreate}
        onConfirm={handleCreate}
      />

      <TutorEditModal
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
        students={students}
        selectedStudentIds={selectedStudentIds}
        onStudentChange={handleStudentCheckbox}
        errors={errorsEdit}
        onConfirm={handleUpdate}
      />

      <TutorDeleteModal
        isOpen={openDeleteModal}
        onClose={closeDeleteModal}
        tutor={selectedTutor}
        onConfirm={confirmDelete}
      />

      <FeedbackModal feedback={feedbackModal} onClose={closeFeedback} />
    </>
  );
}
