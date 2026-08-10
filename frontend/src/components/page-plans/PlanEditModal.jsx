import { Modal } from "../ui/Modal";
import Label from "../form/Label";
import Input from "../form/Input";
import { YesButton, NoButton } from "../ui/ActionButtons";
import PlanSubjectsSelector from "./PlanSubjectsSelector";

export default function PlanEditModal({
  isOpen,
  onClose,

  selectedPlan,
  onPlanChange,

  subjects,
  selectedSubjects,
  onSubjectChange,

  price,
  onPriceChange,

  errors,

  onConfirm,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-8">Editar Plan</h2>

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

      <p className="text-sm italic text-gray-500 text-justify">
        Si modifica el precio, quedará vigente desde hoy. Podrá corregirlo todas
        las veces que sea necesario durante el día de hoy.
        <br />
        <br />
        <strong>
          A partir de mañana ya no podrá modificar el precio y las
          actualizaciones solo estarán habilitadas entre los días 1 y 5 de cada
          mes.
        </strong>
      </p>

      <div className="flex justify-end gap-4 mt-10">
        <NoButton title="Cancelar" onClick={onClose} />

        <YesButton title="Aceptar" onClick={onConfirm} />
      </div>
    </Modal>
  );
}
