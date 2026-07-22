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

  // ======================================================
  // FORMULARIO DEL DOCENTE
  // ======================================================
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");

  // Usuario asignado manualmente (solo se usa en el modal de Editar)
  const [userId, setUserId] = useState("");

  // Generar usuario de acceso automáticamente (solo modal de Crear)
  const [generateUser, setGenerateUser] = useState(true);

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
    setGenerateUser(true);
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

    try {
      const response = await teacherService.create({
        first_name: firstName,
        last_name: lastName,
        dni,
        phone,
        generate_user: generateUser,
      });

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

  const handleDelete = (teacher) => {
    setSelectedTeacher(teacher);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await teacherService.delete(selectedTeacher.id);
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
  }, [selectedPlan]);

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

  // Usuarios disponibles para asignar manualmente en el modal de Editar:
  // los que no tienen docente todavía + el que ya está asignado a este
  // docente (para no perderlo del listado).
  const assignableUsers = users.filter(
    (u) => !u.teacher_id || u.id === Number(userId),
  );

  let columns = [
    { header: "Apellidos", accessor: "last_name" },
    { header: "Nombres", accessor: "first_name" },
    { header: "Teléfonos", accessor: "phone" },
  ];

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

          <DeleteButton
            title="Eliminar Docente"
            onClick={() => handleDelete(row)}
          />
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
        <button
          type="button"
          onClick={() => setGenerateUser((prev) => !prev)}
          className={`w-full flex items-center justify-between p-3 border rounded mb-1 cursor-pointer transition
            ${
              generateUser
                ? "border-[#0cc0df] bg-[#0cc0df]/10 text-[#0a8ea3]"
                : "border-gray-300 text-gray-500"
            }`}
        >
          <span className="text-sm text-left">
            {generateUser
              ? "Se va a generar un usuario de acceso para este docente"
              : "No se va a generar usuario de acceso"}
          </span>

          <span className="text-xs font-semibold whitespace-nowrap ml-3">
            {generateUser ? "Generar usuario ✓" : "Generar usuario"}
          </span>
        </button>

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

        <div className="space-y-4">
          <div>
            <Label>Usuario</Label>
            <div className="flex gap-2">
              <Input
                value={newUserCredentials?.username || ""}
                onChange={() => {}}
              />

              <Button
                type="button"
                className="cursor-pointer whitespace-nowrap"
                onClick={() =>
                  copyToClipboard(newUserCredentials?.username, "username")
                }
              >
                {copiedField === "username" ? "Copiado ✓" : "Copiar"}
              </Button>
            </div>
          </div>

          <div>
            <Label>Contraseña</Label>
            <div className="flex gap-2">
              <Input
                value={newUserCredentials?.password || ""}
                onChange={() => {}}
              />

              <Button
                type="button"
                className="cursor-pointer whitespace-nowrap"
                onClick={() =>
                  copyToClipboard(newUserCredentials?.password, "password")
                }
              >
                {copiedField === "password" ? "Copiado ✓" : "Copiar"}
              </Button>
            </div>
          </div>
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

        <div className="flex justify-end mt-6">
          <Button onClick={closeFeedback}>Cerrar</Button>
        </div>
      </Modal>
    </>
  );
}
