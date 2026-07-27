import { useEffect, useState } from "react";
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import Button from "../../components/ui/Button";
import Input from "../../components/form/Input";
import Label from "../../components/form/Label";
import MonthlyProfitChart from "../../components/charts/monthlyProfitChart/MonthlyProfitChart";
import Select from "../../components/form/Select";
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
  PreviousButton,
  NextButton,
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

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const [selectedYear, setSelectedYear] = useState(currentYear);

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

  // ======================================================
  // USEEFFECTS
  // ======================================================
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

  const goPreviousYear = () => {
    if (canGoPrevious) {
      setSelectedYear(years[currentIndex - 1]);
    }
  };

  const goNextYear = () => {
    if (canGoNext) {
      setSelectedYear(years[currentIndex + 1]);
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

  const annualIncome = finances
    .filter((f) => Number(f.year) === selectedYear)
    .reduce((acc, f) => acc + Number(f.total_income), 0);

  const annualProfit = finances
    .filter((f) => Number(f.year) === selectedYear)
    .reduce((acc, f) => acc + Number(f.net_profit), 0);

  const years = [...new Set(finances.map((f) => Number(f.year)))].sort(
    (a, b) => a - b,
  );

  const currentIndex = years.indexOf(selectedYear);

  const canGoPrevious = currentIndex > 0;

  const canGoNext =
    currentIndex < years.length - 1 && selectedYear < currentYear;

  // ======================================================
  // COLUMNAS DE TABLA
  // ======================================================
  const columns = [
    {
      header: "Meses",
      render: (row) => `${monthNames[row.month - 1]} ${row.year}`,
    },
    {
      header: "Ingresos brutos",
      render: (row) => `$${Number(row.total_income).toLocaleString("es-AR")}`,
    },
    {
      header: "Sueldos",
      render: (row) => `$${Number(row.total_salaries).toLocaleString("es-AR")}`,
    },
    {
      header: "Otros gastos",
      render: (row) => `$${Number(row.other_expenses).toLocaleString("es-AR")}`,
    },
    {
      header: "Ganancias",
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
      <div className="flex justify-center items-center gap-6 mb-6">
        <PreviousButton
          onClick={goPreviousYear}
          disabled={!canGoPrevious}
          title="Año anterior"
        />

        <h1 className="text-3xl font-bold">{selectedYear}</h1>

        <NextButton
          onClick={goNextYear}
          disabled={!canGoNext}
          title="Año siguiente"
        />
      </div>

      <ComponentCard title="Total de ingresos netos por mes">
        <MonthlyProfitChart finances={finances} year={selectedYear} />
      </ComponentCard>

      {/* ---------- Totales ---------- */}
      <div className="grid grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 gap-4 mb-6">
        <ComponentCard title="Total de cierres registrados en el año seleccionado">
          <p className="text-2xl font-bold">
            {finances.filter((f) => Number(f.year) === selectedYear).length}
          </p>
        </ComponentCard>

        <ComponentCard title="Total de ingresos netos en el año seleccionado">
          <p className="text-2xl font-bold">
            ${annualProfit.toLocaleString("es-AR")}
          </p>
        </ComponentCard>

        <ComponentCard title="Total histórico de ingresos brutos">
          <p className="text-2xl font-bold">
            ${totalIncome.toLocaleString("es-AR")}
          </p>
        </ComponentCard>

        <ComponentCard title="Total histórico de ingresos netos">
          <p className="text-2xl font-bold">
            ${totalProfit.toLocaleString("es-AR")}
          </p>
        </ComponentCard>
      </div>

      {/* ---------- Formulario nuevo cierre ---------- */}
      <ComponentCard title="Generar cierre mensual">
        <div className="flex flex-wrap items-end gap-6">
          {" "}
          <div>
            <label className="block text-sm mb-1">Mes</label>
            <Select
              noMargin
              className="border rounded px-2 py-1"
              value={newMonth}
              onChange={(e) => setNewMonth(Number(e.target.value))}
            >
              {monthNames.map((name, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label className="block text-sm mb-1">Año</Label>
            <Input
              noMargin
              type="number"
              className="border rounded px-2 py-1 w-24"
              value={newYear}
              onChange={(e) => setNewYear(Number(e.target.value))}
            />
          </div>
          <div>
            <Label noMargin className="block text-sm mb-1">
              Otros gastos
            </Label>
            <Input
              noMargin
              type="number"
              step="0.01"
              className="border rounded px-2 py-1 w-32"
              value={otherExpenses}
              onChange={(e) => setOtherExpenses(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="flex items-end h-full">
            <Button
              onClick={handleGenerate}
              disabled={submitting || alreadyClosed}
            >
              {submitting ? "Generando..." : "Generar cierre"}
            </Button>
          </div>
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
