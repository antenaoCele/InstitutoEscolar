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
  const [filterStudentId, setFilterStudentId] = useState("");

  const [selectedStudentId, setSelectedStudentId] = useState("");

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
    (r) => r.id === tutor.id
  );

  return {
    ...tutor,

    student_tutor_id:
      relation?.student_tutor_id || null,

    student_id:
      relation?.student_id || "",

    student_name:
      relation?.student_name || "",
  };
});
  
      let filtered = merged;
  
      if (filterStudentId) {
        filtered = merged.filter(
          (s) => String(s.student_id) === String(filterStudentId)
        );
      }
  
      setTutors(filtered);
    } catch (error) {
      console.error(error);
      setTutors([]);
    }
  };

const fetchStudents = async () => {
  try {
    const res = await studentService.getAll();

    console.log("STUDENTS API:");
    console.table(
  res.data.data.map((s) => ({
    id: s.id,
    name: `${s.last_name}, ${s.first_name}`,
  }))
);

    setStudents(res.data.data || []);
  } catch (error) {
    console.error(error);
  }
};

  useEffect(() => {
  fetchTutors();
  }, [filterStudentId]);

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

    setSelectedStudentId("");

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

    const newErrors = {};

if (!firstName.trim()) {
  newErrors.first_name =
    "Este campo no puede estar vacío.";
}

if (!lastName.trim()) {
  newErrors.last_name =
    "Este campo no puede estar vacío.";
}

if (!dni.trim()) {
  newErrors.dni =
    "Este campo no puede estar vacío.";
}

if (!phone.trim()) {
  newErrors.phone =
    "Este campo no puede estar vacío.";
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

console.log("TUTOR RESPONSE:");
console.log(tutorRes.data);

console.log("TUTOR DATA:");
console.log(tutorRes.data.data);

console.log("TUTOR ID:");
console.log(tutorRes.data.data?.id);

console.log("SELECTED STUDENT:");
console.log(selectedStudentId);

if (selectedStudentId) {

  const payload = {
    student_id: selectedStudentId,
    tutor_id: tutorRes.data.data?.id,
  };

  console.log("STUDENT_TUTOR PAYLOAD:");
  console.log(payload);

try {
  await studentTutorService.create(payload);
} catch (error) {

  await tutorService.delete(
    tutorRes.data.data.id
  );

  throw error;
}}

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

  setFirstName(tutor.first_name || "");
  setLastName(tutor.last_name || "");
  setDni(tutor.dni || "");
  setPhone(tutor.phone || "");

  setSelectedStudentId(
    tutor.student_id || ""
  );

  setErrorsEdit({});
  setOpenEditModal(true);
};

  const handleUpdate = async () => {
  try {
    setErrorsEdit({});

   const newErrors = {};

if (!firstName.trim()) {
  newErrors.first_name =
    "Este campo no puede estar vacío.";
}

if (!lastName.trim()) {
  newErrors.last_name =
    "Este campo no puede estar vacío.";
}

if (!dni.trim()) {
  newErrors.dni =
    "Este campo no puede estar vacío.";
}

if (!phone.trim()) {
  newErrors.phone =
    "Este campo no puede estar vacío.";
}

if (Object.keys(newErrors).length > 0) {
  setErrorsCreate(newErrors);
  return;
}

    await tutorService.update(
      selectedTutor.id,
      {
        first_name: firstName,
        last_name: lastName,
        dni: dni,
        phone: phone,
      }
    );

    const existingRelation =
      selectedTutor.student_tutor_id;

    if (
      existingRelation &&
      selectedStudentId
    ) {
      await studentTutorService.update(
        existingRelation,
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
        existingRelation
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
    { header: "ID", accessor: "id" },
    { header: "Apellido", accessor: "last_name" },
    { header: "Nombre", accessor: "first_name" },
    { header: "Teléfono", accessor: "phone" },
    { header: "Alumno", accessor: "student_name" },
  ];

  if (isAdmin()) {
    columns.splice(3, 0, { header: "DNI", accessor: "dni" });
  }

  if (isAdmin()) {
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
            Eliminar
          </Button>
        </div>
      ),
    });
  }

  const showCreateButtons = isAdmin();

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
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          placeholder=" Buscar por nombre o apellido"
          value={searchFirstLastName}
          onChange={(e) => setSearchFirstLastName(e.target.value)}
          className="p-2 border border-gray-300 rounded w-60"
        />

        <input
          placeholder="Buscar por DNI"
          value={searchDNI}
          onChange={(e) => setSearchDNI(e.target.value)}
          className="p-2 border border-gray-300 rounded w-40"
        />

        <select
          value={filterStudentId}
          onChange={(e) => setFilterStudentId(e.target.value)}
          className="p-2 border border-gray-300 rounded w-60"
        >
          <option 
            value="">
              Todos los estudiantes
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

    <Modal 
      isOpen={openCreateModal} 
      onClose={() => {setOpenCreateModal(false);
      resetForm();
    }}
    >
      <h2 className="text-xl font-bold mb-8">
        Crear Tutor
      </h2>

      <div className="flex flex-col mb-6">
        <label className="font-semibold mb-2">
          Nombre
        </label>

        <input 
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
        <label className="font-semibold mb-2">
          Apellido
        </label>

        <input 
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
        <label className="font-semibold mb-2">
          DNI
        </label>

        <input 
          className={inputClass(errorsCreate.dni)}
          value={dni} 
          onChange={(e) => setDni(e.target.value)}
        />
        {errorsCreate.dni && (
          <p className="text-red-500 text-sm mt-1">
            {errorsCreate.dni}
          </p>
        )}
      </div>

      <div className="flex flex-col mb-6">
        <label className="font-semibold mb-2">
          Teléfono
        </label>

        <input 
          className={inputClass(errorsCreate.phone)} 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)}
        />
        {errorsCreate.phone && (
          <p className="text-red-500 text-sm mt-1">
            {errorsCreate.phone}
          </p>
        )}
      </div>

      <div className="flex flex-col mb-6">
      <label className="font-semibold mb-2">Alumno</label>

      <select
  value={selectedStudentId}
  onChange={(e) =>
    setSelectedStudentId(e.target.value)
  }
  className={inputClass(
    errorsCreate.student_id
  )}
>
  <option value="">
    Sin alumno asignado
  </option>

  {students.map((student) => (
    <option
      key={student.id}
      value={student.id}
    >
      {student.last_name},{" "}
      {student.first_name}
    </option>
  ))}
</select>

        {errorsCreate.student_id && (
      <p className="text-red-500 text-sm mt-1">
        {errorsCreate.student_id}
      </p>
    )}

    </div>

      <div className="flex justify-end gap-4 mt-10">
        <Button
              variant="outline"
              onClick={() => {
                setOpenCreateModal(false);
                resetForm();
              }}
              className={buttonClass}
            >
          Cancelar
        </Button>

        <Button 
          onClick={handleCreate}
          className={buttonClass}
        >
          Crear
        </Button>
      </div>
    </Modal>

    <Modal 
      isOpen={openEditModal} 
      onClose={() => {setOpenEditModal(false); resetForm();}}
    >
      <h2 className="text-xl font-bold mb-8">
        Editar Tutor
      </h2>

      <div className="flex flex-col mb-6">
        <label className="font-semibold mb-2">
          Nombre
        </label>

        <input 
          className={inputClass(errorsEdit.first_name)} 
          value={firstName} 
          onChange={(e) => setFirstName(e.target.value)} 
        />
        {errorsEdit.first_name && (
          <p className="text-red-500 text-sm mt-1">
            {errorsEdit.first_name}
          </p>
        )}
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
          className={inputClass(errorsEdit.phone)} 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
        />
        {errorsEdit.phone && (
          <p className="text-red-500 text-sm mt-1">
            {errorsEdit.phone}
          </p>
        )}
      </div>

      <div className="flex flex-col mb-6">
        <label className="font-semibold mb-2">Alumno</label>

        <select
  value={selectedStudentId}
  onChange={(e) =>
    setSelectedStudentId(e.target.value)
  }
  className={inputClass(
    errorsEdit.student_id
  )}
>
  <option value="">
    Sin alumno asignado
  </option>

  {students.map((student) => (
    <option
      key={student.id}
      value={student.id}
    >
      {student.last_name},{" "}
      {student.first_name}
    </option>
  ))}
</select>

        {errorsEdit.student_id && (<p className="text-red-500 text-sm mt-1">{errorsEdit.student_id}</p>)}
      </div>

      <div className="flex justify-end gap-4 mt-10">
        <Button
          variant="outline"
          onClick={() => {
            setOpenEditModal(false);
            resetForm();
          }}
          className={buttonClass}
        >
          Cancelar
        </Button>

        <Button 
          onClick={handleUpdate} 
          className={buttonClass}
        > 
          Guardar
        </Button>
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
