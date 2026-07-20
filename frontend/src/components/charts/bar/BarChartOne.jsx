import Chart from "react-apexcharts";

export default function BarChartOne({
  categories = [],
  data = [],
  title = "",
  color = "#0cc0df",
  height = 300,
}) {
  const options = {
    colors: [color],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      toolbar: {
        show: false,
      },
    },
    title: {
      text: title,
      align: "left",
      style: {
        fontSize: "16px",
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
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
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
