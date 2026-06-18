import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import { teacherService } from "../../services/teacher.service";
import { planService } from "../../services/plan.service";
import Button from "../../components/ui/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/Input";
import Select from "../../components/form/Select";
import { Modal } from "../../components/ui/Modal";
import { isAdmin } from "../../utils/auth";
import {
  PencilIcon,
  TrashBinIcon,
  CloseLineIcon,
  SaveIcon,
  MoreIcon,
  CreateIcon,
} from "../../icons";

export function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("");

  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  const [searchFirstLastName, setSearchFirstLastName] = useState("");
  const [searchDNI, setSearchDNI] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");

  const [errorsCreate, setErrorsCreate] = useState({});
  const [errorsEdit, setErrorsEdit] = useState({});

  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const status = params.get("status") || "all";

  const inputClass = (error) =>
    `w-full p-2 border rounded mb-1 
    border-gray-300
    focus:outline-none focus:ring-1 focus:ring-[#0cc0df] focus:border-[#0cc0df]
    ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}`;

  const buttonClass = "cursor-pointer transition transform hover:scale-105";

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

  const fetchTeachers = async () => {
    try {
      const queryParams = {};

      if (selectedPlan) {
        queryParams.plan_id = selectedPlan;
      }

      const { data } = await teacherService.getAll(queryParams);

      setTeachers(data?.data || []);
    } catch {
      setTeachers([]);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [selectedPlan]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const plansRes = await planService.getAll();

        setPlans(plansRes.data.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchFilters();
  }, []);

  const filteredTeachers = teachers.filter((t) => {
    const textName = searchFirstLastName.toLowerCase();
    const textDNI = searchDNI;

    const matchName =
      !textName ||
      t.first_name?.toLowerCase().includes(textName) ||
      t.last_name?.toLowerCase().includes(textName);

    const matchDNI = !textDNI || t.dni?.toString().includes(textDNI);

    return matchName && matchDNI;
  });

  const handleCreate = async () => {
    try {
      setErrorsCreate({});

      await teacherService.create({
        first_name: firstName,
        last_name: lastName,
        dni,
        phone,
      });

      setOpenCreateModal(false);
      fetchTeachers();
      resetForm();
    } catch (error) {
      const backendErrors = error.response?.data?.errors;
      if (backendErrors) setErrorsCreate(mapErrors(backendErrors));
    }
  };

  const handleEdit = (teacher) => {
    setSelectedTeacher(teacher);

    setFirstName(teacher.first_name || "");
    setLastName(teacher.last_name || "");
    setDni(teacher.dni || "");
    setPhone(teacher.phone || "");

    setErrorsEdit({});
    setOpenEditModal(true);
  };

  const handleUpdate = async () => {
    const newErrors = {};

    if (!firstName.trim()) newErrors.first_name = "Este campo está vacío.";
    if (!lastName.trim()) newErrors.last_name = "Este campo está vacío.";
    if (!dni.trim()) newErrors.dni = "Este campo está vacío.";
    if (!phone.trim()) newErrors.phone = "Este campo está vacío.";

    if (Object.keys(newErrors).length > 0) {
      setErrorsEdit(newErrors);
      return;
    }

    try {
      setErrorsEdit({});

      await teacherService.update(selectedTeacher.id, {
        first_name: firstName,
        last_name: lastName,
        dni,
        phone,
      });

      setOpenEditModal(false);
      fetchTeachers();
    } catch (error) {
      const backendErrors = error.response?.data?.errors;
      if (backendErrors) setErrorsEdit(mapErrors(backendErrors));
    }
  };

  const handleDelete = (teacher) => {
    setSelectedTeacher(teacher);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await teacherService.delete(selectedTeacher.id);
      setOpenDeleteModal(false);
      fetchTeachers();
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert(error.response?.data?.message || "Error al eliminar");
    }
  };

  const openCreate = () => {
    resetForm();
    setOpenCreateModal(true);
  };

  let columns = [
    { header: "Apellido", accessor: "last_name" },
    { header: "Nombre", accessor: "first_name" },
    { header: "Teléfono", accessor: "phone" },
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
            title="Editar"
            size="sm"
            onClick={() => handleEdit(row)}
            className={buttonClass}
          >
            <PencilIcon className="w-5 h-5" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(row)}
            className={buttonClass}
            title="Eliminar"
          >
            <TrashBinIcon className="w-5 h-5" />
          </Button>
        </div>
      ),
    });
  }

  const showCreateButtons = isAdmin();

  const tableTitle = (
    <div className="flex justify-between items-center">
      <span>Docentes</span>
      {showCreateButtons && (
        <Button
          title="Crear Docente"
          size="sm"
          onClick={openCreate}
          className="
                      cursor-pointer
                      w-12
                      h-12
                      rounded
                      bg-[#0cc0df]
                      text-white
                      flex
                      items-center
                      justify-center
                      transition
                      transform
                      hover:scale-105
                    "
        >
          <img
            src={CreateIcon}
            alt="More"
            className="
                        w-5
                        h-5
                        brightness-0
                        invert
                      "
          />
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* BUSCADORES */}
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
      </div>

      <BasicTable
        title={tableTitle}
        columns={columns}
        data={filteredTeachers}
      />

      {showCreateButtons && (
        <div className="mt-8">
          <Button onClick={openCreate} className={buttonClass}>
            Crear Docente
          </Button>
        </div>
      )}

      {/* CREATE MODAL */}
      <Modal isOpen={openCreateModal} onClose={() => setOpenCreateModal(false)}>
        <h2 className="text-xl font-bold mb-8">Crear Docente</h2>

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

        <div className="flex justify-end gap-4 mt-10">
          {/* <Button variant="outline" onClick={() => setOpenCreateModal(false)}>
            Cancelar
          </Button> */}
          <Button
            size="icon"
            title="Guardar"
            onClick={handleCreate}
            className="
                        cursor-pointer
                        w-12
                        h-12
                        rounded
                        bg-[#0cc0df]
                        text-white
                        flex
                        items-center
                        justify-center
                        transition
                        transform
                        hover:scale-105
                      "
          >
            <img
              src={SaveIcon}
              alt="Guardar"
              className="
                          w-5
                          h-5
                          brightness-0
                          invert
                        "
            />
          </Button>
        </div>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={openEditModal} onClose={() => setOpenEditModal(false)}>
        <h2 className="text-xl font-bold mb-8">Editar Docente</h2>

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

        <div className="flex justify-end gap-4 mt-10">
          {/* <Button variant="outline" onClick={() => setOpenEditModal(false)}>
            Cancelar
          </Button> */}
          <Button
            size="icon"
            className="
              cursor-pointer
              w-12
              h-12
              rounded
              bg-[#0cc0df]
              text-white
              flex
              items-center
              justify-center
              transition
              transform
              hover:scale-105
            "
            title="Guardar"
            onClick={handleUpdate}
          >
            <img
              src={SaveIcon}
              alt="Guardar"
              className="
                w-5
                h-5
                brightness-0
                invert
              "
            />
          </Button>
        </div>
      </Modal>

      <Modal isOpen={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <h2 className="text-lg font-semibold mb-4">¿Eliminar Docente?</h2>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpenDeleteModal(false)}
            className={buttonClass}
          >
            No
          </Button>

          <Button onClick={confirmDelete} className={buttonClass}>
            Sí
          </Button>
        </div>
      </Modal>
    </>
  );
}
