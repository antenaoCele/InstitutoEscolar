import { Modal } from "../ui/Modal";

export default function PlanHistoryModal({
  isOpen,
  onClose,
  selectedPlan,
  history,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-6">
        Historial de Precios:
        {selectedPlan ? ` ${selectedPlan.name}` : ""}
      </h2>

      {history.length === 0 ? (
        <p className="text-gray-400 text-sm">
          Este plan no tiene historial de precios registrado.
        </p>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200">
                <th className="py-2 pr-2">Precio</th>
                <th className="py-2 pr-2">Fecha Inicio</th>
                <th className="py-2 pr-2">Fecha Fin</th>
              </tr>
            </thead>

            <tbody>
              {history.map((price) => (
                <tr key={price.id} className="border-b border-gray-100">
                  <td className="py-2 pr-2">{price.price}</td>

                  <td className="py-2 pr-2">
                    {price.start_date?.split("T")[0] || "-"}
                  </td>

                  <td className="py-2 pr-2">
                    {price.end_date?.split("T")[0] || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}
