import { useEffect, useState } from "react";
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import { tutorService } from "../../services/tutor.service";
import { studentService } from "../../services/student.service";
import { studentTutorService } from "../../services/studentTutor.service";
import Button from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { isAdmin } from "../../utils/auth";

export function Tutors() {
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");

  const [studentId, setStudentId] = useState("")
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [studentTutor, setStudentTutor] = useState([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [searchFirstLastName, setSearchFirstLastName] = useState("");
  
  const [dni, setDni] = useState("");
  const [searchDNI, setSearchDNI] = useState("");

  const [phone, setPhone] = useState("");

  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  const [errorsCreate, setErrorsCreate] = useState({});
  const [errorsEdit, setErrorsEdit] = useState({});

  const isTeacher = !isAdmin();

  const buttonClass = "cursor-pointer transition transform hover:scale-105";

  const inputClass = (error) =>
    `w-full p-2 border rounded mb-1 
    border-gray-300
    focus:outline-none focus:ring-1 focus:ring-[#0cc0df] focus:border-[#0cc0df]
    ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}`;

   const fetchTutors = async () => {
    try {
      const [tutorsRes, studentTutorsRes] = await Promise.all([
        tutorService.getAll(),
        studentTutorService.getAll(),
      ]);
  
      const tutorsData = tutorsRes.data.data || [];
      const relations = studentTutorsRes.data.data || [];
  
      const merged = tutorsData.map((tutor) => {
        const relation = relations.find(
          (r) => r.tutor_id === tutor.id
        );
  
        return {
          ...tutor,
          student_tutor_id: relation?.id || null,
          student_id: relation?.student_id || "",
          student_name: relation?.student_name || "",
        };
      });
  
      let filtered = merged;
  
      if (selectedStudent) {
        filtered = merged.filter(
          (s) => String(s.student_id) === String(selectedStudent)
        );
      }
  
      setTutors(filtered);
      setStudentTutor(relations);
    } catch (error) {
      console.error(error);
      setTutors([]);
    }
  };

  const fetchStudents = async () => {
     try {
      const res = await studentService.getAll();
  
      setStudents(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
  fetchTutors();
  }, [selectedStudent]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredTutors = tutors.filter((t) => {
    const textName = searchFirstLastName.toLowerCase();

    const matchName =
      !textName ||
      t.first_name?.toLowerCase().includes(textName) ||
      t.last_name?.toLowerCase().includes(textName);

    const textDNI = searchDNI;
      
    const matchDNI =
      !textDNI ||
      t.dni?.toString().includes(textDNI);

    return matchName && matchDNI;
  });

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setDni("");
    setPhone("");

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

  const openCreate = () => {
    resetForm();
    setOpenCreateModal(true);
  };

  const handleCreate = async () => {
  try {
    setErrorsCreate({});

    if (!firstName.trim()) {
      setErrorsCreate({
        firstName: "Este campo no puede estar vacío.",
      });

      return;
    }

    if (!lastName.trim()) {
      setErrorsCreate({
        lastName: "Este campo no puede estar vacío.",
      });

      return;
    }
  
    if (!dni.trim()) {
      setErrorsCreate({
        dni: "Este campo no puede estar vacío.",
      });

      return;
    }

    if (!phone.trim()) {
      setErrorsCreate({
        phone: "Este campo no puede estar vacío.",
      });

      return;
    }

    const tutorRes = await tutorService.create({
      firstName,
      lastName,
      dni,
      phone
    });

    if (selectedStudentId) {
      await studentTutorService.create({
        student_id: selectedStudentId,
        tutor_id: tutorRes.data.data.id,
      });
    }

    setOpenCreateModal(false);

    resetForm();

    fetchTutors();
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

  const handleEdit = async (tutor) => {
  setSelectedTutor(tutor);

  setFirstName(tutor.firstName || "");
  setLastName(tutor.lastName || "");
  setDni(tutor.dni || "");
  setPhone(tutor.phone || "");

  try {
    const relationRes = await studentTutorService.getAll();

    const relation = relationRes.data.data.find(
      (r) => r.tutor_id === tutor.id
    );

    setSelectedStudentId(relation?.tutor_id || "");
  } catch {
    setSelectedStudentId("");
  }

  setErrorsEdit({});
  setOpenEditModal(true);
};

  const handleUpdate = async () => {
  try {
    setErrorsEdit({});

    if (!firstName.trim()) {
      setErrorsEdit({
        firstName: "Este campo no puede estar vacío.",
      });

      return;
    }

    else if (!lastName.trim()) {
      setErrorsEdit({
        lastName: "Este campo no puede estar vacío.",
      });

      return;
    }

    else if (!dni.trim()) {
      setErrorsEdit({
        dni: "Este campo no puede estar vacío.",
      });

      return;
    }

    else if (!phone.trim()) {
      setErrorsEdit({
        phone: "Este campo no puede estar vacío.",
      });

      return;
    }

    await tutorService.update(
      selectedTutor.id,
      { firstName, lastName, dni, phone}
    );

    const relationsRes =
      await studentTutorService.getAll();

    const existingRelation =
      relationsRes.data.data.find(
        (r) =>
          r.tutor_id === selectedTutor.id
      );

    if (
      existingRelation &&
      selectedStudentId
    ) {
      await studentTutorService.update(
        existingRelation.id,
        {
          student_id: selectedStudentId,
          tutor_id: selectedTutor.id,
        }
      );
    }

    else if (
      existingRelation &&
      !selectedStudentId
    ) {
      await studentTutorService.delete(
        existingRelation.id
      );
    }

    else if (
      !existingRelation &&
      selectedStudentId
    ) {
      await studentTutorService.create({
          student_id: selectedStudentId,
          tutor_id: selectedTutor.id,
      });
    }

    setOpenEditModal(false);

    resetForm();

    fetchTutors();
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

      alert(
        error.response?.data?.message ||
          "Error al eliminar"
      );
    }
  };

  let columns = [
    { header: "ID", accessor: "tutor_id" },
    { header: "Apellido", accessor: "last_name" },
    { header: "Nombre", accessor: "first_name" },
    { header: "Teléfono", accessor: "phone" },
    { header: "Alumno", accessor: "student_name" },
  ];

  if (!isTeacher) {
    columns.splice(3, 0, { header: "DNI", accessor: "dni" });
  }

  if (!isTeacher) {
    columns.push({
      header: "Acciones",
      render: (row) => (
        <div className="flex gap-2">
          <Button 
          size="sm" 
          onClick={() => handleEdit(row)} 
          className={buttonClass}>
            Editar
          </Button>

          <Button 
          size="sm" 
          variant="outline" 
          onClick={() => handleDelete(row)} 
          className={buttonClass}>
            Eliminar
          </Button>
        </div>
      ),
    });
  }

  const showCreateButtons = !(isAdmin());

  const tableTitle = (
    <div className="flex justify-between items-center">
      <span>Tutores</span>
      {showCreateButtons && (
        <Button 
        size="sm" 
        onClick={openCreate} 
        className={buttonClass}>
          +
        </Button>
      )}
    </div>
  );


  return (
  <>
  {/* BUSCADORES */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          placeholder=" 🔍 Buscar por Nombre o Apellido"
          value={searchFirstLastName}
          onChange={(e) => setSearchFirstLastName(e.target.value)}
          className="p-2 border border-gray-300 rounded w-60"
        />

        <input
          placeholder="🔍 Buscar por DNI"
          value={searchDNI}
          onChange={(e) => setSearchDNI(e.target.value)}
          className="p-2 border border-gray-300 rounded w-40"
        />

        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="p-2 border border-gray-300 rounded w-60"
        >
        
          <option 
            value="">👦🏻👧🏻 Todos los estudiantes
          </option>

          {students.map((student) => (
            <option 
              key={student.id} 
              value={student.id}
            >
              {student.last_name}, {student.first_name} 
            </option>
            ))}
        </select>
      </div>

      
    <BasicTable 
      title={tableTitle} 
      columns={columns}  
      data={filteredTutors}
    />

    {showCreateButtons && (
      <div className="mt-8">
        <Button 
          onClick={openCreate} 
          className={buttonClass}
        >
          Crear Tutor
        </Button>
      </div>
    )}

    {/* CREATE MODAL */}
    <Modal 
      isOpen={openCreateModal} 
      onClose={() => {setOpenCreateModal(false);
      resetForm();
    }}
    >
      <h2 className="text-xl font-bold mb-8">Crear Tutor</h2>

      <div className="flex flex-col mb-6">
        <label className="font-semibold mb-2">Nombre</label>

        <input 
          className={inputClass(errorsCreate.first_name)} 
          value={firstName} 
          onChange={(e) => setFirstName(e.target.value)} 
        />
          {errorsCreate.first_name && <p className="text-red-500 text-sm mt-1">{errorsCreate.first_name}</p>}
      </div>

      <div className="flex flex-col mb-6">
        <label className="font-semibold mb-2">Apellido</label>

        <input 
          className={inputClass(errorsCreate.last_name)}
          value={lastName} 
          onChange={(e) => setLastName(e.target.value)} 
        />
        {errorsCreate.last_name && <p className="text-red-500 text-sm mt-1">{errorsCreate.last_name}</p>}
      </div>

      <div className="flex flex-col mb-6">
        <label className="font-semibold mb-2">DNI</label>

        <input 
          className={inputClass(errorsCreate.dni)}
          value={dni} onChange={(e) => setDni(e.target.value)}
        />
        {errorsCreate.dni && <p className="text-red-500 text-sm mt-1">{errorsCreate.dni}</p>}
      </div>

      <div className="flex flex-col mb-6">
        <label className="font-semibold mb-2">Teléfono</label>

        <input 
          className={inputClass(errorsCreate.phone)} 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)}
        />
        {errorsCreate.phone && <p className="text-red-500 text-sm mt-1">{errorsCreate.phone}</p>}
      </div>

      <div className="flex flex-col mb-6">
      <label className="font-semibold mb-2">Alumno</label>

      <select 
        value={selectedStudent} 
        onChange={(e) => setSelectedStudentId(e.target.value)}
        className={inputClass(errorsCreate.tutor_id)}>
      
        <option value="">
          Sin alumno asignado
        </option>

        {students.map((student) => (
          <option
            key={student.id}
            value={student.id}
          >
            {student.last_name}, {student.first_name}
          </option>
        ))}
    </select>
    </div>

      <div className="flex justify-end gap-4 mt-10">
        <Button 
          variant="outline" 
          onClick={() => setOpenCreateModal(false)}
        >
          Cancelar
        </Button>

        <Button 
          onClick={handleCreate}
        >
          Crear
        </Button>
      </div>
    </Modal>

    {/* EDIT MODAL */}
    <Modal 
      isOpen={openEditModal} 
      onClose={() => setOpenEditModal(false)}
    >
      <h2 className="text-xl font-bold mb-8">Editar Tutor</h2>

      <div className="flex flex-col mb-6">
        <label className="font-semibold mb-2">Nombre</label>

        <input 
          className={inputClass(errorsEdit.first_name)} 
          value={firstName} 
          onChange={(e) => setFirstName(e.target.value)} 
        />
        {errorsEdit.first_name && <p className="text-red-500 text-sm mt-1">{errorsEdit.first_name}</p>}
      </div>

      <div className="flex flex-col mb-6">
        <label className="font-semibold mb-2">Apellido</label>

        <input 
          className={inputClass(errorsEdit.last_name)} 
          value={lastName} 
          onChange={(e) => setLastName(e.target.value)}
          />
        {errorsEdit.last_name && <p className="text-red-500 text-sm mt-1">{errorsEdit.last_name}</p>}
      </div>

      <div className="flex flex-col mb-6">
        <label className="font-semibold mb-2">DNI</label>

        <input 
          className={inputClass(errorsEdit.dni)} 
          value={dni} 
          onChange={(e) => setDni(e.target.value)}
        />
        {errorsEdit.dni && <p className="text-red-500 text-sm mt-1">{errorsEdit.dni}</p>}
      </div>

      <div className="flex flex-col mb-6">
        <label className="font-semibold mb-2">Teléfono</label>

        <input 
          className={inputClass(errorsCreate.phone)} 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
        />
        {errorsCreate.phone && <p className="text-red-500 text-sm mt-1">{errorsCreate.phone}</p>}
      </div>

      <div className="flex flex-col mb-6">
        <label className="font-semibold mb-2">Alumno</label>

        <select
          value={selectedStudentId}
          onChange={(e) =>setSelectedStudentId(e.target.value)}
          className={inputClass(errorsEdit.student_id)}
        >
          <option value="">Sin alumno asignado</option>

          {students.map((student) => (
            <option
              key={student.id}
              value={student.id}
            >
              {student.last_name}, {student.first_name}
            </option>
          ))}
        </select>

        {errorsEdit.student_id && (<p className="text-red-500 text-sm mt-1">{errorsEdit.student_id}</p>)}
      </div>

      <div className="flex justify-end gap-4 mt-10">
        <Button 
          variant="outline" 
          onClick={() => setOpenEditModal(false)}
        >
          Cancelar
        </Button>

        <Button onClick={handleUpdate}>Guardar</Button>
      </div>
    </Modal>

      <Modal 
        isOpen={openDeleteModal} 
        onClose={() => setOpenDeleteModal(false)}
      >
        <h2 className="text-lg font-semibold mb-4">¿Eliminar tutor?</h2>

        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => setOpenDeleteModal(false)} 
            className={buttonClass}
          >
            Cancelar
          </Button>

          <Button 
            onClick={confirmDelete} 
            className={buttonClass}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </>
  );
}
