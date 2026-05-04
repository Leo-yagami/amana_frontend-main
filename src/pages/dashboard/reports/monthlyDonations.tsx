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
  const data = {
    labels,
    datasets: [
      {
        // data: values,
        data: values.map((v) => Number(v)),
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
        // barThickness: 65,
        // backgroundColor: values.map((_, i) =>
        //   i === values.length - 1 ? "#053D35" : "#EAF7F5"
        // ),
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
        max: 20000,
        ticks: {
          stepSize: 5000,
          color: "#B6C2C2",
          font: { size: 14 },
          callback: (value) => {
            if (value === 0) return "0";
            if (value === 5000) return "$5k";
            if (value === 10000) return "$10k";
            if (value === 15000) return "$15k";
            if (value === 20000) return "$20k";
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
    // <div className="w-full h-full">
    //   <Bar data={data} options={options} />
    // </div>
    <div className="w-full h-full min-w-0 overflow-hidden">
      <Bar data={data} options={options} />
    </div>
  );
}