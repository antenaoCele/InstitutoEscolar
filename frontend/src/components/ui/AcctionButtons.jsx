import Button from "./Button";
import { PencilIcon, TrashBinIcon, CreateIcon, ViewIcon } from "../../icons";

export function CreateButton({ onClick }) {
  return (
    <Button onClick={onClick} startIcon={<CreateIcon className="w-5 h-5" />}>
      Crear
    </Button>
  );
}

export function SaveButton({ onClick }) {
  return <Button onClick={onClick}>Guardar</Button>;
}

export function EditButton({ onClick }) {
  return (
    <Button size="sm" title="Editar" onClick={onClick}>
      <PencilIcon className="w-5 h-5" />
    </Button>
  );
}

export function DeleteButton({ onClick }) {
  return (
    <Button
      size="sm"
      onClick={onClick}
      className="!bg-red-500 hover:!bg-red-600 !text-white"
    >
      <TrashBinIcon className="w-5 h-5 text-white" />
    </Button>
  );
}

export function ViewButton({ onClick }) {
  return (
    <Button size="sm" title="Ver" onClick={onClick}>
      <img src={ViewIcon} alt="" className="w-5 h-5 invert" />
    </Button>
  );
}
