import { Modal } from "../ui/Modal";
import Label from "../form/Label";
import Input from "../form/Input";
import Select from "../form/Select";
import { YesButton, NoButton } from "../ui/ActionButtons";

export default function TeacherCreateModal({
  isOpen,
  onClose,

  firstName,
  onFirstNameChange,

  lastName,
  onLastNameChange,

  dni,
  onDniChange,

  phone,
  onPhoneChange,

  userMode,
  onUserModeChange,

  userId,
  onUserIdChange,

  assignableUsers,

  errors,

  onConfirm,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-8">Crear Docente</h2>

      <Label>Nombre</Label>

      <Input
        value={firstName}
        onChange={(e) => onFirstNameChange(e.target.value)}
        error={errors.first_name}
      />

      <Label>Apellido</Label>

      <Input
        value={lastName}
        onChange={(e) => onLastNameChange(e.target.value)}
        error={errors.last_name}
      />

      <Label>DNI</Label>

      <Input
        type="number"
        value={dni}
        onChange={(e) => onDniChange(e.target.value)}
        error={errors.dni}
      />

      <Label>Teléfono</Label>

      <Input
        type="number"
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value)}
        error={errors.phone}
      />

      <Label>Usuario de acceso</Label>

      <Select
        value={userMode}
        onChange={(e) => onUserModeChange(e.target.value)}
        className="mb-1"
      >
        <option value="generate">Generar usuario nuevo</option>
        <option value="existing">Asignar usuario existente</option>
        <option value="none">No asignar usuario</option>
      </Select>

      {userMode === "generate" && (
        <p className="text-sm italic text-gray-500 mb-1">
          Se va a generar un usuario de acceso para este docente
        </p>
      )}

      {userMode === "none" && (
        <p className="text-sm italic text-gray-500 mb-1">
          No se va a asignar ningún usuario de acceso
        </p>
      )}

      {userMode === "existing" && (
        <>
          <Select
            value={userId}
            onChange={(e) => onUserIdChange(e.target.value)}
            error={errors.user_id}
            className="mb-1"
          >
            <option value="">Seleccionar usuario</option>

            {assignableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </Select>

          {errors.user_id && (
            <p className="text-xs text-red-500 mb-1">{errors.user_id}</p>
          )}
        </>
      )}

      <div className="flex justify-end gap-4 mt-10">
        <NoButton title="Cancelar" onClick={onClose} />

        <YesButton title="Aceptar" onClick={onConfirm} />
      </div>
    </Modal>
  );
}
