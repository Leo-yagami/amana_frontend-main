/**
 * StatsSection2 — Awwwards-caliber horizontal scroll stats section.
 * Features abstract, continuous-line SVG illustrations optimized for GSAP line drawing.
 */

import { useRef, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
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

// ─── Refined Continuous-Line SVG Icons ───────────────────────────────────────

// const OrphanIcon = ({ svgRef }: { svgRef?: React.Ref<SVGSVGElement> }) => (
//   <svg
//     ref={svgRef}
//     viewBox="0 0 100 100"
//     fill="none"
//     className="w-full h-full"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//     aria-hidden="true"
//   >
//     {/* Protective overhead arch ending in an extending hand */}
//     <path
//       d="M 12 88 C 12 32 36 12 68 20 C 82 24 88 34 80 42 C 74 48 66 38 54 44"
//       stroke="currentColor"
//       strokeWidth="1.5"
//       vectorEffect="non-scaling-stroke"
//     />
//     {/* Child reaching up with continuous posture */}
//     <path
//       d="M 32 88 L 32 70 C 32 62 38 58 44 58 C 50 58 52 63 52 70 L 52 88 M 35 68 L 35 78 M 48 58 L 58 44"
//       stroke="currentColor"
//       strokeWidth="1.5"
//       vectorEffect="non-scaling-stroke"
//     />
//     {/* Child head */}
//     <circle
//       cx="42"
//       cy="48"
//       r="5"
//       stroke="currentColor"
//       strokeWidth="1.5"
//       fill="none"
//       vectorEffect="non-scaling-stroke"
//     />
//   </svg>
// );

// const MotherIcon = ({ svgRef }: { svgRef?: React.Ref<SVGSVGElement> }) => (
//   <svg
//     ref={svgRef}
//     viewBox="0 0 100 100"
//     fill="none"
//     className="w-full h-full"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//     aria-hidden="true"
//   >
//     {/* Mother silhouette contour */}
//     <path
//       d="M 32 88 C 32 72 42 58 52 50 C 54 42 48 32 52 22 C 58 16 68 18 72 26 C 74 34 68 40 62 46 C 58 56 54 70 54 88"
//       stroke="currentColor"
//       strokeWidth="1.5"
//       vectorEffect="non-scaling-stroke"
//     />
//     {/* Hairband detail */}
//     <path
//       d="M 54 20 C 60 23 64 28 66 34"
//       stroke="currentColor"
//       strokeWidth="1.5"
//       vectorEffect="non-scaling-stroke"
//     />
//     {/* Child carried closely on back */}
//     <path
//       d="M 36 66 C 28 62 24 52 28 42 C 32 34 42 36 46 43 C 50 50 46 60 38 66 M 32 56 C 38 56 44 60 42 68"
//       stroke="currentColor"
//       strokeWidth="1.5"
//       vectorEffect="non-scaling-stroke"
//     />
//     {/* Child head */}
//     <circle
//       cx="34"
//       cy="34"
//       r="5"
//       stroke="currentColor"
//       strokeWidth="1.5"
//       fill="none"
//       vectorEffect="non-scaling-stroke"
//     />
//   </svg>
// );

// const DisabilityIcon = ({ svgRef }: { svgRef?: React.Ref<SVGSVGElement> }) => (
//   <svg
//     ref={svgRef}
//     viewBox="0 0 100 100"
//     fill="none"
//     className="w-full h-full"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//     aria-hidden="true"
//   >
//     {/* Ground / path line */}
//     <path
//       d="M 14 86 L 86 86"
//       stroke="currentColor"
//       strokeWidth="1.5"
//       vectorEffect="non-scaling-stroke"
//     />
//     {/* Wheelchair frame & figure posture */}
//     <path
//       d="M 28 36 L 50 36 L 56 56 L 76 56 L 82 72"
//       stroke="currentColor"
//       strokeWidth="1.5"
//       vectorEffect="non-scaling-stroke"
//     />
//     {/* Figure head */}
//     <circle
//       cx="50"
//       cy="24"
//       r="5"
//       stroke="currentColor"
//       strokeWidth="1.5"
//       fill="none"
//       vectorEffect="non-scaling-stroke"
//     />
//     {/* Main Wheel */}
//     <circle
//       cx="48"
//       cy="68"
//       r="18"
//       stroke="currentColor"
//       strokeWidth="1.5"
//       fill="none"
//       vectorEffect="non-scaling-stroke"
//     />
//     {/* Heart motif inside wheel */}
//     <path
//       d="M 48 62 C 48 62 42 55 38 61 C 34 67 42 73 48 78 C 54 73 62 67 58 61 C 54 55 48 62 48 62 Z"
//       stroke="currentColor"
//       strokeWidth="1.5"
//       vectorEffect="non-scaling-stroke"
//     />
//     {/* Front caster wheel */}
//     <circle
//       cx="78"
//       cy="82"
//       r="4"
//       stroke="currentColor"
//       strokeWidth="1.5"
//       fill="none"
//       vectorEffect="non-scaling-stroke"
//     />
//     {/* Kinetic stroke accent */}
//     <path
//       d="M 68 28 C 76 26 84 32 82 42"
//       stroke="currentColor"
//       strokeWidth="1.5"
//       vectorEffect="non-scaling-stroke"
//     />
//   </svg>
// );

// const ElderlyIcon = ({ svgRef }: { svgRef?: React.Ref<SVGSVGElement> }) => (
//   <svg
//     ref={svgRef}
//     viewBox="0 0 100 100"
//     fill="none"
//     className="w-full h-full"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//     aria-hidden="true"
//   >
//     {/* Background warmth / sun vector */}
//     <circle
//       cx="72"
//       cy="28"
//       r="12"
//       stroke="currentColor"
//       strokeWidth="1"
//       strokeDasharray="3 3"
//       fill="none"
//       vectorEffect="non-scaling-stroke"
//     />
//     {/* Supporting figure arch */}
//     <path
//       d="M 22 88 C 22 55 32 35 48 24"
//       stroke="currentColor"
//       strokeWidth="1.5"
//       vectorEffect="non-scaling-stroke"
//     />
//     <circle
//       cx="46"
//       cy="18"
//       r="5.5"
//       stroke="currentColor"
//       strokeWidth="1.5"
//       fill="none"
//       vectorEffect="non-scaling-stroke"
//     />
//     {/* Elderly figure leaning forward */}
//     <path
//       d="M 40 88 C 40 66 48 52 60 52 C 68 52 70 60 66 72 L 62 88"
//       stroke="currentColor"
//       strokeWidth="1.5"
//       vectorEffect="non-scaling-stroke"
//     />
//     <circle
//       cx="62"
//       cy="42"
//       r="5"
//       stroke="currentColor"
//       strokeWidth="1.5"
//       fill="none"
//       vectorEffect="non-scaling-stroke"
//     />
//     {/* Walking cane */}
//     <path
//       d="M 78 62 L 78 88 M 74 62 C 74 58 78 56 82 58"
//       stroke="currentColor"
//       strokeWidth="1.5"
//       vectorEffect="non-scaling-stroke"
//     />
//   </svg>
// );

// const ICONS = [OrphanIcon, MotherIcon, DisabilityIcon, ElderlyIcon];

/**
 * IMPROVED FAMILY CATEGORY SVG ICONS
 * Undraw-inspired minimal hand-drawn aesthetic
 * Continuous line work optimized for GSAP DrawSVGPlugin
 * 
 * Paste these into StatsSection2.tsx to replace the existing icon components
 */

// ─── Refined Continuous-Line SVG Icons (Undraw-inspired) ───────────────────

/**
 * ORPHAN: Protective hands cradling a child — symbolizes community guardianship
 * Continuous line, minimal forms, emotional clarity
 */
const OrphanIcon = ({ svgRef }: { svgRef?: React.Ref<SVGSVGElement> }) => (
  <svg
    ref={svgRef}
    viewBox="0 0 100 100"
    fill="none"
    className="w-full h-full"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {/* Left protective hand curving over */}
    <path
      d="M 14 45 Q 14 25 35 20 Q 45 18 50 25 Q 48 35 45 42"
      stroke="currentColor"
      strokeWidth="1.8"
      vectorEffect="non-scaling-stroke"
    />
    {/* Right protective hand mirroring */}
    <path
      d="M 86 45 Q 86 25 65 20 Q 55 18 50 25 Q 52 35 55 42"
      stroke="currentColor"
      strokeWidth="1.8"
      vectorEffect="non-scaling-stroke"
    />
    {/* Child torso and arms reaching up */}
    <path
      d="M 42 40 L 42 60 Q 42 68 50 70 Q 58 68 58 60 L 58 40"
      stroke="currentColor"
      strokeWidth="1.8"
      vectorEffect="non-scaling-stroke"
    />
    {/* Left arm of child reaching up */}
    <path
      d="M 42 48 L 28 35"
      stroke="currentColor"
      strokeWidth="1.8"
      vectorEffect="non-scaling-stroke"
    />
    {/* Right arm of child reaching up */}
    <path
      d="M 58 48 L 72 35"
      stroke="currentColor"
      strokeWidth="1.8"
      vectorEffect="non-scaling-stroke"
    />
    {/* Child head */}
    <circle
      cx="50"
      cy="32"
      r="6"
      stroke="currentColor"
      strokeWidth="1.8"
      fill="none"
      vectorEffect="non-scaling-stroke"
    />
    {/* Base support line */}
    <path
      d="M 20 78 L 80 78"
      stroke="currentColor"
      strokeWidth="1.5"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

/**
 * SINGLE MOTHER: Woman with child held close, walking forward with determination
 * Continuous gesture line, sense of motion and grace
 */
const MotherIcon = ({ svgRef }: { svgRef?: React.Ref<SVGSVGElement> }) => (
  <svg
    ref={svgRef}
    viewBox="0 0 100 100"
    fill="none"
    className="w-full h-full"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {/* Mother's head */}
    <circle
      cx="52"
      cy="22"
      r="6.5"
      stroke="currentColor"
      strokeWidth="1.8"
      fill="none"
      vectorEffect="non-scaling-stroke"
    />
    {/* Mother's body — flowing line */}
    <path
      d="M 52 28 L 52 56 L 48 72"
      stroke="currentColor"
      strokeWidth="1.8"
      vectorEffect="non-scaling-stroke"
    />
    {/* Mother's left arm holding child */}
    <path
      d="M 52 36 Q 32 42 28 58"
      stroke="currentColor"
      strokeWidth="1.8"
      vectorEffect="non-scaling-stroke"
    />
    {/* Mother's right arm gesture — forward & open */}
    <path
      d="M 52 40 Q 68 44 74 60"
      stroke="currentColor"
      strokeWidth="1.8"
      vectorEffect="non-scaling-stroke"
    />
    {/* Child held on left hip — small figure */}
    <circle
      cx="32"
      cy="48"
      r="5.5"
      stroke="currentColor"
      strokeWidth="1.8"
      fill="none"
      vectorEffect="non-scaling-stroke"
    />
    {/* Child's arm resting on mother */}
    <path
      d="M 32 53 L 42 58"
      stroke="currentColor"
      strokeWidth="1.5"
      vectorEffect="non-scaling-stroke"
    />
    {/* Right leg stride */}
    <path
      d="M 52 56 L 56 72"
      stroke="currentColor"
      strokeWidth="1.8"
      vectorEffect="non-scaling-stroke"
    />
    {/* Ground line */}
    <path
      d="M 22 80 L 78 80"
      stroke="currentColor"
      strokeWidth="1.5"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

/**
 * DISABILITY: Person in wheelchair with forward motion, dignity, community support beam
 * Clean geometric form + human gesture
 */
const DisabilityIcon = ({ svgRef }: { svgRef?: React.Ref<SVGSVGElement> }) => (
  <svg
    ref={svgRef}
    viewBox="0 0 100 100"
    fill="none"
    className="w-full h-full"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {/* Ground line */}
    <path
      d="M 12 82 L 88 82"
      stroke="currentColor"
      strokeWidth="1.5"
      vectorEffect="non-scaling-stroke"
    />
    {/* Support beam (uplift/community) — subtle angle */}
    <path
      d="M 28 82 L 48 45"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeDasharray="3 3"
      vectorEffect="non-scaling-stroke"
      opacity="0.5"
    />
    {/* Person's head */}
    <circle
      cx="50"
      cy="28"
      r="6"
      stroke="currentColor"
      strokeWidth="1.8"
      fill="none"
      vectorEffect="non-scaling-stroke"
    />
    {/* Torso */}
    <path
      d="M 50 34 L 50 54"
      stroke="currentColor"
      strokeWidth="1.8"
      vectorEffect="non-scaling-stroke"
    />
    {/* Left arm resting */}
    <path
      d="M 50 42 L 35 50"
      stroke="currentColor"
      strokeWidth="1.8"
      vectorEffect="non-scaling-stroke"
    />
    {/* Right arm extended/dynamic */}
    <path
      d="M 50 42 L 68 45"
      stroke="currentColor"
      strokeWidth="1.8"
      vectorEffect="non-scaling-stroke"
    />
    {/* Wheelchair seat/frame */}
    <path
      d="M 38 54 L 62 54 L 64 68"
      stroke="currentColor"
      strokeWidth="1.8"
      vectorEffect="non-scaling-stroke"
    />
    {/* Wheelchair backrest */}
    <path
      d="M 38 54 L 35 72"
      stroke="currentColor"
      strokeWidth="1.8"
      vectorEffect="non-scaling-stroke"
    />
    {/* Main wheel — larger */}
    <circle
      cx="45"
      cy="72"
      r="14"
      stroke="currentColor"
      strokeWidth="1.8"
      fill="none"
      vectorEffect="non-scaling-stroke"
    />
    {/* Wheel spoke accent */}
    <path
      d="M 45 58 L 45 86"
      stroke="currentColor"
      strokeWidth="1.2"
      vectorEffect="non-scaling-stroke"
    />
    {/* Front caster wheel */}
    <circle
      cx="68"
      cy="78"
      r="4"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

/**
 * ELDERLY: Seated elder figure with walking cane, surrounded by gentle support
 * Emphasizes dignity, rest, and community care
 */
const ElderlyIcon = ({ svgRef }: { svgRef?: React.Ref<SVGSVGElement> }) => (
  <svg
    ref={svgRef}
    viewBox="0 0 100 100"
    fill="none"
    className="w-full h-full"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {/* Warm sun/time passage accent — top right */}
    <circle
      cx="75"
      cy="20"
      r="8"
      stroke="currentColor"
      strokeWidth="1.3"
      fill="none"
      vectorEffect="non-scaling-stroke"
      opacity="0.4"
    />
    {/* Support hand from community (left arc) */}
    <path
      d="M 18 65 Q 28 55 35 50"
      stroke="currentColor"
      strokeWidth="1.5"
      vectorEffect="non-scaling-stroke"
      opacity="0.6"
    />
    {/* Elder's head */}
    <circle
      cx="50"
      cy="32"
      r="6.5"
      stroke="currentColor"
      strokeWidth="1.8"
      fill="none"
      vectorEffect="non-scaling-stroke"
    />
    {/* Hair/aging detail (soft line) */}
    <path
      d="M 44 28 Q 50 24 56 28"
      stroke="currentColor"
      strokeWidth="1.2"
      vectorEffect="non-scaling-stroke"
      opacity="0.5"
    />
    {/* Seated torso (hunched posture with dignity) */}
    <path
      d="M 48 38 Q 45 50 48 68"
      stroke="currentColor"
      strokeWidth="1.8"
      vectorEffect="non-scaling-stroke"
    />
    {/* Left arm resting on chair/lap */}
    <path
      d="M 48 52 L 32 62"
      stroke="currentColor"
      strokeWidth="1.8"
      vectorEffect="non-scaling-stroke"
    />
    {/* Right arm on walking cane */}
    <path
      d="M 48 52 L 62 65"
      stroke="currentColor"
      strokeWidth="1.8"
      vectorEffect="non-scaling-stroke"
    />
    {/* Seat/chair base */}
    <path
      d="M 35 68 L 65 68"
      stroke="currentColor"
      strokeWidth="1.8"
      vectorEffect="non-scaling-stroke"
    />
    {/* Chair legs */}
    <path
      d="M 38 68 L 36 80 M 62 68 L 64 80"
      stroke="currentColor"
      strokeWidth="1.6"
      vectorEffect="non-scaling-stroke"
    />
    {/* Walking cane — strong, present */}
    <path
      d="M 62 65 L 72 80"
      stroke="currentColor"
      strokeWidth="2"
      vectorEffect="non-scaling-stroke"
    />
    {/* Cane handle hook */}
    <path
      d="M 72 80 Q 76 82 78 78"
      stroke="currentColor"
      strokeWidth="1.5"
      vectorEffect="non-scaling-stroke"
    />
    {/* Ground line */}
    <path
      d="M 18 85 L 82 85"
      stroke="currentColor"
      strokeWidth="1.5"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

const ICONS = [OrphanIcon, MotherIcon, DisabilityIcon, ElderlyIcon];

export { OrphanIcon, MotherIcon, DisabilityIcon, ElderlyIcon };

// ─── Animated Counter ────────────────────────────────────────────────────────

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

export default function StatsSection2() {
  const { t } = useTranslation();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const indexRef = useRef<HTMLSpanElement>(null);
  const segmentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  const kickerRef = useRef<HTMLSpanElement>(null);
  const svgRefs = useRef<(SVGSVGElement | null)[]>([]);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

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
        "Families raising children who have lost one or both parents",
      accent: { light: "168 55% 42%", dark: "168 60% 55%" },
    },
    {
      value: stats.single_mother,
      labelKey: "stats.card2.label",
      labelFallback: "Single Mothers",
      descKey: "stats.card2",
      descFallback:
        "Single mothers raising their children on their own, with our steady support",
      accent: { light: "340 65% 52%", dark: "340 70% 65%" },
    },
    {
      value: stats.disabled_disease,
      labelKey: "stats.card3.label",
      labelFallback: "Disability & Illness",
      descKey: "stats.card3",
      descFallback:
        "Families living with disability or long-term illness, never left behind",
      accent: { light: "250 50% 58%", dark: "250 55% 68%" },
    },
    {
      value: stats.old_age,
      labelKey: "stats.card4.label",
      labelFallback: "Elderly Care",
      descKey: "stats.card4",
      descFallback:
        "Elderly families without a steady income, cared for with dignity",
      accent: { light: "28 80% 52%", dark: "28 85% 62%" },
    },
  ];

  const count = STAT_ITEMS.length;

  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>;
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

      // SVG Line Drawing Animation via DrawSVGPlugin
      svgRefs.current.forEach((svg, i) => {
        if (!svg) return;
        const shapes = svg.querySelectorAll("path, circle");

        if (i === 0) {
          gsap.fromTo(
            shapes,
            { drawSVG: "0%" },
            {
              drawSVG: "100%",
              duration: 2.2,
              ease: "power3.out",
              delay: 0.3,
              scrollTrigger: {
                trigger: wrapper,
                start: "top 80%",
              },
            }
          );
        } else {
          gsap.fromTo(
            shapes,
            { drawSVG: "0%" },
            {
              drawSVG: "100%",
              ease: "power1.inOut",
              scrollTrigger: {
                trigger: panelRefs.current[i],
                containerAnimation: scrollTween,
                start: "left 85%",
                end: "center center",
                scrub: true,
              },
            }
          );
        }
      });
    },
    { scope: wrapperRef, dependencies: [stats, t] }
  );

  return (
    <div
      ref={wrapperRef}
      className="relative w-full h-svh overflow-hidden select-none"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, hsl(var(--primary) / 0.05) 0%, transparent 70%)",
        }}
      />

      <div className="absolute top-20 lg:top-24 left-6 sm:left-8 lg:left-12 z-20 pointer-events-none overflow-hidden">
        <span
          ref={kickerRef}
          className="inline-block font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-muted-foreground/50 will-change-transform"
        >
          {t("stats.kicker", "Who we serve")}
        </span>
      </div>

      <div ref={trackRef} className="flex h-full will-change-transform">
        {STAT_ITEMS.map((stat, i) => {
          const Icon = ICONS[i];
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
              className="relative flex-shrink-0 w-screen h-full flex items-center justify-center"
            >
              {i !== 0 && (
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-[12%] h-[76%] w-px"
                  style={{
                    background: `linear-gradient(180deg, transparent 0%, hsl(var(--border) / 0.6) 25%, hsl(var(--border) / 0.6) 75%, transparent 100%)`,
                  }}
                />
              )}

              {/* Background SVG Watermark */}
              <div
                aria-hidden="true"
                className="absolute pointer-events-none"
                style={{
                  width: "clamp(260px, 42vw, 520px)",
                  height: "clamp(260px, 42vw, 520px)",
                  opacity: 0.16,
                  right: "6%",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: accentColor,
                }}
              >
                <Icon
                  svgRef={(el: SVGSVGElement | null) => {
                    svgRefs.current[i] = el;
                  }}
                />
              </div>

              {/* Content Card */}
              <div className="relative z-10 flex flex-col items-start px-8 sm:px-12 lg:px-20 max-w-2xl w-full">
                <span
                  className="inline-block font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] mb-6 sm:mb-8 px-3.5 py-1.5 rounded-full border"
                  style={{
                    borderColor: `hsl(${accentHsl} / 0.35)`,
                    color: accentColor,
                    backgroundColor: `hsl(${accentHsl} / 0.08)`,
                  }}
                >
                  {t(stat.labelKey, stat.labelFallback)}
                </span>

                <div className="flex items-baseline gap-3 sm:gap-4">
                  <span
                    className="font-display font-black tracking-tighter leading-none"
                    style={{
                      fontSize: "clamp(5rem, 14vw, 12rem)",
                      color: accentColor,
                    }}
                  >
                    <AnimatedCounter
                      target={stat.value}
                      isActive={activeIdx === i}
                    />
                  </span>
                  <span
                    className="font-display font-light text-muted-foreground/30"
                    style={{ fontSize: "clamp(1.8rem, 4.5vw, 4rem)" }}
                  >
                    {t("stats.suffix", "families")}
                  </span>
                </div>

                <div
                  className="mt-6 sm:mt-8 h-[2px] w-12 sm:w-16 rounded-full"
                  style={{ backgroundColor: accentColor, opacity: 0.4 }}
                />

                <p className="mt-5 sm:mt-6 text-[15px] sm:text-lg leading-relaxed text-muted-foreground max-w-[26rem]">
                  {t(stat.descKey, stat.descFallback)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="absolute left-0 right-0 z-20 pointer-events-none"
        style={{
          bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="container mx-auto px-6 sm:px-8 flex items-center gap-4 sm:gap-6">
          <span
            ref={indexRef}
            className="font-mono text-[10px] sm:text-xs tabular-nums tracking-[0.15em] uppercase text-muted-foreground shrink-0"
          >
            01 — {String(count).padStart(2, "0")}
          </span>

          <div className="flex-1 flex items-center gap-1">
            {STAT_ITEMS.map((_, i) => (
              <div
                key={i}
                ref={(el) => {
                  segmentRefs.current[i] = el;
                }}
                className="flex-1 h-[2px] rounded-full bg-foreground/50 transition-opacity duration-300"
                style={{ opacity: i === 0 ? 1 : 0.15 }}
              />
            ))}
          </div>
        </div>
      </div>

      <div
        ref={scrollCueRef}
        className="absolute right-6 sm:right-10 top-1/2 -translate-y-1/2 z-10 pointer-events-none flex flex-col items-center gap-3 text-muted-foreground/25"
        style={{ animation: "float 3s ease-in-out infinite" }}
      >
        <span className="text-[9px] font-mono uppercase tracking-[0.25em] [writing-mode:vertical-lr]">
          {t("stats.scrollCue", "Scroll")}
        </span>
        <svg
          width="14"
          height="22"
          viewBox="0 0 14 22"
          fill="none"
          className="opacity-50"
          aria-hidden="true"
        >
          <rect
            x="3"
            y="0"
            width="8"
            height="14"
            rx="4"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line
            x1="7"
            y1="3.5"
            x2="7"
            y2="7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M3 16l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}