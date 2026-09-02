import { Modal } from "../../ui/Modal";
import Label from "../../form/Label";
import Input from "../../form/Input";
import { YesButton, NoButton } from "../../ui/ActionButtons";

export default function MonthlyCalendarEditModal({
  isOpen,
  onClose,

  eventName,
  onEventNameChange,

  eventDate,
  onEventDateChange,

  eventTime,
  onEventTimeChange,

  errors,

  onConfirm,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-8">Editar Evento</h2>

      {/* Evento */}
      <div className="flex flex-col mb-6">
        <Label>Evento</Label>

        <Input
          value={eventName}
          onChange={(e) => onEventNameChange(e.target.value)}
        />

        {errors?.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Fecha */}
      <div className="flex flex-col mb-6">
        <Label>Fecha</Label>

        <Input
          type="date"
          value={eventDate}
          onChange={(e) => onEventDateChange(e.target.value)}
        />

        {errors?.date && (
          <p className="mt-1 text-sm text-red-500">{errors.date}</p>
        )}
      </div>

      {/* Hora */}
      <div className="flex flex-col mb-6">
        <Label>Hora</Label>

        <Input
          type="time"
          value={eventTime}
          onChange={(e) => onEventTimeChange(e.target.value)}
        />

        {errors?.hour && (
          <p className="mt-1 text-sm text-red-500">{errors.hour}</p>
        )}
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-4 mt-10">
        <NoButton title="Cancelar" onClick={onClose} />

        <YesButton title="Aceptar" onClick={onConfirm} />
      </div>
    </Modal>
  );
}
