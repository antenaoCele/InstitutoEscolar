import Label from "../../form/Label";
import Select from "../../form/Select";
import { Modal } from "../../ui/Modal";
import { PlusButton, YesButton, NoButton } from "../../ui/ActionButtons";

const WeeklyCalendarCreateModal = ({
  isOpen,
  onClose,

  teachers,
  days,
  timeSlots,
  classrooms,
  availablePlans,
  availableStudents,
  selectedStudents,

  teacherId,
  selectedDay,
  selectedTime,
  classroom,
  selectedPlan,
  selectedStudentId,

  errors,

  onTeacherChange,
  onDayChange,
  onTimeChange,
  onClassroomChange,
  onPlanChange,
  onStudentChange,
  onAddStudent,
  onRemoveStudent,
  onCreate,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-8">Crear Horario</h2>

      {/* DOCENTE */}
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

        {errors?.teacher_id && (
          <p className="text-red-500 text-sm mt-1">{errors.teacher_id}</p>
        )}
      </div>

      {/* PLAN */}
      <div className="flex flex-col mb-4">
        <Label>Plan</Label>

        <Select
          disabled={!teacherId}
          value={selectedPlan}
          onChange={onPlanChange}
        >
          <option value="">Seleccionar plan</option>

          {availablePlans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name}
            </option>
          ))}
        </Select>

        {errors?.plan_id && (
          <p className="text-red-500 text-sm mt-1">{errors.plan_id}</p>
        )}
      </div>

      {/* DÍA */}
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

        {errors?.day && (
          <p className="text-red-500 text-sm mt-1">{errors.day}</p>
        )}
      </div>

      {/* HORARIO */}
      <div className="flex flex-col mb-4">
        <Label>Horario</Label>

        <Select
          value={selectedTime}
          onChange={(e) => onTimeChange(e.target.value)}
        >
          <option value="">Seleccionar horario</option>

          {timeSlots.map((slot) => {
            const startTime = slot.split(" - ")[0];

            return (
              <option key={slot} value={startTime}>
                {slot}
              </option>
            );
          })}
        </Select>

        {errors?.start_time && (
          <p className="text-red-500 text-sm mt-1">{errors.start_time}</p>
        )}
      </div>

      {/* AULA */}
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

        {errors?.classroom && (
          <p className="text-red-500 text-sm mt-1">{errors.classroom}</p>
        )}
      </div>

      {/* ESTUDIANTES */}
      <div className="flex flex-col mb-4">
        <Label>Estudiantes</Label>

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
                (student) =>
                  !selectedStudents.some(
                    (selected) => selected.id === student.id,
                  ),
              )
              .map((student) => (
                <option key={student.id} value={student.id}>
                  {student.last_name}, {student.first_name}
                </option>
              ))}
          </Select>

          <PlusButton title="Agregar estudiante" onClick={onAddStudent} />
        </div>

        {errors?.students && (
          <p className="text-red-500 text-sm mt-1">{errors.students}</p>
        )}

        {errors?.studentConflict && (
          <p className="text-red-500 text-sm mt-1">{errors.studentConflict}</p>
        )}

        {/* LISTA DE ESTUDIANTES AGREGADOS */}
        {selectedStudents.length > 0 && (
          <div className="mt-4 space-y-2">
            {selectedStudents.map((student) => (
              <div
                key={student.id}
                className="
                  flex
                  items-center
                  justify-between
                  p-2
                  rounded
                  border
                  bg-gray-50
                  dark:bg-gray-800
                "
              >
                <div className="text-sm">
                  <div className="font-medium">
                    {student.last_name}, {student.first_name}
                  </div>

                  {student.plan_name && (
                    <div className="text-xs text-gray-500">
                      {student.plan_name}
                    </div>
                  )}
                </div>

                <NoButton
                  title="Quitar estudiante"
                  onClick={() => onRemoveStudent(student.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ERROR GENERAL */}
      {errors?.general && (
        <p className="text-red-500 text-sm mb-4">{errors.general}</p>
      )}

      {/* BOTONES */}
      <div className="flex justify-end gap-2 mt-8">
        <NoButton title="Cancelar" onClick={onClose} />

        <YesButton title="Crear horario" onClick={onCreate} />
      </div>
    </Modal>
  );
};

export default WeeklyCalendarCreateModal;
