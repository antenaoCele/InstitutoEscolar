import { Modal } from "../../ui/Modal";
import { YesButton, NoButton } from "../../ui/ActionButtons";

export default function MonthlyCalendarDeleteModal({
  isOpen,
  onClose,
  event,
  onConfirm,
}) {
  if (!event) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-6">Eliminar Evento</h2>

      <p className="text-gray-600 dark:text-gray-300">
        ¿Está seguro que desea eliminar el evento{" "}
        <span className="font-semibold">"{event.name}"</span>?
      </p>

      <p className="text-sm text-gray-500 mt-2">
        Esta acción no se puede deshacer.
      </p>

      <div className="flex justify-end gap-4 mt-10">
        <NoButton title="Cancelar" onClick={onClose} />

        <YesButton title="Eliminar" onClick={onConfirm} />
      </div>
    </Modal>
  );
}
