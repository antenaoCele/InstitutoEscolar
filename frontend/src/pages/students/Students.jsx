import { useEffect, useState } from "react";
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import { studentService } from "../../services/student.service";
import { teacherService } from "../../services/teacher.service";
import { planService } from "../../services/plan.service";
import Label from "../../components/form/Label";
import Button from "../../components/ui/Button";
import Input from "../../components/form/Input";
import Select from "../../components/form/Select";
import SubmitButton from "../../components/form/SubmitButton";
import { Modal } from "../../components/ui/Modal";
import { studentPlanService } from "../../services/studenPlan.service";
import { isAdmin } from "../../utils/auth";
import {
  ViewButton,
  EditButton,
  DeleteButton,
  PlusButton,
  YesButton,
  NoButton,
} from "../../components/ui/ActionButtons";
import { sortByProperty, sortByPersonName } from "../../utils/sort";
import { useFeedbackModal } from "../../hooks/useFeedbackModal";
import { mapErrors } from "../../validators/helpers/errorHelpers";
import { validateStudentForm } from "../../validators/entities/student.validator";

export function Students() {
  // ======================================================
  // DATOS
  // ======================================================
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [plans, setPlans] = useState([]);

  // ======================================================
  // FILTROS
  // ======================================================
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchFirstLastName, setSearchFirstLastName] = useState("");
  const [searchDNI, setSearchDNI] = useState("");
  const [searchSchool, setSearchSchool] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");

  //hacer un componente de filtros

  // ======================================================
  // MODALES
  // ======================================================
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);

  // ======================================================
  // MODAL DE FEEDBACK (hook compartido, reemplaza alert())
  // ======================================================
  const { feedbackModal, showFeedback, closeFeedback } = useFeedbackModal();

  // ======================================================
  // ALUMNO SELECCIONADO
  // ======================================================
  const [selectedStudent, setSelectedStudent] = useState(null);

  // ======================================================
  // FORMULARIO DEL ALUMNO
  // ======================================================
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dni, setDni] = useState("");
  const [school, setSchool] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [level, setLevel] = useState("");
  const [grade, setGrade] = useState("");

  // ======================================================
  // PLANES DEL ALUMNO (se seleccionan con checkboxes)
  // Cada fila: { plan_id, teacher_id, availableTeachers, student_plan_id?, start_date? }
  // ======================================================
  const [formClasses, setFormClasses] = useState([]);

  const [removedClasses, setRemovedClasses] = useState([]);

  // ======================================================
  // ERRORES
  // ======================================================
  const [errorsCreate, setErrorsCreate] = useState({});
  const [errorsEdit, setErrorsEdit] = useState({});

  // ======================================================
  // CONSTANTES
  // ======================================================
  const buttonClass = "cursor-pointer transition transform hover:scale-105";

  // ======================================================
  // FETCH DATOS PRINCIPALES
  // ======================================================
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

      if (selectedPaymentStatus) {
        params.payment_status = selectedPaymentStatus;
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

      const studentsData = Array.from(studentMap.values());

      setStudents(studentsData);
    } catch {
      setStudents([]);
    }
  };

  // ======================================================
  // FETCH AUXILIARES
  // ======================================================
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

  // ======================================================
  // RESETEO
  // ======================================================
  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setDni("");
    setSchool("");
    setBirthDate("");
    setLevel("");
    setGrade("");
    setFormClasses([]);
    setErrorsCreate({});
    setErrorsEdit({});
    setRemovedClasses([]);
  };

  // ======================================================
  // HANDLES CRUD
  // ======================================================
  const openCreate = () => {
    resetForm();
    setOpenCreateModal(true);
  };

  const handleCreate = async () => {
    const errors = validateStudentForm({
      firstName,
      lastName,
      dni,
      school,
      birthDate,
      level,
      grade,
    });

    if (Object.keys(errors).length > 0) {
      setErrorsCreate(errors);
      return;
    }

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
      if (backendErrors) {
        setErrorsCreate(mapErrors(backendErrors));
      } else {
        showFeedback(
          error.response?.data?.message || "Error al crear el alumno.",
        );
      }
    }
  };

  const handleView = async (student) => {
    try {
      const { data } = await studentService.getInfo(student.id);

      setSelectedStudent(data.data);

      setOpenViewModal(true);
    } catch (error) {
      console.error(error);
      showFeedback(
        error.response?.data?.message ||
          "Error al obtener la información del alumno.",
      );
    }
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
        const response = await teacherService.getTeachersByPlan(p.plan_id);

        return {
          teacher_id: p.teacher_id,
          plan_id: p.plan_id,
          student_plan_id: p.student_plan_id,
          start_date: p.start_date?.split("T")[0],

          availableTeachers: (response.data.data || []).sort(sortByPersonName),
        };
      }),
    );

    setFormClasses(rows);

    setErrorsEdit({});
    setRemovedClasses([]);
    setOpenEditModal(true);
  };

  const handleUpdate = async () => {
    const errors = validateStudentForm({
      firstName,
      lastName,
      dni,
      school,
      birthDate,
      level,
      grade,
    });

    if (Object.keys(errors).length > 0) {
      setErrorsEdit(errors);
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
      console.error(error.response?.data || error.message);
      const backendErrors = error.response?.data?.errors;
      if (backendErrors) {
        setErrorsEdit(mapErrors(backendErrors));
      } else {
        showFeedback(
          error.response?.data?.message || "Error al editar el alumno.",
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
      // Baja lógica de todos los planes activos vinculados al alumno
      for (const p of selectedStudent.activePlans || []) {
        await studentPlanService.delete(p.student_plan_id);
      }

      setOpenDeleteModal(false);
      fetchStudents();
    } catch (error) {
      console.error(error.response?.data || error.message);
      setOpenDeleteModal(false);
      showFeedback(error.response?.data?.message || "Error al eliminar");
    }
  };

  // ======================================================
  // HANDLES DE PLANES (checkboxes)
  // ======================================================
  const togglePlan = async (planId, checked) => {
    if (!checked) {
      const row = formClasses.find((r) => r.plan_id === planId);

      // Si la clase ya existía en la BD, la marcamos para eliminar
      if (row?.student_plan_id) {
        setRemovedClasses((prev) => [...prev, row.student_plan_id]);
      }

      setFormClasses((prev) => prev.filter((r) => r.plan_id !== planId));
      return;
    }

    try {
      const response = await teacherService.getTeachersByPlan(planId);

      const availableTeachers = (response.data.data || []).sort(
        sortByPersonName,
      );

      setFormClasses((prev) => [
        ...prev,
        { plan_id: planId, teacher_id: "", availableTeachers },
      ]);
    } catch (error) {
      console.error(error);
    }
  };

  const updateClassRowByPlan = (planId, field, value) => {
    setFormClasses((prev) =>
      prev.map((row) =>
        row.plan_id === planId ? { ...row, [field]: value } : row,
      ),
    );
  };

  const handleScroll = (e, targetId) => {
    const target = document.getElementById(targetId);
    if (target && target.scrollTop !== e.target.scrollTop) {
      target.scrollTop = e.target.scrollTop;
    }
  };

  // ======================================================
  // USEEFFECTS
  // ======================================================
  useEffect(() => {
    fetchStudents();
  }, [selectedTeacher, selectedPlan, selectedStatus, selectedPaymentStatus]);

  useEffect(() => {
    fetchFilters();
  }, []);

  // ======================================================
  // DATOS DERIVADOS
  // ======================================================
  const filteredStudents = [...students]
    .filter((s) => {
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
    })
    .sort(sortByPersonName);

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

  columns.push({
    header: "Plan y Docente",
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
        {row.activePlans?.length > 0 ? (
          row.activePlans.map((p) => (
            <div key={p.student_plan_id}>
              <div className="font-medium text-sm">{p.plan_name}</div>

              <div className="text-xs text-gray-500">{p.teacher_name}</div>
            </div>
          ))
        ) : (
          <div className="text-sm italic text-gray-500">
            Editar para asignar plan y docente
          </div>
        )}
      </div>
    ),
  });

  // Botón Activar solo en "Total de Alumnos" para alumnos inactivos
  if (isAdmin()) {
    columns.push({
      header: "Acciones",
      render: (row) => (
        <div className="flex gap-2">
          <ViewButton title="Ver Alumno" onClick={() => handleView(row)} />

          <EditButton title="Editar Alumno" onClick={() => handleEdit(row)} />

          <DeleteButton
            title="Eliminar Alumno"
            onClick={() => handleDelete(row)}
          />
        </div>
      ),
    });
  }

  const showCreateButtons = isAdmin();

  const tableTitle = (
    <div className="flex justify-between items-center">
      <span>Alumnos</span>
      {showCreateButtons && (
        <PlusButton title="Crear Alumno" onClick={openCreate} />
      )}
    </div>
  );

  const student = selectedStudent?.student;

  // ======================================================
  // BLOQUE REUTILIZABLE: checkboxes de planes (Crear/Editar)
  // ======================================================
  const renderPlanCheckboxes = () => (
    <div className="mt-6 border-t pt-4">
      <h2 className="text-xl font-bold mb-4">Asignar Clases</h2>

      <div className="grid grid-cols-2 gap-3">
        {[...plans].sort(sortByProperty("name")).map((plan) => {
          const row = formClasses.find((r) => r.plan_id === plan.id);

          return (
            <div
              key={plan.id}
              className="
                border
                border-gray-200
                rounded-xl
                p-3
                bg-white
                shadow-sm
              "
            >
              <label className="flex items-center gap-2 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!row}
                  onChange={(e) => togglePlan(plan.id, e.target.checked)}
                />
                {plan.name}
              </label>

              {row && (
                <Select
                  className="mt-2"
                  value={row.teacher_id}
                  onChange={(e) =>
                    updateClassRowByPlan(plan.id, "teacher_id", e.target.value)
                  }
                >
                  <option value="">Seleccione un Docente</option>

                  {row.availableTeachers?.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.last_name}, {teacher.first_name}
                    </option>
                  ))}
                </Select>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ======================================================
  // RETURN
  // ======================================================
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

        <Select
          value={selectedPaymentStatus}
          onChange={(e) => setSelectedPaymentStatus(e.target.value)}
          className="p-2 border border-gray-300 rounded min-w-56"
        >
          <option value="">Todos los pagos</option>
          <option value="paid">Pagaron este mes</option>
          <option value="pending">Faltan pagar este mes</option>
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

        {renderPlanCheckboxes()}

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

        {renderPlanCheckboxes()}

        <div className="flex justify-end gap-4 mt-10">
          <NoButton title="Cancelar" onClick={() => setOpenEditModal(false)} />

          <YesButton title="Aceptar" onClick={handleUpdate} />
        </div>
      </Modal>

      <Modal isOpen={openViewModal} onClose={() => setOpenViewModal(false)}>
        <h2 className="text-xl font-bold mb-8">Datos del Alumno</h2>

        <div className="rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold">Alumno</h4>
              <p className="text-gray-500">
                {" "}
                {student?.last_name}, {student?.first_name}
              </p>
            </div>

            <div>
              <h4 className="font-semibold">DNI</h4>
              <p className="text-gray-500">{student?.dni}</p>
            </div>

            <div>
              <h4 className="font-semibold">Nacimiento</h4>
              <p className="text-gray-500">
                {student?.birth_date
                  ? new Date(student.birth_date).toLocaleDateString("es-AR")
                  : "-"}
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Institución</h4>
              <p className="text-gray-500">{student?.school}</p>
            </div>

            <div>
              <h4 className="font-semibold">Nivel</h4>
              <p className="text-gray-500">{student?.level}</p>
            </div>

            <div>
              <h4 className="font-semibold">Grado o año</h4>
              <p className="text-gray-500">{student?.grade}°</p>
            </div>
          </div>
        </div>

        <hr className="my-6" />

        {selectedStudent?.tutors?.length > 0 ? (
          <div className="space-y-4">
            {selectedStudent.tutors.map((tutor) => (
              <div
                key={tutor.id}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold">Tutor</h4>
                    <p className="text-gray-500">
                      {tutor.last_name}, {tutor.first_name}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold">DNI</h4>
                    <p className="text-gray-500">{tutor.dni}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold">Teléfono</h4>
                    <p className="text-gray-500">{tutor.phone || "-"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            Este alumno no posee tutores registrados.
          </p>
        )}

        <hr className="my-6" />

        {selectedStudent?.plans?.length > 0 ? (
          <div className="space-y-4">
            {selectedStudent.plans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold">Plan</h4>
                    <p className="text-gray-500">{plan.plan_name}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold">Docente</h4>
                    <p className="text-gray-500">
                      {plan.last_name}, {plan.first_name}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold">Fecha de inicio</h4>

                    <p className="text-gray-500">
                      {plan.start_date
                        ? new Date(plan.start_date).toLocaleDateString("es-AR")
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">El alumno no posee planes activos.</p>
        )}
      </Modal>

      <Modal isOpen={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <h2 className="text-lg font-semibold mb-4">¿Eliminar alumno?</h2>

        <div className="flex justify-end gap-2">
          <NoButton
            title="Cancelar"
            onClick={() => setOpenDeleteModal(false)}
          />

          <YesButton title="Aceptar" onClick={confirmDelete} />
        </div>
      </Modal>

      {/* Modal de feedback (errores/éxito) — viene del hook useFeedbackModal */}
      <Modal isOpen={feedbackModal.open} onClose={closeFeedback}>
        <h2
          className={`text-lg font-semibold mb-4 ${
            feedbackModal.type === "error" ? "text-red-600" : "text-green-600"
          }`}
        >
          {feedbackModal.type === "error" ? "Error" : "Listo"}
        </h2>

        <p className="text-gray-600">{feedbackModal.message}</p>

        <div className="flex justify-end mt-6">
          <Button onClick={closeFeedback}>Cerrar</Button>
        </div>
      </Modal>
    </>
  );
}
