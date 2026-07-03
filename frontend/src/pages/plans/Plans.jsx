import { useEffect, useState } from "react";
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import { planService } from "../../services/plan.service";
import { PlanPriceService } from "../../services/PlanPrice.service";
import { subjectService } from "../../services/subject.service";
import { PlanSubjectService } from "../../services/PlanSubject.service";
import Button from "../../components/ui/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/Input";
import { Modal } from "../../components/ui/Modal";
import { isAdmin } from "../../utils/auth";
import { PencilIcon, TrashBinIcon, SaveIcon, CreateIcon } from "../../icons";

export function Plans() {
  // ======================================================
  // DATOS
  // ======================================================
  const [planPrices, setPlanPrices] = useState([]); // historial completo (todos los planes)
  const [currentPlans, setCurrentPlans] = useState([]); // vista principal (planes actuales)
  const [plans, setPlans] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [allPlanSubjects, setAllPlanSubjects] = useState([]);

  // ======================================================
  // FILTROS
  // ======================================================
  const [searchPlanName, setSearchPlanName] = useState("");

  // ======================================================
  // MODALES
  // ======================================================
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);

  // ======================================================
  // PLAN SELECCIONADO
  // ======================================================
  const [selectedPlanPrice, setSelectedPlanPrice] = useState(null); // fila de precio (para editar/eliminar)
  const [selectedPlanForHistory, setSelectedPlanForHistory] = useState(null); // plan (fila de la tabla principal)

  // ======================================================
  // FORMULARIO DEL PLAN
  // ======================================================
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [price, setPrice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ======================================================
  // ESTADO DEL COMPONENTE
  // ======================================================
  const isPlanUser = !isAdmin();

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
  const fetchPlanPrices = async () => {
    try {
      const { data } = await PlanPriceService.getAll();
      setPlanPrices(data?.data || []);
    } catch {
      setPlanPrices([]);
    }
  };

  const fetchCurrentPlans = async () => {
    try {
      const { data } = await planService.getCurrent();
      setCurrentPlans(data?.data || []);
    } catch {
      setCurrentPlans([]);
    }
  };

  // ======================================================
  // RESETEO
  // ======================================================
  const resetForm = () => {
    setSelectedPlan("");
    setPrice("");
    setStartDate("");
    setEndDate("");
    setSelectedSubjects([]);
    setErrorsCreate({});
    setErrorsEdit({});
  };

  // ======================================================
  // FUNCIONES AUXILIARES
  // ======================================================
  const mapErrors = (errors) => {
    const formatted = {};

    errors.forEach((e) => {
      formatted[e.path] = e.msg;
    });

    return formatted;
  };

  const refreshAll = async () => {
    await Promise.all([fetchPlanPrices(), fetchCurrentPlans()]);
    const plansRes = await planService.getAll();
    setPlans(plansRes.data.data || []);
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

      // Crear el plan
      const planResponse = await planService.create({ name: selectedPlan });
      const newPlanId = planResponse.data.data?.id || planResponse.data.id;

      if (!newPlanId)
        throw new Error("No se pudo obtener el ID del nuevo plan");

      for (const subjectId of selectedSubjects) {
        await PlanSubjectService.create({
          plan_id: newPlanId,
          subject_id: subjectId,
        });
      }

      await PlanPriceService.create({
        plan_id: newPlanId,
        price: Number(price),
        start_date: startDate,
        end_date: endDate.trim() || null,
      });

      alert("Plan creado con éxito");
      setOpenCreateModal(false);
      await refreshAll();
      resetForm();
    } catch (error) {
      const backendErrors = error.response?.data?.errors;
      if (backendErrors) {
        setErrorsCreate(mapErrors(backendErrors));
      } else {
        alert(error.response?.data?.message || "Error al crear el plan");
      }
    }
  };

  // Abre el modal de historial para un plan de la tabla principal
  const handleOpenHistory = (planRow) => {
    setSelectedPlanForHistory(planRow);
    setOpenHistoryModal(true);
  };

  // Edita una fila puntual del historial (precio) de un plan
  const handleEdit = (planPrice) => {
    setSelectedPlanPrice(planPrice);

    setSelectedPlan(planPrice.plan_name || "");

    setPrice(planPrice.price ? String(planPrice.price) : "");

    setStartDate(
      planPrice.start_date ? planPrice.start_date.split("T")[0] : "",
    );

    // SIEMPRE VACÍA
    setEndDate("");

    const subjectsForThisPlan = allPlanSubjects
      .filter((ps) => ps.plan_id === planPrice.plan_id)
      .map((ps) => ps.subject_id);

    setSelectedSubjects(subjectsForThisPlan);

    setErrorsEdit({});
    setOpenEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      setErrorsEdit({});

      // Actualizar nombre del plan si cambió
      await planService.update(selectedPlanPrice.plan_id, {
        name: selectedPlan,
      });

      await PlanPriceService.update(selectedPlanPrice.id, {
        plan_id: selectedPlanPrice.plan_id,
        price: Number(price),
        start_date: startDate || null,
        end_date: endDate.trim() || null,
      });

      // --- Lógica de sincronización de materias ---
      const currentPlanSubjects = allPlanSubjects.filter(
        (ps) => ps.plan_id === selectedPlanPrice.plan_id,
      );
      const currentSubjectIds = currentPlanSubjects.map((ps) => ps.subject_id);

      const subjectsToAdd = selectedSubjects.filter(
        (subjectId) => !currentSubjectIds.includes(subjectId),
      );

      const currentSelectedSubjectIds = new Set(selectedSubjects);
      const subjectsToRemove = currentSubjectIds.filter(
        (subjectId) => !currentSelectedSubjectIds.has(subjectId),
      );

      for (const subjectId of subjectsToAdd) {
        await PlanSubjectService.create({
          plan_id: selectedPlanPrice.plan_id,
          subject_id: subjectId,
        });
      }

      for (const subjectId of subjectsToRemove) {
        const planSubjectRelation = currentPlanSubjects.find(
          (ps) => ps.subject_id === subjectId,
        );
        if (planSubjectRelation)
          await PlanSubjectService.delete(planSubjectRelation.id);
      }

      alert("Plan actualizado con éxito");
      setOpenEditModal(false);
      await refreshAll();
      const planSubjectsRes = await PlanSubjectService.getAll();
      setAllPlanSubjects(planSubjectsRes.data.data || []);
      resetForm();
    } catch (error) {
      const backendErrors = error.response?.data?.errors;
      const planSubjectsRes = await PlanSubjectService.getAll();
      setAllPlanSubjects(planSubjectsRes.data.data || []);
      if (backendErrors) {
        setErrorsEdit(mapErrors(backendErrors));
      } else {
        alert(error.response?.data?.message || "Error al actualizar el plan");
      }
    }
  };

  const handleDelete = (planPrice) => {
    setSelectedPlanPrice(planPrice);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      // Primero eliminamos el precio del plan
      await PlanPriceService.delete(selectedPlanPrice.id);
      // Luego eliminamos el plan base asociado
      await planService.delete(selectedPlanPrice.plan_id);

      setOpenDeleteModal(false);
      setOpenHistoryModal(false);
      await refreshAll();
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert(error.response?.data?.message || "Error al eliminar");
    }
  };

  // ======================================================
  // USEEFFECTS
  // ======================================================
  useEffect(() => {
    fetchCurrentPlans();
    fetchPlanPrices();
  }, []);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const plansRes = await planService.getAll();
        setPlans(plansRes.data.data || []);

        const subjectsRes = await subjectService.getAll();
        setSubjects(subjectsRes.data.data || []);

        const planSubjectsRes = await PlanSubjectService.getAll();
        setAllPlanSubjects(planSubjectsRes.data.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchFilters();
  }, []);

  // ======================================================
  // DATOS DERIVADOS
  // ======================================================
  const filteredCurrentPlans = currentPlans.filter((p) => {
    const textPlan = searchPlanName.toLowerCase();
    return !textPlan || p.name?.toLowerCase().includes(textPlan);
  });

  // Historial del plan seleccionado, ordenado por fecha de inicio (más reciente primero)
  const historyForSelectedPlan = selectedPlanForHistory
    ? planPrices
        .filter((pp) => pp.plan_id === selectedPlanForHistory.id)
        .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
    : [];

  const columns = [
    {
      header: "Plan",
      accessor: "name",
    },
    {
      header: "Materias",
      render: (row) => row.subjects?.join(", ") || "-",
    },
    {
      header: "Precio Actual",
      accessor: "current_price",
    },
    {
      header: "Historial",
      render: (row) => (
        <Button
          title="Ver historial"
          size="sm"
          variant="outline"
          onClick={() => handleOpenHistory(row)}
          className={buttonClass}
        >
          Ver historial
        </Button>
      ),
    },
  ];

  const tableTitle = (
    <div className="flex justify-between items-center">
      <span>Planes</span>

      {isAdmin() && (
        <Button
          title="Crear Plan"
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
      <div className="flex gap-3 mb-4 flex-wrap">
        <Input
          placeholder="Buscar por plan"
          value={searchPlanName}
          onChange={(e) => setSearchPlanName(e.target.value)}
          className="p-2 border border-gray-300 rounded w-60"
        />
      </div>

      <BasicTable
        title={tableTitle}
        columns={columns}
        data={filteredCurrentPlans}
      />

      {/* ================== MODAL: CREAR PLAN ================== */}
      <Modal isOpen={openCreateModal} onClose={() => setOpenCreateModal(false)}>
        <h2 className="text-xl font-bold mb-8">Crear Plan</h2>

        <div className="flex flex-col mb-6">
          <Label className="font-semibold mb-2">Plan</Label>
          <Input
            type="text"
            placeholder="Escribir nombre del plan"
            className={inputClass(errorsCreate.name || errorsCreate.plan_id)}
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
          />
          {(errorsCreate.name || errorsCreate.plan_id) && (
            <p className="text-red-500 text-sm mt-1">
              {errorsCreate.name || errorsCreate.plan_id}
            </p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <Label className="font-semibold mb-2">Materias</Label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded">
            {subjects.map((s) => (
              <Label key={s.id} className="flex items-center gap-2 text-sm">
                <Input
                  type="checkbox"
                  value={s.id}
                  checked={selectedSubjects.includes(s.id)}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    if (e.target.checked) {
                      setSelectedSubjects([...selectedSubjects, id]);
                    } else {
                      setSelectedSubjects(
                        selectedSubjects.filter((sid) => sid !== id),
                      );
                    }
                  }}
                />
                {s.name}
              </Label>
            ))}
          </div>
          {selectedSubjects.length === 0 && (
            <p className="text-gray-400 text-xs mt-1">
              Selecciona al menos una materia
            </p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <Label className="font-semibold mb-2">Precio</Label>
          <Input
            type="number"
            className={inputClass(errorsCreate.price)}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div className="flex flex-col mb-6">
          <Label className="font-semibold mb-2">Fecha Inicio</Label>
          <Input
            type="date"
            className={inputClass(errorsCreate.start_date)}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col mb-6">
          <Label className="font-semibold mb-2">Fecha Fin (Opcional)</Label>
          <Input
            type="date"
            className={inputClass(errorsCreate.end_date)}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-4 mt-10">
          <Button
            title="Guardar"
            size="icon"
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

      {/* ================== MODAL: HISTORIAL DE PRECIOS DEL PLAN ================== */}
      <Modal
        isOpen={openHistoryModal}
        onClose={() => setOpenHistoryModal(false)}
      >
        <h2 className="text-xl font-bold mb-6">
          Historial de precios{" "}
          {selectedPlanForHistory ? `- ${selectedPlanForHistory.name}` : ""}
        </h2>

        {historyForSelectedPlan.length === 0 ? (
          <p className="text-gray-400 text-sm">
            Este plan no tiene historial de precios registrado.
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="py-2 pr-2">Precio</th>
                  <th className="py-2 pr-2">Fecha Inicio</th>
                  <th className="py-2 pr-2">Fecha Fin</th>
                  {!isPlanUser && <th className="py-2 pr-2">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {historyForSelectedPlan.map((pp) => (
                  <tr key={pp.id} className="border-b border-gray-100">
                    <td className="py-2 pr-2">{pp.price}</td>
                    <td className="py-2 pr-2">
                      {pp.start_date?.split("T")[0] || "-"}
                    </td>
                    <td className="py-2 pr-2">
                      {pp.end_date?.split("T")[0] || "-"}
                    </td>
                    {!isPlanUser && (
                      <td className="py-2 pr-2">
                        <div className="flex gap-2">
                          <Button
                            title="Editar"
                            size="sm"
                            onClick={() => handleEdit(pp)}
                            className={buttonClass}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            title="Eliminar"
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(pp)}
                            className={buttonClass}
                          >
                            <TrashBinIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end mt-8">
          <Button
            variant="outline"
            onClick={() => setOpenHistoryModal(false)}
            className={buttonClass}
          >
            Cerrar
          </Button>
        </div>
      </Modal>

      {/* ================== MODAL: EDITAR PRECIO ================== */}
      <Modal isOpen={openEditModal} onClose={() => setOpenEditModal(false)}>
        <h2 className="text-xl font-bold mb-8">Editar Plan</h2>

        <div className="flex flex-col mb-6">
          <Label className="font-semibold mb-2">Plan</Label>
          <Input
            type="text"
            placeholder="Editar nombre del plan"
            className={inputClass(errorsEdit.name || errorsEdit.plan_id)}
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
          />
          {(errorsEdit.name || errorsEdit.plan_id) && (
            <p className="text-red-500 text-sm mt-1">
              {errorsEdit.name || errorsEdit.plan_id}
            </p>
          )}
        </div>

        <div className="flex flex-col mb-6">
          <Label className="font-semibold mb-2">Materias</Label>

          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded">
            {subjects.map((s) => (
              <Label key={s.id} className="flex items-center gap-2 text-sm">
                <Input
                  type="checkbox"
                  value={s.id}
                  checked={selectedSubjects.includes(s.id)}
                  onChange={(e) => {
                    const id = Number(e.target.value);

                    if (e.target.checked) {
                      setSelectedSubjects([...selectedSubjects, id]);
                    } else {
                      setSelectedSubjects(
                        selectedSubjects.filter((sid) => sid !== id),
                      );
                    }
                  }}
                />

                {s.name}
              </Label>
            ))}
          </div>
        </div>

        <div className="flex flex-col mb-6">
          <Label className="font-semibold mb-2">Precio</Label>
          <Input
            type="number"
            className={inputClass(errorsEdit.price)}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div className="flex flex-col mb-6">
          <Label className="font-semibold mb-2">Fecha Inicio</Label>
          <Input
            type="date"
            className={inputClass(errorsEdit.start_date)}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col mb-6">
          <Label className="font-semibold mb-2">Fecha Fin (Opcional)</Label>
          <Input
            type="date"
            className={inputClass(errorsEdit.end_date)}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-4 mt-10">
          <Button
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
            size="icon"
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

      {/* ================== MODAL: ELIMINAR ================== */}
      <Modal isOpen={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <h2 className="text-lg font-semibold mb-4">¿Eliminar Plan?</h2>

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
