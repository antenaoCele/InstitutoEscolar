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

  // Estado para manejar múltiples planes en el formulario
  const [formPlans, setFormPlans] = useState([{ teacher_id: "", plan_id: "" }]);

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
    setFormPlans([{ teacher_id: "", plan_id: "" }]);
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

      if (status === "active") {
        if (selectedTeacher) {
          params.teacher_id = selectedTeacher;
        }

        if (selectedPlan) {
          params.plan_id = selectedPlan;
        }
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
          studentMap.get(row.id).activePlans.push({
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
      });

      setStudents(Array.from(studentMap.values()));
    } catch {
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [location.search, selectedTeacher, selectedPlan]);

  useEffect(() => {
    if (status === "all") {
      setSelectedTeacher("");
      setSelectedPlan("");
      setSearchSchool("");
    }
  }, [status]);

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
        formPlans: formPlans.filter((p) => p.teacher_id && p.plan_id),
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

  const handleEdit = (student) => {
    setSelectedStudent(student);

    setFirstName(student.first_name || "");
    setLastName(student.last_name || "");
    setDni(student.dni ? String(student.dni) : "");
    setSchool(student.school || "");
    setBirthDate(student.birth_date?.split("T")[0] || "");
    setLevel(student.level || "");
    setGrade(student.grade || "");

    setFormPlans(
      student.activePlans?.length > 0
        ? student.activePlans.map((p) => ({
            teacher_id: p.teacher_id,
            plan_id: p.plan_id,
            student_plan_id: p.student_plan_id,
            start_date: p.start_date?.split("T")[0], // Limpiar formato para el validador
          }))
        : [{ teacher_id: "", plan_id: "" }],
    );

    setErrorsEdit({});
    setOpenEditModal(true);
  };

  const handleReactivate = async (studentId) => {
    try {
      await studentPlanService.reactivate(studentId);
      fetchStudents();
    } catch (error) {
      console.error(error);
      alert("Error al reactivar al alumno");
    }
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

      // Actualizar o crear planes dinámicamente
      if (status === "active") {
        for (const p of formPlans) {
          // Solo procesar si tiene docente y plan seleccionados
          if (!p.teacher_id || !p.plan_id) continue;

          if (p.student_plan_id) {
            // Actualizar asignación existente
            await studentPlanService.update(p.student_plan_id, {
              student_id: selectedStudent.id,
              teacher_id: p.teacher_id,
              plan_id: p.plan_id,
              start_date: p.start_date?.split("T")[0],
            });
          } else {
            // Crear nueva asignación de docente/plan
            await studentPlanService.create({
              student_id: selectedStudent.id,
              teacher_id: p.teacher_id,
              plan_id: p.plan_id,
              start_date: new Date().toISOString().slice(0, 10),
            });
          }
        }
      }

      setOpenEditModal(false);
      fetchStudents();
    } catch (error) {
      console.error(
        "Error al actualizar:",
        error.response?.data || error.message,
      );
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

  const addPlanRow = () => {
    setFormPlans([...formPlans, { teacher_id: "", plan_id: "" }]);
  };

  const removePlanRow = (index) => {
    const updated = formPlans.filter((_, i) => i !== index);
    setFormPlans(updated.length ? updated : [{ teacher_id: "", plan_id: "" }]);
  };

  const updatePlanRow = (index, field, value) => {
    const updated = [...formPlans];
    updated[index][field] = value;
    setFormPlans(updated);
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

  // Sumar Docente y Plan solo en Activos
  if (status === "active") {
    columns.push(
      {
        header: "Docente",
        render: (row) => (
          <div
            id={`scroll-docente-${row.id}`}
            onScroll={(e) => handleScroll(e, `scroll-plan-${row.id}`)}
            className="max-h-24 overflow-y-auto pr-2 space-y-1 scrollbar-thin"
          >
            {row.activePlans?.map((p, i) => (
              <div
                key={i}
                className="text-sm border-b border-gray-100 last:border-0 pb-1 truncate"
                title={p.teacher_name}
              >
                {p.teacher_name}
              </div>
            ))}
            {(!row.activePlans || row.activePlans.length === 0) && "-"}
          </div>
        ),
      },
      {
        header: "Plan",
        render: (row) => (
          <div
            id={`scroll-plan-${row.id}`}
            onScroll={(e) => handleScroll(e, `scroll-docente-${row.id}`)}
            className="max-h-24 overflow-y-auto pr-2 space-y-1 scrollbar-thin"
          >
            {row.activePlans?.map((p, i) => (
              <div
                key={i}
                className="text-sm border-b border-gray-100 last:border-0 pb-1 text-gray-700 dark:text-gray-300 truncate"
                title={p.plan_name}
              >
                {p.plan_name}
              </div>
            ))}
            {(!row.activePlans || row.activePlans.length === 0) && "-"}
          </div>
        ),
      },
    );
  }

  // Botón Activar solo en "Total de Alumnos" para alumnos inactivos
  if (isAdmin() && status === "all") {
    columns.push({
      header: "Acciones",
      render: (row) => (
        <div className="flex gap-2">
          {!row.student_plan_id && (
            <Button
              size="sm"
              onClick={() => handleReactivate(row.id)}
              className={buttonClass}
            >
              Activar
            </Button>
          )}
        </div>
      ),
    });
  }

  // Mover botones de acción solo a Alumnos Activos
  if (isAdmin() && status === "active") {
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
            <TrashBinIcon className="w-5 h-5" />
          </Button>
        </div>
      ),
    });
  }

  const showCreateButtons = isAdmin() && status !== "active";

  const tableTitle = (
    <div className="flex justify-between items-center">
      <span>
        {status === "active" ? "Alumnos Activos" : "Total de Alumnos"}
      </span>
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

        {status === "active" && (
          <>
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
          </>
        )}
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

        {/* Gestión Dinámica de Clases */}
        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">Clases Asignadas</h3>
            <Button size="sm" onClick={addPlanRow}>
              + Añadir Clase
            </Button>
          </div>
          {formPlans.map((row, idx) => (
            <div
              key={idx}
              className="flex gap-2 items-end mb-3 bg-gray-50 p-2 rounded"
            >
              <div className="flex-1">
                <Select
                  label={idx === 0 ? "Docente" : ""}
                  value={row.teacher_id}
                  onChange={(e) =>
                    updatePlanRow(idx, "teacher_id", e.target.value)
                  }
                >
                  <option value="">Docente...</option>
                  {teachers.map((t) => (
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
                    updatePlanRow(idx, "plan_id", e.target.value)
                  }
                >
                  <option value="">Plan...</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mb-1 text-red-500"
                onClick={() => removePlanRow(idx)}
              >
                ✕
              </Button>
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

        {/* Gestión Dinámica de Clases en Edición */}
        {status === "active" && (
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700">Gestionar Clases</h3>
              <Button size="sm" onClick={addPlanRow}>
                + Añadir Clase
              </Button>
            </div>
            {formPlans.map((row, idx) => (
              <div
                key={idx}
                className="flex gap-2 items-end mb-3 bg-gray-50 p-2 rounded"
              >
                <div className="flex-1">
                  <Select
                    label={idx === 0 ? "Docente" : ""}
                    value={row.teacher_id}
                    onChange={(e) =>
                      updatePlanRow(idx, "teacher_id", e.target.value)
                    }
                  >
                    <option value="">Docente...</option>
                    {teachers.map((t) => (
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
                      updatePlanRow(idx, "plan_id", e.target.value)
                    }
                  >
                    <option value="">Plan...</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </Select>
                </div>
                {!row.student_plan_id && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mb-1 text-red-500"
                    onClick={() => removePlanRow(idx)}
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

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
