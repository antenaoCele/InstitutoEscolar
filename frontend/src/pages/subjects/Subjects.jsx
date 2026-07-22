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
import { sortByProperty } from "../../utils/sort";
import { mapErrors } from "../../validators/helpers/errorHelpers";
import { useFeedbackModal } from "../../hooks/useFeedbackModal";
import { validateSubjectForm } from "../../validators/entities/subjects.validator";

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
  const { feedbackModal, showFeedback, closeFeedback } = useFeedbackModal();

  // ======================================================
  // MATERIA SELECCIONADA
  // ======================================================
  const [selectedSubject, setSelectedSubject] = useState(null);

  // ======================================================
  // FORMULARIO DE LA MATERIA
  // ======================================================
  const [name, setName] = useState("");

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
    setErrorsCreate({});
    setErrorsEdit({});
  };

  // ======================================================
  // FUNCIONES AUXILIARES
  // ======================================================

  // ======================================================
  // HANDLES CRUD
  // ======================================================
  const openCreate = () => {
    resetForm();
    setOpenCreateModal(true);
  };

  const handleCreate = async () => {
    const errors = validateSubjectForm({
      name,
    });

    if (Object.keys(errors).length > 0) {
      setErrorsCreate(errors);
      return;
    }

    try {
      setErrorsCreate({});

      await subjectService.create({ name });

      setOpenCreateModal(false);
      fetchSubjects();
      resetForm();

      showFeedback("Materia creada correctamente.", "success");
    } catch (error) {
      console.error(error.response?.data || error.message);

      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        setErrorsCreate(mapErrors(backendErrors));
      } else {
        showFeedback(
          error.response?.data?.message || "Error al crear la materia.",
          "error",
        );
      }
    }
  };

  const handleEdit = (subject) => {
    setSelectedSubject(subject);
    setName(subject.name);
    setOpenEditModal(true);
  };

  const handleUpdate = async () => {
    const errors = validateSubjectForm({
      name,
    });

    if (Object.keys(errors).length > 0) {
      setErrorsEdit(errors);
      return;
    }

    try {
      setErrorsEdit({});

      await subjectService.update(selectedSubject.id, { name });

      setOpenEditModal(false);
      fetchSubjects();
      resetForm();

      showFeedback("Materia actualizada correctamente.", "success");
    } catch (error) {
      console.error(error.response?.data || error.message);

      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        setErrorsEdit(mapErrors(backendErrors));
      } else {
        showFeedback(
          error.response?.data?.message || "Error al editar la materia.",
          "error",
        );
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

      showFeedback("Materia eliminada correctamente.", "success");
    } catch (error) {
      console.error(error.response?.data || error.message);

      setOpenDeleteModal(false);

      showFeedback(
        error.response?.data?.message || "Error al eliminar la materia.",
        "error",
      );
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

        <Label className="font-semibold mb-2">Nombre</Label>
        <Input
          className={inputClass(errorsCreate.name)}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errorsCreate.name}
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

      <Modal
        isOpen={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          resetForm();
        }}
      >
        <h2 className="text-xl font-bold mb-8">Editar Materia</h2>

        <Label className="font-semibold mb-2">Nombre</Label>
        <Input
          className={inputClass(errorsEdit.name)}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errorsEdit.name}
        />

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
