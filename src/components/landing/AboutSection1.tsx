import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import SectionHeading from "./SectionHeading1";

export default function AboutSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative overflow-hidden py-[clamp(5rem,10vw,9rem)]"
    >
      <div className="container mx-auto px-4 grid lg:grid-cols-[1fr_1.15fr] gap-16 lg:gap-24 items-center">
        {/* Image + accent + pull-quote */}
        <div className="relative" data-reveal="left">
          <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
            <img
              src="https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=900&auto=format&fit=crop&q=80"
              alt={t("about.imageAlt", "Volunteers distributing supplies in a rural community")}
              className="w-full h-full object-cover"
            />
          </div>
          <div
            aria-hidden
            className="absolute -bottom-6 -right-6 w-2/3 aspect-[3/2] bg-primary/15 rounded-2xl -z-10"
          />

          <div className="mt-6 lg:mt-0 lg:absolute lg:-bottom-10 lg:-right-10 lg:w-72 bg-card border border-border rounded-2xl p-5 shadow-lg">
            <p className="text-sm leading-relaxed text-foreground/90">
              {t(
                "about.quote",
                "“The well changed everything. My daughters walk to school now instead of to the river.”"
              )}
            </p>
            <p className="mt-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {t("about.quoteAuthor", "Fatou D. — Senegal, Water Programme")}
            </p>
          </div>
        </div>

        {/* Copy */}
        <div data-reveal="right">
          <SectionHeading
            kicker={t("about.kicker", "Our Mission")}
            title={t("about.tagline", "Hope, delivered where it's needed most.")}
            className="!max-w-none"
          />

          <p className="mt-6 text-lg leading-relaxed text-muted-foreground max-w-xl">
            {t(
              "about.paragraph",
              "HopeBridge exists to close the distance between generosity and need. We work directly with local partners — not layers of bureaucracy — so that what you give arrives as clean water, a classroom, a clinic visit, or a meal, not as overhead."
            )}
          </p>

          <div className="mt-10 grid grid-cols-2 gap-8 max-w-sm">
            <div data-reveal="up" data-reveal-delay="0.1">
              <div className="font-display text-4xl font-bold text-primary leading-none">
                180+
              </div>
              <div className="mt-2 text-sm text-muted-foreground leading-snug">
                {t("about.stat1", "Local partner organizations on the ground")}
              </div>
            </div>
            <div data-reveal="up" data-reveal-delay="0.2">
              <div className="font-display text-4xl font-bold text-primary leading-none">
                12
              </div>
              <div className="mt-2 text-sm text-muted-foreground leading-snug">
                {t("about.stat2", "Years building these local partnerships")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
