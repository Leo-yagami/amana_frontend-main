import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface RegistrationStatusBadgeProps {
  status?: "incomplete" | "pending" | "verified";
  size?: "sm" | "default" | "lg";
}

export default function RegistrationStatusBadge({
  status = "incomplete",
  size = "default",
}: RegistrationStatusBadgeProps) {
  const { t } = useTranslation();

  const getStatusConfig = () => {
    switch (status) {
      case "verified":
        return {
          label: t("dashboard.registrationStatus.verified"),
          variant: "default" as const,
          className: "bg-green-500 hover:bg-green-600 text-white",
          icon: CheckCircle2,
        };
      case "pending":
        return {
          label: t("dashboard.registrationStatus.pending"),
          variant: "secondary" as const,
          className: "bg-yellow-500 hover:bg-yellow-600 text-white",
          icon: Clock,
        };
      case "incomplete":
      default:
        return {
          label: t("dashboard.registrationStatus.incomplete"),
          variant: "destructive" as const,
          className: "bg-red-500 hover:bg-red-600 text-white",
          icon: AlertCircle,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className={`${iconSize} mr-1`} />
      {config.label}
    </Badge>
  );
}
