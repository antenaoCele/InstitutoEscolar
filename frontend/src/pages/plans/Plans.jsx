import { useEffect, useState } from "react";
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import { planService } from "../../services/plan.service";
import { PlanPriceService } from "../../services/PlanPrice.service";
import { subjectService } from "../../services/subject.service";
import { PlanSubjectService } from "../../services/PlanSubject.service";
import { teacherPlansService } from "../../services/teacherPlans.service";
import { teacherService } from "../../services/teacher.service";
import Button from "../../components/ui/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/Input";
import { Modal } from "../../components/ui/Modal";
import { isAdmin } from "../../utils/auth";
import { PencilIcon, SaveIcon, CreateIcon } from "../../icons";
import {
  ViewButton,
  EditButton,
  DeleteButton,
  PlusButton,
  YesButton,
  NoButton,
  AddButton,
  AssignTeacherButton,
} from "../../components/ui/ActionButtons";
import { sortByProperty, sortByPersonName } from "../../utils/sort";
import { mapErrors } from "../../validators/helpers/errorHelpers";
import { validatePlanForm } from "../../validators/entities/plans.validator";
import { useFeedbackModal } from "../../hooks/shared/useFeedBackModal";
import Checkbox from "../../components/form/Checkbox";

export function Plans() {
  // ======================================================
  // DATOS
  // ======================================================
  const [planPrices, setPlanPrices] = useState([]); // historial completo (todos los planes)
  const [currentPlans, setCurrentPlans] = useState([]); // vista principal (planes actuales)
  const [plans, setPlans] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [allPlanSubjects, setAllPlanSubjects] = useState([]);

  const [openTeachersModal, setOpenTeachersModal] = useState(false);

  const [selectedPlanTeachers, setSelectedPlanTeachers] = useState(null);

  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);

  const [teachers, setTeachers] = useState([]);

  // ======================================================
  // FILTROS
  // ======================================================
  const [searchPlanName, setSearchPlanName] = useState("");

  // ======================================================
  // MODALES
  // ======================================================
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);
  const { feedbackModal, showFeedback, closeFeedback } = useFeedbackModal();

  // ======================================================
  // PLAN SELECCIONADO
  // ======================================================
  const [selectedPlanPrice, setSelectedPlanPrice] = useState(null); // precio activo que se está reemplazando (editar)
  const [selectedPlanForHistory, setSelectedPlanForHistory] = useState(null); // plan (fila de la tabla principal) -> ver historial

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
    setSelectedPlanPrice(null);
  };

  // ======================================================
  // FUNCIONES AUXILIARES
  // ======================================================
  // Devuelve la fecha de hoy en formato "YYYY-MM-DD"
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Devuelve la fecha de ayer en formato "YYYY-MM-DD"
  // (usada como fecha de cierre del precio anterior, para no solapar
  // con el nuevo precio que arranca hoy)
  const getYesterdayDateString = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, "0");
    const day = String(yesterday.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Devuelve el precio actualmente vigente de un plan (sin fecha de baja,
  // o en su defecto el de fecha de inicio más reciente)
  const getActivePlanPrice = (planId) => {
    const pricesForPlan = planPrices.filter((pp) => pp.plan_id === planId);
    if (pricesForPlan.length === 0) return null;

    const activeWithoutEndDate = pricesForPlan.find((pp) => !pp.end_date);
    if (activeWithoutEndDate) return activeWithoutEndDate;

    return [...pricesForPlan].sort(
      (a, b) => new Date(b.start_date) - new Date(a.start_date),
    )[0];
  };

  const refreshAll = async () => {
    await Promise.all([fetchPlanPrices(), fetchCurrentPlans()]);

    const [plansRes, planSubjectsRes] = await Promise.all([
      planService.getAll(),
      PlanSubjectService.getAll(),
    ]);

    setPlans(plansRes.data.data || []);
    setAllPlanSubjects(planSubjectsRes.data.data || []);
  };

  // ======================================================
  // HANDLES CRUD
  // ======================================================
  const openCreate = () => {
    resetForm();
    setOpenCreateModal(true);
  };

  const handleCreate = async () => {
    const errors = validatePlanForm({
      plan: selectedPlan,
      subjects: selectedSubjects,
      price,
      startDate,
      endDate,
    });

    if (Object.keys(errors).length > 0) {
      setErrorsCreate(errors);
      return;
    }

    try {
      setErrorsCreate({});

      const planResponse = await planService.create({
        name: selectedPlan,
      });

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

      setOpenCreateModal(false);
      await refreshAll();
      resetForm();

      showFeedback("Plan creado correctamente.", "success");
    } catch (error) {
      console.error(error.response?.data || error.message);

      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        setErrorsCreate(mapErrors(backendErrors));
      } else {
        showFeedback(
          error.response?.data?.message || "Error al crear el plan.",
          "error",
        );
      }
    }
  };

  const handleSubjectCheckbox = (subjectId, checked) => {
    if (checked) {
      setSelectedSubjects((prev) => [...prev, subjectId]);
    } else {
      setSelectedSubjects((prev) => prev.filter((id) => id !== subjectId));
    }
  };

  // Abre el modal de historial (solo lectura) para un plan de la tabla principal
  const handleOpenHistory = (planRow) => {
    setSelectedPlanForHistory(planRow);
    setOpenHistoryModal(true);
  };

  // Carga el formulario de edición con el precio recibido
  const handleEdit = (planPrice) => {
    setSelectedPlanPrice(planPrice);

    setSelectedPlan(planPrice.plan_name || "");
    setPrice(planPrice.price ? String(planPrice.price) : "");

    const subjectsForThisPlan = allPlanSubjects
      .filter((ps) => ps.plan_id === planPrice.plan_id)
      .map((ps) => ps.subject_id);

    setSelectedSubjects(subjectsForThisPlan);

    setErrorsEdit({});
    setOpenEditModal(true);
  };

  // Editar desde la tabla principal: busca el precio vigente del plan y abre el modal
  const handleEditPlan = (planRow) => {
    const activePrice = getActivePlanPrice(planRow.id);

    if (!activePrice) {
      alert("Este plan no tiene un precio activo registrado.");
      return;
    }

    handleEdit({
      ...activePrice,
      plan_name: activePrice.plan_name || planRow.name,
    });
  };

  const handleManageTeachers = async (plan) => {
    try {
      const { data } = await teacherPlansService.getByPlan(plan.id);

      setSelectedPlanTeachers(plan);

      setSelectedTeacherIds((data.data || []).map((row) => row.teacher_id));

      setOpenTeachersModal(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTeacherCheckbox = (teacherId, checked) => {
    if (checked) {
      setSelectedTeacherIds((prev) => [...prev, teacherId]);
    } else {
      setSelectedTeacherIds((prev) => prev.filter((id) => id !== teacherId));
    }
  };

  const handleSaveTeachers = async () => {
    try {
      await teacherPlansService.updateByPlan(selectedPlanTeachers.id, {
        teacher_ids: selectedTeacherIds,
      });

      await fetchCurrentPlans();

      setOpenTeachersModal(false);
      setSelectedTeacherIds([]);
      setSelectedPlanTeachers(null);

      showFeedback("Docente/s asignado/s correctamente.", "success");
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async () => {
    const errors = validatePlanForm({
      plan: selectedPlan,
      subjects: selectedSubjects,
      price,
    });

    if (Object.keys(errors).length > 0) {
      setErrorsEdit(errors);
      return;
    }

    // La restricción de días 1-5 aplica únicamente al precio. Si el precio
    // no cambió respecto al que tenía el plan al abrir el modal, no
    // llamamos a changePrice, para poder editar nombre/materias cualquier
    // día sin chocar con esa regla.
    const priceChanged = Number(price) !== Number(selectedPlanPrice.price);

    try {
      setErrorsEdit({});

      // Actualizar nombre del plan si cambió
      await planService.update(selectedPlanPrice.plan_id, {
        name: selectedPlan,
      });

      if (priceChanged) {
        await PlanPriceService.changePrice(selectedPlanPrice.plan_id, {
          price: Number(price),
        });
      }

      // Lógica de sincronización de materias
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

      setOpenEditModal(false);
      await refreshAll();
      resetForm();

      showFeedback(
        priceChanged
          ? "El plan fue actualizado correctamente.\n\n" +
              "Recuerde que podrá corregir el precio únicamente durante el día de hoy. " +
              "Desde mañana este precio quedará definitivo y las futuras actualizaciones " +
              "solo podrán efectuarse entre los días 1 y 5 de cada mes."
          : "El plan fue actualizado correctamente.",
        "success",
      );
    } catch (error) {
      console.error(error.response?.data || error.message);

      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        setErrorsEdit(mapErrors(backendErrors));
      } else {
        showFeedback(
          error.response?.data?.message || "Error al editar el plan.",
          "error",
        );
      }
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

        const teachersRes = await teacherService.getAll({ active: true });
        setTeachers(teachersRes.data.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchFilters();
  }, []);

  // ======================================================
  // DATOS DERIVADOS
  // ======================================================
  const filteredCurrentPlans = currentPlans
    .filter((p) => {
      const textPlan = searchPlanName.toLowerCase();
      return !textPlan || p.name?.toLowerCase().includes(textPlan);
    })
    .sort(sortByProperty("name"));

  // Historial del plan seleccionado, ordenado por fecha de inicio (más reciente primero)
  const historyForSelectedPlan = selectedPlanForHistory
    ? planPrices
        .filter((pp) => pp.plan_id === selectedPlanForHistory.id)
        .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
    : [];

  const columns = [
    {
      header: "Planes",
      accessor: "name",
    },
    {
      header: "Materias",
      render: (row) => {
        const subjects = row.subjects || [];

        const containerClass =
          subjects.length >= 3
            ? "h-20 overflow-y-auto pr-2"
            : "h-20 flex flex-col justify-center";

        return (
          <div className={containerClass}>
            {subjects.length === 0 ? (
              <span className="text-gray-400 italic">Sin materias</span>
            ) : (
              subjects.map((subject) => (
                <div key={subject} className="py-1">
                  {subject}
                </div>
              ))
            )}
          </div>
        );
      },
    },
    {
      header: "Docentes",
      render: (row) => {
        const teachers = row.teachers || [];

        const containerClass =
          teachers.length >= 3
            ? "h-20 overflow-y-auto pr-2"
            : "h-20 flex flex-col justify-center";

        return (
          <div className={containerClass}>
            {teachers.length === 0 ? (
              <span className="text-sm italic text-gray-500">Sin docentes</span>
            ) : (
              teachers.map((teacher) => (
                <div key={teacher} className="py-1">
                  {teacher}
                </div>
              ))
            )}
          </div>
        );
      },
    },
    {
      header: "Precios Actuales",
      accessor: "current_price",
    },

    ...(!isPlanUser
      ? [
          {
            header: "Acciones",
            render: (row) => {
              const hasSubjects = allPlanSubjects.some(
                (ps) => ps.plan_id === row.id,
              );

              return (
                <div className="flex gap-2">
                  <ViewButton
                    title="Ver Historial"
                    onClick={() => handleOpenHistory(row)}
                  />

                  <EditButton
                    title="Editar Plan"
                    onClick={() => handleEditPlan(row)}
                  />

                  <AssignTeacherButton
                    disabled={!hasSubjects}
                    title={
                      hasSubjects
                        ? "Asignar Docente"
                        : "Primero agregue una o más materias al plan"
                    }
                    onClick={() => handleManageTeachers(row)}
                  />
                </div>
              );
            },
          },
        ]
      : []),
  ];

  const showCreateButtons = isAdmin();

  const tableTitle = (
    <div className="flex justify-between items-center">
      <span>Planes</span>

      {showCreateButtons && (
        <PlusButton title="Crear Plan" onClick={openCreate} />
      )}
    </div>
  );

  const renderSubjectCheckboxes = (errors) => (
    <>
      <Label>Materias</Label>

      <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-3 border border-gray-200 rounded">
        {[...subjects].sort(sortByProperty("name")).map((subject) => (
          <Checkbox
            key={subject.id}
            label={subject.name}
            checked={selectedSubjects.includes(subject.id)}
            onChange={(checked) => handleSubjectCheckbox(subject.id, checked)}
          />
        ))}
      </div>

      {errors.subjects && (
        <p className="text-red-500 text-sm mt-1">{errors.subjects}</p>
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
      {showCreateButtons && (
        <div className="mt-8">
          <Button onClick={openCreate} className={buttonClass}>
            Crear Plan
          </Button>
        </div>
      )}

      {/* ================== MODAL: CREAR PLAN ================== */}
      <Modal isOpen={openCreateModal} onClose={() => setOpenCreateModal(false)}>
        <h2 className="text-xl font-bold mb-8">Crear Plan</h2>

        <Label>Plan</Label>
        <Input
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
          error={errorsCreate.name}
        />

        <div className="mb-5">{renderSubjectCheckboxes(errorsCreate)}</div>

        <Label>Precio</Label>
        <Input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          error={errorsCreate.price}
        />

        <Label>Fecha de Inicio</Label>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          error={errorsCreate.start_date}
        />

        <Label>Fecha Fin (Opcional)</Label>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          error={errorsCreate.end_date}
        />

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

      {/* ================== MODAL: HISTORIAL DE PRECIOS DEL PLAN (SOLO LECTURA) ================== */}
      <Modal
        isOpen={openHistoryModal}
        onClose={() => setOpenHistoryModal(false)}
      >
        <h2 className="text-xl font-bold mb-6">
          Historial de Precios:{" "}
          {selectedPlanForHistory ? ` ${selectedPlanForHistory.name}` : ""}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* ================== MODAL: EDITAR PLAN (genera un nuevo precio vigente) ================== */}
      <Modal
        isOpen={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          resetForm();
        }}
      >
        <h2 className="text-xl font-bold mb-8">Editar Plan</h2>

        <Label>Plan</Label>
        <Input
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
          error={errorsEdit.name}
        />

        <div className="mb-5">{renderSubjectCheckboxes(errorsEdit)}</div>

        <Label>Precio</Label>
        <Input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          error={errorsEdit.price}
        />
        <p className="text-sm italic text-gray-500 text-justify">
          Si modifica el precio, quedará vigente desde hoy. Podrá corregirlo
          todas las veces que sea necesario durante el día de hoy. <br />
          <br />
          <strong>
            A partir de mañana ya no podrá modificar el precio y las
            actualizaciones solo estarán habilitadas entre los días 1 y 5 de
            cada mes.
          </strong>
        </p>

        <div className="flex justify-end gap-4 mt-10">
          <NoButton title="Cancelar" onClick={() => setOpenEditModal(false)} />

          <YesButton title="Aceptar" onClick={handleUpdate} />
        </div>
      </Modal>

      <Modal
        isOpen={openTeachersModal}
        onClose={() => setOpenTeachersModal(false)}
      >
        <h2 className="text-xl font-bold mb-8">Asignar docentes</h2>

        <Label>{selectedPlanTeachers?.name}</Label>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {[...teachers].sort(sortByPersonName).map((teacher) => (
            <label key={teacher.id} className="flex items-center gap-3">
              <Checkbox
                checked={selectedTeacherIds.includes(teacher.id)}
                onChange={(checked) =>
                  handleTeacherCheckbox(teacher.id, checked)
                }
              />
              {teacher.last_name}, {teacher.first_name}
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <NoButton
            onClick={() => {
              setOpenTeachersModal(false);
              setSelectedTeacherIds([]);
              setSelectedPlanTeachers(null);
            }}
          />

          <YesButton onClick={handleSaveTeachers} />
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

        <p className="text-gray-600 text-justify whitespace-pre-line leading-6">
          {feedbackModal.message}
        </p>
      </Modal>
    </>
  );
}
