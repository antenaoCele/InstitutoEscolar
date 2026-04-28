import { useEffect, useState } from "react";
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import { tutorService } from "../../services/tutor.service";
import Button from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { isAdmin } from "../../utils/auth";

export function Tutors() {
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");

  const [errorEdit, setErrorEdit] = useState("");

  const fetchTutors = async () => {
    try {
      const { data } = await tutorService.getAll();
      setTutors(data?.data || []);
    } catch (error) {
      console.error("Error al obtener tutores:", error);
      setTutors([]);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  const handleEdit = (tutor) => {
    setSelectedTutor(tutor);

    setFirstName(tutor.first_name || "");
    setLastName(tutor.last_name || "");
    setDni(tutor.dni || "");
    setPhone(tutor.phone || "");

    setErrorEdit("");
    setOpenEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      setErrorEdit("");

      await tutorService.update(selectedTutor.id, {
        first_name: firstName,
        last_name: lastName,
        dni,
        phone,
      });

      setOpenEditModal(false);
      fetchTutors();
    } catch (error) {
      console.error("Error al actualizar:", error);

      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Error al actualizar";

      setErrorEdit(message);
    }
  };

  const handleDelete = (tutor) => {
    setSelectedTutor(tutor);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await tutorService.delete(selectedTutor.id);
      setOpenDeleteModal(false);
      fetchTutors();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Apellido", accessor: "last_name" },
    { header: "Nombre", accessor: "first_name" },
    { header: "DNI", accessor: "dni" },
    { header: "Teléfono", accessor: "phone" },
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
          <span className="text-gray-400 text-sm">Sin permisos</span>
        ),
    },
  ];

  return (
    <>
      <BasicTable title="Tutores" columns={columns} data={tutors} />

      <Modal
        isOpen={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          setErrorEdit("");
        }}
      >
        <h2 className="text-lg font-semibold mb-4">Editar Tutor</h2>

        <div className="mb-3"> 
          <label className="block text-sm font-medium mb-1"> 
            Apellido 
          </label> 
          <input 
            type="text" 
            className="w-full border p-2 rounded" 
            value={lastName} onChange={(e) => setLastName(e.target.value)} 
          /> 
        </div>

        <div className="mb-3"> 
          <label className="block text-sm font-medium mb-1"> 
            Nombre 
          </label> 
          <input 
            type="text" 
            className="w-full border p-2 rounded" 
            value={firstName} onChange={(e) => setFirstName(e.target.value)} 
          /> 
        </div>

        <div className="mb-3"> 
          <label className="block text-sm font-medium mb-1"> 
            DNI 
          </label> 
          <input 
            type="text" 
            className="w-full border p-2 rounded" 
            value={dni} onChange={(e) => setDni(e.target.value)} 
          /> 
        </div>

        <div className="mb-3"> 
          <label className="block text-sm font-medium mb-1"> 
            Teléfono 
          </label> 
          <input 
            type="text" 
            className="w-full border p-2 rounded" 
            value={phone} onChange={(e) => setPhone(e.target.value)} 
          /> 
        </div>

        {errorEdit && (
          <p className="text-red-500 text-sm mb-3">{errorEdit}</p>
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
            disabled={
              !firstName.trim() ||
              !lastName.trim() ||
              !dni.trim()
            }
          >
            Guardar
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
      >
        <h2 className="text-lg font-semibold mb-4">
          ¿Eliminar tutor?
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