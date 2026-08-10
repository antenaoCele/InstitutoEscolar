import { Modal } from "../ui/Modal";
import Label from "../form/Label";
import Checkbox from "../form/Checkbox";
import { YesButton, NoButton } from "../ui/ActionButtons";
import { sortByPersonName } from "../../utils/sort";

export default function PlanTeachersModal({
  isOpen,
  onClose,

  plan,

  teachers,
  selectedTeacherIds,

  onTeacherChange,
  onConfirm,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-8">Asignar docentes</h2>

      <Label>{plan?.name}</Label>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {[...teachers].sort(sortByPersonName).map((teacher) => (
          <label key={teacher.id} className="flex items-center gap-3">
            <Checkbox
              checked={selectedTeacherIds.includes(teacher.id)}
              onChange={(checked) => onTeacherChange(teacher.id, checked)}
            />
            {teacher.last_name}, {teacher.first_name}
          </label>
        ))}
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <NoButton title="Cancelar" onClick={onClose} />

        <YesButton title="Aceptar" onClick={onConfirm} />
      </div>
    </Modal>
  );
}
