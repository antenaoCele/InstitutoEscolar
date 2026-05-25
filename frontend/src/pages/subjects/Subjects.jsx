import { useEffect, useState } from "react";
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import { subjectService } from "../../services/subject.service";
import { teacherService } from "../../services/teacher.service";
import { teacherSubjectService } from "../../services/teacherSubject.service";
import Button from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { isAdmin } from "../../utils/auth";

export function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");

  const [selectedTeacherId, setSelectedTeacherId] = useState("");

  const [teacherSubjects, setTeacherSubjects] = useState([]);

  const [name, setName] = useState("");
  const [searchName, setSearchName] = useState("");

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [errorsCreate, setErrorsCreate] = useState({});
  const [errorsEdit, setErrorsEdit] = useState({});

  const buttonClass =
    "cursor-pointer transition transform hover:scale-105";

  const inputClass = (error) =>
    `w-full p-2 border rounded mb-1
    border-gray-300
    focus:outline-none focus:ring-1 focus:ring-[#0cc0df] focus:border-[#0cc0df]
    ${
      error
        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
        : ""
    }`;

  const fetchSubjects = async () => {
  try {
    const [subjectsRes, teacherSubjectsRes] = await Promise.all([
      subjectService.getAll(),
      teacherSubjectService.getAll(),
    ]);

    const subjectsData = subjectsRes.data.data || [];
    const relations = teacherSubjectsRes.data.data || [];

    const merged = subjectsData.map((subject) => {
      const relation = relations.find(
        (r) => r.subject_id === subject.id
      );

      return {
        ...subject,
        teacher_subject_id: relation?.id || null,
        teacher_id: relation?.teacher_id || "",
        teacher_name: relation?.teacher_name || "",
      };
    });

    let filtered = merged;

    if (selectedTeacher) {
      filtered = merged.filter(
        (s) => String(s.teacher_id) === String(selectedTeacher)
      );
    }

    setSubjects(filtered);
    setTeacherSubjects(relations);
  } catch (error) {
    console.error(error);
    setSubjects([]);
  }
};

  const fetchTeachers = async () => {
    try {
      const res = await teacherService.getAll();

      setTeachers(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
  fetchSubjects();
  }, [selectedTeacher]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const filteredSubjects = subjects.filter((s) => {
    return (
      !searchName ||
      s.name?.toLowerCase().includes(searchName.toLowerCase())
    );
  });

  const resetForm = () => {
    setName("");
    setSelectedTeacherId("");

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

    if (!name.trim()) {
      setErrorsCreate({
        name: "Este campo no puede estar vacío.",
      });

      return;
    }

    const subjectRes = await subjectService.create({
      name,
    });

    if (selectedTeacherId) {
      await teacherSubjectService.create({
        teacher_id: selectedTeacherId,
        subject_id: subjectRes.data.data.id,
      });
    }

    setOpenCreateModal(false);

    resetForm();

    fetchSubjects();
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

  const handleEdit = async (subject) => {
  setSelectedSubject(subject);

  setName(subject.name || "");

  try {
    const relationRes = await teacherSubjectService.getAll();

    const relation = relationRes.data.data.find(
      (r) => r.subject_id === subject.id
    );

    setSelectedTeacherId(relation?.teacher_id || "");
  } catch {
    setSelectedTeacherId("");
  }

  setErrorsEdit({});
  setOpenEditModal(true);
};

  const handleUpdate = async () => {
  try {
    setErrorsEdit({});

    if (!name.trim()) {
      setErrorsEdit({
        name: "Este campo no puede estar vacío.",
      });

      return;
    }

    await subjectService.update(
      selectedSubject.id,
      { name }
    );

    const relationsRes =
      await teacherSubjectService.getAll();

    const existingRelation =
      relationsRes.data.data.find(
        (r) =>
          r.subject_id === selectedSubject.id
      );

    if (
      existingRelation &&
      selectedTeacherId
    ) {
      await teacherSubjectService.update(
        existingRelation.id,
        {
          teacher_id: selectedTeacherId,
          subject_id: selectedSubject.id,
        }
      );
    }

    else if (
      existingRelation &&
      !selectedTeacherId
    ) {
      await teacherSubjectService.delete(
        existingRelation.id
      );
    }

    else if (
      !existingRelation &&
      selectedTeacherId
    ) {
      await teacherSubjectService.create({
        teacher_id: selectedTeacherId,
        subject_id: selectedSubject.id,
      });
    }

    setOpenEditModal(false);

    resetForm();

    fetchSubjects();
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

  const handleDelete = (subject) => {
    setSelectedSubject(subject);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await subjectService.delete(selectedSubject.id);

      setOpenDeleteModal(false);

      fetchSubjects();
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
  { header: "Materia", accessor: "name" },
  { header: "Docente", accessor: "teacher_name" },
  ];

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
      <span>Materias</span>

      {showCreateButtons && (
        <Button
          size="sm"
          onClick={openCreate}
          className={buttonClass}
        >
          +
        </Button>
      )}
    </div>
  );

  return (
    <>
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          placeholder="🔍 Buscar por materia"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="p-2 border border-gray-300 rounded w-60"
        />

        <select
          value={selectedTeacher}
          onChange={(e) =>
            setSelectedTeacher(e.target.value)
          }
          className="p-2 border border-gray-300 rounded w-60"
        >
          <option value="">
            👨‍🏫 Todos los docentes
          </option>

          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.last_name}, {teacher.first_name}
            </option>
            ))}
        </select>
      </div>

      <BasicTable
        title={tableTitle}
        columns={columns}
        data={filteredSubjects}
      />

      {showCreateButtons && (
        <div className="mt-8">
          <Button
            onClick={openCreate}
            className={buttonClass}
          >
            Crear Materia
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
  <h2 className="text-xl font-bold mb-8">
    Crear Materia
  </h2>

  <div className="flex flex-col mb-6">
    <label className="font-semibold mb-2">
      Nombre
    </label>

    <input
      className={inputClass(errorsCreate.name)}
      value={name}
      onChange={(e) => setName(e.target.value)}
    />

    {errorsCreate.name && (
      <p className="text-red-500 text-sm mt-1">
        {errorsCreate.name}
      </p>
    )}
  </div>

  <div className="flex flex-col mb-6">
    <label className="font-semibold mb-2">
      Docente
    </label>

    <select
      value={selectedTeacherId}
      onChange={(e) =>
        setSelectedTeacherId(e.target.value)
      }
      className={inputClass(errorsCreate.teacher_id)}
    >
      <option value="">
        Sin docente asignado
      </option>

      {teachers.map((teacher) => (
        <option
          key={teacher.id}
          value={teacher.id}
        >
          {teacher.last_name}, {teacher.first_name}
        </option>
      ))}
    </select>

    {errorsCreate.teacher_id && (
      <p className="text-red-500 text-sm mt-1">
        {errorsCreate.teacher_id}
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
    >
      Cancelar
    </Button>

    <Button onClick={handleCreate}>
      Crear
    </Button>
  </div>
</Modal>

      <Modal
  isOpen={openEditModal}
  onClose={() => {
    setOpenEditModal(false);
    resetForm();
  }}
>
  <h2 className="text-xl font-bold mb-8">
    Editar Materia
  </h2>

  <div className="flex flex-col mb-6">
    <label className="font-semibold mb-2">
      Nombre
    </label>

    <input
      className={inputClass(errorsEdit.name)}
      value={name}
      onChange={(e) => setName(e.target.value)}
    />

    {errorsEdit.name && (
      <p className="text-red-500 text-sm mt-1">
        {errorsEdit.name}
      </p>
    )}
  </div>

  <div className="flex flex-col mb-6">
    <label className="font-semibold mb-2">
      Docente
    </label>

    <select
      value={selectedTeacherId}
      onChange={(e) =>
        setSelectedTeacherId(e.target.value)
      }
      className={inputClass(errorsEdit.teacher_id)}
    >
      <option value="">
        Sin docente asignado
      </option>

      {teachers.map((teacher) => (
        <option
          key={teacher.id}
          value={teacher.id}
        >
          {teacher.last_name}, {teacher.first_name}
        </option>
      ))}
    </select>

    {errorsEdit.teacher_id && (
      <p className="text-red-500 text-sm mt-1">
        {errorsEdit.teacher_id}
      </p>
    )}
  </div>

  <div className="flex justify-end gap-4 mt-10">
    <Button
      variant="outline"
      onClick={() => {
        setOpenEditModal(false);
        resetForm();
      }}
    >
      Cancelar
    </Button>

    <Button onClick={handleUpdate}>
      Guardar
    </Button>
  </div>
</Modal>

      <Modal
        isOpen={openDeleteModal}
        onClose={() =>
          setOpenDeleteModal(false)
        }
      >
        <h2 className="text-lg font-semibold mb-4">
          ¿Eliminar materia?
        </h2>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setOpenDeleteModal(false)
            }
          >
            Cancelar
          </Button>

          <Button onClick={confirmDelete}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </>
  );
}