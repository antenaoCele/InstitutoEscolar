import { useEffect, useState } from "react";
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import Button from "../../components/ui/Button";
import ComponentCard from "../../components/common/ComponentCard";
import { MonthlyFinanceService } from "../../services/monthlyFinances.service";
import {
  ViewButton,
  EditButton,
  DeleteButton,
  PlusButton,
  YesButton,
  NoButton,
  AddButton,
} from "../../components/ui/ActionButtons";

const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export default function MonthlyFinances() {
  // ======================================================
  // DATOS
  // ======================================================
  const [finances, setFinances] = useState([]);
  const [loading, setLoading] = useState(true);

  // ======================================================
  // FORMULARIO DE NUEVO CIERRE
  // ======================================================
  const now = new Date();
  const [newYear, setNewYear] = useState(now.getFullYear());
  const [newMonth, setNewMonth] = useState(now.getMonth() + 1);
  const [otherExpenses, setOtherExpenses] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // ======================================================
  // FETCH DATOS
  // ======================================================
  const fetchFinances = async () => {
    try {
      setLoading(true);
      const { data } = await MonthlyFinanceService.getAll();
      setFinances(data.data || []);
    } catch (error) {
      console.error(error);
      setFinances([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinances();
  }, []);

  // ======================================================
  // ¿YA EXISTE UN CIERRE PARA EL MES SELECCIONADO?
  // ======================================================
  const alreadyClosed = finances.some(
    (f) =>
      Number(f.year) === Number(newYear) &&
      Number(f.month) === Number(newMonth),
  );

  // ======================================================
  // GENERAR CIERRE
  // ======================================================
  const handleGenerate = async () => {
    setFormError("");

    if (!newYear || !newMonth) {
      setFormError("Año y mes son obligatorios");
      return;
    }

    if (alreadyClosed) {
      setFormError("Ese mes ya fue cerrado");
      return;
    }

    try {
      setSubmitting(true);
      await MonthlyFinanceService.create({
        year: newYear,
        month: newMonth,
        other_expenses: Number(otherExpenses) || 0,
      });
      setOtherExpenses("");
      await fetchFinances();
    } catch (error) {
      setFormError(
        error.response?.data?.message || "Error al generar el cierre mensual",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ======================================================
  // TOTALES
  // ======================================================
  const totalIncome = finances.reduce(
    (acc, f) => acc + Number(f.total_income),
    0,
  );
  const totalProfit = finances.reduce(
    (acc, f) => acc + Number(f.net_profit),
    0,
  );

  // ======================================================
  // COLUMNAS DE TABLA
  // ======================================================
  const columns = [
    {
      header: "Mes",
      render: (row) => `${monthNames[row.month - 1]} ${row.year}`,
    },
    {
      header: "Total ingresos",
      render: (row) => `$${Number(row.total_income).toLocaleString("es-AR")}`,
    },
    {
      header: "Total sueldos",
      render: (row) => `$${Number(row.total_salaries).toLocaleString("es-AR")}`,
    },
    {
      header: "Otros gastos",
      render: (row) => `$${Number(row.other_expenses).toLocaleString("es-AR")}`,
    },
    {
      header: "Ganancia neta",
      render: (row) => `$${Number(row.net_profit).toLocaleString("es-AR")}`,
    },
  ];

  const tableTitle = (
    <div className="flex justify-between items-center">
      <span>Cierres mensuales</span>
    </div>
  );

  // ======================================================
  // RETURN
  // ======================================================
  return (
    <>
      {/* ---------- Totales ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <ComponentCard title="Cierres registrados">
          <p className="text-2xl font-bold">{finances.length}</p>
        </ComponentCard>

        <ComponentCard title="Total ingresos históricos">
          <p className="text-2xl font-bold">
            ${totalIncome.toLocaleString("es-AR")}
          </p>
        </ComponentCard>

        <ComponentCard title="Ganancia neta histórica">
          <p className="text-2xl font-bold">
            ${totalProfit.toLocaleString("es-AR")}
          </p>
        </ComponentCard>
      </div>

      {/* ---------- Formulario nuevo cierre ---------- */}
      <ComponentCard title="Generar cierre mensual">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm mb-1">Mes</label>
            <select
              className="border rounded px-2 py-1"
              value={newMonth}
              onChange={(e) => setNewMonth(Number(e.target.value))}
            >
              {monthNames.map((name, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Año</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-24"
              value={newYear}
              onChange={(e) => setNewYear(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Otros gastos</label>
            <input
              type="number"
              step="0.01"
              className="border rounded px-2 py-1 w-32"
              value={otherExpenses}
              onChange={(e) => setOtherExpenses(e.target.value)}
              placeholder="0"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={submitting || alreadyClosed}
          >
            {submitting ? "Generando..." : "Generar cierre"}
          </Button>
        </div>

        {alreadyClosed && (
          <p className="text-sm text-amber-600 mt-2">
            {monthNames[newMonth - 1]} {newYear} ya tiene un cierre generado.
          </p>
        )}

        {formError && <p className="text-sm text-red-600 mt-2">{formError}</p>}
      </ComponentCard>

      {/* ---------- Tabla histórica ---------- */}
      <div className="mt-6">
        <BasicTable
          title={tableTitle}
          columns={columns}
          data={finances}
          loading={loading}
        />
      </div>
    </>
  );
}
