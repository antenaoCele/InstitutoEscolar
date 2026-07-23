import { useEffect, useState } from "react";
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import { tutorService } from "../../services/tutor.service";
import { studentService } from "../../services/student.service";
import { studentTutorService } from "../../services/studentTutor.service";
import Button from "../../components/ui/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/Input";
import Select from "../../components/form/Select";
import Checkbox from "../../components/form/Checkbox";
import { Modal } from "../../components/ui/Modal";
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
import { mapErrors } from "../../validators/helpers/errorHelpers";
import { validateTutorForm } from "../../validators/entities/tutors.validator";
import { useFeedbackModal } from "../../hooks/useFeedbackModal";

export function Tutors() {
  // ======================================================
  // DATOS
  // ======================================================
  const [tutors, setTutors] = useState([]);
  const [students, setStudents] = useState([]);

  // ======================================================
  // FILTROS
  // ======================================================
  const [filterStudentId, setFilterStudentId] = useState("");
  const [searchFirstLastName, setSearchFirstLastName] = useState("");
  const [searchDNI, setSearchDNI] = useState("");

  // ======================================================
  // MODALES
  // ======================================================
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const { feedbackModal, showFeedback, closeFeedback } = useFeedbackModal();

  // ======================================================
  // TUTOR SELECCIONADO
  // ======================================================
  const [selectedTutor, setSelectedTutor] = useState(null);

  // ======================================================
  // FORMULARIO DEL TUTOR
  // ======================================================
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

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
  const fetchTutors = async () => {
    try {
      const [tutorsRes, studentTutorsRes] = await Promise.all([
        tutorService.getAll(),
        studentTutorService.getAll(),
      ]);

      const tutorsData = tutorsRes.data.data || [];
      const relations = studentTutorsRes.data.data || [];

      const merged = tutorsData.map((tutor) => {
        const tutorRelations = relations.filter(
          (r) => r.tutor_id === tutor.id && r.student_tutor_id !== null,
        );

        return {
          ...tutor,

          student_relations: tutorRelations,

          student_ids: tutorRelations
            .filter((r) => r.student_id)
            .map((r) => r.student_id),

          student_names: tutorRelations
            .filter((r) => r.student_name)
            .map((r) => r.student_name),
        };
      });

      let filtered = merged;

      if (filterStudentId) {
        filtered = merged.filter((tutor) =>
          tutor.student_ids?.includes(Number(filterStudentId)),
        );
      }

      setTutors(filtered);
    } catch (error) {
      setTutors([]);
    }
  };

  // ======================================================
  // FETCH AUXILIARES
  // ======================================================
  const fetchStudents = async () => {
    try {
      const res = await studentService.getAll();

      const uniqueStudents = Array.from(
        new Map((res.data.data || []).map((s) => [s.id, s])).values(),
      );

      setStudents([...uniqueStudents].sort(sortByPersonName));
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
    setPhone("");
    setSelectedStudentIds([]);
    setErrorsCreate({});
    setErrorsEdit({});
  };

  // ======================================================
  // HANDLES CRUD
  // ======================================================
  const openCreate = () => {
    resetForm();
    setOpenCreateModal(true);
  };

  const handleCreate = async () => {
    const errors = validateTutorForm({
      firstName,
      lastName,
      dni,
      phone,
    });

    if (Object.keys(errors).length > 0) {
      setErrorsCreate(errors);
      return;
    }

    try {
      setErrorsCreate({});

      const tutorRes = await tutorService.create({
        first_name: firstName,
        last_name: lastName,
        dni,
        phone,
      });

      if (selectedStudentIds.length > 0) {
        await Promise.all(
          selectedStudentIds.map((studentId) =>
            studentTutorService.create({
              student_id: studentId,
              tutor_id: tutorRes.data.data.id,
            }),
          ),
        );
      }

      setOpenCreateModal(false);
      fetchTutors();
      resetForm();

      showFeedback("Tutor creado correctamente.", "success");
    } catch (error) {
      console.error("Error al crear:", error.response?.data || error.message);

      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        setErrorsCreate(mapErrors(backendErrors));
      } else {
        showFeedback(
          error.response?.data?.message || "Error al crear el tutor.",
          "error",
        );
      }
    }
  };

  const handleEdit = async (tutor) => {
    setSelectedTutor(tutor);

    setFirstName(tutor.first_name || "");
    setLastName(tutor.last_name || "");
    setDni(tutor.dni || "");
    setPhone(tutor.phone || "");

    setSelectedStudentIds(tutor.student_ids || []);

    setErrorsEdit({});
    setOpenEditModal(true);
  };

  const handleUpdate = async () => {
    const errors = validateTutorForm({
      firstName,
      lastName,
      dni,
      phone,
    });

    if (Object.keys(errors).length > 0) {
      setErrorsEdit(errors);
      return;
    }

    try {
      setErrorsEdit({});

      await tutorService.update(selectedTutor.id, {
        first_name: firstName,
        last_name: lastName,
        dni,
        phone,
      });

      const currentRelations = selectedTutor.student_relations || [];

      await Promise.all(
        currentRelations.map((relation) =>
          studentTutorService.delete(relation.student_tutor_id),
        ),
      );

      await Promise.all(
        selectedStudentIds.map((studentId) =>
          studentTutorService.create({
            student_id: studentId,
            tutor_id: selectedTutor.id,
          }),
        ),
      );

      setOpenEditModal(false);
      fetchTutors();
      resetForm();

      showFeedback("Tutor actualizado correctamente.", "success");
    } catch (error) {
      console.error(error.response?.data || error.message);

      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        setErrorsEdit(mapErrors(backendErrors));
      } else {
        showFeedback(
          error.response?.data?.message || "Error al editar el tutor.",
          "error",
        );
      }
    }
  };

  const handleDelete = (tutor) => {
    setSelectedTutor(tutor);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await tutorService.delete(selectedTutor.id);

      setOpenDeleteModal(false);
      fetchTutors();

      showFeedback("Tutor eliminado correctamente.", "success");
    } catch (error) {
      console.error(error.response?.data || error.message);

      setOpenDeleteModal(false);

      showFeedback(
        error.response?.data?.message || "Error al eliminar el tutor.",
        "error",
      );
    }
  };

  const handleStudentCheckbox = (studentId, checked) => {
    if (checked) {
      setSelectedStudentIds((prev) => [...prev, studentId]);
    } else {
      setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId));
    }
  };

  // ======================================================
  // USEEFFECTS
  // ======================================================
  useEffect(() => {
    fetchTutors();
  }, [filterStudentId]);

  useEffect(() => {
    fetchStudents();
  }, []);

  // ======================================================
  // DATOS DERIVADOS
  // ======================================================
  const filteredTutors = [...tutors]
    .filter((t) => {
      const textName = searchFirstLastName.toLowerCase();

      const matchName =
        !textName ||
        t.first_name?.toLowerCase().includes(textName) ||
        t.last_name?.toLowerCase().includes(textName);

      const textDNI = searchDNI;

      const matchDNI = !textDNI || t.dni?.toString().includes(textDNI);

      return matchName && matchDNI;
    })
    .sort(sortByPersonName);

  const showCreateButtons = isAdmin();

  const tableTitle = (
    <div className="flex justify-between items-center">
      <span>Tutores</span>

      {showCreateButtons && (
        <PlusButton title="Crear Tutor" onClick={openCreate} />
      )}
    </div>
  );

  const mapErrors = (errors) => {
    const formatted = {};

    errors.forEach((e) => {
      formatted[e.path] = e.msg;
    });
    return formatted;
  };

  let columns = [
    { header: "Apellidos", accessor: "last_name" },
    { header: "Nombres", accessor: "first_name" },
    { header: "Teléfonos", accessor: "phone" },
    {
      header: "Estudiantes",
      render: (row) => {
        const hasScroll = (row.student_names?.length || 0) > 3;

        return (
          <div
            className={`
            h-20
            overflow-y-auto
            flex
            flex-col
            ${hasScroll ? "justify-start" : "justify-center"}
          `}
          >
            <div className="flex flex-col gap-1">
              {row.student_names?.length ? (
                row.student_names.map((name, index) => (
                  <span key={index}>{name}</span>
                ))
              ) : (
                <div className="text-sm italic text-gray-500">
                  Sin estudiantes
                </div>
              )}
            </div>
          </div>
        );
      },
    },
  ];

  if (isAdmin()) {
    columns.splice(3, 0, { header: "DNI", accessor: "dni" });
  }

  if (isAdmin()) {
    columns.push({
      header: "Acciones",
      render: (row) => (
        <div className="flex gap-2">
          <EditButton title="Editar Tutor" onClick={() => handleEdit(row)} />

          <DeleteButton
            title="Eliminar Tutor"
            onClick={() => handleDelete(row)}
          />
        </div>
      ),
    });
  }

  const renderStudentCheckboxes = (errors) => (
    <>
      <Label>Estudiantes</Label>
      {students.map((student) => (
        <Checkbox
          key={student.id}
          label={`${student.last_name}, ${student.first_name}`}
          checked={selectedStudentIds.includes(student.id)}
          onChange={(checked) => handleStudentCheckbox(student.id, checked)}
        />
      ))}
      {errors.student_id && (
        <p className="text-red-500 text-sm mt-1">{errors.student_id}</p>
      )}
    </>
  );

  // ======================================================
  // RETURN
  // ======================================================
  return (
    <>
      <div className="flex gap-3 mb-4 flex-wrap">
        <Input
          placeholder=" Buscar por nombre o apellido"
          value={searchFirstLastName}
          onChange={(e) => setSearchFirstLastName(e.target.value)}
          className="p-2 border border-gray-300 rounded w-60"
        />

        <Input
          placeholder="Buscar por DNI"
          value={searchDNI}
          onChange={(e) => setSearchDNI(e.target.value)}
          className="p-2 border border-gray-300 rounded w-40"
        />

        <Select
          value={filterStudentId}
          onChange={(e) => setFilterStudentId(e.target.value)}
          className="p-2 border border-gray-300 rounded w-60"
        >
          <option value="">Todos los estudiantes</option>

          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.last_name}, {student.first_name}
            </option>
          ))}
        </Select>
      </div>

      <BasicTable title={tableTitle} columns={columns} data={filteredTutors} />

      {showCreateButtons && (
        <div className="mt-8">
          <Button onClick={openCreate} className={buttonClass}>
            Crear Tutor
          </Button>
        </div>
      )}

      <Modal
        isOpen={openCreateModal}
        onClose={() => {
          setOpenCreateModal(false);
          resetForm();
        }}
      >
        <h2 className="text-xl font-bold mb-8">Crear Tutor</h2>

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
          type="number"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          error={errorsCreate.dni}
        />

        <Label>Teléfono</Label>
        <Input
          type="number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errorsCreate.phone}
        />

        {renderStudentCheckboxes(errorsCreate)}

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
        }}
      >
        <h2 className="text-xl font-bold mb-8">Editar Tutor</h2>

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
          type="number"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          error={errorsEdit.dni}
        />

        <Label>Teléfono</Label>
        <Input
          type="number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errorsEdit.phone}
        />

        {renderStudentCheckboxes(errorsEdit)}

        <div className="flex justify-end gap-4 mt-10">
          <NoButton title="Cancelar" onClick={() => setOpenEditModal(false)} />

          <YesButton title="Aceptar" onClick={handleUpdate} />
        </div>
      </Modal>

      <Modal isOpen={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <h2 className="text-lg font-semibold mb-4">¿Eliminar Tutor?</h2>

        <div className="flex justify-end gap-2">
          <NoButton
            title="Cancelar"
            onClick={() => setOpenDeleteModal(false)}
          />

          <YesButton title="Aceptar" onClick={confirmDelete} />
        </div>
      </Modal>

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
