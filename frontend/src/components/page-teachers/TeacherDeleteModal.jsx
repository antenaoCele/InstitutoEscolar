import { Modal } from "../ui/Modal";
import { YesButton, NoButton } from "../ui/ActionButtons";

export default function TeacherDeleteModal({
  isOpen,
  onClose,
  teacher,
  onConfirm,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-6">Desactivar Docente</h2>

      <p className="text-gray-600">
        ¿Está seguro de que desea desactivar al docente{" "}
        <span className="font-semibold">
          {teacher ? `${teacher.last_name}, ${teacher.first_name}` : ""}
        </span>
        ?
      </p>

      <p className="text-sm text-gray-500 mt-3">
        El docente no será eliminado permanentemente y podrá ser reactivado
        posteriormente.
      </p>

      <div className="flex justify-end gap-4 mt-10">
        <NoButton title="Cancelar" onClick={onClose} />

        <YesButton title="Desactivar" onClick={onConfirm} />
      </div>
    </Modal>
  );
}
