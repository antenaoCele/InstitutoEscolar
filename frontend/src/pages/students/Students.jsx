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
  const [openCreateModal, setOpenCreateModal] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dni, setDni] = useState("");
  const [school, setSchool] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [level, setLevel] = useState("");
  const [grade, setGrade] = useState("");

  const [errorsCreate, setErrorsCreate] = useState({});
  const [errorEdit, setErrorEdit] = useState("");

  const location = useLocation();
  const isTeacher = !isAdmin();

  const params = new URLSearchParams(location.search);
  const status = params.get("status") || "all";

  const inputClass = (error) =>
    `w-full p-2 border rounded mb-1 
    bg-white text-black border-gray-300
    dark:bg-gray-800 dark:text-white dark:border-gray-600
    focus:outline-none focus:ring-1 focus:ring-[#0cc0df] focus:border-[#0cc0df]
    ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}`;

  const buttonClass = "cursor-pointer transition transform hover:scale-105";

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setDni("");
    setSchool("");
    setBirthDate("");
    setLevel("");
    setGrade("");
    setErrorsCreate({});
  };

  const fetchStudents = async () => {
    try {
      const { data } = await studentService.getAll({ status });
      setStudents(data?.data || []);
    } catch {
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
    setBirthDate(student.birth_date ? student.birth_date.split("T")[0] : "");
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
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Error al actualizar";

      setErrorEdit(message);
    }
  };

  const handleCreate = async () => {
    try {
      setErrorsCreate({});

      await studentService.create({
        first_name: firstName,
        last_name: lastName,
        dni,
        school,
        birth_date: birthDate,
        level,
        grade,
      });

      setOpenCreateModal(false);
      fetchStudents();
      resetForm();
    } catch (error) {
      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        const formatted = {};
        backendErrors.forEach((err) => {
          formatted[err.path] = err.msg;
        });
        setErrorsCreate(formatted);
      }
    }
  };

  const handleDelete = (student) => {
    setSelectedStudent(student);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    await studentService.delete(selectedStudent.student_id);
    setOpenDeleteModal(false);
    fetchStudents();
  };

  const openCreate = () => {
    resetForm();
    setOpenCreateModal(true);
  };

  let columns = [
    { header: "ID", accessor: "student_id" },
    { header: "Apellido", accessor: "last_name" },
    { header: "Nombre", accessor: "first_name" },
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

  if (!isTeacher) {
    columns.splice(3, 0, { header: "DNI", accessor: "dni" });
  }

  if (!isTeacher && status !== "active") {
    columns.push({
      header: "Acciones",
      render: (row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleEdit(row)}
            className={buttonClass}
          >
            Editar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(row)}
            className={buttonClass}
          >
            Eliminar
          </Button>
        </div>
      ),
    });
  }

  const showCreateButtons = !(isAdmin() && status === "active");

  const tableTitle = (
    <div className="flex items-center justify-between">
      <span>Alumnos</span>

      {showCreateButtons && (
        <Button size="sm" onClick={openCreate} className={buttonClass}>
          +
        </Button>
      )}
    </div>
  );

  return (
    <>
      <BasicTable title={tableTitle} columns={columns} data={students} />

      {showCreateButtons && (
        <div className="mt-4">
          <Button onClick={openCreate} className={buttonClass}>
            Crear Alumno
          </Button>
        </div>
      )}

      {/* CREATE */}
      <Modal isOpen={openCreateModal} onClose={() => setOpenCreateModal(false)}>
        <h2 className="text-lg font-semibold mb-4">Crear Alumno</h2>

        <label>Nombre</label>
        <input className={inputClass(errorsCreate.first_name)} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        {errorsCreate.first_name && <p className="text-red-500 text-sm mb-2">{errorsCreate.first_name}</p>}

        <label>Apellido</label>
        <input className={inputClass(errorsCreate.last_name)} value={lastName} onChange={(e) => setLastName(e.target.value)} />
        {errorsCreate.last_name && <p className="text-red-500 text-sm mb-2">{errorsCreate.last_name}</p>}

        <label>DNI</label>
        <input className={inputClass(errorsCreate.dni)} value={dni} onChange={(e) => setDni(e.target.value)} />
        {errorsCreate.dni && <p className="text-red-500 text-sm mb-2">{errorsCreate.dni}</p>}

        <label>Escuela</label>
        <input className={inputClass(errorsCreate.school)} value={school} onChange={(e) => setSchool(e.target.value)} />
        {errorsCreate.school && <p className="text-red-500 text-sm mb-2">{errorsCreate.school}</p>}

        <label>Fecha de nacimiento</label>
        <input type="date" className={inputClass(errorsCreate.birth_date)} value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
        {errorsCreate.birth_date && <p className="text-red-500 text-sm mb-2">{errorsCreate.birth_date}</p>}

        <label>Nivel</label>
        <select className={inputClass(errorsCreate.level)} value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">Seleccionar</option>
          <option value="inicial">Inicial</option>
          <option value="primario">Primario</option>
          <option value="secundario">Secundario</option>
          <option value="universitario">Universitario</option>
        </select>
        {errorsCreate.level && <p className="text-red-500 text-sm mb-2">{errorsCreate.level}</p>}

        <label>Grado</label>
        <select className={inputClass(errorsCreate.grade)} value={grade} onChange={(e) => setGrade(e.target.value)}>
          <option value="">Seleccionar</option>
          {[1,2,3,4,5,6,7].map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        {errorsCreate.grade && <p className="text-red-500 text-sm mb-2">{errorsCreate.grade}</p>}

        <div className="flex justify-end gap-2 mt-3">
          <Button variant="outline" onClick={() => setOpenCreateModal(false)} className={buttonClass}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} className={buttonClass}>
            Crear
          </Button>
        </div>
      </Modal>

      {/* EDIT */}
      <Modal isOpen={openEditModal} onClose={() => setOpenEditModal(false)}>
        <h2 className="text-lg font-semibold mb-4">Editar Alumno</h2>

        <input className={inputClass()} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <input className={inputClass()} value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <input className={inputClass()} value={dni} onChange={(e) => setDni(e.target.value)} />
        <input className={inputClass()} value={school} onChange={(e) => setSchool(e.target.value)} />
        <input type="date" className={inputClass()} value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />

        <select className={inputClass()} value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">Seleccionar</option>
          <option value="inicial">Inicial</option>
          <option value="primario">Primario</option>
          <option value="secundario">Secundario</option>
          <option value="universitario">Universitario</option>
        </select>

        <select className={inputClass()} value={grade} onChange={(e) => setGrade(e.target.value)}>
          <option value="">Seleccionar</option>
          {[1,2,3,4,5,6,7].map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        {errorEdit && <p className="text-red-500 text-sm">{errorEdit}</p>}

        <div className="flex justify-end gap-2 mt-3">
          <Button variant="outline" onClick={() => setOpenEditModal(false)} className={buttonClass}>
            Cancelar
          </Button>
          <Button onClick={handleUpdate} className={buttonClass}>
            Guardar
          </Button>
        </div>
      </Modal>

      {/* DELETE */}
      <Modal isOpen={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <h2 className="text-lg font-semibold mb-4">¿Eliminar alumno?</h2>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpenDeleteModal(false)} className={buttonClass}>
            Cancelar
          </Button>
          <Button onClick={confirmDelete} className={buttonClass}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </>
  );
}