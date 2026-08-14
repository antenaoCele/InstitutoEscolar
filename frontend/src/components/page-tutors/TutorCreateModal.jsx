import { Modal } from "../ui/Modal";
import Label from "../form/Label";
import Input from "../form/Input";
import Checkbox from "../form/Checkbox";
import { YesButton, NoButton } from "../ui/ActionButtons";
import { sortByPersonName } from "../../utils/sort";

export default function TutorCreateModal({
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

  students,
  selectedStudentIds,
  onStudentChange,

  errors,

  onConfirm,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-8">Crear Tutor</h2>

      <Label>Nombre</Label>

      <Input
        value={firstName}
        onChange={(e) => onFirstNameChange(e.target.value)}
        error={errors.firstName}
      />

      <Label>Apellido</Label>

      <Input
        value={lastName}
        onChange={(e) => onLastNameChange(e.target.value)}
        error={errors.lastName}
      />

      <Label>DNI</Label>

      <Input
        value={dni}
        onChange={(e) => onDniChange(e.target.value)}
        error={errors.dni}
      />

      <Label>Teléfono</Label>

      <Input
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value)}
        error={errors.phone}
      />

      <div className="mb-5">
        <Label>Estudiantes</Label>

        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-3 border border-gray-200 rounded">
          {[...students].sort(sortByPersonName).map((student) => (
            <Checkbox
              key={student.id}
              label={`${student.last_name}, ${student.first_name}`}
              checked={selectedStudentIds.includes(student.id)}
              onChange={(checked) => onStudentChange(student.id, checked)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-10">
        <NoButton title="Cancelar" onClick={onClose} />

        <YesButton title="Aceptar" onClick={onConfirm} />
      </div>
    </Modal>
  );
}
