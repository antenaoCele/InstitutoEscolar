import { NextButton, PreviousButton, PlusButton } from "../../ui/ActionButtons";

export default function MonthlyCalendarHeader({
  monthName,
  year,
  onPreviousMonth,
  onNextMonth,
  onCreate,
  canCreate,
}) {
  return (
    <>
      {/* Encabezado del calendario */}
      <div className="flex justify-center items-center gap-4 mb-6">
        <PreviousButton title="Mes anterior" onClick={onPreviousMonth} />

        <h2
          className="
            text-2xl
            font-bold
            capitalize
            text-gray-900
            dark:text-white
          "
        >
          {monthName} {year}
        </h2>

        <NextButton title="Mes siguiente" onClick={onNextMonth} />
      </div>

      {/* Crear evento */}
      {canCreate && (
        <div className="flex justify-end mb-6">
          <PlusButton title="Crear Evento" onClick={onCreate} />
        </div>
      )}
    </>
  );
}
