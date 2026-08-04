import { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Users, Calendar, Hourglass } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import SectionHeading from "./SectionHeading1";
import gsap from "gsap";
import { heroApi } from "@/services/api.service";
import type { HeroStats } from "@/types/api";

// Shared cache key — the hero section populates the same slot, so the impact
// section renders with real numbers instantly after a refresh.
const CACHE_KEY = "amana_hero_stats_cache_v1";
const STALE_MS = 5 * 60 * 1000;

const FALLBACK = {
  familiesSupported: 78,
  eventsThisYear: 24,
  pendingRequests: 17,
  raised: 125000,
  goal: 200000,
  percent: 62.5,
};

const readStatsCache = (): { data: HeroStats; cachedAt: number } | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.data?.counters || !parsed?.data?.progress) return null;
    return parsed;
  } catch {
    return null;
  }
};

const mapStats = (data: HeroStats) => ({
  familiesSupported: data.counters.familiesSupported,
  eventsThisYear: data.counters.eventsThisYear,
  pendingRequests: data.ticker?.aggregates?.urgentFamilies ?? 0,
  raised: data.progress.raised,
  goal: data.progress.goal,
  percent: data.progress.percent,
});

export default function ImpactSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const progressCardRef = useRef<HTMLDivElement>(null);
  useScrollReveal(sectionRef);

  const [stats, setStats] = useState(() => {
    const cached = readStatsCache();
    return cached ? mapStats(cached.data) : FALLBACK;
  });

  useEffect(() => {
    const cached = readStatsCache();
    if (cached && Date.now() - cached.cachedAt < STALE_MS) return;

    heroApi
      .getStats()
      .then((res) => {
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data: res.data, cachedAt: Date.now() })
          );
        } catch {
          /* ignore — private mode etc. */
        }
        setStats(mapStats(res.data));
      })
      .catch((err) => console.warn("Impact stats fetch failed:", err));
  }, []);

  useEffect(() => {
    if (!barRef.current || !progressCardRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        barRef.current,
        { width: "0%" },
        {
          width: `${stats.percent}%`,
          duration: 1.4,
          ease: "power3.out",
          scrollTrigger: { trigger: progressCardRef.current, start: "top 85%", once: true },
          invalidateOnRefresh: true,
        }
      );
    });
    return () => ctx.revert();
  }, [stats.percent]);

  const STATS = [
    {
      icon: Users,
      value: stats.familiesSupported,
      labelKey: "impact.stat1.label",
      fallback: "Families Supported",
      descKey: "impact.stat1.desc",
      descFallback: "Families received direct assistance",
    },
    {
      icon: Calendar,
      value: stats.eventsThisYear,
      labelKey: "impact.stat2.label",
      fallback: "Events Organized",
      descKey: "impact.stat2.desc",
      descFallback: "Charity events successfully completed",
    },
    {
      icon: Hourglass,
      value: stats.pendingRequests,
      labelKey: "impact.stat3.label",
      fallback: "Pending Requests",
      descKey: "impact.stat3.desc",
      descFallback: "Families waiting for assistance",
    },
  ];

  return (
    <section id="impact" ref={sectionRef} className="py-14 sm:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <SectionHeading
          align="center"
          title={t("impact.title", "Our Impact")}
          description={t(
            "impact.description",
            "Through the generosity of our donors and the dedication of our volunteers, we've made significant progress in our mission."
          )}
          className="mb-10 sm:mb-14"
        />

        <div ref={progressCardRef} data-reveal="up" className="rounded-2xl border border-border bg-card shadow-sm p-6 sm:p-8 mb-6 sm:mb-8">
          <h3 className="font-semibold text-base sm:text-lg mb-4">
            {t("impact.donation.title", "Donation Progress")}
          </h3>
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
            <span className="font-display text-[clamp(1.75rem,5vw,2.5rem)] font-bold text-primary leading-none">
              ${stats.raised.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">
              {t("impact.donation.goal", "Goal: ${{goal}}", { goal: stats.goal.toLocaleString() })}
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden mb-2">
            <div ref={barRef} className="h-full rounded-full bg-primary" style={{ width: "0%" }} />
          </div>
          <span className="text-xs sm:text-sm text-muted-foreground">
            {t("impact.donation.percent", "{{percent}}% Complete", { percent: stats.percent })}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {STATS.map(({ icon: Icon, value, labelKey, fallback, descKey, descFallback }, i) => (
            <div
              key={labelKey}
              data-reveal="up"
              data-reveal-delay={String(i * 0.1)}
              className="rounded-2xl border border-border bg-card shadow-sm p-6 text-center"
            >
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="font-display text-[clamp(1.5rem,3.5vw,2rem)] font-bold leading-none mb-1">
                {value.toLocaleString()}
              </div>
              <div className="font-semibold text-sm mb-1">{t(labelKey, fallback)}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{t(descKey, descFallback)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
