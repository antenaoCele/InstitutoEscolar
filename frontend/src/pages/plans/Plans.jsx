// React
import { useState } from "react";

// Hooks
import { usePlans } from "../../hooks/pages/usePlans";
import { usePagination } from "../../hooks/shared/usePagination";

// Componentes de la página
import { getPlansColumns } from "../../components/page-plans/PlanColumns";
import PlanCreateModal from "../../components/page-plans/PlanCreateModal";
import PlanEditModal from "../../components/page-plans/PlanEditModal";
import PlanFilters from "../../components/page-plans/PlanFilters";
import PlanHistoryModal from "../../components/page-plans/PlanHistoryModal";
import PlanTeachersModal from "../../components/page-plans/PlanTeachersModal";

// Componentes compartidos
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import { PlusButton } from "../../components/ui/ActionButtons";
import FeedbackModal from "../../components/ui/FeedbackModal";
import Pagination from "../../components/ui/Pagination";
import TableTitle from "../../components/ui/TableTitle";

// Utilidades
import { isAdmin } from "../../utils/auth";
import { sortByProperty } from "../../utils/sort";

export function Plans() {
  // ======================================================
  // FILTROS
  // ======================================================
  const [searchName, setSearchName] = useState("");

  // ======================================================
  // HOOK
  // ======================================================
  const {
    // DATOS
    currentPlans,
    subjects,
    teachers,
    allPlanSubjects,

    // FORMULARIO
    selectedPlan,
    handlePlanChange,

    selectedSubjects,
    handleSubjectCheckbox,

    price,
    handlePriceChange,

    startDate,
    handleStartDateChange,

    endDate,
    handleEndDateChange,

    // ERRORES
    errorsCreate,
    errorsEdit,

    // MODALES
    openCreateModal,
    openEditModal,
    openHistoryModal,
    openTeachersModal,

    closeCreateModal,
    closeEditModal,
    closeHistoryModal,
    closeTeachersModal,

    // FEEDBACK
    feedbackModal,
    closeFeedback,

    // CREAR
    openCreate,
    handleCreate,

    // EDITAR
    handleEditPlan,
    handleUpdate,

    // HISTORIAL
    handleOpenHistory,
    selectedPlanForHistory,
    historyForSelectedPlan,

    // DOCENTES
    handleManageTeachers,
    handleTeacherCheckbox,
    handleSaveTeachers,
    selectedPlanTeachers,
    selectedTeacherIds,
  } = usePlans();

  // ======================================================
  // DATOS DERIVADOS
  // ======================================================
  const filteredCurrentPlans = currentPlans
    .filter((p) => {
      const textPlan = searchName.toLowerCase();
      return !textPlan || p.name?.toLowerCase().includes(textPlan);
    })
    .sort(sortByProperty("name"));

  const {
    currentPage,
    totalPages,
    currentData: currentPlansPage,
    setCurrentPage,
  } = usePagination({
    data: filteredCurrentPlans,
    itemsPerPage: 4,
    dependencies: [searchName, currentPlans],
  });

  // ======================================================
  // TABLA
  // ======================================================
  const showCreateButtons = isAdmin();

  const columns = getPlansColumns({
    isAdmin: showCreateButtons,
    allPlanSubjects,
    handleOpenHistory,
    handleEditPlan,
    handleManageTeachers,
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

  // ======================================================
  // RETURN
  // ======================================================
  return (
    <>
      <PlanFilters searchName={searchName} onSearchChange={setSearchName} />

      <BasicTable
        title={tableTitle}
        columns={columns}
        data={currentPlansPage}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <PlanHistoryModal
        isOpen={openHistoryModal}
        onClose={closeHistoryModal}
        selectedPlan={selectedPlanForHistory}
        history={historyForSelectedPlan}
      />

      <PlanCreateModal
        isOpen={openCreateModal}
        onClose={closeCreateModal}
        selectedPlan={selectedPlan}
        onPlanChange={handlePlanChange}
        price={price}
        onPriceChange={handlePriceChange}
        startDate={startDate}
        onStartDateChange={handleStartDateChange}
        endDate={endDate}
        onEndDateChange={handleEndDateChange}
        subjects={subjects}
        selectedSubjects={selectedSubjects}
        onSubjectChange={handleSubjectCheckbox}
        errors={errorsCreate}
        onConfirm={handleCreate}
      />

      <PlanEditModal
        isOpen={openEditModal}
        onClose={closeEditModal}
        selectedPlan={selectedPlan}
        onPlanChange={handlePlanChange}
        onPriceChange={handlePriceChange}
        subjects={subjects}
        selectedSubjects={selectedSubjects}
        onSubjectChange={handleSubjectCheckbox}
        price={price}
        errors={errorsEdit}
        onConfirm={handleUpdate}
      />

      <PlanTeachersModal
        isOpen={openTeachersModal}
        onClose={closeTeachersModal}
        plan={selectedPlanTeachers}
        teachers={teachers}
        selectedTeacherIds={selectedTeacherIds}
        onTeacherChange={handleTeacherCheckbox}
        onConfirm={handleSaveTeachers}
      />

      <FeedbackModal feedback={feedbackModal} onClose={closeFeedback} />
    </>
  );
}
