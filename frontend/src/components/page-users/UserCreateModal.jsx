import { Modal } from "../ui/Modal";
import Label from "../form/Label";
import Input from "../form/Input";
import Select from "../form/Select";
import { YesButton, NoButton } from "../ui/ActionButtons";

export default function UserCreateModal({
  isOpen,
  onClose,

  username,
  onUsernameChange,

  password,
  onPasswordChange,

  firstName,
  onFirstNameChange,

  lastName,
  onLastNameChange,

  role,
  onRoleChange,

  errors,

  onConfirm,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-8">Crear Usuario</h2>

      <Label>Usuario</Label>

      <Input
        value={username}
        onChange={(e) => onUsernameChange(e.target.value)}
        error={errors.username}
      />

      <Label>Contraseña</Label>

      <Input
        type="password"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        error={errors.password}
      />

      <Label>Nombres</Label>

      <Input
        value={firstName}
        onChange={(e) => onFirstNameChange(e.target.value)}
        error={errors.first_name}
      />

      <Label>Apellidos</Label>

      <Input
        value={lastName}
        onChange={(e) => onLastNameChange(e.target.value)}
        error={errors.last_name}
      />

      <Label>Rol</Label>

      <Select
        value={role}
        onChange={(e) => onRoleChange(e.target.value)}
        error={errors.role}
      >
        <option value="">Seleccione un rol</option>
        <option value="ADMIN">Administrador</option>
        <option value="DOCENTE">Docente</option>
      </Select>

      <div className="flex justify-end gap-4 mt-10">
        <NoButton title="Cancelar" onClick={onClose} />

        <YesButton title="Aceptar" onClick={onConfirm} />
      </div>
    </Modal>
  );
}
