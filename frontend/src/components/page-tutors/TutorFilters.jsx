import Input from "../form/Input";
import Select from "../form/Select";

export default function TutorFilters({
  searchFirstLastName,
  onSearchFirstLastNameChange,
  searchDNI,
  onSearchDNIChange,
  filterStudentId,
  onStudentChange,
  students,
}) {
  return (
    <div className="flex gap-3 mb-4 flex-wrap">
      <Input
        placeholder="Buscar por nombre o apellido"
        value={searchFirstLastName}
        onChange={(e) => onSearchFirstLastNameChange(e.target.value)}
        className="p-2 border border-gray-300 rounded w-60"
      />

      <Input
        placeholder="Buscar por DNI"
        value={searchDNI}
        onChange={(e) => onSearchDNIChange(e.target.value)}
        className="p-2 border border-gray-300 rounded w-60"
      />

      <Select
        value={filterStudentId}
        onChange={(e) => onStudentChange(e.target.value)}
        className="p-2 border border-gray-300 rounded w-60"
      >
        <option value="">Todos los alumnos</option>

        {students.map((student) => (
          <option key={student.id} value={student.id}>
            {student.last_name}, {student.first_name}
          </option>
        ))}
      </Select>
    </div>
  );
}
