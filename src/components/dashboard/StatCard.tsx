import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
}

const StatCard = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10",
}: StatCardProps) => {
  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", iconBgColor)}>
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
        {change && (
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
              trend === "up"
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {trend === "up" ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {change}
          </div>
        )}
      </div>
      <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{value}</h3>
      <p className="text-muted-foreground text-sm">{title}</p>
    </div>
  );
};

export default StatCard;
