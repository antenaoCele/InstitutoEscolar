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

export function ViewButtonWeek({ onClick, title = "" }) {
  return (
    <Button
      title={title}
      size="sm"
      onClick={onClick}
      className="
        cursor-pointer
        w-10
        h-10
        rounded-lg

        flex
        items-center
        justify-center

        bg-cyan-500
        hover:bg-cyan-600

        transition-all
        duration-200
        hover:scale-105
      "
    >
      <img src={ViewIcon} alt="Ver" className="w-5 h-5 object-contain invert" />
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

export function EditButtonMonth({ onClick, title = "" }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="
        w-8
        h-8
        rounded
        bg-[#0cc0df]
        hover:bg-[#0aa3bf]
        flex
        items-center
        justify-center
        transition
        hover:scale-105
      "
    >
      <PencilIcon
        style={{
          width: 16,
          height: 16,
          color: "white",
        }}
      />
    </button>
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

export function DeleteButtonMonth({ onClick, title = "" }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="
        w-8
        h-8
        rounded
        border
        border-gray-300
        bg-white
        hover:bg-gray-100
        flex
        items-center
        justify-center
        transition
        hover:scale-105
      "
    >
      <TrashBinIcon
        style={{
          width: 16,
          height: 16,
          color: "#111827",
        }}
      />
    </button>
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
