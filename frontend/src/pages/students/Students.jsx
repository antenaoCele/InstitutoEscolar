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

  const [teachers, setTeachers] = useState([]);
  const [plans, setPlans] = useState([]);

  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");

  const [searchFirstLastName, setSearchFirstLastName] = useState("");
  const [searchDNI, setSearchDNI] = useState("");
  const [searchSchool, setSearchSchool] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dni, setDni] = useState("");
  const [school, setSchool] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [level, setLevel] = useState("");
  const [grade, setGrade] = useState("");

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [errorsCreate, setErrorsCreate] = useState({});
  const [errorsEdit, setErrorsEdit] = useState({});

  const location = useLocation();

  const isTeacher = !isAdmin();

  const params = new URLSearchParams(location.search);

  const status = params.get("status") || "all";

  const buttonClass =
    "cursor-pointer transition transform hover:scale-105";

  const inputClass = (error) =>
    `w-full p-2 border rounded mb-1
    border-gray-300
    focus:outline-none focus:ring-1 focus:ring-[#0cc0df] focus:border-[#0cc0df]
    ${
      error
        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
        : ""
    }`;

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
      const queryParams = {
        status,
      };

      if (selectedTeacher) {
        queryParams.teacher_id = selectedTeacher;
      }

      if (selectedPlan) {
        queryParams.plan_id = selectedPlan;
      }

      const { data } =
        await studentService.getAll(queryParams);

      setStudents(data?.data || []);
    } catch (error) {
      console.error(error);

      setStudents([]);
    }
  };

  const fetchFilters = async () => {
    try {
      const [teachersRes, plansRes] =
        await Promise.all([
          teacherService.getAll(),
          planService.getAll(),
        ]);

      setTeachers(teachersRes.data.data || []);
      setPlans(plansRes.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [status, selectedTeacher, selectedPlan]);

  useEffect(() => {
    fetchFilters();
  }, []);

  const filteredStudents = students.filter((s) => {
    const textName =
      searchFirstLastName.toLowerCase();

    const textDNI = searchDNI;

    const textSchool =
      searchSchool.toLowerCase();

    const matchName =
      !textName ||
      s.first_name
        ?.toLowerCase()
        .includes(textName) ||
      s.last_name
        ?.toLowerCase()
        .includes(textName);

    const matchDNI =
      !textDNI ||
      s.dni?.toString().includes(textDNI);

    const matchSchool =
      !textSchool ||
      s.school
        ?.toLowerCase()
        .includes(textSchool);

    return (
      matchName &&
      matchDNI &&
      matchSchool
    );
  });

  const openCreate = () => {
    resetForm();

    setOpenCreateModal(true);
  };

  const handleCreate = async () => {
    try {
      setErrorsCreate({});

      const newErrors = {};

      if (!firstName.trim()) {
        newErrors.first_name =
          "Este campo está vacío.";
      }

      if (!lastName.trim()) {
        newErrors.last_name =
          "Este campo está vacío.";
      }

      if (!dni.trim()) {
        newErrors.dni =
          "Este campo está vacío.";
      }

      if (!school.trim()) {
        newErrors.school =
          "Este campo está vacío.";
      }

      if (!birthDate) {
        newErrors.birth_date =
          "Seleccione una fecha válida.";
      }

      if (!level) {
        newErrors.level =
          "Seleccione una opción válida.";
      }

      if (!grade) {
        newErrors.grade =
          "Seleccione una opción válida.";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrorsCreate(newErrors);

        return;
      }

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

      resetForm();

      fetchStudents();
    } catch (error) {
      const backendErrors =
        error.response?.data?.errors;

      if (backendErrors) {
        setErrorsCreate(
          mapErrors(backendErrors)
        );
      }
    }
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);

    setFirstName(student.first_name || "");
    setLastName(student.last_name || "");
    setDni(student.dni || "");
    setSchool(student.school || "");

    setBirthDate(
      student.birth_date?.split("T")[0] || ""
    );

    setLevel(student.level || "");
    setGrade(student.grade || "");

    setErrorsEdit({});

    setOpenEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      setErrorsEdit({});

      const newErrors = {};

      if (!firstName.trim()) {
        newErrors.first_name =
          "Este campo está vacío.";
      }

      if (!lastName.trim()) {
        newErrors.last_name =
          "Este campo está vacío.";
      }

      if (!dni.trim()) {
        newErrors.dni =
          "Este campo está vacío.";
      }

      if (!school.trim()) {
        newErrors.school =
          "Este campo está vacío.";
      }

      if (!birthDate) {
        newErrors.birth_date =
          "Seleccione una fecha válida.";
      }

      if (!level) {
        newErrors.level =
          "Seleccione una opción válida.";
      }

      if (!grade) {
        newErrors.grade =
          "Seleccione una opción válida.";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrorsEdit(newErrors);

        return;
      }

      await studentService.update(
        selectedStudent.id,
        {
          first_name: firstName,
          last_name: lastName,
          dni,
          school,
          birth_date: birthDate,
          level,
          grade,
        }
      );

      setOpenEditModal(false);

      resetForm();

      fetchStudents();
    } catch (error) {
      const backendErrors =
        error.response?.data?.errors;

      if (backendErrors) {
        setErrorsEdit(
          mapErrors(backendErrors)
        );
      }
    }
  };

  const handleDelete = (student) => {
    setSelectedStudent(student);

    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await studentService.delete(
        selectedStudent.id
      );

      setOpenDeleteModal(false);

      fetchStudents();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Error al eliminar"
      );
    }
  };

  let columns = [
    { header: "ID", accessor: "id" },
    { header: "Apellido", accessor: "last_name" },
    { header: "Nombre", accessor: "first_name" },
    {
      header: "Colegio o Universidad",
      accessor: "school",
    },
    {
      header: "Fecha de Nacimiento",
      render: (row) =>
        row.birth_date
          ? new Date(
              row.birth_date
            ).toLocaleDateString("es-AR")
          : "-",
    },
    { header: "Nivel", accessor: "level" },
    { header: "Grado", accessor: "grade" },
  ];

  if (!isTeacher) {
    columns.splice(3, 0, {
      header: "DNI",
      accessor: "dni",
    });
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

  const showCreateButtons =
    isAdmin() && status !== "active";

  const tableTitle = (
    <div className="flex justify-between items-center">
      <span>Alumnos</span>

      {showCreateButtons && (
        <Button
          size="sm"
          onClick={openCreate}
          className={buttonClass}
        >
          +
        </Button>
      )}
    </div>
  );

  return (
    <>
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          placeholder="🔍 Buscar por Nombre o Apellido"
          value={searchFirstLastName}
          onChange={(e) =>
            setSearchFirstLastName(
              e.target.value
            )
          }
          className="p-2 border border-gray-300 rounded w-60"
        />

        <input
          placeholder="🔍 Buscar por DNI"
          value={searchDNI}
          onChange={(e) =>
            setSearchDNI(e.target.value)
          }
          className="p-2 border border-gray-300 rounded w-40"
        />

        <input
          placeholder="🔍 Buscar por Colegio o Universidad"
          value={searchSchool}
          onChange={(e) =>
            setSearchSchool(e.target.value)
          }
          className="p-2 border border-gray-300 rounded w-60"
        />

        <select
          value={selectedTeacher}
          onChange={(e) =>
            setSelectedTeacher(e.target.value)
          }
          className="p-2 border border-gray-300 rounded w-60"
        >
          <option value="">
            👨‍🏫 Todos los docentes
          </option>

          {teachers.map((teacher) => (
            <option
              key={teacher.id}
              value={teacher.id}
            >
              {teacher.first_name}{" "}
              {teacher.last_name}
            </option>
          ))}
        </select>

        <select
          value={selectedPlan}
          onChange={(e) =>
            setSelectedPlan(e.target.value)
          }
          className="p-2 border border-gray-300 rounded w-60"
        >
          <option value="">
            📘 Todos los planes
          </option>

          {plans.map((plan) => (
            <option
              key={plan.id}
              value={plan.id}
            >
              {plan.name}
            </option>
          ))}
        </select>
      </div>

      <BasicTable
        title={tableTitle}
        columns={columns}
        data={filteredStudents}
      />

      {showCreateButtons && (
        <div className="mt-8">
          <Button
            onClick={openCreate}
            className={buttonClass}
          >
            Crear Alumno
          </Button>
        </div>
      )}
    </>
  );
}