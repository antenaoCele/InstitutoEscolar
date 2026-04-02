import Chart from "react-apexcharts";
import { useEffect, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";

export default function MonthlyTarget() {
  const [isOpen, setIsOpen] = useState(false);
  const [finance, setFinance] = useState(null);

  const TARGET = 200000;

  useEffect(() => {
    fetch("http://localhost:3000/monthly_finances.js")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.data.sort(
          (a, b) => b.year - a.year || b.month - a.month
        );

        setFinance(sorted[0]);
      })
      .catch((err) => console.error(err));
  }, []);

  if (!finance) return <p>Cargando...</p>;

  const progress = (finance.total_income / TARGET) * 100;

  const options = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: { size: "80%" },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: (val) => val.toFixed(1) + "%",
          },
        },
      },
    },
    fill: { type: "solid" },
    stroke: { lineCap: "round" },
    labels: ["Progreso"],
  };

  const series = [progress];

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const isPositive = finance.net_profit >= 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Progreso mensual
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Ingresos vs objetivo
            </p>
          </div>

          <div className="relative inline-block">
            <button onClick={toggleDropdown}>
              <MoreDotIcon className="size-6 text-gray-400" />
            </button>

            <Dropdown isOpen={isOpen} onClose={closeDropdown}>
              <DropdownItem onItemClick={closeDropdown}>
                Ver más
              </DropdownItem>
              <DropdownItem onItemClick={closeDropdown}>
                Eliminar
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        {/* Chart */}
        <div className="relative">
          <Chart options={options} series={series} type="radialBar" height={330} />

          <span
            className={`absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full px-3 py-1 text-xs font-medium ${
              isPositive
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {isPositive ? "+" : ""}
            {finance.net_profit.toLocaleString()}
          </span>
        </div>

        {/* Texto dinámico */}
        <p className="mx-auto mt-10 text-center text-sm text-gray-500">
          Ingresos: ${finance.total_income.toLocaleString()} — Ganancia: $
          {finance.net_profit.toLocaleString()}
        </p>
      </div>

      {/* Métricas */}
      <div className="flex items-center justify-center gap-5 px-6 py-4">
        <div>
          <p className="text-xs text-gray-500 text-center">Target</p>
          <p className="font-semibold text-center">
            ${TARGET.toLocaleString()}
          </p>
        </div>

        <div className="w-px h-6 bg-gray-300"></div>

        <div>
          <p className="text-xs text-gray-500 text-center">Ingresos</p>
          <p className="font-semibold text-center">
            ${finance.total_income.toLocaleString()}
          </p>
        </div>

        <div className="w-px h-6 bg-gray-300"></div>

        <div>
          <p className="text-xs text-gray-500 text-center">Ganancia</p>
          <p className="font-semibold text-center">
            ${finance.net_profit.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}