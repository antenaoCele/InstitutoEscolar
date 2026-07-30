import { useEffect, useState } from "react";
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import { studentService } from "../../services/student.service";
import { teacherService } from "../../services/teacher.service";
import { planService } from "../../services/plan.service";
import Label from "../../components/form/Label";
import Button from "../../components/ui/Button";
import Checkbox from "../../components/form/Checkbox";
import Input from "../../components/form/Input";
import Select from "../../components/form/Select";
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
import { getTodayLocal } from "../../utils/date.js";

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
  const [selectedPlanStatus, setSelectedPlanStatus] = useState("");

  // ======================================================
  // MODALES
  // ======================================================
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
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
  // Cada fila: { plan_id, teacher_id, availableTeachers, student_plan_id?,
  // start_date?, first_payment_option? }
  // first_payment_option solo se pide/usa para filas NUEVAS (sin
  // student_plan_id todavía). Una fila existente que solo cambia de
  // docente no lo pide: el backend copia la que ya tenía.
  // ======================================================
  const [formClasses, setFormClasses] = useState([]);
  const [removedClasses, setRemovedClasses] = useState([]);

  // ======================================================
  // ERRORES
  // ======================================================
  const [errorsCreate, setErrorsCreate] = useState({});
  const [errorsEdit, setErrorsEdit] = useState({});

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

      if (selectedPlanStatus) {
        params.plan_status = selectedPlanStatus;
      }

      const { data } = await studentService.getAll(params);
      const rawData = data?.data || [];

      // Agrupar planes por estudiante para visualización múltiple
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
              academic_status: row.academic_status,
              account_status: row.account_status,
              overdue_period: row.overdue_period,
              current_period_status: row.current_period?.status,
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
      const teachersRes = await teacherService.getAll({ active: true });
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

    const activeRows = formClasses.filter((p) => p.teacher_id && p.plan_id);

    // Es un alta real: TODOS los planes son nuevos, así que todos
    // necesitan una opción de primer pago elegida.
    const missingOption = activeRows.some((p) => !p.first_payment_option);

    if (missingOption) {
      showFeedback(
        "Seleccione la opción de primer pago para cada plan asignado.",
        "error",
      );
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
        formClasses: activeRows,
      });

      setOpenCreateModal(false);
      fetchStudents();
      resetForm();
      showFeedback("Estudiante creado correctamente.", "success");
    } catch (error) {
      console.error("Error al crear:", error.response?.data || error.message);
      const backendErrors = error.response?.data?.errors;
      if (backendErrors) {
        setErrorsCreate(mapErrors(backendErrors));
      } else {
        showFeedback(
          error.response?.data?.message || "Error al crear el estudiante.",
          "error",
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
          "Error al obtener la información del estudiante.",
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
      (student.activePlans || [])
        .filter((p) => p.academic_status === "ACTIVE")
        .map(async (p) => {
          const response = await teacherService.getTeachersByPlan(p.plan_id);

          return {
            teacher_id: p.teacher_id,
            original_teacher_id: p.teacher_id, // guardamos el docente con el que arrancó, para detectar cambios al guardar
            plan_id: p.plan_id,
            student_plan_id: p.student_plan_id,
            start_date: p.start_date?.split("T")[0],
            // Fila existente: no se pide first_payment_option, ya se
            // definió en su momento y no se vuelve a preguntar.
            first_payment_option: null,

            availableTeachers: (response.data.data || []).sort(
              sortByPersonName,
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

    const activeRows = formClasses.filter((p) => p.teacher_id && p.plan_id);

    // Solo las filas NUEVAS (planes recién agregados en esta edición,
    // sin student_plan_id todavía) necesitan la opción de primer pago.
    // Un cambio de docente sobre una fila existente no la pide: el
    // backend copia la que ya tenía esa inscripción.
    const missingOption = activeRows.some(
      (p) => !p.student_plan_id && !p.first_payment_option,
    );

    if (missingOption) {
      showFeedback(
        "Seleccione la opción de primer pago para los planes nuevos.",
        "error",
      );
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
        activeRows.map(async (p) => {
          // Cambio de docente: lo resuelve el backend en UNA sola
          // transacción (cierra la fila vieja + abre la nueva copiando
          // su first_payment_option). Antes se hacía acá con
          // delete + create y un "FULL" fijo, y eso le pisaba la
          // modalidad de primer pago al alumno cuando el cambio caía
          // en el mismo mes del alta: con NEXT_MONTH pasaba de "Aún no
          // corresponde" a "Debe", con HALF se le cobraba la primera
          // cuota completa. Además, si el create fallaba después del
          // delete, el alumno quedaba sin plan.
          if (p.student_plan_id && p.teacher_id !== p.original_teacher_id) {
            return studentPlanService.changeTeacher(
              p.student_plan_id,
              p.teacher_id,
            );
          }

          if (p.student_plan_id) {
            return studentPlanService.update(p.student_plan_id, {
              student_id: selectedStudent.id,
              teacher_id: p.teacher_id,
              plan_id: p.plan_id,
              start_date: p.start_date,
            });
          }

          // Plan nuevo agregado en esta edición: sí es una asignación
          // real, se usa la opción que eligió el admin.
          return studentPlanService.create({
            student_id: selectedStudent.id,
            teacher_id: p.teacher_id,
            plan_id: p.plan_id,
            start_date: getTodayLocal(),
            first_payment_option: p.first_payment_option,
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
      showFeedback("Estudiante actualizado correctamente.", "success");
    } catch (error) {
      console.error(error.response?.data || error.message);
      const backendErrors = error.response?.data?.errors;
      if (backendErrors) {
        setErrorsEdit(mapErrors(backendErrors));
      } else {
        showFeedback(
          error.response?.data?.message || "Error al editar el estudiante.",
          "error",
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
      // Baja lógica de los planes REALMENTE activos vinculados al
      // estudiante (los que ya están inactivos con deuda no se tocan,
      // ya tienen su end_date congelado).
      const plansToDeactivate = (selectedStudent.activePlans || []).filter(
        (p) => p.academic_status === "ACTIVE",
      );

      for (const p of plansToDeactivate) {
        await studentPlanService.delete(p.student_plan_id);
      }

      setOpenDeleteModal(false);
      fetchStudents();
      showFeedback("Estudiante dado de baja.", "success");
    } catch (error) {
      console.error(error.response?.data || error.message);
      setOpenDeleteModal(false);
      showFeedback(
        error.response?.data?.message || "Error al dar de baja.",
        "error",
      );
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
        {
          plan_id: planId,
          teacher_id: "",
          first_payment_option: "",
          availableTeachers,
        },
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

  useEffect(() => {
    fetchStudents();
  }, [selectedTeacher, selectedPlan, selectedStatus, selectedPlanStatus]);

  useEffect(() => {
    fetchFilters();
  }, []);

  // ======================================================
  // DATOS DERIVADOS
  // ======================================================
  const buttonClass = "cursor-pointer transition transform hover:scale-105";

  // Estado de un plan puntual, para la columna "Estado del plan".
  const getPlanStatusInfo = (plan) => {
    if (plan.academic_status === "INACTIVE") {
      return { text: "Baja (con deuda)", color: "text-red-700" };
    }
    if (plan.account_status === "OVERDUE") {
      return { text: "Debe", color: "text-orange-600" };
    }
    if (plan.current_period_status === "pending") {
      return { text: "Pendiente", color: "text-yellow-600" };
    }
    if (plan.current_period_status === "paid") {
      return { text: "Al día", color: "text-green-600" };
    }
    if (plan.current_period_status === "not_due_yet") {
      return { text: "Aún no corresponde", color: "text-gray-500" };
    }
    return { text: "-", color: "text-gray-400" };
  };

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
    { header: "Apellidos", accessor: "last_name" },
    { header: "Nombres", accessor: "first_name" },
    {
      header: "Estados",
      render: (row) => {
        const plans = row.activePlans || [];

        if (!plans.length) {
          return <span className="font-medium text-red-600">● Inactivo</span>;
        }

        const hasActive = plans.some((p) => p.academic_status === "ACTIVE");

        if (!hasActive) {
          return (
            <span className="font-medium text-red-700">
              ● Inactivo (con deuda)
            </span>
          );
        }

        const suspended = plans.some(
          (p) =>
            p.academic_status === "ACTIVE" && p.account_status === "OVERDUE",
        );

        if (suspended) {
          return (
            <span className="font-medium text-orange-600">● Suspendido</span>
          );
        }

        return <span className="font-medium text-green-600">● Activo</span>;
      },
    },
  ];

  columns.push({
    header: "Planes",
    render: (row) => (
      <div className="flex flex-col gap-2">
        {row.activePlans?.length > 0 ? (
          row.activePlans.map((p) => (
            <div
              key={p.student_plan_id}
              className="text-sm font-medium h-6 flex items-center"
            >
              {p.plan_name}
            </div>
          ))
        ) : (
          <span className="text-sm italic text-gray-500">
            Editar para asignar plan y docente
          </span>
        )}
      </div>
    ),
  });

  columns.push({
    header: "Docentes",
    render: (row) => (
      <div className="flex flex-col gap-2">
        {row.activePlans?.length > 0 ? (
          row.activePlans.map((p) => (
            <div
              key={p.student_plan_id}
              className="text-xs text-gray-500 h-6 flex items-center"
            >
              {p.teacher_name}
            </div>
          ))
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </div>
    ),
  });

  columns.push({
    header: "Estados de los planes",
    render: (row) => (
      <div className="flex flex-col gap-2">
        {row.activePlans?.length > 0 ? (
          row.activePlans.map((p) => {
            const info = getPlanStatusInfo(p);

            return (
              <div
                key={p.student_plan_id}
                className={`text-xs font-medium h-6 flex items-center ${info.color}`}
              >
                {info.text}
              </div>
            );
          })
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </div>
    ),
  });

  // Botón Activar solo en "Total de Estudiantes" para estudiantes inactivos
  if (isAdmin()) {
    columns.push({
      header: "Acciones",
      render: (row) => (
        <div className="flex gap-2">
          <ViewButton title="Ver Estudiante" onClick={() => handleView(row)} />

          <EditButton
            title="Editar Estudiante"
            onClick={() => handleEdit(row)}
          />

          <DeleteButton
            title="Eliminar Estudiante"
            onClick={() => handleDelete(row)}
          />
        </div>
      ),
    });
  }

  const showCreateButtons = isAdmin();

  const tableTitle = (
    <div className="flex justify-between items-center">
      <span>Estudiantes</span>
      {showCreateButtons && (
        <PlusButton title="Crear Estudiante" onClick={openCreate} />
      )}
    </div>
  );

  const student = selectedStudent?.student;

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
                dark:border-gray-700
                rounded-xl
                p-3
                bg-white
                dark:bg-gray-800
                shadow-sm
              "
            >
              <Checkbox
                label={plan.name}
                checked={!!row}
                onChange={(checked) => togglePlan(plan.id, checked)}
              />

              {row && (
                <>
                  <Select
                    className="mt-2"
                    value={row.teacher_id}
                    onChange={(e) =>
                      updateClassRowByPlan(
                        plan.id,
                        "teacher_id",
                        e.target.value,
                      )
                    }
                  >
                    <option value="">Seleccione un Docente</option>

                    {row.availableTeachers?.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.last_name}, {teacher.first_name}
                      </option>
                    ))}
                  </Select>

                  {/* Solo se pide en planes NUEVOS (sin student_plan_id).
                      Un plan existente que solo cambia de docente no
                      vuelve a preguntar esto: el backend copia la
                      opción que ya tenía la inscripción. */}
                  {!row.student_plan_id && (
                    <Select
                      className="mt-2"
                      value={row.first_payment_option || ""}
                      onChange={(e) =>
                        updateClassRowByPlan(
                          plan.id,
                          "first_payment_option",
                          e.target.value,
                        )
                      }
                    >
                      <option value="">Primer pago</option>
                      <option value="FULL">Cuota completa</option>
                      <option value="HALF">Media cuota</option>
                      <option value="NEXT_MONTH">
                        Empieza a pagar el próximo mes
                      </option>
                    </Select>
                  )}
                </>
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
          <option value="">Todos los estudiantes</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
          <option value="suspended">Suspendidos</option>
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
          value={selectedPlanStatus}
          onChange={(e) => setSelectedPlanStatus(e.target.value)}
          className="p-2 border border-gray-300 rounded min-w-56"
        >
          <option value="">Estado del plan</option>
          <option value="paid">Al día</option>
          <option value="pending">Pendiente</option>
          <option value="overdue">Debe</option>
          <option value="baja_deuda">Baja (con deuda)</option>
          <option value="not_due_yet">Aún no corresponde</option>
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
            Crear Estudiante
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
        <h2 className="text-xl font-bold mb-8">Crear Estudiante</h2>

        <Label>Nombre</Label>
        <Input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={errorsCreate.first_name}
        />

        <Label>Apellido</Label>
        <Input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          error={errorsCreate.last_name}
        />

        <Label>DNI</Label>
        <Input
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          error={errorsCreate.dni}
        />

        <Label>Colegio o universidad</Label>
        <Input
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          error={errorsCreate.school}
        />

        <Label>Fecha de nacimiento</Label>
        <Input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          error={errorsCreate.birth_date}
        />

        <Label>Nivel </Label>
        <Select
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

        <Label>Grado o año</Label>
        <Select
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
        <h2 className="text-xl font-bold mb-8">Editar Estudiante</h2>

        <Label>Nombre</Label>
        <Input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={errorsEdit.first_name}
        />

        <Label>Apellido</Label>
        <Input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          error={errorsEdit.last_name}
        />

        <Label>DNI</Label>
        <Input
          label="DNI"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          error={errorsEdit.dni}
        />

        <Label>Colegio o universidad</Label>
        <Input
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          error={errorsEdit.school}
        />

        <Label>Fecha de nacimiento</Label>
        <Input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          error={errorsEdit.birth_date}
        />

        <Label>Nivel</Label>
        <Select
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

        <Label>Grado o año</Label>
        <Select
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
        <h2 className="text-xl font-bold mb-8">Datos del Estudiante</h2>

        <div className="rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold">Estudiante</h4>
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
            Este estudiante no posee tutores registrados.
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
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-semibold">Plan</h4>
                    <p className="text-gray-500">
                      {plan.plan_name}
                      {plan.academic_status === "INACTIVE" && (
                        <span className="text-red-600 text-xs ml-1">
                          (de baja)
                        </span>
                      )}
                    </p>
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

                  <div>
                    <h4 className="font-semibold">Debe</h4>
                    <p
                      className={
                        plan.debt > 0
                          ? "text-red-600 font-semibold"
                          : "text-gray-500"
                      }
                    >
                      {plan.debt > 0
                        ? `$${Number(plan.debt).toLocaleString("es-AR")}`
                        : "Al día"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            El estudiante no posee planes activos.
          </p>
        )}
      </Modal>

      <Modal isOpen={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <h2 className="text-lg font-semibold mb-4">¿Eliminar estudiante?</h2>

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
      </Modal>
    </>
  );
}
