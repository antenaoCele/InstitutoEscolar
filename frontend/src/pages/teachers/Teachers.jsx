import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import { teacherService } from "../../services/teacher.service";
import { planService } from "../../services/plan.service";
import { userService } from "../../services/user.service";
import Button from "../../components/ui/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/Input";
import Select from "../../components/form/Select";
import Switch from "../../components/form/Switch";
import { Modal } from "../../components/ui/Modal";
import { isAdmin } from "../../utils/auth";
import {
  ViewButton,
  EditButton,
  DeleteButton,
  PlusButton,
  YesButton,
  NoButton,
  AddButton,
  CopyButton,
  ActivationButton,
} from "../../components/ui/ActionButtons";
import { sortByPersonName } from "../../utils/sort";
import { validateTeacher } from "../../validators/entities/teachers.validator";
import { useFeedbackModal } from "../../hooks/useFeedbackModal";

export function Teachers() {
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

  // ======================================================
  // MODALES
  // ======================================================
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteUserToo, setDeleteUserToo] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  // Modal que muestra el usuario recién generado al crear un docente
  const [openNewUserModal, setOpenNewUserModal] = useState(false);
  const [newUserCredentials, setNewUserCredentials] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // ======================================================
  // FEEDBACK (crear / editar / eliminar)
  // ======================================================
  const { feedbackModal, showFeedback, closeFeedback } = useFeedbackModal();

  // ======================================================
  // DOCENTE SELECCIONADO
  // ======================================================
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  // ======================================================
  // FORMULARIO DEL DOCENTE
  // ======================================================
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");

  // Usuario asignado manualmente (se usa en el modal de Editar y,
  // cuando corresponde, en el modal de Crear)
  const [userId, setUserId] = useState("");

  // Modo de usuario de acceso en el modal de Crear:
  // "generate" -> se crea un usuario nuevo automáticamente
  // "existing" -> se asigna un usuario ya existente (userId)
  // "none"     -> no se asigna ningún usuario
  const [userMode, setUserMode] = useState("generate");

  // ======================================================
  // ESTADO DEL COMPONENTE
  // ======================================================
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  // ======================================================
  // ERRORES
  // ======================================================
  const [errorsCreate, setErrorsCreate] = useState({});
  const [errorsEdit, setErrorsEdit] = useState({});

  // ======================================================
  // CONSTANTES
  // ======================================================
  const buttonClass = "cursor-pointer transition transform hover:scale-105";

  const inputClass = (error) =>
    `w-full p-2 border rounded mb-1 
    border-gray-300
    focus:outline-none focus:ring-1 focus:ring-[#0cc0df] focus:border-[#0cc0df]
    ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}`;

  // ======================================================
  // FETCH DATOS PRINCIPALES
  // ======================================================
  const fetchTeachers = async () => {
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
    } catch {
      setTeachers([]);
    }
  };

  // ======================================================
  // FETCH AUXILIARES
  // ======================================================
  const fetchFilters = async () => {
    try {
      const plansRes = await planService.getAll();

      setPlans(plansRes.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersRes = await userService.getAll();

      setUsers(usersRes.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  // ======================================================
  // RESETEO
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
  // FUNCIONES AUXILIARES
  // ======================================================
  const mapErrors = (errors) => {
    const formatted = {};
    errors.forEach((e) => {
      formatted[e.path] = e.msg;
    });
    return formatted;
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
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
  // HANDLES CRUD
  // ======================================================
  const openCreate = () => {
    resetForm();
    setOpenCreateModal(true);
  };

  const handleCreate = async () => {
    setErrorsCreate({});
    const validationErrors = validateTeacher({
      first_name: firstName,
      last_name: lastName,
      dni,
      phone,
    });

    if (validationErrors && Object.keys(validationErrors).length > 0) {
      setErrorsCreate(validationErrors);
      return; // Detiene la ejecución si hay errores
    }

    if (userMode === "existing" && !userId) {
      setErrorsCreate({ user_id: "Seleccioná un usuario existente" });
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

      setOpenCreateModal(false);
      fetchTeachers();
      resetForm();

      if (response.data.generatedUser) {
        // Se creó un usuario nuevo: mostramos sus credenciales una única vez
        setNewUserCredentials(response.data.generatedUser);
        setOpenNewUserModal(true);
      } else {
        showFeedback("Docente creado correctamente", "success");
      }
    } catch (error) {
      // Mantiene el fallback por si el backend rechaza algo que se le pasó al front
      const backendErrors = error.response?.data?.errors;
      if (backendErrors) {
        setErrorsCreate(mapErrors(backendErrors));
      } else {
        showFeedback(
          error.response?.data?.message || "Error al crear el docente",
          "error",
        );
      }
    }
  };

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

    // Ejecutar la validación del Front-end reemplazando las comprobaciones manuales
    const validationErrors = validateTeacher({
      first_name: firstName,
      last_name: lastName,
      dni,
      phone,
    });

    if (validationErrors && Object.keys(validationErrors).length > 0) {
      setErrorsEdit(validationErrors);
      return; // Detiene la ejecución si hay errores
    }

    try {
      await teacherService.update(selectedTeacher.id, {
        first_name: firstName,
        last_name: lastName,
        dni,
        phone,
        user_id: userId || null,
      });

      setOpenEditModal(false);
      fetchTeachers();
      showFeedback("Docente editado correctamente", "success");
    } catch (error) {
      const backendErrors = error.response?.data?.errors;
      if (backendErrors) {
        setErrorsEdit(mapErrors(backendErrors));
      } else {
        showFeedback(
          error.response?.data?.message || "Error al editar el docente",
          "error",
        );
      }
    }
  };

  const handleReactivate = async (teacher) => {
    try {
      await teacherService.reactivate(teacher.id);

      fetchTeachers();

      showFeedback("Docente reactivado correctamente", "success");
    } catch (error) {
      showFeedback(
        error.response?.data?.message || "Error al reactivar el docente",
        "error",
      );
    }
  };

  const handleDelete = (teacher) => {
    setSelectedTeacher(teacher);
    setDeleteUserToo(false);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await teacherService.delete(selectedTeacher.id);

      // Si el docente tenía usuario asignado y el admin marcó la opción, lo eliminamos también
      if (deleteUserToo && selectedTeacher.user_id) {
        try {
          await userService.delete(selectedTeacher.user_id);
        } catch (userError) {
          console.error(userError.response?.data || userError.message);
          setOpenDeleteModal(false);
          fetchTeachers();
          showFeedback(
            "Docente eliminado, pero hubo un error al eliminar el usuario asignado",
            "error",
          );
          return;
        }
      }

      setOpenDeleteModal(false);
      fetchTeachers();
      showFeedback("Docente eliminado correctamente", "success");
    } catch (error) {
      console.error(error.response?.data || error.message);
      setOpenDeleteModal(false);
      showFeedback(
        error.response?.data?.message || "Error al eliminar",
        "error",
      );
    }
  };

  // ======================================================
  // USEEFFECTS
  // ======================================================
  useEffect(() => {
    fetchTeachers();
  }, [selectedPlan, selectedStatus]);

  useEffect(() => {
    fetchFilters();

    if (isAdmin()) {
      fetchUsers();
    }
  }, []);

  // ======================================================
  // DATOS DERIVADOS
  // ======================================================
  const filteredTeachers = [...teachers]
    .filter((t) => {
      const textName = searchFirstLastName.toLowerCase();
      const textDNI = searchDNI;

      const matchName =
        !textName ||
        t.first_name?.toLowerCase().includes(textName) ||
        t.last_name?.toLowerCase().includes(textName);

      const matchDNI = !textDNI || t.dni?.toString().includes(textDNI);

      return matchName && matchDNI;
    })
    .sort(sortByPersonName);

  const showCreateButtons = isAdmin();

  // Usuarios disponibles para asignar manualmente (Crear o Editar):
  // solo administradores que no tengan un docente asociado todavía,
  // + el que ya está asignado a este docente (para no perderlo del listado).
  const assignableUsers = users.filter(
    (u) => !u.teacher_id || u.id === Number(userId),
  );

  let columns = [
    { header: "Apellidos", accessor: "last_name" },
    { header: "Nombres", accessor: "first_name" },
    { header: "Teléfonos", accessor: "phone" },
  ];

  columns.splice(2, 0, {
    header: "Estados",
    render: (row) => (
      <span
        className={`font-medium ${
          row.active ? "text-green-600" : "text-red-600"
        }`}
      >
        ● {row.active ? "Activo" : "Inactivo"}
      </span>
    ),
  });

  if (isAdmin()) {
    columns.splice(3, 0, { header: "DNI", accessor: "dni" });

    columns.push({
      header: "Usuarios",
      render: (row) => (row.has_user ? row.username : "Sin usuario"),
    });
  }

  if (isAdmin()) {
    columns.push({
      header: "Acciones",
      render: (row) => (
        <div className="flex gap-2">
          <EditButton title="Editar Docente" onClick={() => handleEdit(row)} />

          {row.active ? (
            <DeleteButton
              title="Desactivar Docente"
              onClick={() => handleDelete(row)}
            />
          ) : (
            <ActivationButton
              title="Reactivar Docente"
              onClick={() => handleReactivate(row)}
              className="w-9 h-9 flex items-center justify-center rounded-lg border hover:bg-gray-100"
            >
              {/* Después acá ponemos el ícono */}
            </ActivationButton>
          )}
        </div>
      ),
    });
  }

  const tableTitle = (
    <div className="flex justify-between items-center">
      <span>Docentes</span>
      {showCreateButtons && (
        <div className="flex justify-between items-center">
          {showCreateButtons && (
            <PlusButton title="Crear Docente" onClick={openCreate} />
          )}
        </div>
      )}
    </div>
  );

  // ======================================================
  // RETURN
  // ======================================================
  return (
    <>
      {/* BUSCADORES */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <Input
          placeholder=" Buscar por nombre o apellido"
          value={searchFirstLastName}
          onChange={(e) => setSearchFirstLastName(e.target.value)}
          className="p-2 border border-gray-300 rounded w-60"
        />

        <Input
          placeholder="Buscar por DNI"
          value={searchDNI}
          onChange={(e) => setSearchDNI(e.target.value)}
          className="p-2 border border-gray-300 rounded w-40"
        />

        <Select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="p-2 border border-gray-300 rounded min-w-56"
        >
          <option value="">Todos los docentes</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </Select>
      </div>

      <BasicTable
        title={tableTitle}
        columns={columns}
        data={filteredTeachers}
      />

      {showCreateButtons && (
        <div className="mt-8">
          <Button onClick={openCreate} className={buttonClass}>
            Crear Docente
          </Button>
        </div>
      )}

      {/* CREATE MODAL */}
      <Modal
        isOpen={openCreateModal}
        onClose={() => {
          setOpenCreateModal(false);
          resetForm();
        }}
      >
        <h2 className="text-xl font-bold mb-8">Crear Docente</h2>

        <Label>Nombre</Label>
        <Input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={errorsCreate.first_name}
        />

        <Label>Apellido</Label>
        <Input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          error={errorsCreate.last_name}
        />

        <Label>DNI</Label>
        <Input
          type="number"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          error={errorsCreate.dni}
        />

        <Label>Teléfono</Label>
        <Input
          type="number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errorsCreate.phone}
        />

        <Label>Usuario de acceso</Label>
        <Select
          value={userMode}
          onChange={(e) => {
            setUserMode(e.target.value);
            if (e.target.value !== "existing") {
              setUserId("");
            }
          }}
          className="mb-1"
        >
          <option value="generate">Generar usuario nuevo</option>
          <option value="existing">Asignar usuario existente</option>
          <option value="none">No asignar usuario</option>
        </Select>

        {userMode === "generate" && (
          <p className="text-sm italic text-gray-500 mb-1">
            Se va a generar un usuario de acceso para este docente
          </p>
        )}

        {userMode === "none" && (
          <p className="text-sm italic text-gray-500 mb-1">
            No se va a asignar ningún usuario de acceso
          </p>
        )}

        {userMode === "existing" && (
          <>
            <Select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              error={errorsCreate.user_id}
              className="mb-1"
            >
              <option value="">Seleccionar usuario</option>

              {assignableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
            </Select>
            {errorsCreate.user_id && (
              <p className="text-xs text-red-500 mb-1">
                {errorsCreate.user_id}
              </p>
            )}
          </>
        )}

        <div className="flex justify-end gap-4 mt-10">
          <div className="flex justify-end gap-3">
            <NoButton
              title="Cancelar"
              onClick={() => setOpenCreateModal(false)}
            />

            <YesButton title="Aceptar" onClick={handleCreate} />
          </div>
        </div>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          resetForm();
        }}
      >
        <h2 className="text-xl font-bold mb-8">Editar Docente</h2>

        <Label>Nombre</Label>
        <Input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={errorsEdit.first_name}
        />

        <Label>Apellido</Label>
        <Input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          error={errorsEdit.last_name}
        />

        <Label>DNI</Label>
        <Input
          type="number"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          error={errorsEdit.dni}
        />

        <Label>Teléfono</Label>
        <Input
          type="number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errorsEdit.phone}
        />

        <Label>Usuario asignado</Label>
        <Select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          error={errorsEdit.user_id}
        >
          <option value="">Sin usuario asignado</option>

          {assignableUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.username}
            </option>
          ))}
        </Select>

        <div className="flex justify-end gap-4 mt-10">
          <NoButton title="Cancelar" onClick={() => setOpenEditModal(false)} />

          <YesButton title="Aceptar" onClick={handleUpdate} />
        </div>
      </Modal>

      {/* DELETE MODAL */}
      <Modal isOpen={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <h2 className="text-lg font-semibold mb-4">¿Eliminar Docente?</h2>

        {selectedTeacher?.has_user && (
          <div className="flex items-center justify-between gap-4 mb-4">
            <p className="text-sm text-gray-600">
              Eliminar también el usuario asignado ({selectedTeacher.username})
            </p>

            <Switch
              checked={deleteUserToo}
              onChange={(checked) => setDeleteUserToo(checked)}
              className={deleteUserToo ? "!bg-[#0cc0df]" : "!bg-gray-700"}
            />
          </div>
        )}

        <div className="flex justify-end gap-2">
          <NoButton
            title="Cancelar"
            onClick={() => setOpenDeleteModal(false)}
          />

          <YesButton title="Aceptar" onClick={confirmDelete} />
        </div>
      </Modal>

      {/* USUARIO CREADO: se muestra una única vez, con credenciales para copiar */}
      <Modal
        isOpen={openNewUserModal}
        onClose={() => {
          setOpenNewUserModal(false);
          setNewUserCredentials(null);
        }}
      >
        <h2 className="text-xl font-bold mb-4">Usuario creado</h2>

        <p className="text-sm text-gray-500 mb-6">
          Guardá estos datos ahora: la contraseña no se va a volver a mostrar.
        </p>

        <div className="space-y-4 max-w-sm mx-auto">
          <div>
            <Label>Usuario</Label>
            <div className="flex gap-2 items-center">
              <Input
                value={newUserCredentials?.username || ""}
                onChange={() => {}}
                className="mb-0"
              />

              <CopyButton
                title="Copiar usuario"
                onClick={() =>
                  copyToClipboard(newUserCredentials?.username, "username")
                }
              />
            </div>
            {copiedField === "username" && (
              <span className="text-xs text-green-600 block text-right mt-1">
                Copiado ✓
              </span>
            )}
          </div>

          <div>
            <Label>Contraseña</Label>
            <div className="flex gap-2 items-center">
              <Input
                value={newUserCredentials?.password || ""}
                onChange={() => {}}
                className="mb-0"
              />

              <CopyButton
                title="Copiar contraseña"
                onClick={() =>
                  copyToClipboard(newUserCredentials?.password, "password")
                }
              />
            </div>
            {copiedField === "password" && (
              <span className="text-xs text-green-600 block text-right mt-1">
                Copiado ✓
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <Button
            type="button"
            className="cursor-pointer whitespace-nowrap"
            onClick={copyUserAndPassword}
          >
            {copiedField === "both"
              ? "Copiado ✓"
              : "Copiar usuario y contraseña"}
          </Button>
        </div>

        <div className="flex justify-end mt-8">
          <YesButton
            title="Listo"
            onClick={() => {
              setOpenNewUserModal(false);
              setNewUserCredentials(null);
            }}
          />
        </div>
      </Modal>

      {/* Modal de feedback (errores/éxito) — viene del hook useFeedbackModal */}
      <Modal isOpen={feedbackModal.open} onClose={closeFeedback}>
        <h2
          className={`text-lg font-semibold mb-4 ${
            feedbackModal.type === "error" ? "text-red-600" : "text-green-600"
          }`}
        >
          {feedbackModal.type === "error" ? "Error" : "Listo"}
        </h2>

        <p className="text-gray-600">{feedbackModal.message}</p>
      </Modal>
    </>
  );
}
