import {
  Heart,
  GraduationCap,
  Stethoscope,
  Home,
  Utensils,
  Droplets,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

const ImpactSection = () => {
  const { t } = useTranslation();

  const impactAreas = useMemo(
    () => [
      {
        icon: Heart,
        valueKey: "impactSection.livesValue",
        labelKey: "impactSection.livesLabel",
        descKey: "impactSection.livesDesc",
        color: "text-destructive",
        bgColor: "bg-destructive/10",
      },
      {
        icon: GraduationCap,
        valueKey: "impactSection.studentsValue",
        labelKey: "impactSection.studentsLabel",
        descKey: "impactSection.studentsDesc",
        color: "text-info",
        bgColor: "bg-info/10",
      },
      {
        icon: Stethoscope,
        valueKey: "impactSection.medicalValue",
        labelKey: "impactSection.medicalLabel",
        descKey: "impactSection.medicalDesc",
        color: "text-success",
        bgColor: "bg-success/10",
      },
      {
        icon: Home,
        valueKey: "impactSection.homesValue",
        labelKey: "impactSection.homesLabel",
        descKey: "impactSection.homesDesc",
        color: "text-warning",
        bgColor: "bg-warning/10",
      },
      {
        icon: Utensils,
        valueKey: "impactSection.mealsValue",
        labelKey: "impactSection.mealsLabel",
        descKey: "impactSection.mealsDesc",
        color: "text-accent",
        bgColor: "bg-accent/10",
      },
      {
        icon: Droplets,
        valueKey: "impactSection.wellsValue",
        labelKey: "impactSection.wellsLabel",
        descKey: "impactSection.wellsDesc",
        color: "text-primary",
        bgColor: "bg-primary/10",
      },
    ],
    []
  );

  const trustBadges = useMemo(
    () => [
      { key: "impactSection.badgeGuideStar" },
      { key: "impactSection.badgeCharityNav" },
      { key: "impactSection.badgeBBB" },
      { key: "impactSection.badgeGlobalGiving" },
    ],
    []
  );

  return (
    <section id="impact" className="py-12 sm:py-16 md:py-20 lg:py-32 bg-secondary will-change-transform">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16">
          <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
            {t("impactSection.badge")}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            {t("impactSection.title")}
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground px-2">
            {t("impactSection.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {impactAreas.map((area, index) => (
            <div
              key={area.labelKey}
              className="group bg-card p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-border animate-fade-up opacity-0"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`w-12 sm:w-14 h-12 sm:h-14 rounded-lg sm:rounded-xl ${area.bgColor} flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <area.icon className={`w-6 sm:w-7 h-6 sm:h-7 ${area.color}`} />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{t(area.valueKey)}</div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">{t(area.labelKey)}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">{t(area.descKey)}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 sm:mt-12 md:mt-16 pt-10 sm:pt-12 md:pt-16 border-t border-border">
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-muted-foreground text-sm sm:text-base font-medium">{t("impactSection.recognized")}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-16 opacity-60">
            {trustBadges.map((badge) => (
              <div
                key={badge.key}
                className="text-xs sm:text-sm lg:text-lg font-bold text-muted-foreground text-center"
              >
                {t(badge.key)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
