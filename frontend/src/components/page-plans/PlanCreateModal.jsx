import { Modal } from "../ui/Modal";
import Label from "../form/Label";
import Input from "../form/Input";
import { YesButton, NoButton } from "../ui/ActionButtons";
import PlanSubjectsSelector from "./PlanSubjectsSelector";

export default function PlanCreateModal({
  isOpen,
  onClose,

  selectedPlan,
  onPlanChange,

  subjects,
  selectedSubjects,
  onSubjectChange,

  price,
  onPriceChange,

  startDate,
  onStartDateChange,

  endDate,
  onEndDateChange,

  errors,

  onConfirm,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-8">Crear Plan</h2>

      <Label>Plan</Label>

      <Input
        value={selectedPlan}
        onChange={(e) => onPlanChange(e.target.value)}
        error={errors.name}
      />

      <div className="mb-5">
        <PlanSubjectsSelector
          subjects={subjects}
          selectedSubjects={selectedSubjects}
          onSubjectChange={onSubjectChange}
          error={errors.subjects}
        />
      </div>

      <Label>Precio</Label>

      <Input
        type="number"
        value={price}
        onChange={(e) => onPriceChange(e.target.value)}
        error={errors.price}
      />

      <Label>Fecha de Inicio</Label>

      <Input
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        error={errors.start_date}
      />

      <Label>Fecha Fin (Opcional)</Label>

      <Input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        error={errors.end_date}
      />

      <div className="flex justify-end gap-4 mt-10">
        <NoButton title="Cancelar" onClick={onClose} />

        <YesButton title="Aceptar" onClick={onConfirm} />
      </div>
    </Modal>
  );
}
