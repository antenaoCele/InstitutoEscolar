import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import { studentService } from "../../services/student.service";
import { teacherService } from "../../services/teacher.service";
import { planService } from "../../services/plan.service";
import Button from "../../components/ui/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/Input";
import Select from "../../components/form/Select";
import SubmitButton from "../../components/form/SubmitButton";
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

  const params = new URLSearchParams(location.search);
  const status = params.get("status") || "all";

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
      const rawData = data?.data || [];

      // Eliminar duplicados basados en el ID
      const uniqueStudents = Array.from(
        new Map(rawData.map((s) => [s.id, s])).values(),
      );

      setStudents(uniqueStudents);
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

    const matchDNI = !textDNI || s.dni?.toString().includes(textDNI);

    const matchSchool =
      !textSchool || s.school?.toLowerCase().includes(textSchool);

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

    if (!firstName.trim())
      newErrors.first_name = "Este campo no puede estar vacío.";
    if (!lastName.trim())
      newErrors.last_name = "Este campo no puede estar vacío.";
    if (!dni.trim()) newErrors.dni = "Este campo no puede estar vacío.";
    if (!school.trim()) newErrors.school = "Este campo no puede estar vacío.";
    if (!birthDate) newErrors.birth_date = "Ingrese una fecha válida.";
    if (!level) newErrors.level = "Seleccione una opción válida.";
    if (!grade) newErrors.grade = "Seleccione una opción válida.";

    if (Object.keys(newErrors).length > 0) {
      setErrorsEdit(newErrors);
      return;
    }

    try {
      setErrorsEdit({});

      await studentService.update(selectedStudent.id, {
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
      await studentService.delete(selectedStudent.id);
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
    { header: "Apellido", accessor: "last_name" },
    { header: "Nombre", accessor: "first_name" },
    {
      header: "Fecha de Nacimiento",
      render: (row) =>
        row.birth_date
          ? new Date(row.birth_date).toLocaleDateString("es-AR")
          : "-",
    },
    { header: "Colegio o Universidad", accessor: "school" },
    { header: "Nivel", accessor: "level" },
    { header: "Grado", accessor: "grade" },
  ];

  if (isAdmin()) {
    columns.splice(3, 0, { header: "DNI", accessor: "dni" });
  }

  if (isAdmin() && status !== "active") {
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

  const showCreateButtons = isAdmin() && status !== "active";

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
      <div className="flex gap-3 mb-4 flex-wrap">
        <Input
          placeholder="Buscar por nombre o apellido"
          value={searchFirstLastName}
          onChange={(e) => setSearchFirstLastName(e.target.value)}
          className="w-60"
        />

        <Input
          placeholder="Buscar por DNI"
          value={searchDNI}
          onChange={(e) => setSearchDNI(e.target.value)}
          className="w-40"
        />

        <Input
          placeholder="Buscar por colegio o universidad"
          value={searchSchool}
          onChange={(e) => setSearchSchool(e.target.value)}
          className="w-60"
        />

        <Select
          value={selectedTeacher}
          onChange={(e) => setSelectedTeacher(e.target.value)}
          className="p-2 border border-gray-300 rounded w-60"
        >
          <option value="">Todos los docentes</option>

          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.last_name}, {teacher.first_name}
            </option>
          ))}
        </Select>

        <Select
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
          className="p-2 border border-gray-300 rounded w-60"
        >
          <option value="">Todos los planes</option>

          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name}
            </option>
          ))}
        </Select>
      </div>

      <BasicTable
        title={tableTitle}
        columns={columns}
        data={filteredStudents}
      />

      {showCreateButtons && (
        <div className="mt-8">
          <Button onClick={openCreate} className={buttonClass}>
            Crear Alumno
          </Button>
        </div>
      )}

      <Modal isOpen={openCreateModal} onClose={() => setOpenCreateModal(false)}>
        <h2 className="text-xl font-bold mb-8">Crear Alumno</h2>

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
          label="Colegio o Universidad"
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          error={errorsCreate.school}
        />

        <Input
          label="Fecha de nacimiento"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          error={errorsCreate.birth_date}
        />

        <Select
          label="Nivel"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          error={errorsCreate.level}
        >
          <option value="">Seleccione un nivel</option>
          <option value="Inicial">Inicial</option>
          <option value="Primario">Primario</option>
          <option value="Secundario">Secundario</option>
          <option value="Universitario">Universitario</option>
        </Select>

        <Select
          label="Grado"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          error={errorsCreate.grade}
        >
          <option value="">Seleccione un grado</option>
          {[1, 2, 3, 4, 5, 6, 7].map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </Select>

        <div className="flex justify-end gap-4 mt-10">
          <Button
            variant="outline"
            onClick={() => setOpenCreateModal(false)}
            className={buttonClass}
          >
            Cancelar
          </Button>

          <Button onClick={handleCreate} className={buttonClass}>
            Crear
          </Button>
        </div>
      </Modal>

      <Modal isOpen={openEditModal} onClose={() => setOpenEditModal(false)}>
        <h2 className="text-xl font-bold mb-8">Editar Alumno</h2>

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
          onChange={(e) => setDni(e.target.value)}
          error={errorsEdit.dni}
        />

        <Input
          label="Colegio o Universidad"
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          error={errorsEdit.school}
        />

        <Input
          label="Fecha de nacimiento"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          error={errorsEdit.birth_date}
        />

        <Select
          label="Nivel"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          error={errorsEdit.level}
        >
          <option value="">Seleccione un nivel</option>
          <option value="Inicial">Inicial</option>
          <option value="Primario">Primario</option>
          <option value="Secundario">Secundario</option>
          <option value="Universitario">Universitario</option>
        </Select>

        <Select
          label="Grado"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          error={errorsEdit.grade}
        >
          <option value="">Seleccione un grado</option>
          {[1, 2, 3, 4, 5, 6, 7].map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </Select>

        <div className="flex justify-end gap-4 mt-10">
          <Button
            variant="outline"
            onClick={() => setOpenEditModal(false)}
            className={buttonClass}
          >
            Cancelar
          </Button>

          <Button onClick={handleUpdate} className={buttonClass}>
            Guardar
          </Button>
        </div>
      </Modal>

      <Modal isOpen={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <h2 className="text-lg font-semibold mb-4">¿Eliminar alumno?</h2>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpenDeleteModal(false)}
            className={buttonClass}
          >
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
