import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import { studentService } from "../../services/student.service";
import Button from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { isAdmin } from "../../utils/auth";

export function Students() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dni, setDni] = useState("");
  const [school, setSchool] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [level, setLevel] = useState("");
  const [grade, setGrade] = useState("");

  const [errorEdit, setErrorEdit] = useState("");

  const location = useLocation();

  const fetchStudents = async () => {
    try {
      const params = new URLSearchParams(location.search);
      const status = params.get("status") || "all";

      const { data } = await studentService.getAll({ status });

      setStudents(data?.data || []);
    } catch (error) {
      console.error("Error al obtener alumnos:", error);
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [location.search]);

  const handleEdit = (student) => {
    setSelectedStudent(student);

    setFirstName(student.first_name || "");
    setLastName(student.last_name || "");
    setDni(student.dni || "");
    setSchool(student.school || "");
    setBirthDate(
      student.birth_date
        ? student.birth_date.split("T")[0]
        : ""
    );
    setLevel(student.level || "");
    setGrade(student.grade || "");

    setErrorEdit("");
    setOpenEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      setErrorEdit("");

      await studentService.update(selectedStudent.student_id, {
        first_name: firstName,
        last_name: lastName,
        dni,
        school,
        birth_date: birthDate,
        level,
        grade,
      });

      setOpenEditModal(false);
      fetchStudents();
    } catch (error) {
      console.error("Error al actualizar:", error);

      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Error al actualizar";

      setErrorEdit(message);
    }
  };

  const handleDelete = (student) => {
    setSelectedStudent(student);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await studentService.delete(selectedStudent.student_id);
      setOpenDeleteModal(false);
      fetchStudents();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const params = new URLSearchParams(location.search);
  const status = params.get("status") || "all";

const baseColumns = [
  { header: "ID", accessor: "student_id" },
  { header: "Apellido", accessor: "last_name" },
  { header: "Nombre", accessor: "first_name" },
  { header: "DNI", accessor: "dni" },
  { header: "Escuela", accessor: "school" },
  {
    header: "Fecha Nac.",
    render: (row) =>
      row.birth_date
        ? new Date(row.birth_date).toLocaleDateString("es-AR")
        : "-",
  },
  { header: "Nivel", accessor: "level" },
  { header: "Grado", accessor: "grade" },
];

const actionColumn = {
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
};

// 🔥 acá está la lógica
const columns =
  status === "active"
    ? baseColumns
    : [...baseColumns, actionColumn];

  return (
    <>
      <BasicTable title="Alumnos" columns={columns} data={students} />

      <Modal
        isOpen={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          setErrorEdit("");
        }}
      >
        <h2 className="text-lg font-semibold mb-4">
          Editar Alumno
        </h2>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">
            Nombre
          </label>
          <input
            className="w-full border p-2 rounded"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        {/* Apellido */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">
            Apellido
          </label>
          <input
            className="w-full border p-2 rounded"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        {/* DNI */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">
            DNI
          </label>
          <input
            className="w-full border p-2 rounded"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">
            Escuela
          </label>
          <input
            className="w-full border p-2 rounded"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">
            Fecha de nacimiento
          </label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">
            Nivel
          </label>
          <input
            className="w-full border p-2 rounded"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">
            Grado
          </label>
          <input
            className="w-full border p-2 rounded"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          />
        </div>

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

      {/* MODAL DELETE */}
      <Modal
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
      >
        <h2 className="text-lg font-semibold mb-4">
          ¿Eliminar alumno?
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