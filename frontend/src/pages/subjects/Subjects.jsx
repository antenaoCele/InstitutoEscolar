import { useEffect, useState } from "react";
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import { subjectService } from "../../services/subject.service";
import Button from "../../components/ui/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/Input";
import { Modal } from "../../components/ui/Modal";
import { isAdmin } from "../../utils/auth";
import {
  EditButton,
  DeleteButton,
  PlusButton,
  YesButton,
  NoButton,
} from "../../components/ui/ActionButtons";
import { sortByProperty, sortByPersonName } from "../../utils/sort";

export function Subjects() {
  // ======================================================
  // DATOS
  // ======================================================
  const [subjects, setSubjects] = useState([]);

  // ======================================================
  // FILTROS
  // ======================================================
  const [searchName, setSearchName] = useState("");

  // ======================================================
  // MODALES
  // ======================================================
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  // ======================================================
  // MATERIA SELECCIONADA
  // ======================================================
  const [selectedSubject, setSelectedSubject] = useState(null);

  // ======================================================
  // FORMULARIO DE LA MATERIA
  // ======================================================
  const [name, setName] = useState("");
  // const [selectedTeacher, setSelectedTeacher] = useState("");

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
  const fetchSubjects = async () => {
    try {
      const subjectsRes = await subjectService.getAll();

      const subjectsData = subjectsRes.data.data || [];

      setSubjects(subjectsData);
    } catch (error) {
      console.error(error);
      setSubjects([]);
    }
  };

  // ======================================================
  // RESETEO
  // ======================================================
  const resetForm = () => {
    setName("");
    setSelectedSubject(null);
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
    try {
      setErrorsCreate({});

      if (!name.trim()) {
        setErrorsCreate({
          name: "Este campo no puede estar vacío.",
        });

        return;
      }

      await subjectService.create({ name });

      setOpenCreateModal(false);

      resetForm();

      fetchSubjects();
    } catch (error) {
      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        setErrorsCreate(mapErrors(backendErrors));
      }
    }
  };

  const handleEdit = (subject) => {
    setSelectedSubject(subject);
    setName(subject.name);
    setOpenEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      setErrorsEdit({});

      if (!name.trim()) {
        setErrorsEdit({
          name: "Este campo no puede estar vacío.",
        });

        return;
      }

      await subjectService.update(selectedSubject.id, { name });

      setOpenEditModal(false);

      resetForm();

      fetchSubjects();
    } catch (error) {
      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        setErrorsEdit(mapErrors(backendErrors));
      }
    }
  };

  const handleDelete = (subject) => {
    setSelectedSubject(subject);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await subjectService.delete(selectedSubject.id);

      setOpenDeleteModal(false);

      fetchSubjects();
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.message || "Error al eliminar");
    }
  };

  // ======================================================
  // USEEFFECTS
  // ======================================================
  useEffect(() => {
    fetchSubjects();
  }, []);

  // ======================================================
  // DATOS DERIVADOS
  // ======================================================
  const filteredSubjects = [...subjects]
    .filter((s) => {
      return (
        !searchName || s.name?.toLowerCase().includes(searchName.toLowerCase())
      );
    })
    .sort(sortByProperty("name"));

  const showCreateButtons = isAdmin();

  let columns = [
    {
      header: "Materias",
      accessor: "name",
    },
    {
      header: "Planes",
      render: (row) => {
        const plans = row.plans || [];

        const containerClass =
          plans.length >= 3
            ? "h-20 overflow-y-auto pr-2"
            : "h-20 flex flex-col justify-center";

        return (
          <div className={containerClass}>
            {plans.length === 0 ? (
              <span className="text-gray-400 italic">Sin planes</span>
            ) : (
              plans.map((plan) => (
                <div key={plan.id} className="py-1">
                  {plan.name}
                </div>
              ))
            )}
          </div>
        );
      },
    },
  ];

  if (isAdmin()) {
    columns.push({
      header: "Acciones",
      render: (row) => (
        <div className="flex gap-2">
          <EditButton title="Editar Materia" onClick={() => handleEdit(row)} />

          <DeleteButton
            title="Eliminar Materia"
            onClick={() => handleDelete(row)}
          />
        </div>
      ),
    });
  }

  const tableTitle = (
    <div className="flex justify-between items-center">
      <span>Materias</span>

      {showCreateButtons && (
        <PlusButton title="Crear Materia" onClick={openCreate} />
      )}
    </div>
  );

  // ======================================================
  // RETURN
  // ======================================================
  return (
    <>
      <div className="flex gap-3 mb-4 flex-wrap">
        <Input
          placeholder="Buscar por materia"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="p-2 border border-gray-300 rounded w-60"
        />
      </div>

      <BasicTable
        title={tableTitle}
        columns={columns}
        data={filteredSubjects}
      />

      {showCreateButtons && (
        <div className="mt-8">
          <Button onClick={openCreate} className={buttonClass}>
            Crear Materia
          </Button>
        </div>
      )}

      <Modal
        isOpen={openCreateModal}
        onClose={() => {
          setOpenCreateModal(false);
          resetForm();
        }}
      >
        <h2 className="text-xl font-bold mb-8">Crear Materia</h2>

        <div className="flex flex-col mb-6">
          <Label className="font-semibold mb-2">Nombre</Label>

          <Input
            className={inputClass(errorsCreate.name)}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {errorsCreate.name && (
            <p className="text-red-500 text-sm mt-1">{errorsCreate.name}</p>
          )}
        </div>

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

      <Modal
        isOpen={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          resetForm();
        }}
      >
        <h2 className="text-xl font-bold mb-8">Editar Materia</h2>

        <div className="flex flex-col mb-6">
          <Label className="font-semibold mb-2">Nombre</Label>

          <Input
            className={inputClass(errorsEdit.name)}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {errorsEdit.name && (
            <p className="text-red-500 text-sm mt-1">{errorsEdit.name}</p>
          )}
        </div>

        <div className="flex justify-end gap-4 mt-10">
          <NoButton title="Cancelar" onClick={() => setOpenEditModal(false)} />

          <YesButton title="Aceptar" onClick={handleUpdate} />
        </div>
      </Modal>

      <Modal isOpen={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <h2 className="text-lg font-semibold mb-4">¿Eliminar Materia?</h2>

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
