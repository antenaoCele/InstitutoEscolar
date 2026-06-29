import { useEffect, useState } from "react";
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
import { studentPlanService } from "../../services/studenPlan.service";
import { isAdmin } from "../../utils/auth";
import {
  PencilIcon,
  TrashBinIcon,
  CloseLineIcon,
  SaveIcon,
  MoreIcon,
  CreateIcon,
  MoreInfoIcon,
} from "../../icons";

export function Students() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);

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

  const [removedClasses, setRemovedClasses] = useState([]);

  // Estado para manejar múltiples planes en el formulario
  const [formClasses, setFormClasses] = useState([
    {
      teacher_id: "",
      plan_id: "",
      availablePlans: [],
    },
  ]);

  const [errorsCreate, setErrorsCreate] = useState({});
  const [errorsEdit, setErrorsEdit] = useState({});

  const [selectedStatus, setSelectedStatus] = useState("");

  const buttonClass = "cursor-pointer transition transform hover:scale-105";

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setDni("");
    setSchool("");
    setBirthDate("");
    setLevel("");
    setGrade("");
    setFormClasses([
      {
        teacher_id: "",
        plan_id: "",
        availablePlans: [],
      },
    ]);
    setErrorsCreate({});
    setErrorsEdit({});
    setRemovedClasses([]);
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
      const params = {};

      if (selectedTeacher) {
        params.teacher_id = selectedTeacher;
      }

      if (selectedPlan) {
        params.plan_id = selectedPlan;
      }

      if (selectedStatus) {
        params.status = selectedStatus;
      }

      const { data } = await studentService.getAll(params);
      const rawData = data?.data || [];

      // Agrupar planes por alumno para visualización múltiple
      const studentMap = new Map();
      rawData.forEach((row) => {
        if (!studentMap.has(row.id)) {
          studentMap.set(row.id, { ...row, activePlans: [] });
        }
        if (row.student_plan_id) {
          const student = studentMap.get(row.id);

          const exists = student.activePlans.some(
            (p) => p.student_plan_id === row.student_plan_id,
          );

          if (!exists && row.student_plan_id) {
            student.activePlans.push({
              student_plan_id: row.student_plan_id,
              teacher_id: row.teacher_id,
              teacher_name: row.teacher_last_name
                ? `${row.teacher_last_name}, ${row.teacher_first_name}`
                : "-",
              plan_id: row.plan_id,
              plan_name: row.plan_name,
              start_date: row.start_date,
            });
          }
        }
      });

      setStudents(Array.from(studentMap.values()));
      const studentsData = Array.from(studentMap.values());

      console.log(studentsData);

      setStudents(studentsData);
    } catch {
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedTeacher, selectedPlan, selectedStatus]);

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

      await studentService.createWithPlan({
        first_name: firstName,
        last_name: lastName,
        dni,
        school,
        birth_date: birthDate,
        level,
        grade,
        formClasses: formClasses.filter((p) => p.teacher_id && p.plan_id),
      });

      setOpenCreateModal(false);
      fetchStudents();
      resetForm();
    } catch (error) {
      console.error("Error al crear:", error.response?.data || error.message);
      const backendErrors = error.response?.data?.errors;
      if (backendErrors) setErrorsCreate(mapErrors(backendErrors));
    }
  };

  const handleView = (student) => {
    setSelectedStudent(student);
    setOpenViewModal(true);
  };

  const handleEdit = async (student) => {
    setSelectedStudent(student);

    setFirstName(student.first_name || "");
    setLastName(student.last_name || "");
    setDni(student.dni ? String(student.dni) : "");
    setSchool(student.school || "");
    setBirthDate(student.birth_date?.split("T")[0] || "");
    setLevel(student.level || "");
    setGrade(student.grade || "");

    const rows = await Promise.all(
      (student.activePlans || []).map(async (p) => {
        const response = await teacherService.getAvailablePlans(p.teacher_id);

        return {
          teacher_id: p.teacher_id,
          plan_id: p.plan_id,
          student_plan_id: p.student_plan_id,
          start_date: p.start_date?.split("T")[0],

          availablePlans: (response.data.data || []).sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        };
      }),
    );

    setFormClasses(rows);

    setErrorsEdit({});
    setRemovedClasses([]);
    setOpenEditModal(true);
  };

  const handleUpdate = async () => {
    const newErrors = {};

    if (!firstName?.toString().trim())
      newErrors.first_name = "Este campo no puede estar vacío.";
    if (!lastName?.toString().trim())
      newErrors.last_name = "Este campo no puede estar vacío.";
    if (!dni?.toString().trim())
      newErrors.dni = "Este campo no puede estar vacío.";
    if (!school?.toString().trim())
      newErrors.school = "Este campo no puede estar vacío.";
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

      console.log("FORM CLASSES");
      console.table(formClasses);

      const duplicated = formClasses.filter(
        (item, index, self) =>
          self.findIndex((x) => x.student_plan_id === item.student_plan_id) !==
          index,
      );

      console.log("Duplicados:");
      console.table(duplicated);

      // Actualizar o crear planes dinámicamente
      await Promise.all(
        formClasses
          .filter((p) => p.teacher_id && p.plan_id)
          .map(async (p) => {
            if (p.student_plan_id) {
              return studentPlanService.update(p.student_plan_id, {
                student_id: selectedStudent.id,
                teacher_id: p.teacher_id,
                plan_id: p.plan_id,
                start_date: p.start_date,
              });
            }

            return studentPlanService.create({
              student_id: selectedStudent.id,
              teacher_id: p.teacher_id,
              plan_id: p.plan_id,
              start_date: new Date().toISOString().slice(0, 10),
            });
          }),
      );

      // Eliminar las clases quitadas por el usuario
      await Promise.all(
        removedClasses.map((id) => studentPlanService.delete(id)),
      );

      setOpenEditModal(false);
      fetchStudents();
      setRemovedClasses([]);
    } catch (error) {
      console.log("ERROR COMPLETO");
      console.log(JSON.stringify(error.response?.data, null, 2));
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
      // Baja lógica de todos los planes activos vinculados al alumno
      for (const p of selectedStudent.activePlans || []) {
        await studentPlanService.delete(p.student_plan_id);
      }

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

  const addClassRow = () => {
    setFormClasses((prev) => [
      ...prev,
      {
        teacher_id: "",
        plan_id: "",
        availablePlans: [],
      },
    ]);
  };

  const removeClassRow = (index) => {
    const row = formClasses[index];

    // Si la clase ya existía en la BD, la marcamos para eliminar
    if (row.student_plan_id) {
      setRemovedClasses((prev) => [...prev, row.student_plan_id]);
    }

    const updated = formClasses.filter((_, i) => i !== index);

    setFormClasses(
      updated.length
        ? updated
        : [
            {
              teacher_id: "",
              plan_id: "",
              availablePlans: [],
            },
          ],
    );
  };

  const updateClassRow = (idx, field, value) => {
    setFormClasses((prev) =>
      prev.map((row, index) =>
        index === idx
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    );
  };

  const handleTeacherChange = async (idx, teacherId) => {
    if (!teacherId) {
      setFormClasses((prev) =>
        prev.map((row, index) =>
          index === idx
            ? {
                ...row,
                teacher_id: "",
                plan_id: "",
                availablePlans: [],
              }
            : row,
        ),
      );

      return;
    }

    const response = await teacherService.getAvailablePlans(teacherId);

    const availablePlans = (response.data.data || []).sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    setFormClasses((prev) =>
      prev.map((row, index) =>
        index === idx
          ? {
              ...row,
              teacher_id: teacherId,
              plan_id: "",
              availablePlans,
            }
          : row,
      ),
    );
  };

  const handleScroll = (e, targetId) => {
    const target = document.getElementById(targetId);
    if (target && target.scrollTop !== e.target.scrollTop) {
      target.scrollTop = e.target.scrollTop;
    }
  };

  let columns = [
    { header: "Apellido", accessor: "last_name" },
    { header: "Nombre", accessor: "first_name" },
    {
      header: "Estado",
      render: (row) => {
        const active = row.activePlans?.length > 0;

        return (
          <span
            className={`font-medium ${
              active ? "text-green-600" : "text-red-600"
            }`}
          >
            ● {active ? "Activo" : "Inactivo"}
          </span>
        );
      },
    },
  ];

  // Sumar Docente y Plan solo en Activos
  columns.push({
    header: "Docente y Plan",
    render: (row) => (
      <div
        className="
          h-14
          overflow-y-auto
          overflow-x-hidden
          flex
          flex-col
          gap-2
          pr-1
        "
      >
        {(row.activePlans || []).map((p) => (
          <div key={p.student_plan_id}>
            <div className="font-medium text-sm">{p.teacher_name}</div>

            <div className="text-xs text-gray-500">{p.plan_name}</div>
          </div>
        ))}
      </div>
    ),
  });

  // Botón Activar solo en "Total de Alumnos" para alumnos inactivos
  if (isAdmin()) {
    columns.push({
      header: "Acciones",
      render: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleView(row)}>
            Ver
          </Button>

          <Button
            title="Editar"
            size="sm"
            onClick={() => handleEdit(row)}
            className={buttonClass}
          >
            <PencilIcon className="w-5 h-5" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(row)}
            className={buttonClass}
          >
            <TrashBinIcon className="w-5 h-5" />
          </Button>
        </div>
      ),
    });
  }

  const showCreateButtons = isAdmin();

  const tableTitle = (
    <div className="flex justify-between items-center">
      <span>Alumnos</span>
      {showCreateButtons && (
        <Button
          title="Crear Alumno"
          size="sm"
          onClick={openCreate}
          className="
            cursor-pointer
            w-12
            h-12
            rounded
            bg-[#0cc0df]
            text-white
            flex
            items-center
            justify-center
            transition
            transform
            hover:scale-105
          "
        >
          <img
            src={CreateIcon}
            alt="More"
            className="
              w-5
              h-5
              brightness-0
              invert
            "
          />
        </Button>
      )}
    </div>
  );

  return (
    <>
      <div className="flex gap-3 mb-4 flex-wrap">
        <Input
          placeholder="Nombre o apellido"
          value={searchFirstLastName}
          onChange={(e) => setSearchFirstLastName(e.target.value)}
          className="min-w-56"
        />

        <Input
          placeholder="DNI"
          value={searchDNI}
          onChange={(e) => setSearchDNI(e.target.value)}
          className="min-w-56"
        />

        <Select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="p-2 border border-gray-300 rounded min-w-56"
        >
          <option value="">Todos los alumnos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </Select>

        <Select
          value={selectedTeacher}
          onChange={(e) => setSelectedTeacher(e.target.value)}
          className="p-2 border border-gray-300 rounded min-w-56"
        >
          <option value="">Todos los docentes</option>

          {[...teachers]
            .sort((a, b) =>
              `${a.last_name}, ${a.first_name}`.localeCompare(
                `${b.last_name}, ${b.first_name}`,
                "es",
              ),
            )
            .map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.last_name}, {teacher.first_name}
              </option>
            ))}
        </Select>

        <Select
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
          className="p-2 border border-gray-300 rounded min-w-56"
        >
          <option value="">Todos los planes</option>

          {[...plans]
            .sort((a, b) => a.name.localeCompare(b.name, "es"))
            .map((plan) => (
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

      <Modal
        isOpen={openCreateModal}
        onClose={() => {
          setOpenCreateModal(false);
          resetForm();
          setSelectedStudent(null);
        }}
      >
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
          label="Grado o año"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          error={errorsCreate.grade}
        >
          <option value="">Seleccione un grado o año</option>
          {[1, 2, 3, 4, 5, 6, 7].map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </Select>

        {/* Gestión Dinámica de Clases */}
        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">Clases Asignadas</h3>
            <Button size="sm" onClick={addClassRow}>
              + Añadir Clase
            </Button>
          </div>
          {formClasses.map((row, idx) => (
            <div
              key={idx}
              className="
                border
                border-gray-200
                rounded-xl
                p-4
                mb-4
                bg-white
                shadow-sm
              "
            >
              <div className="flex-1">
                <Select
                  label={idx === 0 ? "Docente" : ""}
                  value={row.teacher_id}
                  onChange={(e) => handleTeacherChange(idx, e.target.value)}
                >
                  <option value="">Seleccione un Docente</option>
                  {[...teachers]
                    .sort(
                      (a, b) =>
                        a.last_name.localeCompare(b.last_name) ||
                        a.first_name.localeCompare(b.first_name),
                    )
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.last_name}, {t.first_name}
                      </option>
                    ))}
                </Select>
              </div>
              <div className="flex-1">
                <Select
                  label={idx === 0 ? "Plan" : ""}
                  value={row.plan_id}
                  onChange={(e) =>
                    updateClassRow(idx, "plan_id", e.target.value)
                  }
                >
                  <option value="">Seleccione un Plan</option>

                  {row.availablePlans?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col">
                <div className="h-6"></div>

                <Button variant="outline" onClick={() => removeClassRow(idx)}>
                  ✕
                </Button>
              </div>
            </div>
          ))}
        </div>

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

      <Modal
        isOpen={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          resetForm();
          setSelectedStudent(null);
        }}
      >
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
          label="Grado o año"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          error={errorsEdit.grade}
        >
          <option value="">Seleccione un grado o año</option>
          {[1, 2, 3, 4, 5, 6, 7].map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </Select>

        {/* Gestión Dinámica de Clases en Edición */}
        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">Gestionar Clases</h3>
            <Button size="sm" onClick={addClassRow}>
              + Añadir Clase
            </Button>
          </div>
          {formClasses.map((row, idx) => (
            <div
              key={idx}
              className="
                border
                border-gray-200
                rounded-xl
                p-4
                mb-4
                bg-white
                shadow-sm
              "
            >
              <div className="flex-1">
                <Select
                  label={idx === 0 ? "Docente" : ""}
                  value={row.teacher_id}
                  onChange={(e) =>
                    updateClassRow(idx, "plan_id", e.target.value)
                  }
                >
                  <option value="">Seleccione un Docente</option>
                  {[...teachers]
                    .sort(
                      (a, b) =>
                        a.last_name.localeCompare(b.last_name) ||
                        a.first_name.localeCompare(b.first_name),
                    )
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.last_name}, {t.first_name}
                      </option>
                    ))}
                </Select>
              </div>
              <div className="flex-1">
                <Select
                  label={idx === 0 ? "Plan" : ""}
                  value={row.plan_id}
                  onChange={(e) => handleTeacherChange(idx, e.target.value)}
                >
                  <option value="">Seleccione un Plan</option>
                  {row.availablePlans?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
              {/* {!row.student_plan_id && (
                <div className="flex items-end pb-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500"
                    onClick={() => removeClassRow(idx)}
                  >
                    ✕
                  </Button>
                </div>
              )} */}
              <div className="flex flex-col">
                <div className="h-6"></div>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 h-11 w-11"
                  onClick={() => removeClassRow(idx)}
                >
                  ✕
                </Button>
              </div>
            </div>
          ))}
        </div>

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

      <Modal isOpen={openViewModal} onClose={() => setOpenViewModal(false)}>
        <h2 className="text-xl font-bold mb-8">
          {selectedStudent?.first_name} {selectedStudent?.last_name}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold">DNI</h4>
            <p>{selectedStudent?.dni}</p>
          </div>

          <div>
            <h4 className="font-semibold">Fecha de nacimiento</h4>
            <p>
              {selectedStudent?.birth_date
                ? new Date(selectedStudent.birth_date).toLocaleDateString(
                    "es-AR",
                  )
                : "-"}
            </p>
          </div>

          <div>
            <h4 className="font-semibold">Colegio o Universidad</h4>
            <p>{selectedStudent?.school}</p>
          </div>

          <div>
            <h4 className="font-semibold">Nivel</h4>
            <p>{selectedStudent?.level}</p>
          </div>

          <div>
            <h4 className="font-semibold">Grado o Año</h4>
            <p>{selectedStudent?.grade}°</p>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <Button onClick={() => setOpenViewModal(false)}>Cerrar</Button>
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
