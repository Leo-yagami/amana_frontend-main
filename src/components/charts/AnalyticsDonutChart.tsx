// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
// import { Doughnut } from "react-chartjs-2";

// ChartJS.register(ArcElement, Tooltip, Legend);

// type DonutItem = {
//   label: string;
//   value: number;
//   color: string;
// };

// export default function AnalyticsDonutChart({ items }: { items: DonutItem[] }) {
//   const data = {
//     labels: items.map((i) => i.label),
//     datasets: [
//       {
//         data: items.map((i) => i.value),
//         backgroundColor: items.map((i) => i.color),
//         borderWidth: 0,
//         cutout: "72%",
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
//         displayColors: true,
//       },
//     },
//   };

//   return (
//     <div className="h-[240px] w-full flex items-center justify-center">
//       <div className="w-[180px] h-[180px]">
//         <Doughnut data={data} options={options} />
//       </div>
//     </div>
//   );
// }
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip);

type DonutItem = {
  label: string;
  value: number;
  color: string;
};

type Props = {
  items: DonutItem[];
  height?: number;
  size?: number;
};

export default function AnalyticsDonutChart({
  items,
  height = 260,
  size = 160,
}: Props) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

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
      },
    },
  };

  return (
    <div className="flex flex-col gap-4" style={{ height }}>
      {/* Donut */}
      <div className="flex items-center justify-center">
        <div style={{ width: size, height: size }}>
          <Doughnut data={data} options={options} />
        </div>
      </div>

      {/* Legend / Breakdown */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 px-2">
        {items.map((item) => {
          const total = items.reduce((sum, i) => sum + i.value, 0);
          const percent = total ? Math.round((item.value / total) * 100) : 0;

          return (
            <div
              key={item.label}
              className="flex items-center justify-between text-sm"
            >
              {/* Left: dot + label */}
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-foreground">{item.label}</span>
              </div>

              {/* Right: percentage */}
              <span className="text-muted-foreground font-medium">
                {percent}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}