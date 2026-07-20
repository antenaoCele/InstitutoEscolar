import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import { teacherService } from "../../services/teacher.service";
import { planService } from "../../services/plan.service";
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
import { validateTeacher } from "../../validators/entities/teachers.validators";

export function Teachers() {
  // ======================================================
  // DATOS
  // ======================================================
  const [teachers, setTeachers] = useState([]);
  const [plans, setPlans] = useState([]);

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

  // ======================================================
  // RESETEO
  // ======================================================
  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setDni("");
    setPhone("");
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
      await teacherService.create({
        first_name: firstName,
        last_name: lastName,
        dni,
        phone,
      });

      setOpenCreateModal(false);
      fetchTeachers();
      resetForm();
    } catch (error) {
      // Mantiene el fallback por si el backend rechaza algo que se le pasó al front
      const backendErrors = error.response?.data?.errors;
      if (backendErrors) setErrorsCreate(mapErrors(backendErrors));
    }
  };

  const handleEdit = (teacher) => {
    setSelectedTeacher(teacher);

    setFirstName(teacher.first_name || "");
    setLastName(teacher.last_name || "");
    setDni(teacher.dni || "");
    setPhone(teacher.phone || "");

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
      });

      setOpenEditModal(false);
      fetchTeachers();
    } catch (error) {
      const backendErrors = error.response?.data?.errors;
      if (backendErrors) setErrorsEdit(mapErrors(backendErrors));
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
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert(error.response?.data?.message || "Error al eliminar");
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

  let columns = [
    { header: "Apellidos", accessor: "last_name" },
    { header: "Nombres", accessor: "first_name" },
    { header: "Teléfonos", accessor: "phone" },
  ];

  if (isAdmin()) {
    columns.splice(3, 0, { header: "DNI", accessor: "dni" });
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

        <Input
          label="Nombre"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={errorsCreate.first_name}
        />

        <Input
          label="Apellido"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          error={errorsCreate.last_name}
        />

        <Input
          label="DNI"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          error={errorsCreate.dni}
        />

        <Input
          label="Teléfono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errorsCreate.phone}
        />

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

        <Input
          label="Nombre"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={errorsEdit.first_name}
        />

        <Input
          label="Apellido"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          error={errorsEdit.last_name}
        />

        <Input
          label="DNI"
          value={dni}
          onChange={(e) => setDni(e.target.value)} // Nota: corregido un typo menor aquí que podría fallar
          error={errorsEdit.dni}
        />

        <Input
          label="Teléfono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errorsEdit.phone}
        />

        <div className="flex justify-end gap-4 mt-10">
          <NoButton title="Cancelar" onClick={() => setOpenEditModal(false)} />

          <YesButton title="Aceptar" onClick={handleUpdate} />
        </div>
      </Modal>

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
    </>
  );
}
