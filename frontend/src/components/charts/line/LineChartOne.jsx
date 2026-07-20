import Chart from "react-apexcharts";

export default function LineChartOne({
  categories = [],
  series = [],
  height = 300,
}) {
  const options = {
    legend: {
      show: true,
      position: "top",
    },
    chart: {
      fontFamily: "Outfit, sans-serif",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories,
    },
    grid: {
      borderColor: "#E5E7EB",
    },
  };

  return (
    <Chart options={options} series={series} type="line" height={height} />
  );
}
