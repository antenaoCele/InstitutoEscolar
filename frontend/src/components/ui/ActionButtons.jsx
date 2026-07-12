import Button from "./Button";

import {
  PencilIcon,
  TrashBinIcon,
  SaveIcon,
  MoreIcon,
  BackIcon,
  ViewIcon,
  YesIcon,
  NoIcon,
  PlusSignIcon,
  AssignTeacher,
} from "../../icons";

const baseClass =
  "cursor-pointer w-12 h-12 rounded flex items-center justify-center transition transform hover:scale-105";

const imgClass = "w-5 h-5 brightness-0 invert";

export function ViewButton({ onClick, title = "" }) {
  return (
    <Button title={title} size="sm" onClick={onClick} className={baseClass}>
      <img src={ViewIcon} alt="Ver" className="w-5 h-5 invert" />
    </Button>
  );
}

export function EditButton({ onClick, title = "" }) {
  return (
    <Button title={title} size="sm" onClick={onClick} className={baseClass}>
      <PencilIcon className="w-5 h-5" />
    </Button>
  );
}

export function DeleteButton({ onClick, title = "" }) {
  return (
    <Button
      title={title}
      size="sm"
      variant="outline"
      onClick={onClick}
      className={baseClass}
    >
      <TrashBinIcon className="w-5 h-5 text-black" />
    </Button>
  );
}

export function SaveButton({ onClick, title = "" }) {
  return (
    <Button title={title} size="sm" onClick={onClick} className={baseClass}>
      <img src={SaveIcon} alt="Guardar" className={imgClass} />
    </Button>
  );
}

export function AddButton({ onClick, title = "" }) {
  return (
    <Button title={title} size="sm" onClick={onClick} className={baseClass}>
      <img src={MoreIcon} alt="Añadir" className={imgClass} />
    </Button>
  );
}

export function PlusButton({ onClick, title = "" }) {
  return (
    <Button title={title} size="sm" onClick={onClick} className={baseClass}>
      <img src={PlusSignIcon} alt="Crear" className={imgClass} />
    </Button>
  );
}

export function BackButton({ onClick, title = "" }) {
  return (
    <Button
      title={title}
      size="sm"
      variant="outline"
      onClick={onClick}
      className={baseClass}
    >
      <img src={BackIcon} alt="Volver" className="w-6 h-6 brightness-0" />
    </Button>
  );
}

export function YesButton({ onClick, title = "" }) {
  return (
    <Button title={title} size="sm" onClick={onClick} className={baseClass}>
      <img src={YesIcon} alt="Sí" className={imgClass} />
    </Button>
  );
}

export function NoButton({ onClick, title = "" }) {
  return (
    <Button
      title={title}
      size="sm"
      variant="outline"
      onClick={onClick}
      className={baseClass}
    >
      <img src={NoIcon} alt="No" className="w-5 h-5 brightness-0" />
    </Button>
  );
}

export function AssignTeacherButton({ onClick, disabled = false, title = "" }) {
  return (
    <Button
      title={title}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${
        disabled ? "opacity-40 cursor-not-allowed hover:scale-100" : ""
      }`}
    >
      <img src={AssignTeacher} alt="Asignar Docentes" className={imgClass} />
    </Button>
  );
}
