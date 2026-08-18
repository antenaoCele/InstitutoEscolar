import { Modal } from "../ui/Modal";
import { YesButton, NoButton } from "../ui/ActionButtons";

export default function StudentDeleteModal({ isOpen, onClose, onConfirm }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-8">Eliminar Estudiante</h2>

      <p className="text-gray-600 dark:text-gray-300 mb-8">
        ¿Está seguro de que desea eliminar este estudiante?
      </p>

      <div className="flex justify-end gap-4 mt-10">
        <NoButton title="Cancelar" onClick={onClose} />

        <YesButton title="Aceptar" onClick={onConfirm} />
      </div>
    </Modal>
  );
}
