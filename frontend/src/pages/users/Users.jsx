// React
import { useState } from "react";

// Hooks
import { useUsers } from "../../hooks/pages/useUsers";
import { usePagination } from "../../hooks/shared/usePagination";

// Componentes de la página
import { getUsersColumns } from "../../components/page-users/UserColumns";
import UserCreateModal from "../../components/page-users/UserCreateModal";
import UserDeleteModal from "../../components/page-users/UserDeleteModal";
import UserEditModal from "../../components/page-users/UserEditModal";
import UserFilters from "../../components/page-users/UserFilters";

// Componentes compartidos
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import { PlusButton } from "../../components/ui/ActionButtons";
import FeedbackModal from "../../components/ui/FeedbackModal";
import Pagination from "../../components/ui/Pagination";
import TableTitle from "../../components/ui/TableTitle";

// Utilidades
import { isAdmin } from "../../utils/auth";

export function Users() {
  // ======================================================
  // FILTROS
  // ======================================================
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  // ======================================================
  // HOOK
  // ======================================================
  const {
    users,
    currentUserId,

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

    openCreate,

    handleCreate,
    handleEdit,
    handleUpdate,
    handleDelete,
    confirmDelete,
  } = useUsers(selectedRole);

  // ======================================================
  // DATOS DERIVADOS
  // ======================================================
  const filteredUsers = [...users]
    .filter((user) => {
      const text = search.toLowerCase();

      return (
        !text ||
        user.first_name?.toLowerCase().includes(text) ||
        user.last_name?.toLowerCase().includes(text) ||
        user.username?.toLowerCase().includes(text)
      );
    })
    .sort((a, b) => {
      const lastNameA = a.last_name?.toLowerCase() || "";
      const lastNameB = b.last_name?.toLowerCase() || "";

      return lastNameA.localeCompare(lastNameB);
    });

  const {
    currentPage,
    totalPages,
    currentData: currentUsers,
    setCurrentPage,
  } = usePagination({
    data: filteredUsers,
    itemsPerPage: 3,
    dependencies: [search, selectedRole, users],
  });

  // ======================================================
  // TABLA
  // ======================================================
  const showActions = isAdmin();

  const columns = getUsersColumns({
    isAdmin: showActions,
    currentUserId,
    handleEdit,
    handleDelete,
  });

  const tableTitle = (
    <TableTitle
      title="Usuarios"
      action={
        showActions && <PlusButton title="Crear Usuario" onClick={openCreate} />
      }
    />
  );

  // ======================================================
  // RETURN
  // ======================================================
  return (
    <>
      <UserFilters
        search={search}
        onSearchChange={setSearch}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
      />

      <BasicTable title={tableTitle} columns={columns} data={currentUsers} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <UserCreateModal
        isOpen={openCreateModal}
        onClose={closeCreateModal}
        username={username}
        onUsernameChange={setUsername}
        password={password}
        onPasswordChange={setPassword}
        firstName={firstName}
        onFirstNameChange={setFirstName}
        lastName={lastName}
        onLastNameChange={setLastName}
        role={role}
        onRoleChange={setRole}
        errors={errorsCreate}
        onConfirm={handleCreate}
      />

      <UserEditModal
        isOpen={openEditModal}
        onClose={closeEditModal}
        username={username}
        onUsernameChange={setUsername}
        password={password}
        onPasswordChange={setPassword}
        firstName={firstName}
        onFirstNameChange={setFirstName}
        lastName={lastName}
        onLastNameChange={setLastName}
        role={role}
        onRoleChange={setRole}
        errors={errorsEdit}
        onConfirm={handleUpdate}
      />

      <UserDeleteModal
        isOpen={openDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
      />

      <FeedbackModal feedback={feedbackModal} onClose={closeFeedback} />
    </>
  );
}
