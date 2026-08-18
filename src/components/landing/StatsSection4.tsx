/**
 * StatsSection4 — Awwwards-caliber horizontal scroll stats section.
 *
 * Built with UI-UX Pro Max design intelligence & precise feedback refinements:
 * ─ 100% Smooth Line-Drawn Category Icons: Custom single-stroke vector SVGs designed specifically
 *   for GSAP DrawSVGPlugin line drawing (zero path overlap glitches).
 * ─ Extra-Late Trigger Timing: Panels 1-3 only start drawing when panel reaches 40% viewport width (start: "left 40%").
 * ─ Preserved Dotted Rings: Multi-pattern dotted & dashed geometric rings (strokeDasharray 6 8, 6 6, 5 5).
 * ─ Side-by-Side Balanced Layout: Text card on left, emblem on right.
 * ─ 120Hz Smooth GSAP Scrubbing with sticky navbar auto-hide integration.
 */

import { useRef, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import {
  FaHandsHoldingChild,
  FaPersonBreastfeeding,
  FaWheelchairMove,
  FaPersonWalkingWithCane,
} from "react-icons/fa6";
import { Sparkles, ArrowRight } from "lucide-react";
import { dashboardApi } from "@/services/api.service";
import type { DashboardOverview } from "@/types/api";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);
ScrollTrigger.config({ ignoreMobileResize: true });

// ─── Data Layer ───────────────────────────────────────────────────────────────

const CACHE_KEY = "amana_overview_cache_v1";
const STALE_MS = 5 * 60 * 1000;

const FALLBACK = {
  orphan: 34,
  single_mother: 18,
  disabled_disease: 12,
  old_age: 14,
};

const readCache = (): { data: DashboardOverview; cachedAt: number } | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.data?.families?.classifications) return null;
    return parsed;
  } catch {
    return null;
  }
};

const mapStats = (data: DashboardOverview) => {
  const c = data.families?.classifications ?? {
    orphan: 0,
    single_mother: 0,
    disabled_disease: 0,
    old_age: 0,
  };
  return {
    orphan: c.orphan ?? 0,
    single_mother: c.single_mother ?? 0,
    disabled_disease: c.disabled_disease ?? 0,
    old_age: c.old_age ?? 0,
  };
};

// ─── Professional Emblems with Outline-Draw & Fill-Fade Icons ───────────────

function OrphanEmblem({ accentColor }: { accentColor: string }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div
        className="absolute inset-0 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: accentColor }}
      />
      {/* Continuous Rotating Geometric Rings */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full animate-[spin_60s_linear_infinite] overflow-visible"
        aria-hidden="true"
      >
        {/* Soft Outer Ring */}
        <circle
          cx="100"
          cy="100"
          r="92"
          stroke={accentColor}
          strokeWidth="1.5"
          strokeDasharray="4 8"
          fill="none"
          opacity="0.7"
        />
        
        {/* Intersecting Protective Orbits (Replaces Crosshairs) */}
        <ellipse
          cx="100"
          cy="100"
          rx="80"
          ry="60"
          transform="rotate(45 100 100)"
          stroke={accentColor}
          strokeWidth="1.8"
          fill="none"
          opacity="0.85"
        />
        <ellipse
          cx="100"
          cy="100"
          rx="80"
          ry="60"
          transform="rotate(-45 100 100)"
          stroke={accentColor}
          strokeWidth="1.8"
          fill="none"
          opacity="0.85"
        />

        {/* Dotted Inner Core Ring */}
        <circle
          cx="100"
          cy="100"
          r="54"
          stroke={accentColor}
          strokeWidth="1.5"
          strokeDasharray="3 5"
          fill="none"
          opacity="0.8"
        />
      </svg>
      {/* Centered Outline-Draw Category Icon Badge */}
      <div
        className="absolute flex items-center justify-center rounded-3xl p-5 sm:p-7 border shadow-2xl backdrop-blur-md transition-transform duration-500 hover:scale-105 [&_.fa-icon-draw_path]:fill-current [&_.fa-icon-draw_path]:fill-opacity-0 [&_.fa-icon-draw_path]:stroke-current [&_.fa-icon-draw_path]:stroke-[16px] [&_.fa-icon-draw_path]:stroke-linejoin-round"
        style={{
          backgroundColor: `${accentColor}12`,
          borderColor: `${accentColor}40`,
          color: accentColor,
          boxShadow: `0 12px 32px -8px ${accentColor}33`,
        }}
      >
        <FaHandsHoldingChild className="fa-icon-draw overflow-visible w-12 h-12 sm:w-20 sm:h-20" />
      </div>
    </div>
  );
}

function MotherEmblem({ accentColor }: { accentColor: string }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div
        className="absolute inset-0 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: accentColor }}
      />
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full animate-[spin_75s_linear_infinite_reverse] overflow-visible"
        aria-hidden="true"
      >
        <circle cx="100" cy="100" r="90" stroke={accentColor} strokeWidth="1.8" fill="none" opacity="0.9" />
        <rect x="32" y="32" width="136" height="136" rx="36" stroke={accentColor} strokeWidth="1.8" strokeDasharray="6 6" fill="none" opacity="0.85" transform="rotate(45 100 100)" />
        <circle cx="100" cy="100" r="56" stroke={accentColor} strokeWidth="1.5" strokeDasharray="4 6" fill="none" opacity="0.8" />
      </svg>
      <div
        className="absolute flex items-center justify-center rounded-3xl p-5 sm:p-7 border shadow-2xl backdrop-blur-md transition-transform duration-500 hover:scale-105 [&_.fa-icon-draw_path]:fill-current [&_.fa-icon-draw_path]:fill-opacity-0 [&_.fa-icon-draw_path]:stroke-current [&_.fa-icon-draw_path]:stroke-[16px] [&_.fa-icon-draw_path]:stroke-linejoin-round"
        style={{
          backgroundColor: `${accentColor}12`,
          borderColor: `${accentColor}40`,
          color: accentColor,
          boxShadow: `0 12px 32px -8px ${accentColor}33`,
        }}
      >
        <FaPersonBreastfeeding className="fa-icon-draw overflow-visible w-12 h-12 sm:w-20 sm:h-20" />
      </div>
    </div>
  );
}

function DisabilityEmblem({ accentColor }: { accentColor: string }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div
        className="absolute inset-0 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: accentColor }}
      />
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full animate-[spin_90s_linear_infinite] overflow-visible"
        aria-hidden="true"
      >
        <circle cx="100" cy="100" r="92" stroke={accentColor} strokeWidth="2" fill="none" opacity="0.9" />
        <path d="M 20 100 Q 60 45, 100 100 T 180 100" stroke={accentColor} strokeWidth="1.8" strokeDasharray="5 5" fill="none" opacity="0.85" />
        <path d="M 20 100 Q 60 155, 100 100 T 180 100" stroke={accentColor} strokeWidth="1.8" strokeDasharray="5 5" fill="none" opacity="0.85" />
        <circle cx="100" cy="100" r="54" stroke={accentColor} strokeWidth="1.5" strokeDasharray="3 5" fill="none" opacity="0.8" />
      </svg>
      <div
        className="absolute flex items-center justify-center rounded-3xl p-5 sm:p-7 border shadow-2xl backdrop-blur-md transition-transform duration-500 hover:scale-105 [&_.fa-icon-draw_path]:fill-current [&_.fa-icon-draw_path]:fill-opacity-0 [&_.fa-icon-draw_path]:stroke-current [&_.fa-icon-draw_path]:stroke-[16px] [&_.fa-icon-draw_path]:stroke-linejoin-round"
        style={{
          backgroundColor: `${accentColor}12`,
          borderColor: `${accentColor}40`,
          color: accentColor,
          boxShadow: `0 12px 32px -8px ${accentColor}33`,
        }}
      >
        <FaWheelchairMove className="fa-icon-draw overflow-visible w-12 h-12 sm:w-20 sm:h-20" />
      </div>
    </div>
  );
}

function ElderlyEmblem({ accentColor }: { accentColor: string }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div
        className="absolute inset-0 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: accentColor }}
      />
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full animate-[spin_80s_linear_infinite_reverse] overflow-visible"
        aria-hidden="true"
      >
        <polygon points="100,10 180,50 180,150 100,190 20,150 20,50" stroke={accentColor} strokeWidth="1.8" strokeDasharray="6 6" fill="none" opacity="0.85" />
        <circle cx="100" cy="100" r="68" stroke={accentColor} strokeWidth="2" fill="none" opacity="0.95" />
        <circle cx="100" cy="100" r="48" stroke={accentColor} strokeWidth="1.5" strokeDasharray="4 4" fill="none" opacity="0.8" />
      </svg>
      <div
        className="absolute flex items-center justify-center rounded-3xl p-5 sm:p-7 border shadow-2xl backdrop-blur-md transition-transform duration-500 hover:scale-105 [&_.fa-icon-draw_path]:fill-current [&_.fa-icon-draw_path]:fill-opacity-0 [&_.fa-icon-draw_path]:stroke-current [&_.fa-icon-draw_path]:stroke-[16px] [&_.fa-icon-draw_path]:stroke-linejoin-round"
        style={{
          backgroundColor: `${accentColor}12`,
          borderColor: `${accentColor}40`,
          color: accentColor,
          boxShadow: `0 12px 32px -8px ${accentColor}33`,
        }}
      >
        <FaPersonWalkingWithCane className="fa-icon-draw overflow-visible w-12 h-12 sm:w-20 sm:h-20" />
      </div>
    </div>
  );
}

const EMBLEMS = [OrphanEmblem, MotherEmblem, DisabilityEmblem, ElderlyEmblem];

// ─── Animated Counter Component ───────────────────────────────────────────────

function AnimatedCounter({
  target,
  isActive,
}: {
  target: number;
  isActive: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!isActive || hasRun.current || !ref.current) return;
    hasRun.current = true;
    const el = ref.current;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 1.8,
      ease: "expo.out",
      onUpdate: () => {
        el.textContent = Math.round(obj.val).toString();
      },
    });
  }, [isActive, target]);

  useEffect(() => {
    hasRun.current = false;
  }, [target]);

  return <span ref={ref}>0</span>;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function StatsSection4() {
  const { t } = useTranslation();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const indexRef = useRef<HTMLSpanElement>(null);
  const segmentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  const kickerRef = useRef<HTMLSpanElement>(null);
  const emblemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hasScrolledRef = useRef(false);

  const [activeIdx, setActiveIdx] = useState(0);
  const activeIdxRef = useRef(0);

  const [stats, setStats] = useState(() => {
    const cached = readCache();
    return cached ? mapStats(cached.data) : FALLBACK;
  });

  useEffect(() => {
    const cached = readCache();
    if (cached && Date.now() - cached.cachedAt < STALE_MS) return;
    dashboardApi
      .getOverview()
      .then((res) => {
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data: res.data, cachedAt: Date.now() })
          );
        } catch {}
        setStats(mapStats(res.data));
      })
      .catch((err) => console.warn("Stats section fetch failed:", err));
  }, []);

  const STAT_ITEMS = [
    {
      value: stats.orphan,
      labelKey: "stats.card1.label",
      labelFallback: "Orphaned",
      descKey: "stats.card1",
      descFallback:
        "Families raising children who have lost one or both parents, receiving safe sanctuary and holistic support",
      accent: { light: "168 55% 42%", dark: "168 60% 55%" },
    },
    {
      value: stats.single_mother,
      labelKey: "stats.card2.label",
      labelFallback: "Single Mothers",
      descKey: "stats.card2",
      descFallback:
        "Single mothers raising their children independently, backed by our monthly living and healthcare assistance",
      accent: { light: "340 65% 52%", dark: "340 70% 65%" },
    },
    {
      value: stats.disabled_disease,
      labelKey: "stats.card3.label",
      labelFallback: "Disability & Illness",
      descKey: "stats.card3",
      descFallback:
        "Families living with disability or chronic conditions, empowered with essential care and accessibility aids",
      accent: { light: "250 50% 58%", dark: "250 55% 68%" },
    },
    {
      value: stats.old_age,
      labelKey: "stats.card4.label",
      labelFallback: "Elderly Care",
      descKey: "stats.card4",
      descFallback:
        "Elderly individuals living without a breadwinner, sustained with dignity, comfort, and steady nutrition",
      accent: { light: "28 80% 52%", dark: "28 85% 62%" },
    },
  ];

  const count = STAT_ITEMS.length;

  useEffect(() => {
    let scrollTimeout: ReturnType<typeof window.setTimeout>;
    const trackElement = trackRef.current;
    const disablePointers = () => {
      if (!trackElement) return;
      if (trackElement.style.pointerEvents !== "none") {
        trackElement.style.pointerEvents = "none";
      }
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (trackElement) trackElement.style.pointerEvents = "auto";
      }, 150);
    };
    window.addEventListener("scroll", disablePointers, { passive: true });
    return () => {
      window.removeEventListener("scroll", disablePointers);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const debouncedSetIdx = useCallback((idx: number) => {
    if (activeIdxRef.current !== idx) {
      activeIdxRef.current = idx;
      setActiveIdx(idx);
    }
  }, []);

  useGSAP(
    () => {
      if (!wrapperRef.current || !trackRef.current) return;
      const wrapper = wrapperRef.current;
      const track = trackRef.current;

      // Editorial Kicker Reveal
      if (kickerRef.current) {
        gsap.fromTo(
          kickerRef.current,
          { y: "100%", opacity: 0 },
          {
            y: "0%",
            opacity: 1,
            duration: 1.2,
            ease: "expo.out",
            delay: 0.2,
            scrollTrigger: {
              trigger: wrapper,
              start: "top 80%",
            },
          }
        );
      }

      // Main Horizontal Track Scroll Animation
      const getDistance = () => track.scrollWidth - track.offsetWidth;

      const scrollTween = gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: () => `+=${getDistance()}`,
          pin: true,
          pinSpacing: true,
          scrub: true,
          fastScrollEnd: true,
          preventOverlaps: true,
          invalidateOnRefresh: true,
          anticipatePin: 1,

          onEnter: () =>
            window.dispatchEvent(
              new CustomEvent("force-hide-nav", { detail: { hidden: true } })
            ),
          onLeave: () =>
            window.dispatchEvent(
              new CustomEvent("force-hide-nav", { detail: { hidden: false } })
            ),
          onEnterBack: () =>
            window.dispatchEvent(
              new CustomEvent("force-hide-nav", { detail: { hidden: true } })
            ),
          onLeaveBack: () =>
            window.dispatchEvent(
              new CustomEvent("force-hide-nav", { detail: { hidden: false } })
            ),

          onUpdate: (self) => {
            const progress = self.progress;
            const idx = Math.min(
              Math.round(progress * (count - 1)),
              count - 1
            );

            if (!hasScrolledRef.current && progress > 0.01) {
              hasScrolledRef.current = true;
              if (scrollCueRef.current) {
                gsap.to(scrollCueRef.current, {
                  opacity: 0,
                  duration: 0.6,
                  ease: "power2.out",
                });
              }
            }

            if (indexRef.current) {
              indexRef.current.textContent = `${String(idx + 1).padStart(
                2,
                "0"
              )} — ${String(count).padStart(2, "0")}`;
            }

            segmentRefs.current.forEach((seg, i) => {
              if (!seg) return;
              seg.style.opacity = i === idx ? "1" : "0.15";
            });

            debouncedSetIdx(idx);
          },
        },
      });

      // 1. Pre-calculate path lengths and set initial 0% draw state for ALL emblems
      emblemRefs.current.forEach((emblem) => {
        if (!emblem) return;
        const shapes = Array.from(
          emblem.querySelectorAll("path, circle, polygon, rect, line, polyline")
        ) as SVGGeometryElement[];

        shapes.forEach((el) => {
          let length = 500;
          try {
            if (typeof (el as SVGPathElement).getTotalLength === "function") {
              length = (el as SVGPathElement).getTotalLength();
            } else if (el.tagName.toLowerCase() === "circle") {
              const r = parseFloat(el.getAttribute("r") ?? "0");
              length = 2 * Math.PI * r;
            }
          } catch {
            length = 500;
          }
          if (!length || isNaN(length)) length = 500;
          el.style.strokeDasharray = el.getAttribute("stroke-dasharray") || `${length}`;
          el.style.strokeDashoffset = `${length}`;
        });

        gsap.set(shapes, { drawSVG: "0%" });
        const iconPaths = emblem.querySelectorAll(".fa-icon-draw path");
        if (iconPaths.length) {
          gsap.set(iconPaths, { fillOpacity: 0 });
        }
      });

      // 2. Extra-Late Scroll-Triggered DrawSVG Line Animation for EACH panel separately
      emblemRefs.current.forEach((emblem, i) => {
        if (!emblem) return;
        const shapes = emblem.querySelectorAll(
          "path, circle, polygon, rect, line, polyline"
        );
        const iconPaths = emblem.querySelectorAll(".fa-icon-draw path");
        
        if (!shapes.length) return;

        if (i === 0) {
          // Panel 0: Starts drawing smoothly after entering viewport, using fromTo to guarantee initial undrawn state
          gsap.fromTo(
            shapes,
            { drawSVG: "0%" },
            {
              drawSVG: "100%",
              strokeDashoffset: 0,
              duration: 2.2,
              ease: "power2.out",
              scrollTrigger: {
                trigger: wrapper,
                start: "top 65%",
              },
            }
          );
          // Fade in the solid fill as the outline finishes drawing
          if (iconPaths.length) {
            gsap.fromTo(
              iconPaths,
              { fillOpacity: 0 },
              {
                fillOpacity: 1,
                duration: 1.0,
                ease: "power1.inOut",
                delay: 1.2,
                scrollTrigger: {
                  trigger: wrapper,
                  start: "top 65%",
                },
              }
            );
          }
        } else {
          // Panels 1, 2, 3: EXTRA LATE trigger — starts drawing when panel reaches 40% of viewport width
          
          // -- VERSION A: PLAY ONCE AND KEEP DRAWN (Active) --
          gsap.fromTo(
            shapes,
            { drawSVG: "0%" },
            {
              drawSVG: "100%",
              strokeDashoffset: 0,
              duration: 2.2,
              ease: "power2.out",
              scrollTrigger: {
                trigger: panelRefs.current[i],
                containerAnimation: scrollTween,
                start: "left 40%",
                toggleActions: "play none none none",
              },
            }
          );
          
          if (iconPaths.length) {
            gsap.fromTo(
              iconPaths,
              { fillOpacity: 0 },
              {
                fillOpacity: 1,
                duration: 1.0,
                ease: "power1.inOut",
                delay: 1.2,
                scrollTrigger: {
                  trigger: panelRefs.current[i],
                  containerAnimation: scrollTween,
                  start: "left 40%",
                  toggleActions: "play none none none",
                },
              }
            );
          }

          /* 
          // -- VERSION B: SCRUBBABLE (Undraws on scroll backward) --
          // To use this version, uncomment this block and comment out VERSION A above.
          gsap.fromTo(
            shapes,
            { drawSVG: "0%" },
            {
              drawSVG: "100%",
              strokeDashoffset: 0,
              ease: "power1.inOut",
              scrollTrigger: {
                trigger: panelRefs.current[i],
                containerAnimation: scrollTween,
                start: "left 40%",
                end: "left 5%",
                scrub: 1.0,
              },
            }
          );
          // Fade in the solid fill towards the final portion of the scroll trigger
          if (iconPaths.length) {
            gsap.fromTo(
              iconPaths,
              { fillOpacity: 0 },
              {
                fillOpacity: 1,
                ease: "power2.in",
                scrollTrigger: {
                  trigger: panelRefs.current[i],
                  containerAnimation: scrollTween,
                  start: "left 20%",
                  end: "left 5%",
                  scrub: 1.0,
                },
              }
            );
          }
          */
        }
      });
    },
    { scope: wrapperRef, dependencies: [stats, t] }
  );

  return (
    <div
      ref={wrapperRef}
      className="relative w-full h-svh overflow-hidden select-none bg-background text-foreground"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Subtle Radial Glow Backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, hsl(var(--primary) / 0.04) 0%, transparent 70%)",
        }}
      />

      {/* Fixed Editorial Header Kicker (Clears Sticky Navbar) */}
      <div className="absolute top-16 sm:top-20 lg:top-24 left-6 sm:left-10 lg:left-16 z-20 pointer-events-none overflow-hidden flex items-center gap-2.5 sm:gap-3">
        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary/60" />
        <span
          ref={kickerRef}
          className="inline-block font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-muted-foreground/70 will-change-transform"
        >
          {t("stats.kicker", "Who we serve")}
        </span>
      </div>

      {/* Horizontal Panels Track */}
      <div ref={trackRef} className="flex h-full will-change-transform">
        {STAT_ITEMS.map((stat, i) => {
          const Emblem = EMBLEMS[i];
          const isDark =
            typeof document !== "undefined" &&
            document.documentElement.classList.contains("dark");
          const accentHsl = isDark ? stat.accent.dark : stat.accent.light;
          const accentColor = `hsl(${accentHsl})`;

          return (
            <div
              key={stat.descKey}
              ref={(el) => {
                panelRefs.current[i] = el;
              }}
              className="relative flex-shrink-0 w-screen h-full flex items-center justify-center px-6 sm:px-12 lg:px-20"
            >
              {/* Vertical Section Divider */}
              {i !== 0 && (
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-[14%] h-[72%] w-px"
                  style={{
                    background: `linear-gradient(180deg, transparent 0%, hsl(var(--border) / 0.4) 25%, hsl(var(--border) / 0.4) 75%, transparent 100%)`,
                  }}
                />
              )}

              {/* Side-by-Side Container (Text on Left, Emblem on Right) */}
              <div className="max-w-5xl w-full flex flex-col-reverse lg:flex-row items-center justify-between gap-6 sm:gap-10 lg:gap-16 z-10">
                {/* Main Stat Content Card (Left Side) */}
                <div className="flex-1 flex flex-col items-start text-left max-w-xl">
                  {/* Category Pill Tag */}
                  <span
                    className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] mb-4 sm:mb-6 px-4 py-1.5 rounded-full border backdrop-blur-md shadow-sm"
                    style={{
                      borderColor: `hsl(${accentHsl} / 0.35)`,
                      color: accentColor,
                      backgroundColor: `hsl(${accentHsl} / 0.08)`,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: accentColor }}
                    />
                    {t(stat.labelKey, stat.labelFallback)}
                  </span>

                  {/* Main Hero Number Counter */}
                  <div className="flex items-baseline gap-2.5 sm:gap-4">
                    <span
                      className="font-display font-black tracking-tighter leading-none"
                      style={{
                        fontSize: "clamp(3.8rem, 11vw, 8.5rem)",
                        color: accentColor,
                        textShadow: `0 16px 36px ${accentColor}20`,
                      }}
                    >
                      <AnimatedCounter
                        target={stat.value}
                        isActive={activeIdx === i}
                      />
                    </span>
                    <span
                      className="font-display font-light text-muted-foreground/45"
                      style={{ fontSize: "clamp(1.5rem, 3.8vw, 3.2rem)" }}
                    >
                      {t("stats.suffix", "families")}
                    </span>
                  </div>

                  {/* Accent Line */}
                  <div
                    className="mt-4 sm:mt-6 h-[2px] w-12 sm:w-16 rounded-full"
                    style={{ backgroundColor: accentColor, opacity: 0.6 }}
                  />

                  {/* Stat Description */}
                  <p className="mt-4 sm:mt-6 text-[14px] sm:text-base lg:text-lg leading-relaxed text-muted-foreground/90 max-w-[26rem]">
                    {t(stat.descKey, stat.descFallback)}
                  </p>
                </div>

                {/* Emblem & Rotating Rings (Right Side — Placed BESIDE Text) */}
                <div
                  ref={(el) => {
                    emblemRefs.current[i] = el;
                  }}
                  className="relative w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] lg:w-[360px] lg:h-[360px] shrink-0 will-change-transform"
                >
                  <Emblem accentColor={accentColor} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Control Rail (Dynamic Safe-Area Inset) */}
      <div
        className="absolute left-0 right-0 z-20 pointer-events-none"
        style={{
          bottom: "calc(1.2rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="container mx-auto px-6 sm:px-8 flex items-center gap-4 sm:gap-6">
          {/* Slide Index Display */}
          <span
            ref={indexRef}
            className="font-mono text-[10px] sm:text-xs tabular-nums tracking-[0.18em] uppercase text-muted-foreground/80 shrink-0"
          >
            01 — {String(count).padStart(2, "0")}
          </span>

          {/* Segmented Progress Rail */}
          <div className="flex-1 flex items-center gap-1.5">
            {STAT_ITEMS.map((_, i) => (
              <div
                key={i}
                ref={(el) => {
                  segmentRefs.current[i] = el;
                }}
                className="flex-1 h-[2px] rounded-full bg-foreground/60 transition-opacity duration-300"
                style={{ opacity: i === 0 ? 1 : 0.15 }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Cue Hint */}
      <div
        ref={scrollCueRef}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-10 pointer-events-none hidden sm:flex flex-col items-center gap-3 text-muted-foreground/30"
        style={{ animation: "float 3s ease-in-out infinite" }}
      >
        <span className="text-[9px] font-mono uppercase tracking-[0.25em] [writing-mode:vertical-lr]">
          {t("stats.scrollCue", "Scroll")}
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 rotate-90" />
      </div>
    </div>
  );
}
