import { useEffect, useState } from "react";
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import { subjectService } from "../../services/subject.service";
import Button from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { isAdmin } from "../../utils/auth";

export function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [name, setName] = useState("");
  const [errorEdit, setErrorEdit] = useState("");

  // =========================
  // FETCH
  // =========================
  const fetchSubjects = async () => {
    try {
      const { data } = await subjectService.getAll();
      setSubjects(data?.data || []);
    } catch (error) {
      console.error("Error al obtener materias:", error);
      setSubjects([]);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // =========================
  // EDITAR
  // =========================
  const handleEdit = (subject) => {
    setSelectedSubject(subject);
    setName(subject.name);
    setErrorEdit("");
    setOpenEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      setErrorEdit("");

      await subjectService.update(selectedSubject.id, { name });

      setOpenEditModal(false);
      fetchSubjects();
    } catch (error) {
      console.error("Error al actualizar:", error);

      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Error al actualizar";

      setErrorEdit(message);
    }
  };

  // =========================
  // ELIMINAR
  // =========================
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
      console.error("Error al eliminar:", error);
    }
  };

  // =========================
  // COLUMNAS
  // =========================
  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Nombre", accessor: "name" },
    {
      header: "Acciones",
      render: (row) =>
        isAdmin() ? (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleEdit(row)}>
              Editar
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDelete(row)}
            >
              Eliminar
            </Button>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">
            Sin permisos
          </span>
        ),
    },
  ];

  return (
    <>
      <BasicTable
        title="Materias"
        columns={columns}
        data={subjects}
      />

      {/* ================= MODAL EDITAR ================= */}
      <Modal
        isOpen={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          setErrorEdit("");
        }}
      >
        <h2 className="text-lg font-semibold mb-4">
          Editar Materia
        </h2>

        <div className="mb-3"> 
          <label className="block text-sm font-medium mb-1"> 
            Materia 
          </label> 
          <input 
            type="text" 
            className="w-full border p-2 rounded" 
            value={name} onChange={(e) => setName(e.target.value)} 
          /> 
        </div>

        {/* 🔥 ERROR */}
        {errorEdit && (
          <p className="text-red-500 text-sm mb-3">
            {errorEdit}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setOpenEditModal(false);
              setErrorEdit("");
            }}
          >
            Cancelar
          </Button>

          <Button
            onClick={handleUpdate}
            disabled={!name.trim()}
          >
            Guardar
          </Button>
        </div>
      </Modal>

      {/* ================= MODAL ELIMINAR ================= */}
      <Modal
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
      >
        <h2 className="text-lg font-semibold mb-4">
          ¿Eliminar materia?
        </h2>

        <p className="text-gray-600 mb-4">
          Esta acción no se puede deshacer.
        </p>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpenDeleteModal(false)}
          >
            Cancelar
          </Button>

          <Button onClick={confirmDelete}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </>
  );
}