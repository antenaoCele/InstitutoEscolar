// React
import { useState } from "react";

// Hooks
import { useSubjects } from "../../hooks/pages/useSubjects";
import { usePagination } from "../../hooks/shared/usePagination";

// Componentes de la página
import { getSubjectsColumns } from "../../components/page-subjects/subjectColumns";
import SubjectCreateModal from "../../components/page-subjects/SubjectCreateModal";
import SubjectDeleteModal from "../../components/page-subjects/SubjectDeleteModal";
import SubjectEditModal from "../../components/page-subjects/SubjectEditModal";
import SubjectFilters from "../../components/page-subjects/SubjectFilters";

// Componentes compartidos
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import { PlusButton } from "../../components/ui/ActionButtons";
import FeedbackModal from "../../components/ui/FeedbackModal";
import Pagination from "../../components/ui/Pagination";
import TableTitle from "../../components/ui/TableTitle";

// Utilidades
import { sortByProperty } from "../../utils/sort";
import { isAdmin } from "../../utils/auth";

export function Subjects() {
  const [searchName, setSearchName] = useState("");

  const {
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
  } = useSubjects();

  const filteredSubjects = [...subjects]
    .filter((s) => {
      return (
        !searchName || s.name?.toLowerCase().includes(searchName.toLowerCase())
      );
    })
    .sort(sortByProperty("name"));

  const showCreateButtons = isAdmin();

  const {
    currentPage,
    totalPages,
    currentData: currentSubjects,
    setCurrentPage,
  } = usePagination({
    data: filteredSubjects,
    itemsPerPage: 3,
    dependencies: [searchName, subjects],
  });

  const columns = getSubjectsColumns({
    isAdmin: showCreateButtons,
    handleEdit,
    handleDelete,
  });

  const tableTitle = (
    <TableTitle
      title="Materias"
      action={
        showCreateButtons && (
          <PlusButton title="Crear Materia" onClick={openCreate} />
        )
      }
    />
  );

  return (
    <>
      <SubjectFilters searchName={searchName} onSearchChange={setSearchName} />
      <BasicTable title={tableTitle} columns={columns} data={currentSubjects} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      <SubjectCreateModal
        isOpen={openCreateModal}
        onClose={closeCreateModal}
        name={name}
        onNameChange={setName}
        errors={errorsCreate}
        onConfirm={handleCreate}
      />
      <SubjectEditModal
        isOpen={openEditModal}
        onClose={closeEditModal}
        name={name}
        onNameChange={setName}
        errors={errorsEdit}
        onConfirm={handleUpdate}
      />
      <SubjectDeleteModal
        isOpen={openDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
      />
      <FeedbackModal feedback={feedbackModal} onClose={closeFeedback} />
    </>
  );
}
