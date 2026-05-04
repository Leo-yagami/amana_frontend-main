import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function DonationTrendsChart({ values, labels }) {
  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          "#EAF7F5",
          "#EAF7F5",
          "#1E6B5B",
          "#053D35",
          "#7FF5F1",
          "#EAF7F5",
        ],
        borderRadius: 12,
        borderSkipped: false,
        barThickness: 65,
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
        displayColors: false,
        callbacks: {
          label: (ctx) => `$${Number(ctx.raw || 0).toLocaleString()}`,
        },
      },
    },

    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#7A8A8A",
          font: { size: 14, weight: "400" },
        },
        border: { display: false },
      },

      y: {
        min: 0,
        max: 15,
        ticks: {
          stepSize: 5,
          color: "#B6C2C2",
          font: { size: 16 },
          callback: (value) => {
            if (value === 0) return "0";
            if (value === 5) return "5";
            if (value === 10) return "10";
            if (value === 15) return "15";
            // if (value === 20) return "20";
            // if (value === 25000) return "$25k";
            // if (value === 30000) return "$30k";
            // if (value === 35000) return "$35k";
            // if (value === 40000) return "$40k";
            // if (value === 45000) return "$45k";
            // if (value === 50000) return "$50k";
            // if (value === 10000) return "$10k";
            return value;
          },
        },
        grid: {
          color: "#EEF3F3",
          drawBorder: false,
        },
        border: { display: false },
      },
    },
  };

  return (
    <div className="w-full h-full">
      <Bar data={data} options={options} />
    </div>
  );
}