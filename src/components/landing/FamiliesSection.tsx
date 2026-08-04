import { useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import SectionHeading from "./SectionHeading1";

interface Family {
  id: string;
  name: string;
  urgency: "high" | "medium";
  location: string;
  size: string;
  descKey: string;
  descFallback: string;
  tags: string[];
}

const FAMILIES: Family[] = [
  {
    id: "tadesse",
    name: "Tadesse Family",
    urgency: "high",
    location: "Addis Ababa",
    size: "5 members",
    descKey: "family.tadesse.desc",
    descFallback: "The Tadesse family lost their home in a recent fire. They have three young children and are currently staying with relatives in very crowded conditions.",
    tags: ["Medical Support", "Food", "Education"],
  },
  {
    id: "kebede",
    name: "Kebede Family",
    urgency: "medium",
    location: "Bahir Dar",
    size: "4 members",
    descKey: "family.kebede.desc",
    descFallback: "Single mother with three children struggling after losing her job. The eldest child has healthcare needs that require regular attention.",
    tags: ["Housing", "Job Opportunity"],
  },
  {
    id: "ahmed",
    name: "Ahmed Family",
    urgency: "high",
    location: "Dire Dawa",
    size: "7 members",
    descKey: "family.ahmed.desc",
    descFallback: "Large family with elderly grandparents and young children. The main income earner recently suffered a workplace accident and cannot work.",
    tags: ["Food", "Clothing", "Medical Support"],
  },
];

// Reads --warning directly off the CSS variable, no tailwind.config color
// extension required — safe regardless of how "warning" is (or isn't) wired up.
const URGENCY_STYLES: Record<Family["urgency"], string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-[hsl(var(--warning)/0.12)] text-[hsl(var(--warning))]",
};

const URGENCY_LABEL: Record<Family["urgency"], string> = {
  high: "High Urgency",
  medium: "Medium Urgency",
};

export default function FamiliesSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef);

  return (
    <section ref={sectionRef} className="py-14 sm:py-20 lg:py-24 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6">
        <SectionHeading
          align="center"
          title={t("families.title", "Families In Need")}
          description={t(
            "families.description",
            "These families are currently waiting for support. Your contributions can make a significant difference in their lives."
          )}
          className="mb-10 sm:mb-14"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {FAMILIES.map((family, i) => (
            <div
              key={family.id}
              data-reveal="up"
              data-reveal-delay={String(i * 0.1)}
              className="rounded-2xl border border-border bg-card shadow-sm p-6 flex flex-col"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-display text-lg font-bold">{family.name}</h3>
                <span className={`shrink-0 px-2.5 py-1 rounded-full text-[0.65rem] font-semibold uppercase tracking-wide ${URGENCY_STYLES[family.urgency]}`}>
                  {t(`family.urgency.${family.urgency}`, URGENCY_LABEL[family.urgency])}
                </span>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                {t(family.descKey, family.descFallback)}
              </p>

              <div className="space-y-1.5 mb-4 text-sm">
                <div className="flex items-center gap-2 text-foreground/80">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span>{family.location}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground/80">
                  <Users className="w-4 h-4 text-primary shrink-0" />
                  <span>{family.size}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                {family.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {tag}
                  </span>
                ))}
              </div>

              <Link to="/payment" className="mt-auto">
                <Button className="w-full h-11 rounded-xl text-sm">
                  {t("families.cta", "Support This Family")}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}