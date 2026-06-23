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
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [enrollmentStudent, setEnrollmentStudent] = useState("");
  const [enrollmentAmount, setEnrollmentAmount] = useState("");
  const [enrollmentDate, setEnrollmentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [openEditEnrollmentModal, setOpenEditEnrollmentModal] = useState(false);
  const [editingEnrollmentId, setEditingEnrollmentId] = useState(null);

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
      console.log(data.data);
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

      alert("OK");
    } catch (error) {
      console.log("ERROR COMPLETO:", error);
      console.log("RESPONSE:", error.response);
      console.log("DATA:", error.response?.data);

      alert(JSON.stringify(error.response?.data));
    }
  };

  const handleCreateEnrollment = async () => {
    try {
      await EnrollmentService.create({
        student_id: enrollmentStudent,
        amount: enrollmentAmount,
        payment_date: enrollmentDate,
      });

      await fetchEnrollments();

      alert("Inscripción registrada");

      setOpenCreateEnrollmentModal(false);

      setEnrollmentStudent("");
      setEnrollmentAmount("");
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.message || "Error al registrar inscripción");
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

      alert("Inscripción actualizada");
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.message || "Error al editar inscripción");
    }
  };

  const handleDeleteEnrollment = async (id) => {
    const confirmed = window.confirm("¿Desea eliminar esta inscripción?");

    if (!confirmed) return;

    try {
      await EnrollmentService.delete(id);

      await fetchEnrollments();

      alert("Inscripción eliminada");
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.message || "Error al eliminar inscripción");
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
      <div className="flex gap-3 mb-4">
        <Button onClick={() => setOpenCreateModal(true)}>
          Registrar cuota
        </Button>

        <Button onClick={() => setOpenCreateEnrollmentModal(true)}>
          Registrar inscripción
        </Button>
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
          <option value="qr">Otro</option>
        </Select>

        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={handleCreatePayment}>Registrar</Button>
        </div>
      </Modal>
      <Modal
        isOpen={openCreateEnrollmentModal}
        onClose={() => setOpenCreateEnrollmentModal(false)}
      >
        <h2 className="text-xl font-bold mb-6">Registrar inscripción</h2>

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
          label="Fecha de pago"
          value={enrollmentDate}
          onChange={(e) => setEnrollmentDate(e.target.value)}
        />

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => setOpenCreateEnrollmentModal(false)}
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
      <BasicTable title="Pagos de alumnos" columns={columns} data={payments} />
      <div className="mt-8">
        <BasicTable
          title="Inscripciones"
          columns={enrollmentColumns}
          data={enrollments}
        />
      </div>
    </>
  );
}
