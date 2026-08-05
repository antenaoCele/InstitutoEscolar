import { Modal } from "../ui/Modal";
import Label from "../form/Label";
import Input from "../form/Input";
import { YesButton, NoButton } from "../ui/ActionButtons";

export default function SubjectCreateModal({
  isOpen,
  onClose,
  name,
  onNameChange,
  errors,
  onConfirm,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-8">Crear Materia</h2>

      <Label>Nombre</Label>

      <Input
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        error={errors.name}
      />

      <div className="flex justify-end gap-4 mt-10">
        <NoButton title="Cancelar" onClick={onClose} />

        <YesButton title="Aceptar" onClick={onConfirm} />
      </div>
    </Modal>
  );
}
