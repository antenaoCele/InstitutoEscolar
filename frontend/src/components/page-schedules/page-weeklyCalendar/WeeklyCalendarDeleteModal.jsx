import { Modal } from "../../ui/Modal";
import { YesButton, NoButton } from "../../ui/ActionButtons";

const WeeklyCalendarDeleteModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">¿Eliminar Horario?</h2>

      <div className="flex justify-end gap-2">
        <NoButton title="Cancelar" onClick={onClose} />

        <YesButton title="Aceptar" onClick={onConfirm} />
      </div>
    </Modal>
  );
};

export default WeeklyCalendarDeleteModal;
