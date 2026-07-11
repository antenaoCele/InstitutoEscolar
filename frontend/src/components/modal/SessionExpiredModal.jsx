import { Modal } from "../ui/Modal";

export default function SessionExpiredModal({ isOpen, onConfirm }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      showCloseButton={false}
      closeOnOverlayClick={false}
    >
      <div className="text-center">
        <h2 className="text-xl font-bold mb-4">Sesión expirada</h2>

        <p className="mb-6">
          Tu sesión ha expirado por seguridad. Por favor, inicia sesión
          nuevamente.
        </p>

        <button
          onClick={onConfirm}
          className="px-5 py-2 rounded-lg bg-blue-600 text-white"
        >
          Aceptar
        </button>
      </div>
    </Modal>
  );
}
