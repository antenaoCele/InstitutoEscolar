import { Modal } from "../ui/Modal";
import Label from "../form/Label";
import Input from "../form/Input";
import Select from "../form/Select";
import { YesButton, NoButton } from "../ui/ActionButtons";

import StudentPlansSelector from "./StudentPlansSelector";

export default function StudentEditModal({
  isOpen,
  onClose,

  firstName,
  onFirstNameChange,

  lastName,
  onLastNameChange,

  dni,
  onDniChange,

  school,
  onSchoolChange,

  birthDate,
  onBirthDateChange,

  level,
  onLevelChange,

  grade,
  onGradeChange,

  plans,
  formClasses,
  errors,

  onTogglePlan,
  onClassRowChange,

  onConfirm,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-8">Editar Estudiante</h2>

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
        value={dni}
        onChange={(e) => onDniChange(e.target.value)}
        error={errors.dni}
      />

      <Label>Colegio o universidad</Label>

      <Input
        value={school}
        onChange={(e) => onSchoolChange(e.target.value)}
        error={errors.school}
      />

      <Label>Fecha de nacimiento</Label>

      <Input
        type="date"
        value={birthDate}
        onChange={(e) => onBirthDateChange(e.target.value)}
        error={errors.birth_date}
      />

      <Label>Nivel</Label>

      <Select
        value={level}
        onChange={(e) => onLevelChange(e.target.value)}
        error={errors.level}
      >
        <option value="">Seleccione un nivel</option>
        <option value="Inicial">Inicial</option>
        <option value="Primario">Primario</option>
        <option value="Secundario">Secundario</option>
        <option value="Universitario">Universitario</option>
      </Select>

      <Label>Grado o año</Label>

      <Select
        value={grade}
        onChange={(e) => onGradeChange(e.target.value)}
        error={errors.grade}
      >
        <option value="">Seleccione un grado o año</option>

        {[1, 2, 3, 4, 5, 6, 7].map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </Select>

      <StudentPlansSelector
        plans={plans}
        formClasses={formClasses}
        onTogglePlan={onTogglePlan}
        onClassRowChange={onClassRowChange}
      />

      <div className="flex justify-end gap-4 mt-10">
        <NoButton title="Cancelar" onClick={onClose} />

        <YesButton title="Aceptar" onClick={onConfirm} />
      </div>
    </Modal>
  );
}
