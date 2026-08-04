// import { Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Tooltip,
// } from "chart.js";
// import { Bar } from "react-chartjs-2";

// ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

// export default function DonationTrendsChart({ values }) {
//   // Example values: [4500, 6500, 5200, 9000, 7600, 6000]
//   // You will provide real values.

//   const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

//   const data = {
//     labels,
//     datasets: [
//       {
//         data: values,
//         backgroundColor: [
//           "#EAF7F5", // Jan (very light mint)
//           "#EAF7F5", // Feb
//           "#1E6B5B", // Mar (dark green)
//           "#053D35", // Apr (very dark green - highlighted)
//           "#7FF5F1", // May (cyan)
//           "#EAF7F5", // Jun
//         ],
//         borderRadius: 12,
//         borderSkipped: false,
//         barThickness: 65,
//       },
//     ],
//   };

//   const options = {
//     responsive: true,
//     maintainAspectRatio: false,

//     plugins: {
//       legend: { display: false },
//       tooltip: {
//         backgroundColor: "#053D35",
//         titleColor: "#fff",
//         bodyColor: "#fff",
//         padding: 12,
//         cornerRadius: 10,
//         displayColors: false,
//         callbacks: {
//           label: (ctx) => `$${ctx.raw.toLocaleString()}`,
//         },
//       },
//     },

//     scales: {
//       x: {
//         grid: {
//           display: false,
//         },
//         ticks: {
//           color: "#7A8A8A",
//           font: {
//             size: 14,
//             weight: (ctx) => (ctx.tick.label === "Apr" ? "600" : "400"),
//           },
//         },
//         border: { display: false },
//       },

//       y: {
//         min: 0,
//         max: 10000,
//         ticks: {
//           stepSize: 2500,
//           color: "#B6C2C2",
//           font: {
//             size: 13,
//           },
//           callback: (value) => {
//             if (value === 0) return "0";
//             if (value === 2500) return "$2.5k";
//             if (value === 5000) return "$5k";
//             if (value === 7500) return "$7.5k";
//             if (value === 10000) return "$10k";
//             return value;
//           },
//         },
//         grid: {
//           color: "#EEF3F3",
//           drawBorder: false,
//         },
//         border: { display: false },
//       },
//     },
//   };

//   return (
//     <div style={{ width: "100%", height: "330px" }}>
//       <Bar data={data} options={options} />
//     </div>
//   );
// }

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from "chart.js";
import { Layout } from "lucide-react";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function DonationTrendsChart({ values, labels }) {
  const nums = values.map(Number);
  const maxVal = Math.max(...nums, 1);

  // Calculate a "nice" step size for the y-axis
  const niceStep = (() => {
    const targetIntervals = 5; // gives 6 ticks (0 … niceMax)
    const roughStep = maxVal / targetIntervals;
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const norm = roughStep / magnitude;
    if (norm <= 1.5) return 1 * magnitude;
    if (norm <= 3.5) return 2 * magnitude;
    if (norm <= 7.5) return 5 * magnitude;
    return 10 * magnitude;
  })();

  const niceMax = Math.ceil(maxVal / niceStep) * niceStep;

  const formatTick = (v: number) => {
    if (v === 0) return "0";
    if (v >= 1000) {
      const k = v / 1000;
      return `$${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
    }
    return `$${v}`;
  };

  const data = {
    labels,
    datasets: [
      {
        data: nums,
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
        barThickness: "flex",
        maxBarThickness: 50,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 50,
    layout: {
      padding: 0,
    },

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
        max: niceMax,
        ticks: {
          stepSize: niceStep,
          color: "#B6C2C2",
          font: { size: 14 },
          callback: (value) => formatTick(value),
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
    // <div className="w-full h-full">
    //   <Bar data={data} options={options} />
    // </div>
    <div className="w-full h-full min-w-0 overflow-hidden">
      <Bar data={data} options={options} />
    </div>
  );
}