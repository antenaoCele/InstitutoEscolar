import { useEffect, useState } from "react";
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import { tutorService } from "../../services/tutor.service";
import { studentService } from "../../services/student.service";
import { studentTutorService } from "../../services/studentTutor.service";
import Button from "../../components/ui/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/Input";
import Select from "../../components/form/Select";
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

  const inputClass = (error) =>
    `w-full p-2 border rounded mb-1 
    border-gray-300
    focus:outline-none focus:ring-1 focus:ring-[#0cc0df] focus:border-[#0cc0df]
    ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}`;

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
      console.error(error);
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
    try {
      setErrorsCreate({});

      const newErrors = {};

      if (!firstName.trim()) {
        newErrors.first_name = "Campo obligatorio.";
      }

      if (!lastName.trim()) {
        newErrors.last_name = "Campo obligatorio.";
      }

      if (!dni.trim()) {
        newErrors.dni = "Campo obligatorio.";
      }

      if (!phone.trim()) {
        newErrors.phone = "Campo obligatorio.";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrorsCreate(newErrors);
        return;
      }

      const tutorRes = await tutorService.create({
        first_name: firstName,
        last_name: lastName,
        dni: dni,
        phone: phone,
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

      resetForm();

      fetchTutors();
    } catch (error) {
      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        setErrorsCreate(mapErrors(backendErrors));
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
    try {
      setErrorsEdit({});

      const newErrors = {};

      if (!firstName.trim()) {
        newErrors.first_name = "Campo obligatorio.";
      }

      if (!lastName.trim()) {
        newErrors.last_name = "Campo obligatorio.";
      }

      if (!dni.trim()) {
        newErrors.dni = "Campo obligatorio.";
      }

      if (!phone.trim()) {
        newErrors.phone = "Campo obligatorio.";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrorsEdit(newErrors);
        return;
      }

      await tutorService.update(selectedTutor.id, {
        first_name: firstName,
        last_name: lastName,
        dni: dni,
        phone: phone,
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

      resetForm();

      fetchTutors();
    } catch (error) {
      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        setErrorsEdit(mapErrors(backendErrors));
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
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.message || "Error al eliminar");
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
        <PlusButton title="Crear Materia" onClick={openCreate} />
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
                <span>Sin estudiantes</span>
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

        <div className="flex flex-col mb-6">
          <Label className="font-semibold mb-2">Nombre</Label>

          <Input
            className={inputClass(errorsCreate.first_name)}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          {errorsCreate.first_name && (
            <p className="text-red-500 text-sm mt-1">
              {errorsCreate.first_name}
            </p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <Label className="font-semibold mb-2">Apellido</Label>

          <Input
            className={inputClass(errorsCreate.last_name)}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          {errorsCreate.last_name && (
            <p className="text-red-500 text-sm mt-1">
              {errorsCreate.last_name}
            </p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <Label className="font-semibold mb-2">DNI</Label>

          <Input
            className={inputClass(errorsCreate.dni)}
            value={dni}
            onChange={(e) => setDni(e.target.value)}
          />
          {errorsCreate.dni && (
            <p className="text-red-500 text-sm mt-1">{errorsCreate.dni}</p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <Label className="font-semibold mb-2">Teléfono</Label>

          <Input
            className={inputClass(errorsCreate.phone)}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {errorsCreate.phone && (
            <p className="text-red-500 text-sm mt-1">{errorsCreate.phone}</p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <Label className="font-semibold mb-2">Estudiante</Label>

          {students.map((student) => (
            <Label key={student.id} className="flex items-center gap-2">
              <Input
                type="checkbox"
                checked={selectedStudentIds.includes(student.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedStudentIds([...selectedStudentIds, student.id]);
                  } else {
                    setSelectedStudentIds(
                      selectedStudentIds.filter((id) => id !== student.id),
                    );
                  }
                }}
              />
              {student.last_name}, {student.first_name}
            </Label>
          ))}

          {errorsCreate.student_id && (
            <p className="text-red-500 text-sm mt-1">
              {errorsCreate.student_id}
            </p>
          )}
        </div>

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

        <div className="flex flex-col mb-6">
          <Label className="font-semibold mb-2">Nombre</Label>

          <Input
            className={inputClass(errorsEdit.first_name)}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          {errorsEdit.first_name && (
            <p className="text-red-500 text-sm mt-1">{errorsEdit.first_name}</p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <Label className="font-semibold mb-2">Apellido</Label>

          <Input
            className={inputClass(errorsEdit.last_name)}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          {errorsEdit.last_name && (
            <p className="text-red-500 text-sm mt-1">{errorsEdit.last_name}</p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <Label className="font-semibold mb-2">DNI</Label>

          <Input
            className={inputClass(errorsEdit.dni)}
            value={dni}
            onChange={(e) => setDni(e.target.value)}
          />
          {errorsEdit.dni && (
            <p className="text-red-500 text-sm mt-1">{errorsEdit.dni}</p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <Label className="font-semibold mb-2">Teléfono</Label>

          <Input
            className={inputClass(errorsEdit.phone)}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {errorsEdit.phone && (
            <p className="text-red-500 text-sm mt-1">{errorsEdit.phone}</p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <Label className="font-semibold mb-2">Estudiante</Label>

          <div className="border border-gray-300 rounded p-3 max-h-40 overflow-y-auto">
            {students.map((student) => (
              <label key={student.id} className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={selectedStudentIds.includes(student.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStudentIds([
                        ...selectedStudentIds,
                        student.id,
                      ]);
                    } else {
                      setSelectedStudentIds(
                        selectedStudentIds.filter((id) => id !== student.id),
                      );
                    }
                  }}
                />
                {student.last_name}, {student.first_name}
              </label>
            ))}
          </div>

          {errorsEdit.student_id && (
            <p className="text-red-500 text-sm mt-1">{errorsEdit.student_id}</p>
          )}
        </div>

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
    </>
  );
}
