import { Modal } from "../../ui/Modal";
import { EditButton, DeleteButton } from "../../ui/ActionButtons";

const WeeklyCalendarInfoModal = ({
  isOpen,
  onClose,
  selectedScheduleInfo,
  selectedSchedule,
  isAdmin,
  onEdit,
  onDelete,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {selectedScheduleInfo && (
        <>
          <h2 className="text-xl font-bold mb-6">Información del horario</h2>

          {/* Docente */}
          <div className="space-y-3 mb-8">
            <h3 className="font-bold text-lg">Docente</h3>

            <div
              className="
                border
                rounded-lg
                p-4
                bg-gray-50
                dark:bg-black
                border
                border-gray-200
                dark:border-gray-700
              "
            >
              <div
                className="
                  font-semibold
                  text-gray-900
                  dark:text-white
                "
              >
                {selectedScheduleInfo.teacher}
              </div>

              <div
                className="
                  mt-2 text-sm
                  text-gray-600
                  dark:text-gray-300
                "
              >
                Aula: {selectedScheduleInfo.classroom}
              </div>
            </div>
          </div>

          {/* Planes */}
          <div className="space-y-3 mb-8">
            <h3 className="font-bold text-lg">Planes</h3>

            {selectedScheduleInfo.plans.length === 0 ? (
              <div
                className="
                  border
                  rounded-lg
                  p-4
                  bg-gray-50
                  dark:bg-black
                  border
                  border-gray-200
                  dark:border-gray-700
                  text-gray-500
                "
              >
                No hay planes asignados.
              </div>
            ) : (
              selectedScheduleInfo.plans.map((plan) => (
                <div
                  key={plan.id}
                  className="
                    border
                    rounded-lg
                    p-4
                    bg-gray-50
                    dark:bg-black
                    border
                    border-gray-200
                    dark:border-gray-700
                  "
                >
                  <div
                    className="
                      font-semibold
                      text-gray-900
                      dark:text-white
                    "
                  >
                    {plan.name}
                  </div>

                  <div className="mt-2 text-sm">Materias:</div>

                  <ul className="ml-5 list-disc text-sm">
                    {plan.subjects.map((subject) => (
                      <li key={subject}>{subject}</li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>

          {/* Estudiantes */}
          <div className="space-y-3 mb-8">
            <h3 className="font-bold text-lg">Estudiantes</h3>

            {selectedScheduleInfo.students.length === 0 ? (
              <div
                className="
                  border
                  rounded-lg
                  p-4
                  bg-gray-50
                  dark:bg-black
                  border
                  border-gray-200
                  dark:border-gray-700
                  text-gray-500
                "
              >
                No hay estudiantes asignados.
              </div>
            ) : (
              selectedScheduleInfo.students.map((student) => (
                <div
                  key={student.id}
                  className="
                    border
                    rounded-lg
                    p-4
                    bg-gray-50
                    dark:bg-black
                    border
                    border-gray-200
                    dark:border-gray-700
                  "
                >
                  <div className="font-semibold">{student.name}</div>

                  <div
                    className="
                      mt-2 text-sm
                      text-gray-600
                      dark:text-gray-300
                    "
                  >
                    Plan: {student.plan}
                  </div>

                  <div className="mt-2 text-sm">Materias:</div>

                  <ul className="ml-5 list-disc text-sm">
                    {student.subjects.map((subject) => (
                      <li key={subject}>{subject}</li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 mt-8">
            {isAdmin && (
              <>
                <EditButton
                  title="Editar Horario"
                  onClick={() => {
                    onEdit(selectedSchedule);
                  }}
                />

                <DeleteButton
                  title="Eliminar Horario"
                  onClick={() => {
                    onDelete(selectedSchedule);
                  }}
                />
              </>
            )}
          </div>
        </>
      )}
    </Modal>
  );
};

export default WeeklyCalendarInfoModal;
