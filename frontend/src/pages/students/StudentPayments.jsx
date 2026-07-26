import { useEffect, useState } from "react";
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import Button from "../../components/ui/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/Input";
import Select from "../../components/form/Select";
import SubmitButton from "../../components/form/SubmitButton";
import { Modal } from "../../components/ui/Modal";
import ComponentCard from "../../components/common/ComponentCard";
import { PaymentService } from "../../services/payment.service";
import { studentPlanService } from "../../services/studenPlan.service";
import { studentService } from "../../services/student.service";
import { EnrollmentService } from "../../services/enrollment.service";
import { useFeedbackModal } from "../../hooks/useFeedbackModal";
import { validatePaymentForm } from "../../validators/entities/payments.validator";
import {
  validateEnrollmentForm,
  validateEditEnrollmentForm,
} from "../../validators/entities/enrollments.validator";
import {
  YesButton,
  NoButton,
  EditButton,
  DeleteButton,
} from "../../components/ui/ActionButtons";
import { getTodayLocal } from "../../utils/date";

// ======================================================
// Arma las opciones de período que se le pueden ofrecer al admin
// para un student_plan puntual, a partir del estado que devuelve
// studentPlanService.getStatus(). extraPeriod es el período que ya
// tenía un pago que se está editando (para no perder la posibilidad
// de mantenerlo aunque ya no figure como "vigente").
// ======================================================
const STATUS_LABELS = {
  pending: "Pendiente",
  paid: "Ya pagado",
  on_hold: "En espera (hay una deuda anterior)",
  not_due_yet: "Todavía no corresponde pagar",
};

function getPeriodOptions(status, extraPeriod = null) {
  const options = [];

  (status?.overdue_periods || []).forEach((o) => {
    options.push({
      value: o.period,
      label: `Regularizar ${o.period} (+15%)`,
    });
  });

  const currentIsOverdue = (status?.overdue_periods || []).some(
    (o) => o.period === status?.current_period?.period,
  );

  // No ofrecemos un período que ya está pagado como opción normal
  // (para eso está extraPeriod, que lo mantiene disponible SOLO al
  // editar el pago que ya lo saldó).
  if (
    status?.current_period &&
    status.current_period.status !== "not_due_yet" &&
    status.current_period.status !== "paid" &&
    !currentIsOverdue
  ) {
    const label =
      STATUS_LABELS[status.current_period.status] ||
      status.current_period.status;

    options.push({
      value: status.current_period.period,
      label: `${status.current_period.period} — ${label}`,
    });
  }

  if (extraPeriod && !options.some((o) => o.value === extraPeriod)) {
    options.push({
      value: extraPeriod,
      label: `${extraPeriod} (período original de este pago)`,
    });
  }

  return options;
}

export default function StudentPayments() {
  // ======================================================
  // DATOS
  // ======================================================
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentPlans, setStudentPlans] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  // ======================================================
  // MODALES
  // ======================================================
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditPaymentModal, setOpenEditPaymentModal] = useState(false);
  const [openCreateEnrollmentModal, setOpenCreateEnrollmentModal] =
    useState(false);
  const [openEditEnrollmentModal, setOpenEditEnrollmentModal] = useState(false);

  // ======================================================
  // MODAL DE FEEDBACK (hook compartido)
  // ======================================================
  const { feedbackModal, showFeedback, closeFeedback } = useFeedbackModal();

  // ======================================================
  // FORMULARIO: REGISTRAR PAGO
  // ======================================================
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedStudentPlan, setSelectedStudentPlan] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [errorsPayment, setErrorsPayment] = useState({});
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [errorsEditPayment, setErrorsEditPayment] = useState({});

  // Estado del plan seleccionado (académico + de cuenta + período a
  // pagar), y período elegido por el admin dentro de las opciones
  // que ese estado habilita. originalPaymentPeriod solo se usa en
  // edición, para no perder el período que el pago ya tenía.
  const [planStatus, setPlanStatus] = useState(null);
  const [paymentPeriod, setPaymentPeriod] = useState("");
  const [originalPaymentPeriod, setOriginalPaymentPeriod] = useState(null);

  // Fecha local (evita el corrimiento de día por UTC-3 de toISOString)
  const getLocalDateString = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    return new Date(d.getTime() - offset * 60000).toISOString().split("T")[0];
  };

  const [paymentDate, setPaymentDate] = useState(getLocalDateString());

  // ======================================================
  // FORMULARIO: REGISTRAR INSCRIPCIÓN
  // ======================================================
  const [enrollmentStudents, setEnrollmentStudents] = useState([]);
  const [enrollmentAmount, setEnrollmentAmount] = useState("");
  const [enrollmentDate, setEnrollmentDate] = useState(getLocalDateString());
  const [errorsEnrollment, setErrorsEnrollment] = useState({});

  // ======================================================
  // FORMULARIO: EDITAR INSCRIPCIÓN
  // ======================================================
  const [enrollmentStudent, setEnrollmentStudent] = useState("");
  const [editingEnrollmentId, setEditingEnrollmentId] = useState(null);
  const [errorsEditEnrollment, setErrorsEditEnrollment] = useState({});

  // ======================================================
  // FILTRO DE MES / AÑO
  // ======================================================
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const today = getTodayLocal();

  const currentYear = Number(today.split("-")[0]);
  const currentMonth = Number(today.split("-")[1]);

  const isCurrentMonth = month === currentMonth && year === currentYear;

  // ======================================================
  // FETCH DATOS
  // ======================================================
  const fetchStudents = async () => {
    try {
      const { data } = await studentService.getActiveStudents();
      setStudents(data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPayments = async () => {
    try {
      const { data } = await PaymentService.getMonthly(month, year);

      setPayments(data.data || []);
    } catch (error) {
      console.error(error);
      setPayments([]);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const { data } = await EnrollmentService.getMonthly(month, year);

      setEnrollments(data.data || []);
    } catch (error) {
      console.error(error);
      setEnrollments([]);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchEnrollments();
    fetchStudents();
  }, [month, year]);

  // Cuando cambia el estado del plan (recién elegido, o recién
  // cargado al editar), si todavía no hay un período elegido, se
  // preselecciona el primero disponible (prioriza la deuda vieja
  // sobre el período actual, por eso va primero en getPeriodOptions).
  useEffect(() => {
    if (!planStatus) return;

    setPaymentPeriod((prev) => {
      if (prev) return prev;

      const options = getPeriodOptions(planStatus, originalPaymentPeriod);
      return options[0]?.value || "";
    });
  }, [planStatus]);

  // ======================================================
  // NAVEGACIÓN DE MES
  // ======================================================
  const previousMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((prev) => prev - 1);
    } else {
      setMonth((prev) => prev - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((prev) => prev + 1);
    } else {
      setMonth((prev) => prev + 1);
    }
  };

  // ======================================================
  // TOTALES
  // ======================================================
  const totalPayments = payments.reduce(
    (acc, payment) => acc + Number(payment.amount),
    0,
  );

  const totalEnrollments = enrollments.reduce(
    (acc, enrollment) => acc + Number(enrollment.amount),
    0,
  );

  const totalCollected = totalPayments + totalEnrollments;

  // ======================================================
  // RESETEOS DE FORMULARIO
  // ======================================================
  const resetPaymentForm = () => {
    setSelectedStudent("");
    setSelectedStudentPlan("");
    setPaymentMethod("");
    setPaymentDate(getLocalDateString());
    setPlanStatus(null);
    setPaymentPeriod("");
    setOriginalPaymentPeriod(null);
    setErrorsPayment({});
  };

  const resetEditPaymentForm = () => {
    setSelectedStudent("");
    setSelectedStudentPlan("");
    setStudentPlans([]);
    setPaymentMethod("");
    setPaymentDate(getLocalDateString());
    setPlanStatus(null);
    setPaymentPeriod("");
    setOriginalPaymentPeriod(null);
    setEditingPaymentId(null);
    setErrorsEditPayment({});
  };

  const resetEnrollmentForm = () => {
    setEnrollmentStudents([]);
    setEnrollmentAmount("");
    setEnrollmentDate(getLocalDateString());
    setErrorsEnrollment({});
  };

  const resetEditEnrollmentForm = () => {
    setEnrollmentStudent("");
    setEnrollmentAmount("");
    setEnrollmentDate(getLocalDateString());
    setEditingEnrollmentId(null);
    setErrorsEditEnrollment({});
  };

  // ======================================================
  // HANDLES: PAGO
  // ======================================================
  const handleStudentChange = async (studentId) => {
    setSelectedStudent(studentId);
    setSelectedStudentPlan("");
    setPlanStatus(null);
    setPaymentPeriod("");

    try {
      const { data } = await PaymentService.getStudentPlans(studentId);

      setStudentPlans(data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  // Al elegir un plan (o al cargarlo automáticamente al editar), se
  // consulta su estado para saber qué períodos se pueden pagar y si
  // corresponde regularización.
  const handlePlanSelect = async (studentPlanId) => {
    setSelectedStudentPlan(studentPlanId);
    setPaymentPeriod("");
    setPlanStatus(null);

    if (!studentPlanId) return;

    try {
      const { data } = await studentPlanService.getStatus(studentPlanId);
      setPlanStatus(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreatePayment = async () => {
    const errors = validatePaymentForm({
      selectedStudent,
      selectedStudentPlan,
      paymentDate,
      paymentPeriod,
      paymentMethod,
    });

    if (Object.keys(errors).length > 0) {
      setErrorsPayment(errors);
      return;
    }

    try {
      setErrorsPayment({});

      // Aviso de duplicado: informativo, no bloquea. El admin decide
      // si continúa.
      const { data: dupData } = await PaymentService.checkDuplicate(
        selectedStudentPlan,
        paymentPeriod,
      );

      if (dupData?.exists) {
        const confirmed = window.confirm(
          "Ya existe un pago registrado para este período. ¿Desea registrarlo de todos modos?",
        );
        if (!confirmed) return;
      }

      await PaymentService.create({
        student_plan_id: selectedStudentPlan,
        payment_date: paymentDate,
        payment_period: paymentPeriod,
        payment_method: paymentMethod,
      });

      await fetchPayments();

      setOpenCreateModal(false);
      resetPaymentForm();

      showFeedback("Pago registrado correctamente.", "success");
    } catch (error) {
      const data = error.response?.data;

      // Error de negocio/backend (no es de un campo puntual) -> modal
      const message = data?.requiresEnrollment
        ? "El estudiante debe realizar una nueva inscripción antes de registrar el pago."
        : data?.message || "Error al registrar el pago.";

      showFeedback(message, "error");
    }
  };

  // ======================================================
  // HANDLES: PAGO (editar)
  // ======================================================
  const handleEditPayment = async (payment) => {
    setEditingPaymentId(payment.id);
    setSelectedStudent(payment.student_id);
    setPaymentDate(payment.payment_date.split("T")[0]);
    setPaymentMethod(payment.payment_method);
    setPaymentPeriod(payment.payment_period);
    setOriginalPaymentPeriod(payment.payment_period);
    setErrorsEditPayment({});

    try {
      const { data } = await PaymentService.getStudentPlans(payment.student_id);

      setStudentPlans(data.data || []);
      setSelectedStudentPlan(payment.student_plan_id);

      const { data: statusData } = await studentPlanService.getStatus(
        payment.student_plan_id,
      );
      setPlanStatus(statusData.data);
    } catch (error) {
      console.error(error);
    }

    setOpenEditPaymentModal(true);
  };

  const handleUpdatePayment = async () => {
    const errors = validatePaymentForm({
      selectedStudent,
      selectedStudentPlan,
      paymentDate,
      paymentPeriod,
      paymentMethod,
    });

    if (Object.keys(errors).length > 0) {
      setErrorsEditPayment(errors);
      return;
    }

    try {
      setErrorsEditPayment({});

      const { data: dupData } = await PaymentService.checkDuplicate(
        selectedStudentPlan,
        paymentPeriod,
        editingPaymentId,
      );

      if (dupData?.exists) {
        const confirmed = window.confirm(
          "Ya existe otro pago registrado para este período. ¿Desea guardar de todos modos?",
        );
        if (!confirmed) return;
      }

      await PaymentService.update(editingPaymentId, {
        student_plan_id: selectedStudentPlan,
        payment_date: paymentDate,
        payment_period: paymentPeriod,
        payment_method: paymentMethod,
      });

      await fetchPayments();

      setOpenEditPaymentModal(false);
      resetEditPaymentForm();

      showFeedback("Pago actualizado correctamente.", "success");
    } catch (error) {
      showFeedback(
        error.response?.data?.message || "Error al editar el pago.",
        "error",
      );
    }
  };

  // ======================================================
  // HANDLES: PAGO (eliminar)
  // ======================================================
  const handleDeletePayment = async (id) => {
    const confirmed = window.confirm("¿Desea eliminar este pago?");

    if (!confirmed) return;

    try {
      await PaymentService.delete(id);

      await fetchPayments();

      showFeedback("Pago eliminado correctamente.", "success");
    } catch (error) {
      showFeedback(
        error.response?.data?.message || "Error al eliminar el pago.",
        "error",
      );
    }
  };

  // ======================================================
  // HANDLES: INSCRIPCIÓN (crear)
  // ======================================================
  const toggleEnrollmentStudent = (studentId) => {
    setEnrollmentStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const handleCreateEnrollment = async () => {
    const errors = validateEnrollmentForm({
      enrollmentStudents,
      enrollmentAmount,
      enrollmentDate,
    });

    if (Object.keys(errors).length > 0) {
      setErrorsEnrollment(errors);
      return;
    }

    try {
      setErrorsEnrollment({});

      await Promise.all(
        enrollmentStudents.map((studentId) =>
          EnrollmentService.create({
            student_id: studentId,
            amount: enrollmentAmount,
            payment_date: enrollmentDate,
          }),
        ),
      );

      await fetchEnrollments();

      setOpenCreateEnrollmentModal(false);
      resetEnrollmentForm();

      showFeedback("Inscripción/es registrada/s correctamente.", "success");
    } catch (error) {
      showFeedback(
        error.response?.data?.message || "Error al registrar inscripción.",
        "error",
      );
    }
  };

  // ======================================================
  // HANDLES: INSCRIPCIÓN (editar)
  // ======================================================
  const handleEditEnrollment = (enrollment) => {
    setEditingEnrollmentId(enrollment.id);
    setEnrollmentStudent(enrollment.student_id);
    setEnrollmentAmount(enrollment.amount);
    setEnrollmentDate(enrollment.payment_date.split("T")[0]);
    setErrorsEditEnrollment({});

    setOpenEditEnrollmentModal(true);
  };

  const handleUpdateEnrollment = async () => {
    const errors = validateEditEnrollmentForm({
      enrollmentStudent,
      enrollmentAmount,
      enrollmentDate,
    });

    if (Object.keys(errors).length > 0) {
      setErrorsEditEnrollment(errors);
      return;
    }

    try {
      setErrorsEditEnrollment({});

      await EnrollmentService.update(editingEnrollmentId, {
        student_id: enrollmentStudent,
        amount: enrollmentAmount,
        payment_date: enrollmentDate,
      });

      await fetchEnrollments();

      setOpenEditEnrollmentModal(false);
      resetEditEnrollmentForm();

      showFeedback("Inscripción actualizada.", "success");
    } catch (error) {
      showFeedback(
        error.response?.data?.message || "Error al editar inscripción.",
        "error",
      );
    }
  };

  // ======================================================
  // HANDLES: INSCRIPCIÓN (eliminar)
  // ======================================================
  const handleDeleteEnrollment = async (id) => {
    const confirmed = window.confirm("¿Desea eliminar esta inscripción?");

    if (!confirmed) return;

    try {
      await EnrollmentService.delete(id);

      await fetchEnrollments();

      showFeedback("Inscripción eliminada.", "success");
    } catch (error) {
      showFeedback(
        error.response?.data?.message || "Error al eliminar inscripción.",
        "error",
      );
    }
  };

  // ======================================================
  // COLUMNAS DE TABLAS
  // ======================================================
  const columns = [
    {
      header: "Fecha",
      render: (row) => new Date(row.payment_date).toLocaleDateString("es-AR"),
    },
    {
      header: "Estudiante",
      render: (row) => `${row.last_name}, ${row.first_name}`,
    },
    {
      header: "Plan",
      accessor: "plan_name",
    },
    {
      header: "Período",
      accessor: "payment_period",
    },
    {
      header: "Tipo",
      render: (row) => (
        <span
          className={
            row.payment_type === "REGULARIZATION"
              ? "text-amber-600 font-medium"
              : "text-gray-600"
          }
        >
          {row.payment_type === "REGULARIZATION" ? "Regularización" : "Normal"}
        </span>
      ),
    },
    {
      header: "Monto",
      render: (row) => `$${Number(row.amount).toLocaleString("es-AR")}`,
    },
    {
      header: "Método",
      accessor: "payment_method",
    },
    {
      header: "Acciones",
      render: (row) => (
        <div className="flex gap-2">
          <EditButton
            title="Editar Pago"
            onClick={() => handleEditPayment(row)}
          />

          <DeleteButton
            title="Eliminar Pago"
            onClick={() => handleDeletePayment(row.id)}
          />
        </div>
      ),
    },
  ];

  const enrollmentColumns = [
    {
      header: "Fecha",
      render: (row) => new Date(row.payment_date).toLocaleDateString("es-AR"),
    },
    {
      header: "Estudiante",
      render: (row) => `${row.last_name}, ${row.first_name}`,
    },
    {
      header: "Monto",
      render: (row) => `$${Number(row.amount).toLocaleString("es-AR")}`,
    },
    {
      header: "Acciones",
      render: (row) => (
        <div className="flex gap-2">
          <EditButton
            title="Editar Inscripción"
            onClick={() => handleEditEnrollment(row)}
          />

          <DeleteButton
            title="Eliminar Inscripción"
            onClick={() => handleDeleteEnrollment(row.id)}
          />
        </div>
      ),
    },
  ];

  // Títulos de tabla con el botón correspondiente arriba de cada una
  const paymentsTableTitle = (
    <div className="flex justify-between items-center">
      <span>Pagos de estudiantes</span>
      <Button onClick={() => setOpenCreateModal(true)}>Registrar cuota</Button>
    </div>
  );

  const enrollmentsTableTitle = (
    <div className="flex justify-between items-center">
      <span>Inscripciones</span>
      <Button onClick={() => setOpenCreateEnrollmentModal(true)}>
        Registrar inscripción
      </Button>
    </div>
  );

  const createPeriodOptions = getPeriodOptions(planStatus);
  const editPeriodOptions = getPeriodOptions(planStatus, originalPaymentPeriod);

  // ======================================================
  // RETURN
  // ======================================================
  return (
    <>
      {/* ---------- Navegación de mes ---------- */}
      <div className="flex justify-center items-center gap-4 mb-6">
        <Button onClick={previousMonth}>◀</Button>

        <h2 className="text-xl font-bold">
          {monthNames[month - 1]} {year}
        </h2>

        <Button onClick={nextMonth} disabled={isCurrentMonth}>
          ▶
        </Button>
      </div>

      {/* ---------- Totales ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <ComponentCard title="Cuotas">
          <p className="text-2xl font-bold">{payments.length}</p>
        </ComponentCard>

        <ComponentCard title="Total de cuotas">
          <p className="text-2xl font-bold">
            ${totalPayments.toLocaleString("es-AR")}
          </p>
        </ComponentCard>

        <ComponentCard title="Inscripciones">
          <p className="text-2xl font-bold">{enrollments.length}</p>
        </ComponentCard>

        <ComponentCard title="Total de inscripciones">
          <p className="text-2xl font-bold">
            ${totalEnrollments.toLocaleString("es-AR")}
          </p>
        </ComponentCard>

        <ComponentCard title="Total recaudado">
          <p className="text-2xl font-bold">
            ${totalCollected.toLocaleString("es-AR")}
          </p>
        </ComponentCard>
      </div>

      {/* ======================================================
          MODAL: REGISTRAR PAGO
      ====================================================== */}
      <Modal
        isOpen={openCreateModal}
        onClose={() => {
          setOpenCreateModal(false);
          resetPaymentForm();
        }}
      >
        <h2 className="text-xl font-bold mb-6">Registrar pago</h2>

        <Select
          label="Estudiante"
          value={selectedStudent}
          onChange={(e) => handleStudentChange(e.target.value)}
          error={errorsPayment.student}
        >
          <option value="">Seleccione un estudiante</option>

          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.last_name}, {student.first_name}
            </option>
          ))}
        </Select>

        <Select
          label="Plan"
          value={selectedStudentPlan}
          onChange={(e) => handlePlanSelect(e.target.value)}
          error={errorsPayment.plan}
        >
          <option value="">Seleccione un plan</option>

          {studentPlans.map((plan) => (
            <option key={plan.student_plan_id} value={plan.student_plan_id}>
              {plan.plan_name}
            </option>
          ))}
        </Select>

        {selectedStudentPlan && createPeriodOptions.length > 0 && (
          <Select
            label="Período a pagar"
            value={paymentPeriod}
            onChange={(e) => setPaymentPeriod(e.target.value)}
            error={errorsPayment.period}
          >
            <option value="">Seleccione un período</option>

            {createPeriodOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        )}

        {selectedStudentPlan && createPeriodOptions.length === 0 && (
          <p className="text-green-600 font-medium my-2">
            Este alumno está al día con este plan. No hay ningún período
            pendiente de pago.
          </p>
        )}

        <Input
          type="date"
          label="Fecha de pago"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          error={errorsPayment.date}
        />

        <Select
          label="Método de pago"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          error={errorsPayment.method}
        >
          <option value="">Seleccione un método</option>

          <option value="efectivo">Efectivo</option>
          <option value="transferencia">Transferencia</option>
          <option value="qr"> Código QR</option>
          <option value="otro">Otro</option>
        </Select>

        <div className="flex justify-end gap-3">
          <NoButton
            title="Cancelar"
            variant="outline"
            onClick={() => {
              setOpenCreateModal(false);
              resetPaymentForm();
            }}
          />

          <YesButton
            title="Aceptar"
            onClick={handleCreatePayment}
            disabled={!!selectedStudentPlan && createPeriodOptions.length === 0}
          />
        </div>
      </Modal>

      {/* ======================================================
          MODAL: EDITAR PAGO
      ====================================================== */}
      <Modal
        isOpen={openEditPaymentModal}
        onClose={() => {
          setOpenEditPaymentModal(false);
          resetEditPaymentForm();
        }}
      >
        <h2 className="text-xl font-bold mb-6">Editar pago</h2>

        <Select
          label="Estudiante"
          value={selectedStudent}
          onChange={(e) => handleStudentChange(e.target.value)}
          error={errorsEditPayment.student}
        >
          <option value="">Seleccione un estudiante</option>

          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.last_name}, {student.first_name}
            </option>
          ))}
        </Select>

        <Select
          label="Plan"
          value={selectedStudentPlan}
          onChange={(e) => handlePlanSelect(e.target.value)}
          error={errorsEditPayment.plan}
        >
          <option value="">Seleccione un plan</option>

          {studentPlans.map((plan) => (
            <option key={plan.student_plan_id} value={plan.student_plan_id}>
              {plan.plan_name}
            </option>
          ))}
        </Select>

        {selectedStudentPlan && (
          <Select
            label="Período a pagar"
            value={paymentPeriod}
            onChange={(e) => setPaymentPeriod(e.target.value)}
            error={errorsEditPayment.period}
          >
            <option value="">Seleccione un período</option>

            {editPeriodOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        )}

        <Input
          type="date"
          label="Fecha de pago"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          error={errorsEditPayment.date}
        />

        <Select
          label="Método de pago"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          error={errorsEditPayment.method}
        >
          <option value="">Seleccione un método</option>

          <option value="efectivo">Efectivo</option>
          <option value="transferencia">Transferencia</option>
          <option value="qr"> Código QR</option>
          <option value="otro">Otro</option>
        </Select>

        <div className="flex justify-end gap-3">
          <NoButton
            title="Cancelar"
            variant="outline"
            onClick={() => {
              setOpenEditPaymentModal(false);
              resetEditPaymentForm();
            }}
          />

          <YesButton title="Aceptar" onClick={handleUpdatePayment} />
        </div>
      </Modal>

      {/* ======================================================
          MODAL: REGISTRAR INSCRIPCIÓN
      ====================================================== */}
      <Modal
        isOpen={openCreateEnrollmentModal}
        onClose={() => {
          setOpenCreateEnrollmentModal(false);
          resetEnrollmentForm();
        }}
      >
        <h2 className="text-xl font-bold mb-6">Registrar inscripción</h2>
        <Select
          label="Estudiante"
          value={enrollmentStudent}
          onChange={(e) => setEnrollmentStudent(e.target.value)}
          error={errorsEnrollment.student}
        >
          <option value="">Seleccione un estudiante</option>

          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.last_name}, {student.first_name}
            </option>
          ))}
        </Select>

        {errorsEnrollment.students && (
          <p className="text-red-500 text-sm mb-3">
            {errorsEnrollment.students}
          </p>
        )}

        <Input
          type="number"
          label="Monto"
          value={enrollmentAmount}
          onChange={(e) => setEnrollmentAmount(e.target.value)}
          error={errorsEnrollment.amount}
        />

        <Input
          type="date"
          label="Fecha de pago"
          value={enrollmentDate}
          onChange={(e) => setEnrollmentDate(e.target.value)}
          error={errorsEnrollment.date}
        />

        <div className="flex justify-end gap-3">
          <NoButton
            title="Cancelar"
            variant="outline"
            onClick={() => {
              setOpenCreateEnrollmentModal(false);
              resetEnrollmentForm();
            }}
          />

          <YesButton title="Aceptar" onClick={handleCreateEnrollment} />
        </div>
      </Modal>

      {/* ======================================================
          MODAL: EDITAR INSCRIPCIÓN
      ====================================================== */}
      <Modal
        isOpen={openEditEnrollmentModal}
        onClose={() => {
          setOpenEditEnrollmentModal(false);
          resetEditEnrollmentForm();
        }}
      >
        <h2 className="text-xl font-bold mb-6">Editar inscripción</h2>

        <Select
          label="Estudiante"
          value={enrollmentStudent}
          onChange={(e) => setEnrollmentStudent(e.target.value)}
          error={errorsEditEnrollment.student}
        >
          <option value="">Seleccione un estudiante</option>

          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.last_name}, {student.first_name}
            </option>
          ))}
        </Select>

        <Input
          type="number"
          label="Monto"
          value={enrollmentAmount}
          onChange={(e) => setEnrollmentAmount(e.target.value)}
          error={errorsEditEnrollment.amount}
        />

        <Input
          type="date"
          label="Fecha"
          value={enrollmentDate}
          onChange={(e) => setEnrollmentDate(e.target.value)}
          error={errorsEditEnrollment.date}
        />

        <div className="flex justify-end gap-3">
          <NoButton
            title="Cancelar"
            variant="outline"
            onClick={() => {
              setOpenEditEnrollmentModal(false);
              resetEditEnrollmentForm();
            }}
          />

          <YesButton title="Aceptar" onClick={handleUpdateEnrollment} />
        </div>
      </Modal>

      {/* ======================================================
          MODAL DE FEEDBACK (éxito/error general)
      ====================================================== */}
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

      {/* ---------- Tablas ---------- */}
      <BasicTable
        title={paymentsTableTitle}
        columns={columns}
        data={payments}
      />

      <div className="mt-8">
        <BasicTable
          title={enrollmentsTableTitle}
          columns={enrollmentColumns}
          data={enrollments}
        />
      </div>
    </>
  );
}
