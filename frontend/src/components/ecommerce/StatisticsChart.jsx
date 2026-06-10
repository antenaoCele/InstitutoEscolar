import Chart from "react-apexcharts";
import { useEffect, useState } from "react";
import ChartTab from "../common/ChartTab";

export default function StatisticsChart() {
  const [finances, setFinances] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/monthly_finances.js")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.data.sort(
          (a, b) => a.year - b.year || a.month - b.month,
        );
        setFinances(sorted);
      })
      .catch((err) => console.error(err));
  }, []);

  const getMonthShort = (month) => {
    const months = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    return months[month - 1];
  };

  const categories = finances.map(
    (item) => `${getMonthShort(item.month)} ${item.year}`,
  );

  const incomeData = finances.map((item) => item.total_income);
  const profitData = finances.map((item) => item.net_profit);

  const options = {
    legend: {
      show: true,
      position: "top",
    },
    colors: ["#465FFF", "#22C55E"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area",
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.4,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
      hover: { size: 5 },
    },
    grid: {
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories,
    },
    yaxis: {
      labels: {
        formatter: (val) => `$${val.toLocaleString()}`,
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `$${val.toLocaleString()}`,
      },
    },
  };

  const series = [
    {
      name: "Ingresos",
      data: incomeData,
    },
    {
      name: "Ganancia",
      data: profitData,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Estadísticas financieras
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Ingresos y ganancias por mes
          </p>
        </div>

        <div className="flex items-start w-full gap-3 sm:justify-end">
          <ChartTab />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={310} />
        </div>
      </div>
    </div>
  );
}
