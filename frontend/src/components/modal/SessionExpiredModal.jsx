import { Modal } from "../ui/Modal";
import Button from "../ui/Button";

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
          Su sesión ha expirado por seguridad. Por favor, inicie sesión
          nuevamente.
        </p>

        <Button onClick={onConfirm}>Aceptar</Button>
      </div>
    </Modal>
  );
}
