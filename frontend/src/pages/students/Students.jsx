import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import { studentService } from "../../services/student.service";
import { teacherService } from "../../services/teacher.service";
import { planService } from "../../services/plan.service";
import Button from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { isAdmin } from "../../utils/auth";

export function Students() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  const [searchFirstLastName, setSearchFirstLastName] = useState("");
  const [searchDNI, setSearchDNI] = useState("");
  const [searchSchool, setSearchSchool] = useState("");

  const [teachers, setTeachers] = useState([]);
  const [plans, setPlans] = useState([]);

  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dni, setDni] = useState("");
  const [school, setSchool] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [level, setLevel] = useState("");
  const [grade, setGrade] = useState("");

  const [errorsCreate, setErrorsCreate] = useState({});
  const [errorsEdit, setErrorsEdit] = useState({});

  const location = useLocation();
  const isTeacher = !isAdmin();

  const params = new URLSearchParams(location.search);
  const status = params.get("status") || "all";

  const inputClass = (error) =>
    `w-full p-2 border rounded mb-1 
    border-gray-300
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
    setErrorsEdit({});
  };

  const mapErrors = (errors) => {
    const formatted = {};
    errors.forEach((e) => {
      formatted[e.path] = e.msg;
    });
    return formatted;
  };

  const fetchStudents = async () => {
    try {
      const params = { status };

    if (selectedTeacher) {
      params.teacher_id = selectedTeacher;
    }

    if (selectedPlan) {
      params.plan_id = selectedPlan;
    }

const { data } = await studentService.getAll(params);
      setStudents(data?.data || []);
    } catch {
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [location.search, selectedTeacher, selectedPlan]);

  useEffect(() => {
  const fetchFilters = async () => {
    try {
      const teachersRes = await teacherService.getAll();
      const plansRes = await planService.getAll();

      setTeachers(teachersRes.data.data || []);
      setPlans(plansRes.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  fetchFilters();
}, []);


  const filteredStudents = students.filter((s) => {
    const textName = searchFirstLastName.toLowerCase();
    const textDNI = searchDNI;
    const textSchool = searchSchool.toLowerCase();

    const matchName =
      !textName ||
      s.first_name?.toLowerCase().includes(textName) ||
      s.last_name?.toLowerCase().includes(textName);

    const matchDNI =
      !textDNI ||
      s.dni?.toString().includes(textDNI);

    const matchSchool =
      !textSchool ||
      s.school?.toLowerCase().includes(textSchool);

    return matchName && matchDNI && matchSchool;
  });


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
      if (backendErrors) setErrorsCreate(mapErrors(backendErrors));
    }
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);

    setFirstName(student.first_name || "");
    setLastName(student.last_name || "");
    setDni(student.dni || "");
    setSchool(student.school || "");
    setBirthDate(student.birth_date?.split("T")[0] || "");
    setLevel(student.level || "");
    setGrade(student.grade || "");

    setErrorsEdit({});
    setOpenEditModal(true);
  };

  const handleUpdate = async () => {
    const newErrors = {};

    if (!firstName.trim()) newErrors.first_name = "Este campo está vacío o contiene caracteres no válidos.";
    if (!lastName.trim()) newErrors.last_name = "Este campo está vacío o contiene caracteres no válidos.";
    if (!dni.trim()) newErrors.dni = "Este campo está vacío o contiene caracteres no válidos.";
    if (!school.trim()) newErrors.school = "Este campo está vacío o contiene caracteres no válidos.";
    if (!birthDate) newErrors.birth_date = "Seleccione una fecha válida.";
    if (!level) newErrors.level = "Seleccione una opción válida.";
    if (!grade) newErrors.grade = "Seleccione una opción válida.";

    if (Object.keys(newErrors).length > 0) {
      setErrorsEdit(newErrors);
      return;
    }

    try {
      setErrorsEdit({});

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
      const backendErrors = error.response?.data?.errors;
      if (backendErrors) setErrorsEdit(mapErrors(backendErrors));
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
    console.error(error.response?.data || error.message);
    alert(error.response?.data?.message || "Error al eliminar");
  }
};

  const openCreate = () => {
    resetForm();
    setOpenCreateModal(true);
  };

  let columns = [
    { header: "ID", accessor: "student_id" },
    { header: "Apellido", accessor: "last_name" },
    { header: "Nombre", accessor: "first_name" },
    { header: "Colegio o Universidad", accessor: "school" },
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
          <Button size="sm" onClick={() => handleEdit(row)} className={buttonClass}>
            Editar
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleDelete(row)} className={buttonClass}>
            Eliminar
          </Button>
        </div>
      ),
    });
  }

  const showCreateButtons = !(isAdmin() && status === "active");

  const tableTitle = (
    <div className="flex justify-between items-center">
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
 {/* BUSCADORES */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          placeholder=" 🔍 Buscar por Nombre o Apellido"
          value={searchFirstLastName}
          onChange={(e) => setSearchFirstLastName(e.target.value)}
          className="p-2 border border-gray-300 rounded w-60"
        />

        <input
          placeholder="🔍 Buscar por DNI"
          value={searchDNI}
          onChange={(e) => setSearchDNI(e.target.value)}
          className="p-2 border border-gray-300 rounded w-40"
        />

        <input
          placeholder="🔍 Buscar por Colegio o Universidad"
          value={searchSchool}
          onChange={(e) => setSearchSchool(e.target.value)}
          className="p-2 border border-gray-300 rounded w-60"
        />

        <select
  value={selectedTeacher}
  onChange={(e) => setSelectedTeacher(e.target.value)}
  className="p-2 border border-gray-300 rounded w-60"
>
  <option value="">👨‍🏫 Todos los docentes</option>

  {teachers.map((teacher) => (
    <option key={teacher.id} value={teacher.id}>
      {teacher.first_name} {teacher.last_name}
    </option>
  ))}
</select>

<select
  value={selectedPlan}
  onChange={(e) => setSelectedPlan(e.target.value)}
  className="p-2 border border-gray-300 rounded w-60"
>
  <option value="">📘 Todos los planes</option>

  {plans.map((plan) => (
    <option key={plan.id} value={plan.id}>
      {plan.name}
    </option>
  ))}
</select>

      </div>

      
    <BasicTable title={tableTitle} columns={columns}  data={filteredStudents} />

    {showCreateButtons && (
      <div className="mt-8">
        <Button onClick={openCreate} className={buttonClass}>
          Crear Alumno
        </Button>
      </div>
    )}

    {/* CREATE MODAL */}
    <Modal isOpen={openCreateModal} onClose={() => setOpenCreateModal(false)}>
      <h2 className="text-xl font-bold mb-8">Crear Alumno</h2>

      <div className="flex flex-col mb-6">
        <label className="font-semibold mb-2">Nombre</label>
        <input className={inputClass(errorsCreate.first_name)} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        {errorsCreate.first_name && <p className="text-red-500 text-sm mt-1">{errorsCreate.first_name}</p>}
      </div>

      <div className="flex flex-col mb-6">
        <label className="font-semibold mb-2">Apellido</label>
        <input className={inputClass(errorsCreate.last_name)} value={lastName} onChange={(e) => setLastName(e.target.value)} />
        {errorsCreate.last_name && <p className="text-red-500 text-sm mt-1">{errorsCreate.last_name}</p>}
      </div>

      <div className="flex flex-col mb-6">
        <label className="font-semibold mb-2">DNI</label>
        <input className={inputClass(errorsCreate.dni)} value={dni} onChange={(e) => setDni(e.target.value)} />
        {errorsCreate.dni && <p className="text-red-500 text-sm mt-1">{errorsCreate.dni}</p>}
      </div>

      <div className="flex flex-col mb-6">
        <label className="font-semibold mb-2">Colegio o Universidad</label>
        <input className={inputClass(errorsCreate.school)} value={school} onChange={(e) => setSchool(e.target.value)} />
        {errorsCreate.school && <p className="text-red-500 text-sm mt-1">{errorsCreate.school}</p>}
      </div>

      <div className="flex flex-col mb-6">
        <label className="font-semibold mb-2">Fecha de nacimiento</label>
        <input type="date" className={inputClass(errorsCreate.birth_date)} value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
        {errorsCreate.birth_date && <p className="text-red-500 text-sm mt-1">{errorsCreate.birth_date}</p>}
      </div>

      <div className="flex flex-col mb-6">
        <label className="font-semibold mb-2">Nivel</label>
        <select className={inputClass(errorsCreate.level)} value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="" disabled>Seleccionar</option>
          <option value="Inicial">Inicial</option>
          <option value="Primario">Primario</option>
          <option value="Secundario">Secundario</option>
          <option value="Universitario">Universitario</option>
        </select>
        {errorsCreate.level && <p className="text-red-500 text-sm mt-1">{errorsCreate.level}</p>}
      </div>

      <div className="flex flex-col mb-6">
        <label className="font-semibold mb-2">Grado</label>
        <select className={inputClass(errorsCreate.grade)} value={grade} onChange={(e) => setGrade(e.target.value)}>
          <option value="" disabled>Seleccionar</option>
          {[1, 2, 3, 4, 5, 6, 7].map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        {errorsCreate.grade && <p className="text-red-500 text-sm mt-1">{errorsCreate.grade}</p>}
      </div>

      <div className="flex justify-end gap-4 mt-10">
        <Button variant="outline" onClick={() => setOpenCreateModal(false)}>Cancelar</Button>
        <Button onClick={handleCreate}>Crear</Button>
      </div>
    </Modal>

    {/* EDIT MODAL */}
    <Modal isOpen={openEditModal} onClose={() => setOpenEditModal(false)}>
      <h2 className="text-xl font-bold mb-8">Editar Alumno</h2>

      <div className="flex flex-col mb-6">
        <label className="font-semibold mb-2">Nombre</label>
        <input className={inputClass(errorsEdit.first_name)} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        {errorsEdit.first_name && <p className="text-red-500 text-sm mt-1">{errorsEdit.first_name}</p>}
      </div>

      <div className="flex flex-col mb-6">
        <label className="font-semibold mb-2">Apellido</label>
        <input className={inputClass(errorsEdit.last_name)} value={lastName} onChange={(e) => setLastName(e.target.value)} />
        {errorsEdit.last_name && <p className="text-red-500 text-sm mt-1">{errorsEdit.last_name}</p>}
      </div>

      <div className="flex flex-col mb-6">
        <label className="font-semibold mb-2">DNI</label>
        <input className={inputClass(errorsEdit.dni)} value={dni} onChange={(e) => setDni(e.target.value)} />
        {errorsEdit.dni && <p className="text-red-500 text-sm mt-1">{errorsEdit.dni}</p>}
      </div>

      <div className="flex flex-col mb-6">
        <label className="font-semibold mb-2">Colegio o Universidad</label>
        <input className={inputClass(errorsEdit.school)} value={school} onChange={(e) => setSchool(e.target.value)} />
        {errorsEdit.school && <p className="text-red-500 text-sm mt-1">{errorsEdit.school}</p>}
      </div>

      <div className="flex flex-col mb-6">
        <label className="font-semibold mb-2">Fecha de nacimiento</label>
        <input type="date" className={inputClass(errorsEdit.birth_date)} value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
        {errorsEdit.birth_date && <p className="text-red-500 text-sm mt-1">{errorsEdit.birth_date}</p>}
      </div>

      <div className="flex flex-col mb-6">
        <label className="font-semibold mb-2">Nivel</label>
        <select className={inputClass(errorsEdit.level)} value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="" disabled>Seleccionar</option>
          <option value="Inicial">Inicial</option>
          <option value="Primario">Primario</option>
          <option value="Secundario">Secundario</option>
          <option value="Universitario">Universitario</option>
        </select>
        {errorsEdit.level && <p className="text-red-500 text-sm mt-1">{errorsEdit.level}</p>}
      </div>

      <div className="flex flex-col mb-6">
        <label className="font-semibold mb-2">Grado</label>
        <select className={inputClass(errorsEdit.grade)} value={grade} onChange={(e) => setGrade(e.target.value)}>
          <option value="" disabled>Seleccionar</option>
          {[1, 2, 3, 4, 5, 6, 7].map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        {errorsEdit.grade && <p className="text-red-500 text-sm mt-1">{errorsEdit.grade}</p>}
      </div>

      <div className="flex justify-end gap-4 mt-10">
        <Button variant="outline" onClick={() => setOpenEditModal(false)}>Cancelar</Button>
        <Button onClick={handleUpdate}>Guardar</Button>
      </div>
    </Modal>

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