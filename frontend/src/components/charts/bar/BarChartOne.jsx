import Chart from "react-apexcharts";
import { useTheme } from "../../../context/ThemeContext";

export default function BarChartOne({
  categories = [],
  data = [],
  title = "",
  color = "#0cc0df",
  height = 300,
}) {
  const { theme } = useTheme();

  const isDark = theme === "dark";

  const textColor = isDark ? "#ffffff" : "#374151";
  const tooltipTheme = isDark ? "dark" : "light";

  const options = {
    colors: [color],

    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      toolbar: {
        show: false,
      },
      foreColor: textColor,
    },

    title: {
      text: title,
      align: "left",
      style: {
        fontSize: "16px",
        color: textColor,
      },
    },

    plotOptions: {
      bar: {
        borderRadius: 5,
        columnWidth: "45%",
      },
    },

    dataLabels: {
      enabled: false,
    },

    xaxis: {
      categories,

      labels: {
        style: {
          colors: textColor,
        },
      },

      axisBorder: {
        show: false,
      },

      axisTicks: {
        show: false,
      },
    },

    yaxis: {
      labels: {
        style: {
          colors: textColor,
        },
      },
    },

    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },

    tooltip: {
      theme: "none",
      cssClass: isDark ? "apex-tooltip-dark" : "apex-tooltip-light",
      y: {
        formatter: (value) => value,
      },
    },
  };

  const series = [
    {
      name: title,
      data,
    },
  ];

  return <Chart options={options} series={series} type="bar" height={height} />;
}
