import Checkbox from "../form/Checkbox";
import Label from "../form/Label";
import { sortByProperty } from "../../utils/sort";

export default function PlanSubjectsSelector({
  subjects,
  selectedSubjects,
  onSubjectChange,
  error,
}) {
  return (
    <>
      <Label>Materias</Label>

      <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-3 border border-gray-200 rounded">
        {[...subjects].sort(sortByProperty("name")).map((subject) => (
          <Checkbox
            key={subject.id}
            label={subject.name}
            checked={selectedSubjects.includes(subject.id)}
            onChange={(checked) => onSubjectChange(subject.id, checked)}
          />
        ))}
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </>
  );
}
