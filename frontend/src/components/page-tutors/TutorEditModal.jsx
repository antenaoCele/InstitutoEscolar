import { Modal } from "../ui/Modal";
import Label from "../form/Label";
import Input from "../form/Input";
import Checkbox from "../form/Checkbox";
import { YesButton, NoButton } from "../ui/ActionButtons";

export default function TutorEditModal({
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
      <h2 className="text-xl font-bold mb-8">Editar Tutor</h2>

      <Label>Apellidos</Label>

      <Input
        value={lastName}
        onChange={(e) => onLastNameChange(e.target.value)}
        error={errors.lastName}
      />

      <Label>Nombres</Label>

      <Input
        value={firstName}
        onChange={(e) => onFirstNameChange(e.target.value)}
        error={errors.firstName}
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

      <Label>Estudiantes</Label>

      <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-3 space-y-2">
        {students.map((student) => (
          <Checkbox
            key={student.id}
            label={`${student.last_name}, ${student.first_name}`}
            checked={selectedStudentIds.includes(student.id)}
            onChange={(checked) => onStudentChange(student.id, checked)}
          />
        ))}
      </div>

      <div className="flex justify-end gap-4 mt-10">
        <NoButton title="Cancelar" onClick={onClose} />

        <YesButton title="Aceptar" onClick={onConfirm} />
      </div>
    </Modal>
  );
}
