import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

type DonutItem = {
  label: string;
  value: number;
  color: string;
};

export default function AnalyticsDonutChart({
  items,
}: {
  items: DonutItem[];
}) {
  const data = {
    labels: items.map((i) => i.label),
    datasets: [
      {
        data: items.map((i) => i.value),
        backgroundColor: items.map((i) => i.color),
        borderWidth: 0,
        cutout: "70%",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#053D35",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 12,
        cornerRadius: 10,
        displayColors: true,
      },
    },
  };

  return (
    <div className="h-[240px] w-full flex items-center justify-center">
      <div className="w-[180px] h-[180px]">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}