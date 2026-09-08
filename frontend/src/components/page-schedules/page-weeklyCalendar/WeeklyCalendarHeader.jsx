import Label from "../../form/Label";
import Select from "../../form/Select";
import { PlusButton } from "../../ui/ActionButtons";

const WeeklyCalendarHeader = ({
  teachers,
  students,
  selectedTeacher,
  selectedStudent,
  selectedClassroom,
  onTeacherChange,
  onStudentChange,
  onClassroomChange,
  onCreate,
  isAdmin,
}) => {
  return (
    <div className="flex justify-between mb-6">
      {/* Docente */}
      <div>
        <Label>Docente</Label>

        <Select
          value={selectedTeacher}
          onChange={onTeacherChange}
          className="w-72"
        >
          <option value="">Todos los docentes</option>

          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.last_name}, {teacher.first_name}
            </option>
          ))}
        </Select>
      </div>

      {/* Alumno */}
      <div>
        <Label>Alumno</Label>

        <Select
          value={selectedStudent}
          onChange={(e) => onStudentChange(e.target.value)}
          className="w-72"
        >
          <option value="">Todos los estudiantes</option>

          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.last_name}, {student.first_name}
            </option>
          ))}
        </Select>
      </div>

      {/* Aula */}
      <div>
        <Label>Aula</Label>

        <Select
          value={selectedClassroom}
          onChange={(e) => onClassroomChange(e.target.value)}
          className="w-72"
        >
          <option value="">Todas las aulas</option>

          <option value="A">🟦 Aula A</option>
          <option value="B">🟪 Aula B</option>
        </Select>
      </div>

      {/* Crear */}
      {isAdmin && (
        <div className="flex items-end">
          <PlusButton title="Crear Horario" onClick={onCreate} />
        </div>
      )}
    </div>
  );
};

export default WeeklyCalendarHeader;
