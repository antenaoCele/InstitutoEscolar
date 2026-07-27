import Chart from "react-apexcharts";

const monthNames = [
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

export default function MonthlyProfitChart({
  finances = [],
  year,
  height = 350,
}) {
  // ======================================================
  // DATOS DEL AÑO
  // ======================================================
  const chartData = Array.from({ length: 12 }, (_, index) => ({
    month: monthNames[index],
    value: null,
  }));

  finances
    .filter((f) => Number(f.year) === Number(year))
    .forEach((f) => {
      chartData[f.month - 1].value = Number(f.net_profit);
    });

  // Si es el año actual, ocultamos los meses futuros
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  if (Number(year) === currentYear) {
    for (let i = currentMonth + 1; i < 12; i++) {
      chartData[i].value = null;
    }
  }

  const categories = chartData.map((m) => m.month);

  const series = [
    {
      name: "Ingresos netos",
      data: chartData.map((m) => m.value),
    },
  ];

  // ======================================================
  // OPCIONES
  // ======================================================
  const options = {
    chart: {
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      fontFamily: "Outfit, sans-serif",
    },

    colors: ["#0cc0df"],

    stroke: {
      curve: "smooth",
      width: 4,
    },

    markers: {
      size: 6,
      colors: ["#8d5df4"],
      strokeColors: "#ffffff",
      strokeWidth: 3,
      hover: {
        size: 8,
      },
    },

    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0,
        opacityFrom: 0.35,
        opacityTo: 0.03,
        stops: [0, 100],
      },
    },

    dataLabels: {
      enabled: false,
    },

    legend: {
      show: false,
    },

    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 5,
    },

    xaxis: {
      categories,
      labels: {
        style: {
          fontSize: "13px",
        },
      },
    },

    yaxis: {
      labels: {
        formatter: (value) => "$" + Number(value).toLocaleString("es-AR"),
      },
    },

    tooltip: {
      theme: "light",
      y: {
        formatter: (value) => "$" + Number(value).toLocaleString("es-AR"),
      },
    },

    noData: {
      text: "No hay datos",
    },
  };

  return (
    <Chart options={options} series={series} type="area" height={height} />
  );
}
