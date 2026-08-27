import { Modal } from "../ui/Modal";
import { YesButton } from "../ui/ActionButtons";

export default function TeacherNewUserModal({
  isOpen,
  onClose,
  credentials,
  copiedField,
  onCopy,
}) {
  if (!credentials) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-6">Usuario creado correctamente</h2>

      <p className="text-gray-600 mb-6">
        Se generó un nuevo usuario de acceso para el docente.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Usuario</label>

          <div className="flex gap-2">
            <input
              type="text"
              value={credentials.username}
              readOnly
              className="
                flex-1
                rounded-lg
                border-2
                border-gray-300
                px-3
                py-2
                bg-gray-100
                dark:bg-gray-900
              "
            />

            <button
              type="button"
              onClick={() => onCopy(credentials.username, "username")}
              className="
                px-3
                py-2
                rounded-lg
                border
                border-gray-300
                hover:bg-gray-100
                dark:hover:bg-gray-800
              "
            >
              {copiedField === "username" ? "Copiado" : "Copiar"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Contraseña</label>

          <div className="flex gap-2">
            <input
              type="text"
              value={credentials.password}
              readOnly
              className="
                flex-1
                rounded-lg
                border-2
                border-gray-300
                px-3
                py-2
                bg-gray-100
                dark:bg-gray-900
              "
            />

            <button
              type="button"
              onClick={() => onCopy(credentials.password, "password")}
              className="
                px-3
                py-2
                rounded-lg
                border
                border-gray-300
                hover:bg-gray-100
                dark:hover:bg-gray-800
              "
            >
              {copiedField === "password" ? "Copiado" : "Copiar"}
            </button>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-5">
        Guarde estas credenciales. La contraseña generada no podrá recuperarse
        posteriormente desde este formulario.
      </p>

      <div className="flex justify-end mt-8">
        <YesButton title="Cerrar" onClick={onClose} />
      </div>
    </Modal>
  );
}
