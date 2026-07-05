import { useEffect, useState } from "react";
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import Button from "../../components/ui/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/Input";
import Select from "../../components/form/Select";
import SubmitButton from "../../components/form/SubmitButton";
import { Modal } from "../../components/ui/Modal";
import { PaymentService } from "../../services/payment.service";
import { studentService } from "../../services/student.service";
import { EnrollmentService } from "../../services/enrollment.service";

export default function StudentPayments() {
  const [payments, setPayments] = useState([]);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openCreateEnrollmentModal, setOpenCreateEnrollmentModal] =
    useState(false);
  const [students, setStudents] = useState([]);
  const [studentPlans, setStudentPlans] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedStudentPlan, setSelectedStudentPlan] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  // Fecha local (evita el corrimiento de día por UTC-3 de toISOString)
  const getLocalDateString = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    return new Date(d.getTime() - offset * 60000).toISOString().split("T")[0];
  };

  const [paymentDate, setPaymentDate] = useState(getLocalDateString());

  // Inscripción: ahora se pueden tildar varios alumnos (hermanos)
  const [enrollmentStudents, setEnrollmentStudents] = useState([]);
  const [enrollmentAmount, setEnrollmentAmount] = useState("");
  const [enrollmentDate, setEnrollmentDate] = useState(getLocalDateString());

  // Edición de inscripción (sigue siendo de a un alumno por vez)
  const [enrollmentStudent, setEnrollmentStudent] = useState("");
  const [openEditEnrollmentModal, setOpenEditEnrollmentModal] = useState(false);
  const [editingEnrollmentId, setEditingEnrollmentId] = useState(null);

  // ======================================================
  // MODAL DE FEEDBACK (reemplaza los alert())
  // ======================================================
  const [feedbackModal, setFeedbackModal] = useState({
    open: false,
    type: "error",
    message: "",
  });

  const showFeedback = (message, type = "error") =>
    setFeedbackModal({ open: true, type, message });

  const closeFeedback = () =>
    setFeedbackModal((prev) => ({ ...prev, open: false }));

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

  const totalPayments = payments.reduce(
    (acc, payment) => acc + Number(payment.amount),
    0,
  );

  const totalEnrollments = enrollments.reduce(
    (acc, enrollment) => acc + Number(enrollment.amount),
    0,
  );

  const totalCollected = totalPayments + totalEnrollments;

  const handleStudentChange = async (studentId) => {
    setSelectedStudent(studentId);
    setSelectedStudentPlan("");

    try {
      const { data } = await PaymentService.getStudentPlans(studentId);

      setStudentPlans(data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreatePayment = async () => {
    try {
      await PaymentService.create({
        student_plan_id: selectedStudentPlan,
        payment_date: paymentDate,
        payment_method: paymentMethod,
      });

      await fetchPayments();

      setOpenCreateModal(false);
      setSelectedStudent("");
      setSelectedStudentPlan("");
      setPaymentMethod("");

      showFeedback("Pago registrado correctamente.", "success");
    } catch (error) {
      const data = error.response?.data;

      const message = data?.requiresEnrollment
        ? "El alumno debe realizar una nueva inscripción antes de registrar el pago."
        : data?.message || "Error al registrar el pago.";

      showFeedback(message, "error");
    }
  };

  // ======================================================
  // INSCRIPCIÓN: selección múltiple de alumnos (hermanos)
  // ======================================================
  const toggleEnrollmentStudent = (studentId) => {
    setEnrollmentStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const handleCreateEnrollment = async () => {
    if (!enrollmentStudents.length) {
      showFeedback("Seleccione al menos un alumno.", "error");
      return;
    }

    try {
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
      setEnrollmentStudents([]);
      setEnrollmentAmount("");

      showFeedback("Inscripción/es registrada/s correctamente.", "success");
    } catch (error) {
      showFeedback(
        error.response?.data?.message || "Error al registrar inscripción.",
        "error",
      );
    }
  };

  const handleEditEnrollment = (enrollment) => {
    setEditingEnrollmentId(enrollment.id);

    setEnrollmentStudent(enrollment.student_id);

    setEnrollmentAmount(enrollment.amount);

    setEnrollmentDate(enrollment.payment_date.split("T")[0]);

    setOpenEditEnrollmentModal(true);
  };

  const handleUpdateEnrollment = async () => {
    try {
      await EnrollmentService.update(editingEnrollmentId, {
        student_id: enrollmentStudent,
        amount: enrollmentAmount,
        payment_date: enrollmentDate,
      });

      await fetchEnrollments();

      setOpenEditEnrollmentModal(false);

      showFeedback("Inscripción actualizada.", "success");
    } catch (error) {
      showFeedback(
        error.response?.data?.message || "Error al editar inscripción.",
        "error",
      );
    }
  };

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

  const columns = [
    {
      header: "Fecha",
      render: (row) => new Date(row.payment_date).toLocaleDateString("es-AR"),
    },
    {
      header: "Alumno",
      render: (row) => `${row.last_name}, ${row.first_name}`,
    },
    {
      header: "Plan",
      accessor: "plan_name",
    },
    {
      header: "Monto",
      render: (row) => `$${Number(row.amount).toLocaleString("es-AR")}`,
    },
    {
      header: "Método",
      accessor: "payment_method",
    },
  ];

  const enrollmentColumns = [
    {
      header: "Fecha",
      render: (row) => new Date(row.payment_date).toLocaleDateString("es-AR"),
    },
    {
      header: "Alumno",
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
          <Button size="sm" onClick={() => handleEditEnrollment(row)}>
            Editar
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteEnrollment(row.id)}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  // Títulos de tabla con el botón correspondiente arriba de cada una
  const paymentsTableTitle = (
    <div className="flex justify-between items-center">
      <span>Pagos de alumnos</span>
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

  return (
    <>
      <div className="flex justify-center items-center gap-4 mb-6">
        <Button onClick={previousMonth}>◀</Button>

        <h2 className="text-xl font-bold">
          {monthNames[month - 1]} {year}
        </h2>

        <Button onClick={nextMonth}>▶</Button>
      </div>

      <div className="flex gap-6 mb-6">
        <div className="p-4 rounded border">
          <p className="text-sm text-gray-500">Pagos registrados</p>

          <p className="text-2xl font-bold">
            {payments.length + enrollments.length}
          </p>
        </div>

        <div className="p-4 rounded border">
          <p className="text-sm text-gray-500">Total recaudado</p>

          <p className="text-2xl font-bold">
            ${totalCollected.toLocaleString("es-AR")}
          </p>
        </div>
      </div>

      <Modal isOpen={openCreateModal} onClose={() => setOpenCreateModal(false)}>
        <h2 className="text-xl font-bold mb-6">Registrar pago</h2>

        <Select
          label="Alumno"
          value={selectedStudent}
          onChange={(e) => handleStudentChange(e.target.value)}
        >
          <option value="">Seleccione un alumno</option>

          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.last_name}, {student.first_name}
            </option>
          ))}
        </Select>

        <Select
          label="Plan"
          value={selectedStudentPlan}
          onChange={(e) => setSelectedStudentPlan(e.target.value)}
        >
          <option value="">Seleccione un plan</option>

          {studentPlans.map((plan) => (
            <option key={plan.student_plan_id} value={plan.student_plan_id}>
              {plan.plan_name}
            </option>
          ))}
        </Select>

        <Input
          type="date"
          label="Fecha de pago"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
        />

        <Select
          label="Método de pago"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="">Seleccione un método</option>

          <option value="efectivo">Efectivo</option>

          <option value="transferencia">Transferencia</option>
          <option value="qr"> Código QR</option>
          <option value="otro">Otro</option>
        </Select>

        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={handleCreatePayment}>Registrar</Button>
        </div>
      </Modal>

      <Modal
        isOpen={openCreateEnrollmentModal}
        onClose={() => {
          setOpenCreateEnrollmentModal(false);
          setEnrollmentStudents([]);
        }}
      >
        <h2 className="text-xl font-bold mb-6">Registrar inscripción</h2>

        <Label>Alumnos (tildá uno o más si son hermanos)</Label>
        <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-1 mb-4">
          {students.length === 0 && (
            <p className="text-sm text-gray-500">No hay alumnos activos.</p>
          )}

          {students.map((s) => (
            <label
              key={s.id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={enrollmentStudents.includes(s.id)}
                onChange={() => toggleEnrollmentStudent(s.id)}
              />
              {s.last_name}, {s.first_name}
            </label>
          ))}
        </div>

        <Input
          type="number"
          label="Monto"
          value={enrollmentAmount}
          onChange={(e) => setEnrollmentAmount(e.target.value)}
        />

        <Input
          type="date"
          label="Fecha de pago"
          value={enrollmentDate}
          onChange={(e) => setEnrollmentDate(e.target.value)}
        />

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setOpenCreateEnrollmentModal(false);
              setEnrollmentStudents([]);
            }}
          >
            Cancelar
          </Button>

          <Button onClick={handleCreateEnrollment}>Registrar</Button>
        </div>
      </Modal>

      <Modal
        isOpen={openEditEnrollmentModal}
        onClose={() => setOpenEditEnrollmentModal(false)}
      >
        <h2 className="text-xl font-bold mb-6">Editar inscripción</h2>

        <Select
          label="Alumno"
          value={enrollmentStudent}
          onChange={(e) => setEnrollmentStudent(e.target.value)}
        >
          <option value="">Seleccione un alumno</option>

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
        />

        <Input
          type="date"
          label="Fecha"
          value={enrollmentDate}
          onChange={(e) => setEnrollmentDate(e.target.value)}
        />

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => setOpenEditEnrollmentModal(false)}
          >
            Cancelar
          </Button>

          <Button onClick={handleUpdateEnrollment}>Guardar</Button>
        </div>
      </Modal>

      {/* Modal de feedback (éxito / error) — reemplaza los alert() */}
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
