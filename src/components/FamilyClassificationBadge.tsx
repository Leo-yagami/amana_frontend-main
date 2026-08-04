import { Baby, Heart, Accessibility, Home, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const config: Record<string, { label: string; shortLabel: string; className: string; icon: any }> = {
  orphan: {
    label: "Orphan",
    shortLabel: "Orphan",
    className: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/70 dark:text-blue-300 dark:border-blue-700",
    icon: Baby,
  },
  disabled_disease: {
    label: "Disabled & Disease",
    shortLabel: "D&D",
    className: "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/70 dark:text-pink-300 dark:border-pink-700",
    icon: Heart,
  },
  old_age: {
    label: "Old Age",
    shortLabel: "Old Age",
    className: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/70 dark:text-purple-300 dark:border-purple-700",
    icon: Accessibility,
  },
  single_mother: {
    label: "Single Mother",
    shortLabel: "SM",
    className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/70 dark:text-amber-300 dark:border-amber-700",
    icon: Home,
  },
};

const ClassificationBadge = ({
  classification,
  t,
  short,
}: {
  classification: string;
  t: (key: string) => string;
  short?: boolean;
}) => {
  const c = config[classification] || config.orphan;
  const Icon = c.icon;
  return (
    <Badge variant="outline" className={`${c.className} text-xs`}>
      <Icon className="h-3 w-3 mr-1" />
      {short ? c.shortLabel : t("dashboard.classifications." + classification)}
    </Badge>
  );
};

const FamilyClassificationBadge = ({
  classification,
  t,
  short,
}: {
  classification?: string | string[];
  t: (key: string) => string;
  short?: boolean;
}) => {
  if (!classification || (Array.isArray(classification) && classification.length === 0)) {
    return (
      <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-xs">
        {t("dashboard.classifications.none")}
      </Badge>
    );
  }

  if (Array.isArray(classification)) {
    if (classification.length === 1) {
      return <ClassificationBadge classification={classification[0]} t={t} short={short} />;
    }
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 text-xs">
        <Layers className="h-3 w-3 mr-1" />
        {t("dashboard.classifications.mixed")}
      </Badge>
    );
  }

  return <ClassificationBadge classification={classification} t={t} short={short} />;
};

export { ClassificationBadge };
export default FamilyClassificationBadge;
