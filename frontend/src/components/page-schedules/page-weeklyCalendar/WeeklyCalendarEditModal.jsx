import Label from "../../form/Label";
import Select from "../../form/Select";
import { Modal } from "../../ui/Modal";
import { PlusButton, YesButton, NoButton } from "../../ui/ActionButtons";

export default function WeeklyCalendarEditModal({
  isOpen,
  onClose,
  onUpdate,

  teachers,
  days,
  timeSlots,
  classrooms,

  teacherId,
  selectedPlan,
  selectedDay,
  selectedTime,
  classroom,

  selectedStudentId,
  selectedStudents,
  availableStudents,
  availablePlans,

  errors,

  onTeacherChange,
  onPlanChange,
  onDayChange,
  onTimeChange,
  onClassroomChange,
  onStudentChange,

  onAddStudent,
  onRemoveStudent,

  incompatibleStudents = [],
}) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar horario" size="lg">
      {/* Docente */}
      <div className="flex flex-col mb-4">
        <Label>Docente</Label>

        <Select value={teacherId} onChange={onTeacherChange}>
          <option value="">Seleccionar docente</option>

          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.last_name}, {teacher.first_name}
            </option>
          ))}
        </Select>

        {errors.teacher_id && (
          <p className="mt-1 text-sm text-red-500">{errors.teacher_id}</p>
        )}
      </div>

      {/* Día */}
      <div className="flex flex-col mb-4">
        <Label>Día</Label>

        <Select
          value={selectedDay}
          onChange={(e) => onDayChange(e.target.value)}
        >
          <option value="">Seleccionar día</option>

          {days.map((day) => (
            <option key={day.value} value={day.value}>
              {day.name}
            </option>
          ))}
        </Select>

        {errors.day && (
          <p className="mt-1 text-sm text-red-500">{errors.day}</p>
        )}
      </div>

      {/* Horario */}
      <div className="flex flex-col mb-4">
        <Label>Horario</Label>

        <Select
          value={selectedTime}
          onChange={(e) => onTimeChange(e.target.value)}
        >
          <option value="">Seleccionar horario</option>

          {timeSlots.map((slot) => (
            <option key={slot} value={slot.split(" - ")[0]}>
              {slot}
            </option>
          ))}
        </Select>

        {errors.start_time && (
          <p className="mt-1 text-sm text-red-500">{errors.start_time}</p>
        )}
      </div>

      {/* Aula */}
      <div className="flex flex-col mb-4">
        <Label>Aula</Label>

        <Select
          value={classroom}
          onChange={(e) => onClassroomChange(e.target.value)}
        >
          <option value="">Seleccionar aula</option>

          {classrooms.map((room) => (
            <option key={room.value} value={room.value}>
              {room.name}
            </option>
          ))}
        </Select>

        {errors.classroom && (
          <p className="mt-1 text-sm text-red-500">{errors.classroom}</p>
        )}
      </div>

      {/* Plan */}
      <div className="flex flex-col mb-4">
        <Label>Filtrar por plan (opcional)</Label>

        <Select
          disabled={!teacherId}
          value={selectedPlan}
          onChange={onPlanChange}
        >
          <option value="">
            {teacherId ? "Todos los planes" : "Seleccione primero un docente"}
          </option>

          {availablePlans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name}
            </option>
          ))}
        </Select>

        <p className="text-xs text-gray-500 mt-1">
          El plan queda registrado por estudiante. Podés cambiar el filtro y
          seguir agregando alumnos de otros planes.
        </p>
      </div>

      {/* Estudiante */}
      <div className="flex flex-col mb-2">
        <Label>Estudiante</Label>

        <div className="flex gap-2">
          <Select
            disabled={!teacherId}
            value={selectedStudentId}
            onChange={(e) => onStudentChange(e.target.value)}
            className="flex-1"
          >
            <option value="">
              {teacherId
                ? "Seleccionar estudiante"
                : "Seleccione primero un docente"}
            </option>

            {availableStudents
              .filter(
                (student) => !selectedStudents.some((s) => s.id === student.id),
              )
              .map((student) => (
                <option key={student.id} value={student.id}>
                  {student.last_name}, {student.first_name}
                </option>
              ))}
          </Select>

          <PlusButton
            title="Agregar estudiante"
            onClick={() => onAddStudent(true)}
          />
        </div>

        {errors.students && (
          <p className="mt-1 text-sm text-red-500">{errors.students}</p>
        )}
      </div>

      {/* Lista de estudiantes */}
      <div className="space-y-2 mt-4">
        {selectedStudents.map((student) => (
          <div key={student.id}>
            <div
              className="
                flex
                justify-between
                items-center
                border
                rounded
                px-3
                py-2
              "
            >
              <span>
                {student.last_name}, {student.first_name}
                <span className="ml-2 text-xs text-gray-500">
                  {student.plan_name}
                </span>
              </span>

              <button
                type="button"
                onClick={() => onRemoveStudent(student.id)}
                className="
                  cursor-pointer
                  text-red-500
                  font-bold
                "
              >
                ✕
              </button>
            </div>

            {incompatibleStudents.includes(student.id) && (
              <div className="mt-1 text-sm text-red-500">
                {student.last_name}, {student.first_name} no tiene ese plan con
                el docente seleccionado.
              </div>
            )}
          </div>
        ))}

        {errors.plans && (
          <div className="mt-4 text-sm text-red-500">{errors.plans}</div>
        )}

        {errors.studentConflict && (
          <div className="mt-4 text-sm text-red-500">
            {errors.studentConflict}
          </div>
        )}

        {errors.general && (
          <div className="mt-4 text-sm text-red-500">{errors.general}</div>
        )}
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-4 mt-10">
        <NoButton title="Cancelar" onClick={onClose} />

        <YesButton title="Aceptar" onClick={onUpdate} />
      </div>
    </Modal>
  );
}
