import { Modal } from "../ui/Modal";
import { YesButton, NoButton } from "../ui/ActionButtons";

export default function TutorDeleteModal({ isOpen, onClose, onConfirm }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-8">Eliminar Tutor</h2>

      <p className="text-gray-600">
        ¿Está seguro de que desea eliminar este tutor?
      </p>

      <div className="flex justify-end gap-4 mt-10">
        <NoButton title="Cancelar" onClick={onClose} />

        <YesButton title="Aceptar" onClick={onConfirm} />
      </div>
    </Modal>
  );
}
