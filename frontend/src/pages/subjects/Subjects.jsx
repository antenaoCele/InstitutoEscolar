import { useEffect, useState } from "react";
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import { subjectService } from "../../services/subject.service";
import { teacherService } from "../../services/teacher.service";
import { teacherSubjectService } from "../../services/teacherSubject.service";
import Button from "../../components/ui/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/Input";
import Select from "../../components/form/Select";
import { Modal } from "../../components/ui/Modal";
import { isAdmin } from "../../utils/auth";

export function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");

  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);
  const [teacherSubjects, setTeacherSubjects] = useState([]);

  const [name, setName] = useState("");
  const [searchName, setSearchName] = useState("");

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [errorsCreate, setErrorsCreate] = useState({});
  const [errorsEdit, setErrorsEdit] = useState({});

  const buttonClass = "cursor-pointer transition transform hover:scale-105";

  const inputClass = (error) =>
    `w-full p-2 border rounded mb-1
    border-gray-300
    focus:outline-none focus:ring-1 focus:ring-[#0cc0df] focus:border-[#0cc0df]
    ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}`;

  const fetchSubjects = async () => {
    try {
      const [subjectsRes, teacherSubjectsRes] = await Promise.all([
        subjectService.getAll(),
        teacherSubjectService.getAll(),
      ]);

      const subjectsData = subjectsRes.data.data || [];
      const relations = teacherSubjectsRes.data.data || [];

      const merged = subjectsData.map((subject) => {
        const subjectTeachers = relations
          .filter((r) => r.subject_id === subject.id)
          .map((r) => ({ id: r.teacher_id, name: r.teacher_name }));
        return {
          ...subject,
          teachers: subjectTeachers,
        };
      });

      let filtered = merged;

      if (selectedTeacher) {
        filtered = merged.filter((s) =>
          s.teachers.some((t) => String(t.id) === String(selectedTeacher)),
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
      !searchName || s.name?.toLowerCase().includes(searchName.toLowerCase())
    );
  });

  const resetForm = () => {
    setName("");
    setSelectedTeacherIds([]);

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

      const subjectRes = await subjectService.create({ name });
      const newSubjectId = subjectRes.data.data.id;

      for (const teacherId of selectedTeacherIds) {
        await teacherSubjectService.create({
          teacher_id: teacherId,
          subject_id: newSubjectId,
        });
      }

      setOpenCreateModal(false);

      resetForm();

      fetchSubjects();
    } catch (error) {
      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        setErrorsCreate(mapErrors(backendErrors));
      }
    }
  };

  const handleEdit = async (subject) => {
    setSelectedSubject(subject);

    setName(subject.name || "");
    setSelectedTeacherIds(subject.teachers?.map((t) => t.id) || []);

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

      await subjectService.update(selectedSubject.id, { name });

      // Sincronizar docentes
      const relRes = await teacherSubjectService.getAll();
      const existingRels = relRes.data.data.filter(
        (r) => r.subject_id === selectedSubject.id,
      );
      const existingIds = existingRels.map((r) => r.teacher_id);

      // Agregar nuevos
      for (const tId of selectedTeacherIds) {
        if (!existingIds.includes(tId)) {
          await teacherSubjectService.create({
            teacher_id: tId,
            subject_id: selectedSubject.id,
          });
        }
      }
      // Eliminar los que ya no están
      for (const rel of existingRels) {
        if (!selectedTeacherIds.includes(rel.teacher_id)) {
          await teacherSubjectService.delete(rel.id);
        }
      }

      setOpenEditModal(false);

      resetForm();

      fetchSubjects();
    } catch (error) {
      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        setErrorsEdit(mapErrors(backendErrors));
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

      alert(error.response?.data?.message || "Error al eliminar");
    }
  };

  let columns = [
    { header: "Materia", accessor: "name" },
    {
      header: "Docente(s)",
      render: (row) => {
        if (!row.teachers || row.teachers.length === 0) return "-";
        if (row.teachers.length === 1) return row.teachers[0].name;
        return (
          <div className="max-h-16 overflow-y-auto border border-gray-100 p-1 rounded bg-gray-50 text-xs">
            {row.teachers.map((t, idx) => (
              <div key={t.id} className="mb-0.5 last:mb-0">
                {idx + 1}. {t.name}
              </div>
            ))}
          </div>
        );
      },
    },
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
        <Button size="sm" onClick={openCreate} className={buttonClass}>
          +
        </Button>
      )}
    </div>
  );

  return (
    <>
      <div className="flex gap-3 mb-4 flex-wrap">
        <Input
          placeholder="Buscar por materia"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="p-2 border border-gray-300 rounded w-60"
        />

        <Select
          value={selectedTeacher}
          onChange={(e) => setSelectedTeacher(e.target.value)}
          className="p-2 border border-gray-300 rounded w-60"
        >
          <option value="">Todos los docentes</option>

          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.last_name}, {teacher.first_name}
            </option>
          ))}
        </Select>
      </div>

      <BasicTable
        title={tableTitle}
        columns={columns}
        data={filteredSubjects}
      />

      {showCreateButtons && (
        <div className="mt-8">
          <Button onClick={openCreate} className={buttonClass}>
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
        <h2 className="text-xl font-bold mb-8">Crear Materia</h2>

        <div className="flex flex-col mb-6">
          <Label className="font-semibold mb-2">Nombre</Label>

          <Input
            className={inputClass(errorsCreate.name)}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {errorsCreate.name && (
            <p className="text-red-500 text-sm mt-1">{errorsCreate.name}</p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <Label className="font-semibold mb-2">Docentes</Label>
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded">
            {teachers.map((teacher) => (
              <Label
                key={teacher.id}
                className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded"
              >
                <Input
                  type="checkbox"
                  checked={selectedTeacherIds.includes(teacher.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTeacherIds([
                        ...selectedTeacherIds,
                        teacher.id,
                      ]);
                    } else {
                      setSelectedTeacherIds(
                        selectedTeacherIds.filter((id) => id !== teacher.id),
                      );
                    }
                  }}
                />
                {teacher.last_name}, {teacher.first_name}
              </Label>
            ))}
          </div>
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

          <Button onClick={handleCreate} className={buttonClass}>
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
        <h2 className="text-xl font-bold mb-8">Editar Materia</h2>

        <div className="flex flex-col mb-6">
          <Label className="font-semibold mb-2">Nombre</Label>

          <Input
            className={inputClass(errorsEdit.name)}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {errorsEdit.name && (
            <p className="text-red-500 text-sm mt-1">{errorsEdit.name}</p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <Label className="font-semibold mb-2">Docentes</Label>
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded">
            {teachers.map((teacher) => (
              <Label
                key={teacher.id}
                className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded"
              >
                <Input
                  type="checkbox"
                  checked={selectedTeacherIds.includes(teacher.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTeacherIds([
                        ...selectedTeacherIds,
                        teacher.id,
                      ]);
                    } else {
                      setSelectedTeacherIds(
                        selectedTeacherIds.filter((id) => id !== teacher.id),
                      );
                    }
                  }}
                />
                {teacher.last_name}, {teacher.first_name}
              </Label>
            ))}
          </div>
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

          <Button onClick={handleUpdate} className={buttonClass}>
            Guardar
          </Button>
        </div>
      </Modal>

      <Modal isOpen={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <h2 className="text-lg font-semibold mb-4">¿Eliminar materia?</h2>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpenDeleteModal(false)}
            className={buttonClass}
          >
            Cancelar
          </Button>

          <Button onClick={confirmDelete} className={buttonClass}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </>
  );
}
