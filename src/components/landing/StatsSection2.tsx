// /**
//  * StatsSection2 — Awwwards-caliber horizontal scroll stats section.
//  *
//  * Design philosophy:
//  * ─ Each "panel" fills the viewport as a full-bleed card with a large
//  *   hero-scale number, a category label, a description, and a subtle
//  *   SVG icon that visually anchors the stat's meaning.
//  * ─ Panels are separated by thin luminous dividers that fade in/out
//  *   as you scroll.
//  * ─ A fixed "control rail" at the bottom displays a segmented progress
//  *   bar, the current index, and a gentle drag-hint on first visit.
//  * ─ The bottom padding dynamically accounts for the mobile gesture bar
//  *   (env(safe-area-inset-bottom)) so there is no gap when scrolling
//  *   downward, and no overlap when scrolling upward.
//  *
//  * Performance:
//  * ─ scrub: true for 1:1 Lenis mapping (no double-interpolation).
//  * ─ All scroll-time mutations are direct DOM writes via refs (zero
//  *   React re-renders during scroll).
//  * ─ pointer-events disabled on the track during active scroll.
//  * ─ Navbar is force-hidden while the section is pinned.
//  * ─ ignoreMobileResize prevents 120Hz address-bar jitter.
//  * ─ will-change-transform only on the moving track element.
//  */

// import { useRef, useState, useEffect, useCallback, useLayoutEffect } from "react";
// import { useTranslation } from "react-i18next";
// import { useGSAP } from "@gsap/react";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
// import { dashboardApi } from "@/services/api.service";
// import type { DashboardOverview } from "@/types/api";

// gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);
// ScrollTrigger.config({ ignoreMobileResize: true });

// // ─── Data Layer ───────────────────────────────────────────────────────────────

// const CACHE_KEY = "amana_overview_cache_v1";
// const STALE_MS = 5 * 60 * 1000;

// const FALLBACK = {
//   orphan: 34,
//   single_mother: 18,
//   disabled_disease: 12,
//   old_age: 14,
// };

// const readCache = (): { data: DashboardOverview; cachedAt: number } | null => {
//   try {
//     const raw = localStorage.getItem(CACHE_KEY);
//     if (!raw) return null;
//     const parsed = JSON.parse(raw);
//     if (!parsed?.data?.families?.classifications) return null;
//     return parsed;
//   } catch {
//     return null;
//   }
// };

// const mapStats = (data: DashboardOverview) => {
//   const c = data.families?.classifications ?? {
//     orphan: 0,
//     single_mother: 0,
//     disabled_disease: 0,
//     old_age: 0,
//   };
//   return {
//     orphan: c.orphan ?? 0,
//     single_mother: c.single_mother ?? 0,
//     disabled_disease: c.disabled_disease ?? 0,
//     old_age: c.old_age ?? 0,
//   };
// };

// // ─── SVG Icons (Abstract, Continuous Line Style) ──────────────────────────────
// // Inspired by minimal, hand-drawn vector continuous line art.
// // All paths use a single continuous stroke or minimal connected strokes.

// const OrphanIcon = ({ svgRef }: { svgRef?: React.Ref<SVGSVGElement> }) => (
//   <svg ref={svgRef} viewBox="0 0 100 100" fill="none" className="w-full h-full" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
//     <path
//       d="M20,80 C20,50 35,30 50,30 C65,30 80,50 80,80 C80,95 50,90 50,70 C50,50 30,50 30,70"
//       stroke="currentColor"
//       strokeWidth="1.5"
//       vectorEffect="non-scaling-stroke"
//     />
//     <circle cx="50" cy="20" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
//     <circle cx="30" cy="45" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
//   </svg>
// );

// const MotherIcon = ({ svgRef }: { svgRef?: React.Ref<SVGSVGElement> }) => (
//   <svg ref={svgRef} viewBox="0 0 100 100" fill="none" className="w-full h-full" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
//     <path
//       d="M15,85 C15,60 30,40 45,40 C55,40 65,55 60,70 C55,85 35,80 35,65 C35,55 45,50 55,50 C70,50 85,65 85,85"
//       stroke="currentColor"
//       strokeWidth="1.5"
//       vectorEffect="non-scaling-stroke"
//     />
//     <circle cx="45" cy="25" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
//     <circle cx="65" cy="40" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
//   </svg>
// );

// const DisabilityIcon = ({ svgRef }: { svgRef?: React.Ref<SVGSVGElement> }) => (
//   <svg ref={svgRef} viewBox="0 0 100 100" fill="none" className="w-full h-full" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
//     <path
//       d="M50,15 C50,45 20,45 20,75 C20,90 40,90 50,75 C60,60 40,60 50,45 C60,30 80,45 80,75 C80,90 60,90 50,75"
//       stroke="currentColor"
//       strokeWidth="1.5"
//       vectorEffect="non-scaling-stroke"
//     />
//     <circle cx="50" cy="75" r="15" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
//   </svg>
// );

// const ElderlyIcon = ({ svgRef }: { svgRef?: React.Ref<SVGSVGElement> }) => (
//   <svg ref={svgRef} viewBox="0 0 100 100" fill="none" className="w-full h-full" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
//     <path
//       d="M30,80 C30,60 40,50 50,50 C60,50 70,60 70,80 M50,50 C50,30 35,30 35,45 C35,60 65,60 65,45 C65,30 50,30 50,50"
//       stroke="currentColor"
//       strokeWidth="1.5"
//       vectorEffect="non-scaling-stroke"
//     />
//     <path d="M45,20 C50,15 55,20 50,25" stroke="currentColor" strokeWidth="1.5" />
//   </svg>
// );

// const ICONS = [OrphanIcon, MotherIcon, DisabilityIcon, ElderlyIcon];

// // ─── Animated Counter (runs once per panel entrance) ─────────────────────────

// function AnimatedCounter({
//   target,
//   isActive,
// }: {
//   target: number;
//   isActive: boolean;
// }) {
//   const ref = useRef<HTMLSpanElement>(null);
//   const hasRun = useRef(false);

//   useEffect(() => {
//     if (!isActive || hasRun.current || !ref.current) return;
//     hasRun.current = true;
//     const el = ref.current;
//     const obj = { val: 0 };
//     gsap.to(obj, {
//       val: target,
//       duration: 1.8,
//       ease: "expo.out",
//       onUpdate: () => {
//         el.textContent = Math.round(obj.val).toString();
//       },
//     });
//   }, [isActive, target]);

//   // Reset so it can replay if stats change
//   useEffect(() => {
//     hasRun.current = false;
//   }, [target]);

//   return <span ref={ref}>0</span>;
// }

// // ─── Main Component ──────────────────────────────────────────────────────────

// export default function StatsSection2() {
//   const { t } = useTranslation();
//   const wrapperRef = useRef<HTMLDivElement>(null);
//   const trackRef = useRef<HTMLDivElement>(null);

//   // Progress rail refs (direct DOM mutation, no React re-renders)
//   const indexRef = useRef<HTMLSpanElement>(null);
//   const segmentRefs = useRef<(HTMLDivElement | null)[]>([]);
//   const scrollCueRef = useRef<HTMLDivElement>(null);
//   const hasScrolledRef = useRef(false);

//   // Kicker & SVG refs for animation
//   const kickerRef = useRef<HTMLSpanElement>(null);
//   const svgRefs = useRef<(SVGSVGElement | null)[]>([]);
//   const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

//   // Active panel index for counter animation
//   const [activeIdx, setActiveIdx] = useState(0);
//   const activeIdxRef = useRef(0);

//   // Stats data
//   const [stats, setStats] = useState(() => {
//     const cached = readCache();
//     return cached ? mapStats(cached.data) : FALLBACK;
//   });

//   useEffect(() => {
//     const cached = readCache();
//     if (cached && Date.now() - cached.cachedAt < STALE_MS) return;
//     dashboardApi
//       .getOverview()
//       .then((res) => {
//         try {
//           localStorage.setItem(
//             CACHE_KEY,
//             JSON.stringify({ data: res.data, cachedAt: Date.now() })
//           );
//         } catch {}
//         setStats(mapStats(res.data));
//       })
//       .catch((err) => console.warn("Stats section fetch failed:", err));
//   }, []);

//   // Curated accent palette — avoids stock CSS variable colors.
//   // These are chosen as a warm-to-cool gradient that feels cohesive
//   // across both light (cream) and dark (slate) themes.
//   const STAT_ITEMS = [
//     {
//       value: stats.orphan,
//       labelKey: "stats.card1.label",
//       labelFallback: "Orphaned",
//       descKey: "stats.card1",
//       descFallback: "Families raising children who have lost one or both parents",
//       accent: { light: "168 55% 42%", dark: "168 60% 55%" },  // Teal — trust, hope
//     },
//     {
//       value: stats.single_mother,
//       labelKey: "stats.card2.label",
//       labelFallback: "Single Mothers",
//       descKey: "stats.card2",
//       descFallback: "Single mothers raising their children on their own, with our steady support",
//       accent: { light: "340 65% 52%", dark: "340 70% 65%" },  // Rose — warmth, care
//     },
//     {
//       value: stats.disabled_disease,
//       labelKey: "stats.card3.label",
//       labelFallback: "Disability & Illness",
//       descKey: "stats.card3",
//       descFallback: "Families living with disability or long-term illness, never left behind",
//       accent: { light: "250 50% 58%", dark: "250 55% 68%" },  // Violet — resilience
//     },
//     {
//       value: stats.old_age,
//       labelKey: "stats.card4.label",
//       labelFallback: "Elderly Care",
//       descKey: "stats.card4",
//       descFallback: "Elderly families without a steady income, cared for with dignity",
//       accent: { light: "28 80% 52%", dark: "28 85% 62%" },    // Amber — dignity, warmth
//     },
//   ];

//   const count = STAT_ITEMS.length;

//   // ── Pointer-events optimization ─────────────────────────────────────────
//   useEffect(() => {
//     let scrollTimeout: ReturnType<typeof setTimeout>;
//     const trackElement = trackRef.current;
//     const disablePointers = () => {
//       if (!trackElement) return;
//       if (trackElement.style.pointerEvents !== "none") {
//         trackElement.style.pointerEvents = "none";
//       }
//       clearTimeout(scrollTimeout);
//       scrollTimeout = setTimeout(() => {
//         if (trackElement) trackElement.style.pointerEvents = "auto";
//       }, 150);
//     };
//     window.addEventListener("scroll", disablePointers, { passive: true });
//     return () => {
//       window.removeEventListener("scroll", disablePointers);
//       clearTimeout(scrollTimeout);
//     };
//   }, []);

//   // ── Debounced React state update for counter animation ──────────────────
//   const debouncedSetIdx = useCallback((idx: number) => {
//     if (activeIdxRef.current !== idx) {
//       activeIdxRef.current = idx;
//       setActiveIdx(idx);
//     }
//   }, []);

//   // ── GSAP Horizontal Scroll & Reveals ──────────────────────────────────────
//   useGSAP(
//     () => {
//       if (!wrapperRef.current || !trackRef.current) return;
//       const wrapper = wrapperRef.current;
//       const track = trackRef.current;

//       // 1. Initial Reveals
//       if (kickerRef.current) {
//         gsap.fromTo(
//           kickerRef.current,
//           { y: "100%", opacity: 0 },
//           {
//             y: "0%",
//             opacity: 1,
//             duration: 1.2,
//             ease: "expo.out",
//             delay: 0.2,
//             scrollTrigger: {
//               trigger: wrapper,
//               start: "top 80%",
//             },
//           }
//         );
//       }

//       // 2. Horizontal Scroll Logic
//       const getDistance = () => track.scrollWidth - track.offsetWidth;

//       const scrollTween = gsap.to(track, {
//         x: () => -getDistance(),
//         ease: "none",
//         scrollTrigger: {
//           trigger: wrapper,
//           start: "top top",
//           end: () => `+=${getDistance()}`,
//           pin: true,
//           pinSpacing: true,
//           scrub: true,
//           fastScrollEnd: true,
//           preventOverlaps: true,
//           invalidateOnRefresh: true,
//           anticipatePin: 1,

//           // Force-hide navbar while pinned
//           onEnter: () =>
//             window.dispatchEvent(
//               new CustomEvent("force-hide-nav", { detail: { hidden: true } })
//             ),
//           onLeave: () =>
//             window.dispatchEvent(
//               new CustomEvent("force-hide-nav", { detail: { hidden: false } })
//             ),
//           onEnterBack: () =>
//             window.dispatchEvent(
//               new CustomEvent("force-hide-nav", { detail: { hidden: true } })
//             ),
//           onLeaveBack: () =>
//             window.dispatchEvent(
//               new CustomEvent("force-hide-nav", { detail: { hidden: false } })
//             ),

//           onUpdate: (self) => {
//             const progress = self.progress;
//             const idx = Math.min(
//               Math.round(progress * (count - 1)),
//               count - 1
//             );

//             // Fade out scroll cue on first interaction
//             if (!hasScrolledRef.current && progress > 0.01) {
//               hasScrolledRef.current = true;
//               if (scrollCueRef.current) {
//                 gsap.to(scrollCueRef.current, {
//                   opacity: 0,
//                   duration: 0.6,
//                   ease: "power2.out",
//                 });
//               }
//             }

//             // Update index display (direct DOM)
//             if (indexRef.current) {
//               indexRef.current.textContent = `${String(idx + 1).padStart(2, "0")} — ${String(count).padStart(2, "0")}`;
//             }

//             // Highlight active segment
//             segmentRefs.current.forEach((seg, i) => {
//               if (!seg) return;
//               seg.style.opacity = i === idx ? "1" : "0.15";
//             });

//             // Trigger counter animation (debounced React update)
//             debouncedSetIdx(idx);
//           },
//         },
//       });

//       // 3. SVG Line Drawing (using DrawSVGPlugin & containerAnimation)
//       svgRefs.current.forEach((svg, i) => {
//         if (!svg) return;
//         const shapes = svg.querySelectorAll("path, circle");
        
//         if (i === 0) {
//           // First panel draws in automatically on section enter
//           gsap.fromTo(
//             shapes,
//             { drawSVG: "0%" },
//             {
//               drawSVG: "100%",
//               duration: 2.5,
//               ease: "power3.out",
//               delay: 0.3,
//               scrollTrigger: {
//                 trigger: wrapper,
//                 start: "top 80%",
//               },
//             }
//           );
//         } else {
//           // Subsequent panels draw in scrubbed via horizontal container scroll
//           gsap.fromTo(
//             shapes,
//             { drawSVG: "0%" },
//             {
//               drawSVG: "100%",
//               ease: "power1.inOut",
//               scrollTrigger: {
//                 trigger: panelRefs.current[i],
//                 containerAnimation: scrollTween,
//                 start: "left 85%", // Start drawing when panel enters 85% of screen
//                 end: "center center", // Finish drawing when panel is centered
//                 scrub: true,
//               },
//             }
//           );
//         }
//       });
//     },
//     { scope: wrapperRef, dependencies: [stats, t] }
//   );

//   return (
//     <div
//       ref={wrapperRef}
//       className="relative w-full h-svh overflow-hidden select-none"
//       style={{
//         paddingBottom: "env(safe-area-inset-bottom, 0px)",
//       }}
//     >
//       {/* ── Background: subtle radial glow ────────────────────────────────── */}
//       <div
//         aria-hidden="true"
//         className="absolute inset-0 pointer-events-none"
//         style={{
//           background:
//             "radial-gradient(ellipse 80% 60% at 50% 40%, hsl(var(--primary) / 0.05) 0%, transparent 70%)",
//         }}
//       />

//       {/* ── Fixed editorial kicker (top-left) ────────────────────────────── */}
//       {/* Lowered to top-20 / top-24 to accommodate the sticky navbar safely */}
//       <div className="absolute top-20 lg:top-24 left-6 sm:left-8 lg:left-12 z-20 pointer-events-none overflow-hidden">
//         <span 
//           ref={kickerRef}
//           className="inline-block font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-muted-foreground/50 will-change-transform"
//         >
//           {t("stats.kicker", "Who we serve")}
//         </span>
//       </div>

//       {/* ── Horizontal Track ─────────────────────────────────────────────── */}
//       <div ref={trackRef} className="flex h-full will-change-transform">
//         {STAT_ITEMS.map((stat, i) => {
//           const Icon = ICONS[i];
//           const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
//           const accentHsl = isDark ? stat.accent.dark : stat.accent.light;
//           const accentColor = `hsl(${accentHsl})`;
//           return (
//             <div
//               key={stat.descKey}
//               ref={(el) => { panelRefs.current[i] = el; }}
//               className="relative flex-shrink-0 w-screen h-full flex items-center justify-center"
//             >
//               {/* Vertical divider between panels */}
//               {i !== 0 && (
//                 <span
//                   aria-hidden="true"
//                   className="absolute left-0 top-[12%] h-[76%] w-px"
//                   style={{
//                     background: `linear-gradient(180deg, transparent 0%, hsl(var(--border) / 0.6) 25%, hsl(var(--border) / 0.6) 75%, transparent 100%)`,
//                   }}
//                 />
//               )}

//               {/* Background icon watermark */}
//               <div
//                 aria-hidden="true"
//                 className="absolute pointer-events-none"
//                 style={{
//                   width: "clamp(240px, 40vw, 480px)",
//                   height: "clamp(240px, 40vw, 480px)",
//                   opacity: 0.12, // Increased opacity since lines are thinner and more abstract
//                   right: "6%",
//                   top: "50%",
//                   transform: "translateY(-50%)",
//                   color: accentColor,
//                 }}
//               >
//                 <Icon svgRef={(el: SVGSVGElement | null) => { svgRefs.current[i] = el; }} />
//               </div>

//               {/* Content card */}
//               <div className="relative z-10 flex flex-col items-start px-8 sm:px-12 lg:px-20 max-w-2xl w-full">
//                 {/* Category kicker */}
//                 <span
//                   className="inline-block font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] mb-6 sm:mb-8 px-3.5 py-1.5 rounded-full border"
//                   style={{
//                     borderColor: `hsl(${accentHsl} / 0.35)`,
//                     color: accentColor,
//                     backgroundColor: `hsl(${accentHsl} / 0.08)`,
//                   }}
//                 >
//                   {t(stat.labelKey, stat.labelFallback)}
//                 </span>

//                 {/* Hero number */}
//                 <div className="flex items-baseline gap-3 sm:gap-4">
//                   <span
//                     className="font-display font-black tracking-tighter leading-none"
//                     style={{
//                       fontSize: "clamp(5rem, 14vw, 12rem)",
//                       color: accentColor,
//                     }}
//                   >
//                     <AnimatedCounter
//                       target={stat.value}
//                       isActive={activeIdx === i}
//                     />
//                   </span>
//                   <span
//                     className="font-display font-light text-muted-foreground/30"
//                     style={{ fontSize: "clamp(1.8rem, 4.5vw, 4rem)" }}
//                   >
//                     {t("stats.suffix", "families")}
//                   </span>
//                 </div>

//                 {/* Accent line */}
//                 <div
//                   className="mt-6 sm:mt-8 h-[2px] w-12 sm:w-16 rounded-full"
//                   style={{ backgroundColor: accentColor, opacity: 0.4 }}
//                 />

//                 {/* Description */}
//                 <p className="mt-5 sm:mt-6 text-[15px] sm:text-lg leading-relaxed text-muted-foreground max-w-[26rem]">
//                   {t(stat.descKey, stat.descFallback)}
//                 </p>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* ── Bottom Control Rail ───────────────────────────────────────────── */}
//       <div
//         className="absolute left-0 right-0 z-20 pointer-events-none"
//         style={{
//           bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
//         }}
//       >
//         <div className="container mx-auto px-6 sm:px-8 flex items-center gap-4 sm:gap-6">
//           {/* Index counter */}
//           <span
//             ref={indexRef}
//             className="font-mono text-[10px] sm:text-xs tabular-nums tracking-[0.15em] uppercase text-muted-foreground shrink-0"
//           >
//             01 — {String(count).padStart(2, "0")}
//           </span>

//           {/* Segmented progress bar */}
//           <div className="flex-1 flex items-center gap-1">
//             {STAT_ITEMS.map((_, i) => (
//               <div
//                 key={i}
//                 ref={(el) => {
//                   segmentRefs.current[i] = el;
//                 }}
//                 className="flex-1 h-[2px] rounded-full bg-foreground/50 transition-opacity duration-300"
//                 style={{ opacity: i === 0 ? 1 : 0.15 }}
//               />
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* ── Scroll cue — auto-fades after first interaction ─────────────── */}
//       <div
//         ref={scrollCueRef}
//         className="absolute right-6 sm:right-10 top-1/2 -translate-y-1/2 z-10 pointer-events-none flex flex-col items-center gap-3 text-muted-foreground/25"
//         style={{ animation: "float 3s ease-in-out infinite" }}
//       >
//         <span className="text-[9px] font-mono uppercase tracking-[0.25em] [writing-mode:vertical-lr]">
//           {t("stats.scrollCue", "Scroll")}
//         </span>
//         <svg
//           width="14"
//           height="22"
//           viewBox="0 0 14 22"
//           fill="none"
//           className="opacity-50"
//           aria-hidden="true"
//         >
//           <rect x="3" y="0" width="8" height="14" rx="4" stroke="currentColor" strokeWidth="1.5" />
//           <line x1="7" y1="3.5" x2="7" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//           <path d="M3 16l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//         </svg>
//       </div>
//     </div>
//   );
// }


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

// ─── Detailed Continuous-Line SVG Icons ─────────────────────────────────────
// Hand-drawn illustration scenes. Layered linework with soft filled accents:
// lines draw in via DrawSVG, `.fill` shapes fade in via fillOpacity.
// Shared family rules: adult heads r5 / child heads r4.5, one recurring heart
// motif, a ground baseline, sun/ray accents, and 4-point sparkle details.
// Micro-detail (rays, sparkles, motion) uses a lighter 1.1 stroke on purpose.

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
    {/* Sun disc + rays (top-left) */}
    <circle
      cx="20"
      cy="20"
      r="5.5"
      fill="currentColor"
      fillOpacity="0.25"
      className="fill"
    />
    <path
      d="M 20 16 L 20 12.5 M 20 24 L 20 27.5 M 14.5 20 L 11 20 M 25.5 20 L 29 20 M 16 24 L 13.6 26.4 M 24 24 L 26.4 26.4 M 16 16 L 13.6 13.6 M 24 16 L 26.4 13.6"
      stroke="currentColor"
      strokeWidth="1.1"
      vectorEffect="non-scaling-stroke"
    />
    {/* Small cloud */}
    <path
      d="M 60 20 C 60 16 63 15 65 17 C 67 15 71 16 72 20 M 60 20 L 72 20"
      stroke="currentColor"
      strokeWidth="1.3"
      vectorEffect="non-scaling-stroke"
    />
    {/* Protective canopy — outer + inner arch */}
    <path
      d="M 12 84 C 12 22 34 8 50 8 C 66 8 88 22 88 84"
      stroke="currentColor"
      strokeWidth="1.5"
      vectorEffect="non-scaling-stroke"
    />
    <path
      d="M 22 84 C 22 30 37 18 50 18 C 63 18 78 30 78 84"
      stroke="currentColor"
      strokeWidth="1.1"
      vectorEffect="non-scaling-stroke"
    />
    {/* Heart — filled tint + outline */}
    <path
      d="M 50 26 C 50 26 46 22 43 25 C 40 28 46 34 50 37 C 54 34 60 28 57 25 C 54 22 50 26 50 26 Z"
      fill="currentColor"
      fillOpacity="0.3"
      className="fill"
    />
    <path
      d="M 50 26 C 50 26 46 22 43 25 C 40 28 46 34 50 37 C 54 34 60 28 57 25 C 54 22 50 26 50 26 Z"
      stroke="currentColor"
      strokeWidth="1.1"
      vectorEffect="non-scaling-stroke"
    />
    {/* Soft ground shadow */}
    <ellipse
      cx="50"
      cy="87.5"
      rx="16"
      ry="1.5"
      fill="currentColor"
      fillOpacity="0.15"
      className="fill"
    />
    {/* Child head + face */}
    <circle
      cx="50"
      cy="54"
      r="5"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      vectorEffect="non-scaling-stroke"
    />
    <path
      d="M 47.5 53.5 C 48 53 49 53 49.5 53.5 M 47.5 56 C 48.5 57 51 57 52 56"
      stroke="currentColor"
      strokeWidth="1.1"
      vectorEffect="non-scaling-stroke"
    />
    {/* Child body, legs, raised arms */}
    <path
      d="M 50 59 L 50 72 M 50 72 C 47 78 45 82 44 86 M 50 72 C 53 78 55 82 56 86 M 46 63 C 43 63 41 65 41 68 M 54 63 C 57 63 59 65 59 68"
      stroke="currentColor"
      strokeWidth="1.5"
      vectorEffect="non-scaling-stroke"
    />
    {/* Ground + grass */}
    <path
      d="M 26 88 L 74 88"
      stroke="currentColor"
      strokeWidth="1.3"
      vectorEffect="non-scaling-stroke"
    />
    <path
      d="M 30 88 L 30 84 M 32 88 L 33 85 M 34 88 L 34 84.5 M 62 88 L 62 84.5 M 64 88 L 64 84 M 66 88 L 67 85"
      stroke="currentColor"
      strokeWidth="1.1"
      vectorEffect="non-scaling-stroke"
    />
    {/* Sparkles */}
    <path
      d="M 72 44 L 72 48 M 70 46 L 74 46 M 34 40 L 34 44 M 32 42 L 36 42"
      stroke="currentColor"
      strokeWidth="1.1"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

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
    {/* Sun disc + rays (top-right) */}
    <circle
      cx="80"
      cy="20"
      r="5.5"
      fill="currentColor"
      fillOpacity="0.25"
      className="fill"
    />
    <path
      d="M 80 16 L 80 12.5 M 80 24 L 80 27.5 M 74.5 20 L 71 20 M 85.5 20 L 89 20 M 76 24 L 73.6 26.4 M 84 24 L 86.4 26.4 M 76 16 L 73.6 13.6 M 84 16 L 86.4 13.6"
      stroke="currentColor"
      strokeWidth="1.1"
      vectorEffect="non-scaling-stroke"
    />
    {/* Heart — filled tint + outline */}
    <path
      d="M 50 4 C 50 4 46 0 43 3 C 40 6 46 12 50 15 C 54 12 60 6 57 3 C 54 0 50 4 50 4 Z"
      fill="currentColor"
      fillOpacity="0.3"
      className="fill"
    />
    <path
      d="M 50 4 C 50 4 46 0 43 3 C 40 6 46 12 50 15 C 54 12 60 6 57 3 C 54 0 50 4 50 4 Z"
      stroke="currentColor"
      strokeWidth="1.1"
      vectorEffect="non-scaling-stroke"
    />
    {/* Soft ground shadow */}
    <ellipse
      cx="45"
      cy="88"
      rx="20"
      ry="1.5"
      fill="currentColor"
      fillOpacity="0.15"
      className="fill"
    />
    {/* Mother head + hair bun */}
    <circle
      cx="48"
      cy="30"
      r="5"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      vectorEffect="non-scaling-stroke"
    />
    <circle
      cx="42"
      cy="26.5"
      r="2.8"
      stroke="currentColor"
      strokeWidth="1.3"
      fill="none"
      vectorEffect="non-scaling-stroke"
    />
    <path
      d="M 45 24 C 43 21 40 22 39 25"
      stroke="currentColor"
      strokeWidth="1.1"
      vectorEffect="non-scaling-stroke"
    />
    {/* Mother face */}
    <path
      d="M 46.5 29.5 C 47 29 48 29 48.5 29.5 M 46.5 32 C 47.5 33 49 33 50 32"
      stroke="currentColor"
      strokeWidth="1.1"
      vectorEffect="non-scaling-stroke"
    />
    {/* Neck */}
    <path
      d="M 47 34 L 47 37 M 49 34 L 49 37"
      stroke="currentColor"
      strokeWidth="1.3"
      vectorEffect="non-scaling-stroke"
    />
    {/* A-line dress */}
    <path
      d="M 47 37 C 43 46 42 56 41 64 C 40 70 39 76 39 82 C 39 84 39 86 39 87"
      stroke="currentColor"
      strokeWidth="1.5"
      vectorEffect="non-scaling-stroke"
    />
    <path
      d="M 49 37 C 52 46 53 56 52 64 C 51 70 50 76 50 82 C 50 84 50 86 50 87"
      stroke="currentColor"
      strokeWidth="1.5"
      vectorEffect="non-scaling-stroke"
    />
    <path
      d="M 39 87 C 43 89 47 89 50 87"
      stroke="currentColor"
      strokeWidth="1.1"
      vectorEffect="non-scaling-stroke"
    />
    {/* Arm cradling the child */}
    <path
      d="M 50 42 C 56 48 58 56 55 62 C 53 66 49 67 45 66"
      stroke="currentColor"
      strokeWidth="1.5"
      vectorEffect="non-scaling-stroke"
    />
    {/* Child head + hair curl + face */}
    <circle
      cx="38"
      cy="62"
      r="4.5"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      vectorEffect="non-scaling-stroke"
    />
    <path
      d="M 38 57.5 C 38 56.5 37 56.5 36.5 57.3 M 36.8 61.5 C 37.2 61 38 61 38.4 61.5 M 36.8 64 C 37.6 64.8 39.4 64.8 40.2 64"
      stroke="currentColor"
      strokeWidth="1.1"
      vectorEffect="non-scaling-stroke"
    />
    {/* Child body, legs, reaching arm */}
    <path
      d="M 38 66.5 L 38 74 M 38 74 C 36 79 35 83 34 86 M 38 74 C 40 79 41 83 42 86 M 40 69 C 43 66 45 64 46 61"
      stroke="currentColor"
      strokeWidth="1.5"
      vectorEffect="non-scaling-stroke"
    />
    {/* Ground + flowers + grass */}
    <path
      d="M 16 88 L 84 88"
      stroke="currentColor"
      strokeWidth="1.3"
      vectorEffect="non-scaling-stroke"
    />
    <path
      d="M 20 88 L 20 78 M 16 74 L 24 74 M 20 70 L 20 78 M 70 88 L 70 80 M 67 77 L 73 77 M 70 74 L 70 80"
      stroke="currentColor"
      strokeWidth="1.3"
      vectorEffect="non-scaling-stroke"
    />
    <circle cx="20" cy="74" r="1" fill="currentColor" className="fill" />
    <circle cx="70" cy="77" r="1" fill="currentColor" className="fill" />
    <path
      d="M 52 88 L 52 85 M 54 88 L 55 86 M 58 88 L 58 85.5 M 60 88 L 59 86.5"
      stroke="currentColor"
      strokeWidth="1.1"
      vectorEffect="non-scaling-stroke"
    />
    {/* Sparkles */}
    <path
      d="M 66 36 L 66 40 M 64 38 L 68 38 M 30 38 L 30 42 M 28 40 L 32 40"
      stroke="currentColor"
      strokeWidth="1.1"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

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
    {/* Medical cross */}
    <path
      d="M 20 18 L 26 18 M 23 15 L 23 21"
      stroke="currentColor"
      strokeWidth="1.3"
      vectorEffect="non-scaling-stroke"
    />
    {/* Heart — filled tint + outline + ECG pulse */}
    <path
      d="M 78 16 C 78 16 74 12 71 15 C 68 18 74 24 78 27 C 82 24 88 18 85 15 C 82 12 78 16 78 16 Z"
      fill="currentColor"
      fillOpacity="0.3"
      className="fill"
    />
    <path
      d="M 78 16 C 78 16 74 12 71 15 C 68 18 74 24 78 27 C 82 24 88 18 85 15 C 82 12 78 16 78 16 Z"
      stroke="currentColor"
      strokeWidth="1.1"
      vectorEffect="non-scaling-stroke"
    />
    <path
      d="M 70 40 L 76 40 L 78 36 L 81 43 L 83 40 L 88 40"
      stroke="currentColor"
      strokeWidth="1.3"
      vectorEffect="non-scaling-stroke"
    />
    {/* Motion lines behind the wheel */}
    <path
      d="M 24 66 L 20 66 M 26 60 L 22 60 M 26 76 L 22 76"
      stroke="currentColor"
      strokeWidth="1.1"
      vectorEffect="non-scaling-stroke"
    />
    {/* Main wheel + spokes */}
    <circle
      cx="44"
      cy="72"
      r="15"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      vectorEffect="non-scaling-stroke"
    />
    <path
      d="M 44 57 L 44 87 M 29 72 L 59 72 M 33.5 61.5 L 54.5 82.5 M 54.5 61.5 L 33.5 82.5"
      stroke="currentColor"
      strokeWidth="1.1"
      vectorEffect="non-scaling-stroke"
    />
    <circle cx="44" cy="72" r="1.5" fill="currentColor" className="fill" />
    {/* Frame + backrest + caster */}
    <path
      d="M 46 46 L 46 60 M 44 60 L 58 60 L 66 60 C 68 68 68 78 70 83"
      stroke="currentColor"
      strokeWidth="1.3"
      vectorEffect="non-scaling-stroke"
    />
    <circle
      cx="70"
      cy="83"
      r="4"
      stroke="currentColor"
      strokeWidth="1.3"
      fill="none"
      vectorEffect="non-scaling-stroke"
    />
    {/* Figure head + hair + face */}
    <circle
      cx="48"
      cy="38"
      r="5"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      vectorEffect="non-scaling-stroke"
    />
    <path
      d="M 48 33 C 48 31 46 31 45 32 C 43 33 43 35 44 36 M 44 36 C 42 36 42 38 43 39 M 46.5 37.5 C 47 37 48 37 48.5 37.5 M 46.5 40 C 47.5 41 49.5 41 50.5 40"
      stroke="currentColor"
      strokeWidth="1.1"
      vectorEffect="non-scaling-stroke"
    />
    {/* Torso + arm reaching the rim */}
    <path
      d="M 48 43 C 50 47 51 52 49 56 L 48 60 M 51 47 C 53 50 54 54 53 58"
      stroke="currentColor"
      strokeWidth="1.5"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

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
    {/* Sun disc + rays (top-left) */}
    <circle
      cx="24"
      cy="18"
      r="5.5"
      fill="currentColor"
      fillOpacity="0.25"
      className="fill"
    />
    <path
      d="M 24 14.5 L 24 11 M 24 21.5 L 24 25 M 18.5 18 L 15 18 M 29.5 18 L 33 18 M 20 22 L 17.6 24.4 M 28 22 L 30.4 24.4 M 20 14 L 17.6 11.6 M 28 14 L 30.4 11.6"
      stroke="currentColor"
      strokeWidth="1.1"
      vectorEffect="non-scaling-stroke"
    />
    {/* Heart — filled tint + outline */}
    <path
      d="M 30 32 C 30 32 26 28 23 31 C 20 34 26 40 30 43 C 34 40 40 34 37 31 C 34 28 30 32 30 32 Z"
      fill="currentColor"
      fillOpacity="0.3"
      className="fill"
    />
    <path
      d="M 30 32 C 30 32 26 28 23 31 C 20 34 26 40 30 43 C 34 40 40 34 37 31 C 34 28 30 32 30 32 Z"
      stroke="currentColor"
      strokeWidth="1.1"
      vectorEffect="non-scaling-stroke"
    />
    {/* Soft ground shadow */}
    <ellipse
      cx="48"
      cy="88"
      rx="20"
      ry="1.5"
      fill="currentColor"
      fillOpacity="0.15"
      className="fill"
    />
    {/* Head + glasses + smile */}
    <circle
      cx="46"
      cy="30"
      r="5"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      vectorEffect="non-scaling-stroke"
    />
    <circle
      cx="44.5"
      cy="29.5"
      r="2"
      stroke="currentColor"
      strokeWidth="1.1"
      fill="none"
      vectorEffect="non-scaling-stroke"
    />
    <circle
      cx="50.5"
      cy="29.5"
      r="2"
      stroke="currentColor"
      strokeWidth="1.1"
      fill="none"
      vectorEffect="non-scaling-stroke"
    />
    <path
      d="M 46.5 29.5 L 48.5 29.5 M 42.5 29.5 L 41 29 M 45 33 C 46 34 49 34 50 33"
      stroke="currentColor"
      strokeWidth="1.1"
      vectorEffect="non-scaling-stroke"
    />
    {/* Stooped body */}
    <path
      d="M 46 35 C 44 42 44 50 45 58 C 46 66 47 74 47 82 C 47 85 47 86 47 87"
      stroke="currentColor"
      strokeWidth="1.5"
      vectorEffect="non-scaling-stroke"
    />
    <path
      d="M 46 38 C 49 43 50 50 50 58 C 50 66 50 74 50 82 C 50 85 50 86 50 87"
      stroke="currentColor"
      strokeWidth="1.5"
      vectorEffect="non-scaling-stroke"
    />
    {/* Arm extended to cane */}
    <path
      d="M 50 52 C 54 54 57 56 59 58"
      stroke="currentColor"
      strokeWidth="1.3"
      vectorEffect="non-scaling-stroke"
    />
    {/* Cane with crook handle + hand */}
    <path
      d="M 62 60 L 62 87 M 62 60 C 62 54 57 51 53 52"
      stroke="currentColor"
      strokeWidth="1.3"
      vectorEffect="non-scaling-stroke"
    />
    <circle
      cx="59"
      cy="58"
      r="3.5"
      stroke="currentColor"
      strokeWidth="1.3"
      fill="none"
      vectorEffect="non-scaling-stroke"
    />
    {/* Ground + grass */}
    <path
      d="M 16 88 L 84 88"
      stroke="currentColor"
      strokeWidth="1.3"
      vectorEffect="non-scaling-stroke"
    />
    <path
      d="M 20 88 L 20 85 M 22 88 L 23 86 M 24 88 L 24 85.5 M 74 88 L 74 85.5 M 76 88 L 76 85 M 78 88 L 79 86"
      stroke="currentColor"
      strokeWidth="1.1"
      vectorEffect="non-scaling-stroke"
    />
    {/* Sparkles */}
    <path
      d="M 66 30 L 66 34 M 64 32 L 68 32 M 34 22 L 34 26 M 32 24 L 36 24"
      stroke="currentColor"
      strokeWidth="1.1"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

const ICONS = [OrphanIcon, MotherIcon, DisabilityIcon, ElderlyIcon];

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

      // SVG Line Drawing + Fill Fade via GSAP DrawSVGPlugin (with native fallback)
      svgRefs.current.forEach((svg, i) => {
        if (!svg) return;
        const strokes = Array.from(
          svg.querySelectorAll("path, circle, ellipse, rect, line, polygon, polyline")
        ).filter((el) => !el.classList.contains("fill")) as SVGGeometryElement[];

        const fills = Array.from(svg.querySelectorAll(".fill"));

        // Initialize dash properties per stroke element for native fallbacks
        strokes.forEach((el) => {
          let length = 0;
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
          el.style.strokeDasharray = `${length}`;
          el.style.strokeDashoffset = `${length}`;
        });

        const panelTrigger =
          i === 0
            ? { trigger: wrapper, start: "top 80%" }
            : {
                trigger: panelRefs.current[i],
                containerAnimation: scrollTween,
                start: "left 95%",
                end: "center center",
                scrub: true,
              };

        if (strokes.length) {
          gsap.fromTo(
            strokes,
            {
              drawSVG: "0%",
              strokeDashoffset: (_, target: SVGGeometryElement) => {
                let l = 500;
                try {
                  if (typeof (target as SVGPathElement).getTotalLength === "function") {
                    l = (target as SVGPathElement).getTotalLength();
                  } else if (target.tagName.toLowerCase() === "circle") {
                    l = 2 * Math.PI * parseFloat(target.getAttribute("r") ?? "0");
                  }
                } catch {}
                return l || 500;
              },
            },
            {
              drawSVG: "100%",
              strokeDashoffset: 0,
              duration: i === 0 ? 2.2 : undefined,
              ease: i === 0 ? "power3.out" : "power1.inOut",
              delay: i === 0 ? 0.3 : undefined,
              scrollTrigger: panelTrigger,
            }
          );
        }

        if (fills.length) {
          gsap.fromTo(
            fills,
            { fillOpacity: 0 },
            {
              fillOpacity: (_, el) =>
                parseFloat(el.getAttribute("fill-opacity") ?? "1") || 0,
              duration: i === 0 ? 2.8 : undefined,
              ease: "power2.inOut",
              delay: i === 0 ? 0.9 : undefined,
              scrollTrigger: panelTrigger,
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