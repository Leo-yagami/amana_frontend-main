// import { useRef, useLayoutEffect, useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import { useLenis } from "lenis/react";
// import { ArrowRight } from "lucide-react";
// import gsap from "gsap";
// import { useAnimationCoordinator, type AnimationMode } from "@/components/AnimationCoordinator";

// // ─── Ticker tape items — alternating EN / AM flavor, real-sounding dispatch ───
// const TICKER_ITEMS = [
//   "78 families supported this quarter",
//   "ቤተሰቦች",
//   "Urgent: 17 pending aid requests",
//   "ምሕረት",
//   "Food distribution — Bole, Addis Ababa",
//   "ተስፋ",
//   "Donor threshold reached: ETB 2.4M",
//   "ሰላም",
//   "New campaign live — education fund",
//   "ፍቅር",
//   "Medical supply convoy dispatched",
//   "አሚን",
// ];

// // ─── The diagonal shard boundary angles match the Preloader's SLICES exactly ──
// // Preloader shard lines: 20/40/60/80% x-intercepts top → 40/60/80/100% x-intercepts bottom
// // We mirror the rightmost shard boundary for the panel clip

// const COUNTER_TARGETS = [
//   { value: 78, label: t("hero.counters.families", "Families"), sublabel: t("hero.counters.familiesSub", "directly supported") },
//   { value: 24, label: t("hero.counters.events", "Events"), sublabel: t("hero.counters.eventsSub", "this year") },
//   { value: 125, label: t("hero.counters.raised", "ETB (K)"), sublabel: t("hero.counters.raisedSub", "raised to date") },
// ];

// function useCountUp(target: number, duration = 1.6, start = false) {
//   const [count, setCount] = useState(0);
//   useEffect(() => {
//     if (!start) return;
//     const startTime = performance.now();
//     const raf = (now: number) => {
//       const elapsed = (now - startTime) / 1000;
//       const t = Math.min(elapsed / duration, 1);
//       // ease out expo
//       const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
//       setCount(Math.round(eased * target));
//       if (t < 1) requestAnimationFrame(raf);
//     };
//     requestAnimationFrame(raf);
//   }, [start, target, duration]);
//   return count;
// }

// function CounterCard({
//   item,
//   active,
//   index,
// }: {
//   item: { value: number; labelKey: string; label: string; sublabelKey: string; sublabel: string; };
//   active: boolean;
//   index: number;
// }) {
//   const count = useCountUp(item.value, 1.4 + index * 0.2, active);
//   return (
//     <div className="border-l border-border/60 pl-4 py-1">
//       <div className="font-display font-black text-[clamp(1.6rem,3.5vw,2.6rem)] leading-none tabular-nums text-foreground">
//         {count}
//         {item.label === "ETB (K)" && "K"}
//       </div>
//       <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
//         {item.label}
//         <span className="block text-muted-foreground/50 tracking-[0.1em] normal-case font-sans text-[10px] mt-0.5">
//           {item.sublabel}
//         </span>
//       </div>
//     </div>
//   );
// }

// export default function HeroSection() {
//   const { t } = useTranslation();
//   const lenis = useLenis();
//   const { registerAnimation } = useAnimationCoordinator();

//   // Refs for GSAP targets
//   const sectionRef = useRef<HTMLElement>(null);
//   const eyebrowRef = useRef<HTMLDivElement>(null);
//   const headlineRef = useRef<HTMLDivElement>(null);
//   const subRef = useRef<HTMLDivElement>(null);
//   const ctaRef = useRef<HTMLDivElement>(null);
//   const panelRef = useRef<HTMLDivElement>(null);
//   const tickerRef = useRef<HTMLDivElement>(null);
//   const tickerInnerRef = useRef<HTMLDivElement>(null);
//   const [countersActive, setCountersActive] = useState(false);

//   // Ticker loop
//   useEffect(() => {
//     const ticker = tickerInnerRef.current;
//     if (!ticker) return;

//     // Duplicate for seamless loop
//     const clone = ticker.cloneNode(true) as HTMLElement;
//     clone.setAttribute("aria-hidden", "true");
//     tickerRef.current?.appendChild(clone);

//     const totalWidth = ticker.scrollWidth;
//     let x = 0;
//     let rafId: number;
//     const speed = 0.55; // px per frame

//     const animate = () => {
//       x -= speed;
//       if (Math.abs(x) >= totalWidth) x = 0;
//       if (tickerRef.current) {
//         tickerRef.current.style.transform = `translateX(${x}px)`;
//       }
//       rafId = requestAnimationFrame(animate);
//     };

//     rafId = requestAnimationFrame(animate);
//     return () => cancelAnimationFrame(rafId);
//   }, []);

//   // GSAP animation orchestration
//   const runAnimation = (mode: AnimationMode) => {
//     const ease = mode === "reveal" ? "expo.out" : "power3.out";
//     const baseDuration = mode === "reveal" ? 0.9 : 0.65;
//     const baseDelay = mode === "reveal" ? 0.05 : 0.3;

//     const tl = gsap.timeline({
//       onComplete: () => setCountersActive(true),
//     });

//     // All elements start invisible — set initial state
//     // Target .hero-line children directly, never headlineRef itself
//     const heroLines = headlineRef.current?.querySelectorAll(".hero-line");
//     gsap.set(
//       [
//         eyebrowRef.current,
//         ...(heroLines ? Array.from(heroLines) : []),
//         subRef.current,
//         ctaRef.current,
//       ],
//       { y: 40, opacity: 0 }
//     );
//     gsap.set(panelRef.current, { x: 60, opacity: 0 });

//     // Eyebrow
//     tl.to(
//       eyebrowRef.current,
//       { y: 0, opacity: 1, duration: baseDuration * 0.7, ease },
//       baseDelay
//     );

//     // Headline lines staggered
//     const lines = headlineRef.current?.querySelectorAll(".hero-line");
//     if (lines?.length) {
//       tl.to(
//         lines,
//         {
//           y: 0,
//           opacity: 1,
//           duration: baseDuration,
//           stagger: 0.08,
//           ease,
//         },
//         "-=0.4"
//       );
//     }

//     // Sub + CTA
//     tl.to(
//       subRef.current,
//       { y: 0, opacity: 1, duration: baseDuration * 0.85, ease },
//       "-=0.5"
//     );
//     tl.to(
//       ctaRef.current,
//       { y: 0, opacity: 1, duration: baseDuration * 0.75, ease },
//       "-=0.4"
//     );

//     // Panel slides in from the right with a slight delay to feel independent
//     tl.to(
//       panelRef.current,
//       { x: 0, opacity: 1, duration: baseDuration * 1.1, ease },
//       mode === "reveal" ? "-=0.9" : "-=0.5"
//     );
//   };

//   useLayoutEffect(() => {
//     // Set everything invisible on mount before any animation fires
//     // NOTE: target .hero-line children directly — never the headlineRef wrapper,
//     // or the invisible parent will block the child animations from showing.
//     const lines = headlineRef.current?.querySelectorAll(".hero-line");
//     gsap.set(
//       [eyebrowRef.current, ...(lines ? Array.from(lines) : []), subRef.current, ctaRef.current],
//       { opacity: 0, y: 40 }
//     );
//     gsap.set(panelRef.current, { opacity: 0 });

//     const unsub = registerAnimation(runAnimation);
//     return unsub;
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [registerAnimation]);

//   return (
//     <section
//       ref={sectionRef}
//       className="relative min-h-[92vh] flex flex-col overflow-hidden bg-background"
//     >
//       {/* ── Diagonal shard-echo geometry — SVG hairlines that mirror Preloader ── */}
//       <svg
//         className="absolute inset-0 w-full h-full pointer-events-none"
//         xmlns="http://www.w3.org/2000/svg"
//         aria-hidden="true"
//       >
//         {/* Mirror the preloader's 60%→80% shard boundary */}
//         <line
//           x1="60%"
//           y1="0%"
//           x2="80%"
//           y2="100%"
//           stroke="currentColor"
//           strokeWidth="0.5"
//           strokeOpacity="0.08"
//         />
//         {/* The main structural diagonal — right panel separator */}
//         <line
//           x1="58%"
//           y1="0%"
//           x2="77%"
//           y2="100%"
//           stroke="currentColor"
//           strokeWidth="0.5"
//           strokeOpacity="0.05"
//         />
//       </svg>

//       {/* ── Corner brackets (echo Preloader decor) ── */}
//       <svg
//         className="absolute top-6 left-6 pointer-events-none"
//         width="22"
//         height="22"
//         viewBox="0 0 28 28"
//         aria-hidden="true"
//         style={{ opacity: 0.2 }}
//       >
//         <path d="M 0 28 L 0 0 L 28 0" fill="none" stroke="currentColor" strokeWidth="1" />
//       </svg>
//       <svg
//         className="absolute top-6 right-6 pointer-events-none"
//         width="22"
//         height="22"
//         viewBox="0 0 28 28"
//         aria-hidden="true"
//         style={{ opacity: 0.2 }}
//       >
//         <path d="M 28 28 L 28 0 L 0 0" fill="none" stroke="currentColor" strokeWidth="1" />
//       </svg>

//       {/* ─── Main content grid ─────────────────────────────────────────────── */}
//       <div className="flex-1 container mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-0 items-center pt-24 pb-20 sm:pt-28 sm:pb-24 relative z-10">

//         {/* LEFT — Typographic core */}
//         <div className="flex flex-col justify-center max-w-3xl">

//           {/* Eyebrow — system label style from Preloader */}
//           <div ref={eyebrowRef} className="flex items-center gap-3 mb-8">
//             <div className="w-6 h-px bg-primary" />
//             <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
//               {t("hero.eyebrow", "Aid dispatch — Addis Ababa")}
//             </span>
//             {/* Live pulse dot */}
//             <span className="relative flex h-[6px] w-[6px]">
//               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
//               <span className="relative inline-flex rounded-full h-[6px] w-[6px] bg-primary" />
//             </span>
//           </div>

//           {/* Headline — three-line staggered break, no stock photo needed */}
//           <div ref={headlineRef} className="mb-8">
//             <h1 className="font-display font-black leading-[0.93] tracking-[-0.03em] text-[clamp(3rem,8.5vw,6.5rem)]">
//               <span className="hero-line block text-foreground">
//                 {t("hero.line1", "Aid that")}
//               </span>
//               <span className="hero-line block text-foreground">
//                 {t("hero.line2", "actually")}
//               </span>
//               <span className="hero-line block text-primary relative">
//                 {t("hero.line3", "arrives.")}
//                 {/* Underline accent — thin rule, editorial */}
//                 <span
//                   className="absolute bottom-1 left-0 h-[3px] w-full bg-accent"
//                   style={{ transform: "scaleX(1)", transformOrigin: "left" }}
//                 />
//               </span>
//             </h1>
//           </div>

//           {/* Sub */}
//           <p
//             ref={subRef}
//             className="text-[clamp(0.95rem,1.5vw,1.1rem)] leading-relaxed text-muted-foreground max-w-[42ch] mb-10"
//           >
//             {t(
//               "hero.subtitle",
//               "Amana connects donors directly with families in Addis Ababa. No black box. Every birr tracked, every family named."
//             )}
//           </p>

//           {/* CTAs */}
//           <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
//             <Link to="/payment">
//               <button className="group inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-7 h-12 rounded-xl hover:bg-primary/90 transition-colors shadow-md hover:shadow-glow">
//                 {t("hero.ctaPrimary", "Donate now")}
//                 <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
//               </button>
//             </Link>
//             <button
//               onClick={(e) => {
//                 e.preventDefault();
//                 lenis?.scrollTo("#impact");
//               }}
//               className="inline-flex items-center gap-2 border border-border text-foreground font-medium text-sm px-7 h-12 rounded-xl hover:bg-secondary/60 transition-colors"
//             >
//               {t("hero.ctaSecondary", "See our impact")}
//             </button>
//           </div>
//         </div>

//         {/* RIGHT — The field dispatch panel */}
//         <div
//           ref={panelRef}
//           className="hidden lg:flex flex-col self-stretch justify-center ml-16 xl:ml-24 relative"
//           style={{ minWidth: "260px" }}
//         >
//           {/* Vertical mono label */}
//           <div
//             className="absolute -left-5 top-1/2 -translate-y-1/2 font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40"
//             style={{ writingMode: "vertical-rl", transform: "translateY(-50%) rotate(180deg)" }}
//           >
//             FIELD / STATUS
//           </div>

//           {/* Panel header */}
//           <div className="border-t border-b border-border/50 py-3 mb-6">
//             <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/60 flex justify-between">
//               <span>AMANA / OS — v2.4.1</span>
//               <span>15°N 38°E</span>
//             </div>
//           </div>

//           {/* Live counters */}
//           <div className="flex flex-col gap-5 mb-8">
//             {COUNTER_TARGETS.map((item, i) => (
//               <CounterCard key={item.label} item={item} active={countersActive} index={i} />
//             ))}
//           </div>

//           {/* Campaign urgency bar */}
//           <div className="mt-auto">
//             <div className="flex justify-between items-baseline mb-2">
//             <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
//               {t("hero.counters.fundProgress", "FUND PROGRESS")}
//             </span>
//             <span className="font-mono text-[10px] text-foreground/60">62.5%</span>
//           </div>
//           <div className="h-[2px] w-full bg-border/60 rounded-full overflow-hidden">
//             <div
//               className="h-full bg-primary rounded-full transition-all duration-[1400ms] ease-out"
//               style={{ width: countersActive ? "62.5%" : "0%" }}
//             />
//           </div>
//           <p className="font-mono text-[9px] text-muted-foreground/40 mt-2 tracking-[0.1em]">
//             {t("hero.counters.raisedOf", "ETB {{raised}}K of {{goal}}K RAISED", { raised: 125, goal: 200 })}
//           </p>
//           </div>

//           {/* Corner bracket (decorative, panel-level) */}
//           <svg
//             className="absolute bottom-0 right-0"
//             width="16"
//             height="16"
//             viewBox="0 0 28 28"
//             aria-hidden="true"
//             style={{ opacity: 0.15 }}
//           >
//             <path d="M 28 0 L 28 28 L 0 28" fill="none" stroke="currentColor" strokeWidth="1.5" />
//           </svg>
//         </div>
//       </div>

//       {/* ── TICKER TAPE — The signature element ──────────────────────────────── */}
//       <div
//         className="relative z-10 border-t border-border/40 overflow-hidden select-none"
//         aria-hidden="true"
//       >
//         {/* Gradient fade masks at edges */}
//         <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
//           style={{ background: "linear-gradient(to right, hsl(var(--background)), transparent)" }}
//         />
//         <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
//           style={{ background: "linear-gradient(to left, hsl(var(--background)), transparent)" }}
//         />

//         <div
//           ref={tickerRef}
//           className="flex items-center will-change-transform py-3"
//           style={{ width: "max-content" }}
//         >
//           <div
//             ref={tickerInnerRef}
//             className="flex items-center gap-0 shrink-0"
//           >
//             {TICKER_ITEMS.map((item, i) => (
//               <div key={i} className="flex items-center shrink-0">
//                 <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 whitespace-nowrap px-4">
//                   {item}
//                 </span>
//                 <span className="text-muted-foreground/20 text-xs">◆</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// import { useRef, useLayoutEffect, useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import { useLenis } from "lenis/react";
// import { ArrowRight } from "lucide-react";
// import gsap from "gsap";
// import { useAnimationCoordinator, type AnimationMode } from "@/components/AnimationCoordinator";
// import Copy, { type CopyHandle } from "@/components/Copy";

// // ─── Ticker tape items — alternating EN / AM flavor, real-sounding dispatch ───
// const TICKER_ITEMS = [
//   "78 families supported this quarter",
//   "ቤተሰቦች",
//   "Urgent: 17 pending aid requests",
//   "ምሕረት",
//   "Food distribution — Bole, Addis Ababa",
//   "ተስፋ",
//   "Donor threshold reached: ETB 2.4M",
//   "ሰላም",
//   "New campaign live — education fund",
//   "ፍቅር",
//   "Medical supply convoy dispatched",
//   "አሚን",
// ];

// // ─── The diagonal shard boundary angles match the Preloader's SLICES exactly ──
// // Preloader shard lines: 20/40/60/80% x-intercepts top → 40/60/80/100% x-intercepts bottom
// // We mirror the rightmost shard boundary for the panel clip

// const COUNTER_TARGETS = [
//   { value: 78, label: t("hero.counters.families", "Families"), sublabel: t("hero.counters.familiesSub", "directly supported") },
//   { value: 24, label: t("hero.counters.events", "Events"), sublabel: t("hero.counters.eventsSub", "this year") },
//   { value: 125, label: t("hero.counters.raised", "ETB (K)"), sublabel: t("hero.counters.raisedSub", "raised to date") },
// ];

// function useCountUp(target: number, duration = 1.6, start = false) {
//   const [count, setCount] = useState(0);
//   useEffect(() => {
//     if (!start) return;
//     const startTime = performance.now();
//     const raf = (now: number) => {
//       const elapsed = (now - startTime) / 1000;
//       const t = Math.min(elapsed / duration, 1);
//       // ease out expo
//       const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
//       setCount(Math.round(eased * target));
//       if (t < 1) requestAnimationFrame(raf);
//     };
//     requestAnimationFrame(raf);
//   }, [start, target, duration]);
//   return count;
// }

// function CounterCard({
//   item,
//   active,
//   index,
// }: {
//   item: { value: number; labelKey: string; label: string; sublabelKey: string; sublabel: string; };
//   active: boolean;
//   index: number;
// }) {
//   const count = useCountUp(item.value, 1.4 + index * 0.2, active);
//   return (
//     <div className="border-l border-border/60 pl-4 py-1">
//       <div className="font-display font-black text-[clamp(1.6rem,3.5vw,2.6rem)] leading-none tabular-nums text-foreground">
//         {count}
//         {item.label === "ETB (K)" && "K"}
//       </div>
//       <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
//         {item.label}
//         <span className="block text-muted-foreground/50 tracking-[0.1em] normal-case font-sans text-[10px] mt-0.5">
//           {item.sublabel}
//         </span>
//       </div>
//     </div>
//   );
// }

// export default function HeroSection() {
//   const { t } = useTranslation();
//   const lenis = useLenis();
//   const { registerAnimation } = useAnimationCoordinator();

//   // Refs for GSAP targets
//   const sectionRef = useRef<HTMLElement>(null);
//   const eyebrowRef = useRef<HTMLDivElement>(null);
//   // Three separate Copy refs — one per headline line for staggered word-mask reveal
//   const line1Ref = useRef<CopyHandle>(null);
//   const line2Ref = useRef<CopyHandle>(null);
//   const line3Ref = useRef<CopyHandle>(null);
//   const subRef = useRef<HTMLDivElement>(null);
//   const ctaRef = useRef<HTMLDivElement>(null);
//   const panelRef = useRef<HTMLDivElement>(null);
//   const tickerRef = useRef<HTMLDivElement>(null);
//   const tickerInnerRef = useRef<HTMLDivElement>(null);
//   const [countersActive, setCountersActive] = useState(false);

//   // Ticker loop
//   useEffect(() => {
//     const ticker = tickerInnerRef.current;
//     if (!ticker) return;

//     // Duplicate for seamless loop
//     const clone = ticker.cloneNode(true) as HTMLElement;
//     clone.setAttribute("aria-hidden", "true");
//     tickerRef.current?.appendChild(clone);

//     const totalWidth = ticker.scrollWidth;
//     let x = 0;
//     let rafId: number;
//     const speed = 0.55; // px per frame

//     const animate = () => {
//       x -= speed;
//       if (Math.abs(x) >= totalWidth) x = 0;
//       if (tickerRef.current) {
//         tickerRef.current.style.transform = `translateX(${x}px)`;
//       }
//       rafId = requestAnimationFrame(animate);
//     };

//     rafId = requestAnimationFrame(animate);
//     return () => cancelAnimationFrame(rafId);
//   }, []);

//   // GSAP animation orchestration
//   const runAnimation = (mode: AnimationMode) => {
//     const ease = mode === "reveal" ? "expo.out" : "power3.out";
//     const baseDuration = mode === "reveal" ? 0.9 : 0.65;
//     const baseDelay = mode === "reveal" ? 0.05 : 0.3;

//     const tl = gsap.timeline();

//     // Initial state for non-Copy elements
//     gsap.set([eyebrowRef.current, subRef.current, ctaRef.current], { y: 40, opacity: 0 });
//     gsap.set(panelRef.current, { x: 60, opacity: 0 });

//     // Eyebrow
//     tl.to(
//       eyebrowRef.current,
//       { y: 0, opacity: 1, duration: baseDuration * 0.7, ease },
//       baseDelay
//     );

//     // Headline — fire each Copy line's word-mask reveal with staggered delays.
//     const lineDelay = baseDelay + baseDuration * 0.3;
//     tl.call(() => {
//       // Counters activate in sync with the headline reveal
//       setCountersActive(true);
//       if (mode === "reveal") {
//         line1Ref.current?.play();
//         setTimeout(() => line2Ref.current?.play(), 100);
//         setTimeout(() => line3Ref.current?.play(), 200);
//       } else {
//         line1Ref.current?.fadeIn();
//         setTimeout(() => line2Ref.current?.fadeIn(), 80);
//         setTimeout(() => line3Ref.current?.fadeIn(), 160);
//       }
//     }, [], lineDelay);

//     // Sub + CTA — appear after headline words start landing
//     tl.to(
//       subRef.current,
//       { y: 0, opacity: 1, duration: baseDuration * 0.85, ease },
//       lineDelay + 0.55
//     );
//     tl.to(
//       ctaRef.current,
//       { y: 0, opacity: 1, duration: baseDuration * 0.75, ease },
//       lineDelay + 0.7
//     );

//     // Panel slides in from the right
//     tl.to(
//       panelRef.current,
//       { x: 0, opacity: 1, duration: baseDuration * 1.1, ease },
//       lineDelay + 0.2
//     );
//   };

//   useLayoutEffect(() => {
//     // Only hide non-Copy elements here — Copy manages its own word initial state internally
//     gsap.set([eyebrowRef.current, subRef.current, ctaRef.current], { opacity: 0, y: 40 });
//     gsap.set(panelRef.current, { opacity: 0 });

//     const unsub = registerAnimation(runAnimation);
//     return unsub;
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [registerAnimation]);

//   return (
//     <section
//       ref={sectionRef}
//       className="relative min-h-[92vh] flex flex-col overflow-hidden bg-background"
//     >
//       {/* ── Diagonal shard-echo geometry — SVG hairlines that mirror Preloader ── */}
//       <svg
//         className="absolute inset-0 w-full h-full pointer-events-none"
//         xmlns="http://www.w3.org/2000/svg"
//         aria-hidden="true"
//       >
//         {/* Mirror the preloader's 60%→80% shard boundary */}
//         <line
//           x1="60%"
//           y1="0%"
//           x2="80%"
//           y2="100%"
//           stroke="currentColor"
//           strokeWidth="0.5"
//           strokeOpacity="0.08"
//         />
//         {/* The main structural diagonal — right panel separator */}
//         <line
//           x1="58%"
//           y1="0%"
//           x2="77%"
//           y2="100%"
//           stroke="currentColor"
//           strokeWidth="0.5"
//           strokeOpacity="0.05"
//         />
//       </svg>

//       {/* ── Corner brackets (echo Preloader decor) ── */}
//       <svg
//         className="absolute top-6 left-6 pointer-events-none"
//         width="22"
//         height="22"
//         viewBox="0 0 28 28"
//         aria-hidden="true"
//         style={{ opacity: 0.2 }}
//       >
//         <path d="M 0 28 L 0 0 L 28 0" fill="none" stroke="currentColor" strokeWidth="1" />
//       </svg>
//       <svg
//         className="absolute top-6 right-6 pointer-events-none"
//         width="22"
//         height="22"
//         viewBox="0 0 28 28"
//         aria-hidden="true"
//         style={{ opacity: 0.2 }}
//       >
//         <path d="M 28 28 L 28 0 L 0 0" fill="none" stroke="currentColor" strokeWidth="1" />
//       </svg>

//       {/* ─── Main content grid ─────────────────────────────────────────────── */}
//       <div className="flex-1 container mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-0 items-center pt-24 pb-20 sm:pt-28 sm:pb-24 relative z-10">

//         {/* LEFT — Typographic core */}
//         <div className="flex flex-col justify-center max-w-3xl">

//           {/* Eyebrow — system label style from Preloader */}
//           <div ref={eyebrowRef} className="flex items-center gap-3 mb-8">
//             <div className="w-6 h-px bg-primary" />
//             <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
//               {t("hero.eyebrow", "Aid dispatch — Addis Ababa")}
//             </span>
//             {/* Live pulse dot */}
//             <span className="relative flex h-[6px] w-[6px]">
//               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
//               <span className="relative inline-flex rounded-full h-[6px] w-[6px] bg-primary" />
//             </span>
//           </div>

//           {/* Headline — three Copy word-mask reveals, coordinator-triggered */}
//           <div className="mb-8">
//             <h1 className="font-display font-black leading-[0.93] tracking-[-0.03em] text-[clamp(3rem,8.5vw,6.5rem)]">
//               <Copy ref={line1Ref} animateOnScroll={false} revealDelay={0} fadeDelay={0.3}>
//                 <span className="block text-foreground">
//                   {t("hero.line1", "Aid that")}
//                 </span>
//               </Copy>
//               <Copy ref={line2Ref} animateOnScroll={false} revealDelay={0} fadeDelay={0.38}>
//                 <span className="block text-foreground">
//                   {t("hero.line2", "actually")}
//                 </span>
//               </Copy>
//               <Copy ref={line3Ref} animateOnScroll={false} revealDelay={0} fadeDelay={0.46}>
//                 <span className="block text-primary">
//                   {t("hero.line3", "arrives.")}
//                 </span>
//               </Copy>
//             </h1>
//           </div>

//           {/* Sub */}
//           <p
//             ref={subRef}
//             className="text-[clamp(0.95rem,1.5vw,1.1rem)] leading-relaxed text-muted-foreground max-w-[42ch] mb-10"
//           >
//             {t(
//               "hero.subtitle",
//               "Amana connects donors directly with families in Addis Ababa. No black box. Every birr tracked, every family named."
//             )}
//           </p>

//           {/* CTAs */}
//           <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
//             <Link to="/payment">
//               <button className="group inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-7 h-12 rounded-xl hover:bg-primary/90 transition-colors shadow-md hover:shadow-glow">
//                 {t("hero.ctaPrimary", "Donate now")}
//                 <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
//               </button>
//             </Link>
//             <button
//               onClick={(e) => {
//                 e.preventDefault();
//                 lenis?.scrollTo("#impact");
//               }}
//               className="inline-flex items-center gap-2 border border-border text-foreground font-medium text-sm px-7 h-12 rounded-xl hover:bg-secondary/60 transition-colors"
//             >
//               {t("hero.ctaSecondary", "See our impact")}
//             </button>
//           </div>
//         </div>

//         {/* RIGHT — The field dispatch panel */}
//         <div
//           ref={panelRef}
//           className="hidden lg:flex flex-col self-stretch justify-center ml-16 xl:ml-24 relative"
//           style={{ minWidth: "260px" }}
//         >
//           {/* Vertical mono label */}
//           <div
//             className="absolute -left-5 top-1/2 -translate-y-1/2 font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40"
//             style={{ writingMode: "vertical-rl", transform: "translateY(-50%) rotate(180deg)" }}
//           >
//             FIELD / STATUS
//           </div>

//           {/* Panel header */}
//           <div className="border-t border-b border-border/50 py-3 mb-6">
//             <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/60 flex justify-between">
//               <span>AMANA / OS — v2.4.1</span>
//               <span>15°N 38°E</span>
//             </div>
//           </div>

//           {/* Live counters */}
//           <div className="flex flex-col gap-5 mb-8">
//             {COUNTER_TARGETS.map((item, i) => (
//               <CounterCard key={item.label} item={item} active={countersActive} index={i} />
//             ))}
//           </div>

//           {/* Campaign urgency bar */}
//           <div className="mt-auto">
//             <div className="flex justify-between items-baseline mb-2">
//             <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
//               {t("hero.counters.fundProgress", "FUND PROGRESS")}
//             </span>
//             <span className="font-mono text-[10px] text-foreground/60">62.5%</span>
//           </div>
//           <div className="h-[2px] w-full bg-border/60 rounded-full overflow-hidden">
//             <div
//               className="h-full bg-primary rounded-full transition-all duration-[1400ms] ease-out"
//               style={{ width: countersActive ? "62.5%" : "0%" }}
//             />
//           </div>
//           <p className="font-mono text-[9px] text-muted-foreground/40 mt-2 tracking-[0.1em]">
//             {t("hero.counters.raisedOf", "ETB {{raised}}K of {{goal}}K RAISED", { raised: 125, goal: 200 })}
//           </p>
//           </div>

//           {/* Corner bracket (decorative, panel-level) */}
//           <svg
//             className="absolute bottom-0 right-0"
//             width="16"
//             height="16"
//             viewBox="0 0 28 28"
//             aria-hidden="true"
//             style={{ opacity: 0.15 }}
//           >
//             <path d="M 28 0 L 28 28 L 0 28" fill="none" stroke="currentColor" strokeWidth="1.5" />
//           </svg>
//         </div>
//       </div>

//       {/* ── TICKER TAPE — The signature element ──────────────────────────────── */}
//       <div
//         className="relative z-10 border-t border-border/40 overflow-hidden select-none"
//         aria-hidden="true"
//       >
//         {/* Gradient fade masks at edges */}
//         <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
//           style={{ background: "linear-gradient(to right, hsl(var(--background)), transparent)" }}
//         />
//         <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
//           style={{ background: "linear-gradient(to left, hsl(var(--background)), transparent)" }}
//         />

//         <div
//           ref={tickerRef}
//           className="flex items-center will-change-transform py-3"
//           style={{ width: "max-content" }}
//         >
//           <div
//             ref={tickerInnerRef}
//             className="flex items-center gap-0 shrink-0"
//           >
//             {TICKER_ITEMS.map((item, i) => (
//               <div key={i} className="flex items-center shrink-0">
//                 <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 whitespace-nowrap px-4">
//                   {item}
//                 </span>
//                 <span className="text-muted-foreground/20 text-xs">◆</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// import React, { useRef, useLayoutEffect, useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import { useLenis } from "lenis/react";
// import { ArrowRight } from "lucide-react";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { useAnimationCoordinator, type AnimationMode } from "@/components/AnimationCoordinator";
// import Copy, { type CopyHandle } from "@/components/Copy";

// // ─── Domain-warped FBM shader — full-field organic noise, theme-aware ────────
// // Technique: Inigo Quilez's domain-warp FBM (noise fed into its own domain).
// // The result is soft, cloud-like flow fields — reads as living paper/watercolor.
// // Extremely subtle opacity so text is always the hero.
// // Mouse: offsets the warp domain for gentle parallax feel.
// // Scroll: drifts the Y coordinate, creating true vertical parallax.
// // Renders at 0.35× resolution — plenty for smooth noise, zero perf cost.

// function parseHsl(hslStr: string): [number, number, number] {
//   const parts = hslStr.trim().split(/\s+/);
//   const h = parseFloat(parts[0]) / 360;
//   const s = parseFloat(parts[1]) / 100;
//   const l = parseFloat(parts[2]) / 100;
//   const hue2rgb = (p: number, q: number, t: number) => {
//     if (t < 0) t += 1; if (t > 1) t -= 1;
//     if (t < 1/6) return p + (q - p) * 6 * t;
//     if (t < 1/2) return q;
//     if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
//     return p;
//   };
//   if (s === 0) return [l, l, l];
//   const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
//   const p = 2 * l - q;
//   return [hue2rgb(p, q, h + 1/3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1/3)];
// }

// function getCssColor(varName: string): [number, number, number] {
//   const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
//   return parseHsl(raw);
// }

// function isDarkMode(): boolean {
//   return document.documentElement.classList.contains("dark");
// }

// const VERT_SRC = `
// attribute vec2 a_pos;
// void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
// `;

// // Domain-warped FBM fragment shader.
// // u_mouse: normalized mouse position, used to subtly warp domain origin.
// // u_scroll: 0→1 scroll progress — drifts Y of domain for parallax.
// // u_dark: 1.0 = dark mode, 0.0 = light mode — adjusts opacity + tint.
// // u_c1/u_c2: primary teal + accent amber from CSS vars.
// const FRAG_SRC = `
// precision mediump float;

// uniform vec2  u_res;
// uniform vec2  u_mouse;   // normalized 0-1
// uniform float u_scroll;  // 0-1 scroll progress in section
// uniform float u_time;
// uniform float u_dark;    // 0 = light, 1 = dark
// uniform vec3  u_c1;      // primary color (teal)
// uniform vec3  u_c2;      // accent color (amber)

// // ── Hash + smooth noise (McGuire / Book of Shaders standard) ──
// float hash(vec2 p) {
//   return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
// }

// float noise(vec2 p) {
//   vec2 i = floor(p);
//   vec2 f = fract(p);
//   vec2 u = f * f * (3.0 - 2.0 * f); // smoothstep
//   return mix(
//     mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), u.x),
//     mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x),
//     u.y
//   );
// }

// // ── 4-octave FBM ──
// float fbm(vec2 p) {
//   float v = 0.0;
//   float a = 0.5;
//   vec2  shift = vec2(100.0);
//   mat2  rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
//   for (int i = 0; i < 4; i++) {
//     v += a * noise(p);
//     p  = rot * p * 2.1 + shift;
//     a *= 0.5;
//   }
//   return v;
// }

// void main() {
//   vec2 uv = gl_FragCoord.xy / u_res;
//   uv.y = 1.0 - uv.y;

//   // Aspect-correct coords for the noise domain
//   float aspect = u_res.x / u_res.y;
//   vec2 st = vec2(uv.x * aspect, uv.y);

//   // Slow autonomous time drift — very gentle
//   float t = u_time * 0.055;

//   // Mouse subtly displaces the warp origin (max ±0.04 units)
//   vec2 mouseWarp = (u_mouse - 0.5) * 0.08;

//   // Scroll parallax — drifts domain Y (0.18 units total across scroll range)
//   float scrollDrift = u_scroll * 0.18;

//   // ── Domain warp: feed one FBM into another's coordinates ──
//   // This is Inigo Quilez's "fbm( fbm( p ) )" technique.
//   // First warp pass
//   vec2 q = vec2(
//     fbm(st + vec2(0.00, 0.00) + t + mouseWarp),
//     fbm(st + vec2(5.20, 1.30) + t + mouseWarp)
//   );
//   // Second warp pass (domain warp proper) + scroll parallax
//   vec2 r = vec2(
//     fbm(st + 0.9 * q + vec2(1.70, 9.20) + t * 0.8 + vec2(0.0, scrollDrift)),
//     fbm(st + 0.9 * q + vec2(8.30, 2.80) + t * 0.8 + vec2(0.0, scrollDrift))
//   );

//   // Final noise value — centered and contrast-adjusted
//   float f = fbm(st + r);
//   f = smoothstep(0.2, 0.85, f);

//   // ── Colour mixing ──
//   // c1 (teal) dominates the mid-tones, c2 (amber) kisses the peaks.
//   vec3 col = mix(u_c1 * 0.6, u_c1, f)
//            + u_c2 * pow(f, 3.0) * 0.4;

//   // Opacity: much lower in light mode so it reads as breath, not paint.
//   // Dark mode can be slightly bolder since background is already dark.
//   float alpha = mix(0.055, 0.11, u_dark) * f;

//   gl_FragColor = vec4(col, alpha);
// }
// `;

// function useShaderBackground(
//   canvasRef: React.RefObject<HTMLCanvasElement>,
//   scrollProgressRef: React.MutableRefObject<number>
// ) {
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const gl = canvas.getContext("webgl", {
//       alpha: true,            // transparent canvas — bg-background shows through
//       premultipliedAlpha: false,
//       antialias: false,
//       powerPreference: "low-power",
//     });
//     if (!gl) return;

//     // Enable blending so the alpha in the shader actually composites
//     gl.enable(gl.BLEND);
//     gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

//     const compile = (type: number, src: string) => {
//       const sh = gl.createShader(type)!;
//       gl.shaderSource(sh, src);
//       gl.compileShader(sh);
//       if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
//         console.warn("[shader]", gl.getShaderInfoLog(sh));
//       }
//       return sh;
//     };
//     const prog = gl.createProgram()!;
//     gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT_SRC));
//     gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG_SRC));
//     gl.linkProgram(prog);
//     gl.useProgram(prog);

//     // Full-screen quad
//     const buf = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, buf);
//     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
//     const aPos = gl.getAttribLocation(prog, "a_pos");
//     gl.enableVertexAttribArray(aPos);
//     gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

//     // Uniform locations
//     const uRes    = gl.getUniformLocation(prog, "u_res");
//     const uMouse  = gl.getUniformLocation(prog, "u_mouse");
//     const uScroll = gl.getUniformLocation(prog, "u_scroll");
//     const uTime   = gl.getUniformLocation(prog, "u_time");
//     const uDark   = gl.getUniformLocation(prog, "u_dark");
//     const uC1     = gl.getUniformLocation(prog, "u_c1");
//     const uC2     = gl.getUniformLocation(prog, "u_c2");

//     // Adaptive render scale — desktop full quality, mobile lighter for battery
//     // Based on actual screen width, not matchMedia, so devtools docking never affects it
//     const getScale = () => window.screen.width <= 768 ? 0.25 : 0.35;

//     const resize = () => {
//       const SCALE = getScale();
//       canvas.width  = Math.floor(canvas.clientWidth  * SCALE);
//       canvas.height = Math.floor(canvas.clientHeight * SCALE);
//       gl.viewport(0, 0, canvas.width, canvas.height);
//     };
//     resize();
//     const ro = new ResizeObserver(resize);
//     ro.observe(canvas);

//     // Mouse — lerped, very gentle warp influence
//     let mouseTarget = { x: 0.5, y: 0.5 };
//     let mouseCurrent = { x: 0.5, y: 0.5 };
//     const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

//     const onMouseMove = (e: MouseEvent) => {
//       const rect = canvas.getBoundingClientRect();
//       mouseTarget.x = (e.clientX - rect.left)  / rect.width;
//       mouseTarget.y = (e.clientY - rect.top)    / rect.height;
//     };
//     window.addEventListener("mousemove", onMouseMove, { passive: true });

//     let rafId: number;

//     const render = (now: number) => {
//       const t = now * 0.001;

//       // Slow mouse lerp — 0.018 feels like air resistance
//       mouseCurrent.x = lerp(mouseCurrent.x, mouseTarget.x, 0.018);
//       mouseCurrent.y = lerp(mouseCurrent.y, mouseTarget.y, 0.018);

//       const dark = isDarkMode() ? 1.0 : 0.0;
//       const c1 = getCssColor("--primary");
//       const c2 = getCssColor("--accent");

//       gl.clearColor(0, 0, 0, 0);
//       gl.clear(gl.COLOR_BUFFER_BIT);

//       gl.uniform2f(uRes,    canvas.width, canvas.height);
//       gl.uniform2f(uMouse,  mouseCurrent.x, mouseCurrent.y);
//       gl.uniform1f(uScroll, scrollProgressRef.current);
//       gl.uniform1f(uTime,   t);
//       gl.uniform1f(uDark,   dark);
//       gl.uniform3fv(uC1,    c1);
//       gl.uniform3fv(uC2,    c2);

//       gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
//       rafId = requestAnimationFrame(render);
//     };

//     rafId = requestAnimationFrame(render);

//     return () => {
//       cancelAnimationFrame(rafId);
//       window.removeEventListener("mousemove", onMouseMove);
//       ro.disconnect();
//       gl.deleteProgram(prog);
//       gl.deleteBuffer(buf);
//     };
//   }, [canvasRef, scrollProgressRef]);
// }


// const TICKER_ITEMS = [
//   "78 families supported this quarter",
//   "ቤተሰቦች",
//   "Urgent: 17 pending aid requests",
//   "ምሕረት",
//   "Food distribution — Bole, Addis Ababa",
//   "ተስፋ",
//   "Donor threshold reached: ETB 2.4M",
//   "ሰላም",
//   "New campaign live — education fund",
//   "ፍቅር",
//   "Medical supply convoy dispatched",
//   "አሚን",
// ];

// // ─── The diagonal shard boundary angles match the Preloader's SLICES exactly ──
// // Preloader shard lines: 20/40/60/80% x-intercepts top → 40/60/80/100% x-intercepts bottom
// // We mirror the rightmost shard boundary for the panel clip

// const COUNTER_TARGETS = [
//   { value: 78, label: t("hero.counters.families", "Families"), sublabel: t("hero.counters.familiesSub", "directly supported") },
//   { value: 24, label: t("hero.counters.events", "Events"), sublabel: t("hero.counters.eventsSub", "this year") },
//   { value: 125, label: t("hero.counters.raised", "ETB (K)"), sublabel: t("hero.counters.raisedSub", "raised to date") },
// ];

// function useCountUp(target: number, duration = 1.6, start = false) {
//   const [count, setCount] = useState(0);
//   useEffect(() => {
//     if (!start) return;
//     const startTime = performance.now();
//     const raf = (now: number) => {
//       const elapsed = (now - startTime) / 1000;
//       const t = Math.min(elapsed / duration, 1);
//       // ease out expo
//       const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
//       setCount(Math.round(eased * target));
//       if (t < 1) requestAnimationFrame(raf);
//     };
//     requestAnimationFrame(raf);
//   }, [start, target, duration]);
//   return count;
// }

// function CounterCard({
//   item,
//   active,
//   index,
// }: {
//   item: { value: number; labelKey: string; label: string; sublabelKey: string; sublabel: string; };
//   active: boolean;
//   index: number;
// }) {
//   const count = useCountUp(item.value, 1.4 + index * 0.2, active);
//   return (
//     <div className="border-l border-border/60 pl-4 py-1">
//       <div className="font-display font-black text-[clamp(1.6rem,3.5vw,2.6rem)] leading-none tabular-nums text-foreground">
//         {count}
//         {item.label === "ETB (K)" && "K"}
//       </div>
//       <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
//         {item.label}
//         <span className="block text-muted-foreground/50 tracking-[0.1em] normal-case font-sans text-[10px] mt-0.5">
//           {item.sublabel}
//         </span>
//       </div>
//     </div>
//   );
// }

// export default function HeroSection() {
//   const { t } = useTranslation();
//   const lenis = useLenis();
//   const { registerAnimation } = useAnimationCoordinator();

//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const sectionRef = useRef<HTMLElement>(null);
//   // Ref instead of state — written every scroll frame, read in rAF loop, no re-render needed
//   const scrollProgressRef = useRef<number>(0);
//   useShaderBackground(canvasRef, scrollProgressRef);

//   // Wire ScrollTrigger to update scrollProgressRef for shader parallax
//   useEffect(() => {
//     gsap.registerPlugin(ScrollTrigger);
//     const section = sectionRef.current;
//     if (!section) return;
//     const st = ScrollTrigger.create({
//       trigger: section,
//       start: "top top",
//       end: "bottom top",
//       onUpdate: (self) => { scrollProgressRef.current = self.progress; },
//     });
//     return () => st.kill();
//   }, []);

//   // Refs for GSAP targets
//   const eyebrowRef = useRef<HTMLDivElement>(null);
//   // Three separate Copy refs — one per headline line for staggered word-mask reveal
//   const line1Ref = useRef<CopyHandle>(null);
//   const line2Ref = useRef<CopyHandle>(null);
//   const line3Ref = useRef<CopyHandle>(null);
//   const subRef = useRef<HTMLDivElement>(null);
//   const ctaRef = useRef<HTMLDivElement>(null);
//   const panelRef = useRef<HTMLDivElement>(null);
//   const tickerRef = useRef<HTMLDivElement>(null);
//   const tickerInnerRef = useRef<HTMLDivElement>(null);
//   const [countersActive, setCountersActive] = useState(false);

//   // Ticker loop
//   useEffect(() => {
//     const ticker = tickerInnerRef.current;
//     if (!ticker) return;

//     // Duplicate for seamless loop
//     const clone = ticker.cloneNode(true) as HTMLElement;
//     clone.setAttribute("aria-hidden", "true");
//     tickerRef.current?.appendChild(clone);

//     const totalWidth = ticker.scrollWidth;
//     let x = 0;
//     let rafId: number;
//     const speed = 0.55; // px per frame

//     const animate = () => {
//       x -= speed;
//       if (Math.abs(x) >= totalWidth) x = 0;
//       if (tickerRef.current) {
//         tickerRef.current.style.transform = `translateX(${x}px)`;
//       }
//       rafId = requestAnimationFrame(animate);
//     };

//     rafId = requestAnimationFrame(animate);
//     return () => cancelAnimationFrame(rafId);
//   }, []);

//   // GSAP animation orchestration
//   const runAnimation = (mode: AnimationMode) => {
//     const ease = mode === "reveal" ? "expo.out" : "power3.out";
//     const baseDuration = mode === "reveal" ? 0.9 : 0.65;
//     const baseDelay = mode === "reveal" ? 0.05 : 0.3;

//     const tl = gsap.timeline();

//     // Initial state for non-Copy elements
//     gsap.set([eyebrowRef.current, subRef.current, ctaRef.current], { y: 40, opacity: 0 });
//     gsap.set(panelRef.current, { x: 60, opacity: 0 });

//     // Eyebrow
//     tl.to(
//       eyebrowRef.current,
//       { y: 0, opacity: 1, duration: baseDuration * 0.7, ease },
//       baseDelay
//     );

//     // Headline — fire each Copy line's word-mask reveal with staggered delays.
//     const lineDelay = baseDelay + baseDuration * 0.3;
//     tl.call(() => {
//       // Counters activate in sync with the headline reveal
//       setCountersActive(true);
//       if (mode === "reveal") {
//         line1Ref.current?.play();
//         setTimeout(() => line2Ref.current?.play(), 100);
//         setTimeout(() => line3Ref.current?.play(), 200);
//       } else {
//         line1Ref.current?.fadeIn();
//         setTimeout(() => line2Ref.current?.fadeIn(), 80);
//         setTimeout(() => line3Ref.current?.fadeIn(), 160);
//       }
//     }, [], lineDelay);

//     // Sub + CTA — appear after headline words start landing
//     tl.to(
//       subRef.current,
//       { y: 0, opacity: 1, duration: baseDuration * 0.85, ease },
//       lineDelay + 0.55
//     );
//     tl.to(
//       ctaRef.current,
//       { y: 0, opacity: 1, duration: baseDuration * 0.75, ease },
//       lineDelay + 0.7
//     );

//     // Panel slides in from the right
//     tl.to(
//       panelRef.current,
//       { x: 0, opacity: 1, duration: baseDuration * 1.1, ease },
//       lineDelay + 0.2
//     );
//   };

//   useLayoutEffect(() => {
//     // Only hide non-Copy elements here — Copy manages its own word initial state internally
//     gsap.set([eyebrowRef.current, subRef.current, ctaRef.current], { opacity: 0, y: 40 });
//     gsap.set(panelRef.current, { opacity: 0 });

//     const unsub = registerAnimation(runAnimation);
//     return unsub;
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [registerAnimation]);

//   return (
//     <section
//       ref={sectionRef}
//       className="relative min-h-[92vh] flex flex-col overflow-hidden bg-background"
//     >
//       {/* ── WebGL shader background — minimal mouse-reactive blobs ── */}
//       <canvas
//         ref={canvasRef}
//         aria-hidden="true"
//         className="absolute inset-0 w-full h-full pointer-events-none"
//         style={{ zIndex: 0, imageRendering: "auto" }}
//       />

//       {/* ── Diagonal shard-echo geometry — SVG hairlines that mirror Preloader ── */}
//       <svg
//         className="absolute inset-0 w-full h-full pointer-events-none"
//         xmlns="http://www.w3.org/2000/svg"
//         aria-hidden="true"
//       >
//         {/* Mirror the preloader's 60%→80% shard boundary */}
//         <line
//           x1="60%"
//           y1="0%"
//           x2="80%"
//           y2="100%"
//           stroke="currentColor"
//           strokeWidth="0.5"
//           strokeOpacity="0.08"
//         />
//         {/* The main structural diagonal — right panel separator */}
//         <line
//           x1="58%"
//           y1="0%"
//           x2="77%"
//           y2="100%"
//           stroke="currentColor"
//           strokeWidth="0.5"
//           strokeOpacity="0.05"
//         />
//       </svg>

//       {/* ── Corner brackets (echo Preloader decor) ── */}
//       <svg
//         className="absolute top-6 left-6 pointer-events-none"
//         width="22"
//         height="22"
//         viewBox="0 0 28 28"
//         aria-hidden="true"
//         style={{ opacity: 0.2 }}
//       >
//         <path d="M 0 28 L 0 0 L 28 0" fill="none" stroke="currentColor" strokeWidth="1" />
//       </svg>
//       <svg
//         className="absolute top-6 right-6 pointer-events-none"
//         width="22"
//         height="22"
//         viewBox="0 0 28 28"
//         aria-hidden="true"
//         style={{ opacity: 0.2 }}
//       >
//         <path d="M 28 28 L 28 0 L 0 0" fill="none" stroke="currentColor" strokeWidth="1" />
//       </svg>

//       {/* ─── Main content grid ─────────────────────────────────────────────── */}
//       <div className="flex-1 container mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-0 items-center pt-24 pb-20 sm:pt-28 sm:pb-24 relative z-10">

//         {/* LEFT — Typographic core */}
//         <div className="flex flex-col justify-center max-w-3xl">

//           {/* Eyebrow — system label style from Preloader */}
//           <div ref={eyebrowRef} className="flex items-center gap-3 mb-8">
//             <div className="w-6 h-px bg-primary" />
//             <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
//               {t("hero.eyebrow", "Aid dispatch — Addis Ababa")}
//             </span>
//             {/* Live pulse dot */}
//             <span className="relative flex h-[6px] w-[6px]">
//               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
//               <span className="relative inline-flex rounded-full h-[6px] w-[6px] bg-primary" />
//             </span>
//           </div>

//           {/* Headline — three Copy word-mask reveals, coordinator-triggered */}
//           <div className="mb-8">
//             <h1 className="font-display font-black leading-[0.93] tracking-[-0.03em] text-[clamp(3rem,8.5vw,6.5rem)]">
//               <Copy ref={line1Ref} animateOnScroll={false} revealDelay={0} fadeDelay={0.3}>
//                 <span className="block text-foreground">
//                   {t("hero.line1", "Aid that")}
//                 </span>
//               </Copy>
//               <Copy ref={line2Ref} animateOnScroll={false} revealDelay={0} fadeDelay={0.38}>
//                 <span className="block text-foreground">
//                   {t("hero.line2", "actually")}
//                 </span>
//               </Copy>
//               <Copy ref={line3Ref} animateOnScroll={false} revealDelay={0} fadeDelay={0.46}>
//                 <span className="block text-primary">
//                   {t("hero.line3", "arrives.")}
//                 </span>
//               </Copy>
//             </h1>
//           </div>

//           {/* Sub */}
//           <p
//             ref={subRef}
//             className="text-[clamp(0.95rem,1.5vw,1.1rem)] leading-relaxed text-muted-foreground max-w-[42ch] mb-10"
//           >
//             {t(
//               "hero.subtitle",
//               "Amana connects donors directly with families in Addis Ababa. No black box. Every birr tracked, every family named."
//             )}
//           </p>

//           {/* CTAs */}
//           <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
//             <Link to="/payment">
//               <button className="group inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-7 h-12 rounded-xl hover:bg-primary/90 transition-colors shadow-md hover:shadow-glow">
//                 {t("hero.ctaPrimary", "Donate now")}
//                 <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
//               </button>
//             </Link>
//             <button
//               onClick={(e) => {
//                 e.preventDefault();
//                 lenis?.scrollTo("#impact");
//               }}
//               className="inline-flex items-center gap-2 border border-border text-foreground font-medium text-sm px-7 h-12 rounded-xl hover:bg-secondary/60 transition-colors"
//             >
//               {t("hero.ctaSecondary", "See our impact")}
//             </button>
//           </div>
//         </div>

//         {/* RIGHT — The field dispatch panel */}
//         <div
//           ref={panelRef}
//           className="hidden lg:flex flex-col self-stretch justify-center ml-16 xl:ml-24 relative"
//           style={{ minWidth: "260px" }}
//         >
//           {/* Vertical mono label */}
//           <div
//             className="absolute -left-5 top-1/2 -translate-y-1/2 font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40"
//             style={{ writingMode: "vertical-rl", transform: "translateY(-50%) rotate(180deg)" }}
//           >
//             FIELD / STATUS
//           </div>

//           {/* Panel header */}
//           <div className="border-t border-b border-border/50 py-3 mb-6">
//             <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/60 flex justify-between">
//               <span>AMANA / OS — v2.4.1</span>
//               <span>15°N 38°E</span>
//             </div>
//           </div>

//           {/* Live counters */}
//           <div className="flex flex-col gap-5 mb-8">
//             {COUNTER_TARGETS.map((item, i) => (
//               <CounterCard key={item.label} item={item} active={countersActive} index={i} />
//             ))}
//           </div>

//           {/* Campaign urgency bar */}
//           <div className="mt-auto">
//             <div className="flex justify-between items-baseline mb-2">
//             <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
//               {t("hero.counters.fundProgress", "FUND PROGRESS")}
//             </span>
//             <span className="font-mono text-[10px] text-foreground/60">62.5%</span>
//           </div>
//           <div className="h-[2px] w-full bg-border/60 rounded-full overflow-hidden">
//             <div
//               className="h-full bg-primary rounded-full transition-all duration-[1400ms] ease-out"
//               style={{ width: countersActive ? "62.5%" : "0%" }}
//             />
//           </div>
//           <p className="font-mono text-[9px] text-muted-foreground/40 mt-2 tracking-[0.1em]">
//             {t("hero.counters.raisedOf", "ETB {{raised}}K of {{goal}}K RAISED", { raised: 125, goal: 200 })}
//           </p>
//           </div>

//           {/* Corner bracket (decorative, panel-level) */}
//           <svg
//             className="absolute bottom-0 right-0"
//             width="16"
//             height="16"
//             viewBox="0 0 28 28"
//             aria-hidden="true"
//             style={{ opacity: 0.15 }}
//           >
//             <path d="M 28 0 L 28 28 L 0 28" fill="none" stroke="currentColor" strokeWidth="1.5" />
//           </svg>
//         </div>
//       </div>

//       {/* ── TICKER TAPE — The signature element ──────────────────────────────── */}
//       <div
//         className="relative z-10 border-t border-border/40 overflow-hidden select-none"
//         aria-hidden="true"
//       >
//         {/* Gradient fade masks at edges */}
//         <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
//           style={{ background: "linear-gradient(to right, hsl(var(--background)), transparent)" }}
//         />
//         <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
//           style={{ background: "linear-gradient(to left, hsl(var(--background)), transparent)" }}
//         />

//         <div
//           ref={tickerRef}
//           className="flex items-center will-change-transform py-3"
//           style={{ width: "max-content" }}
//         >
//           <div
//             ref={tickerInnerRef}
//             className="flex items-center gap-0 shrink-0"
//           >
//             {TICKER_ITEMS.map((item, i) => (
//               <div key={i} className="flex items-center shrink-0">
//                 <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 whitespace-nowrap px-4">
//                   {item}
//                 </span>
//                 <span className="text-muted-foreground/20 text-xs">◆</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// import React, { useRef, useLayoutEffect, useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import { useLenis } from "lenis/react";
// import { ArrowRight } from "lucide-react";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { useAnimationCoordinator, type AnimationMode } from "@/components/AnimationCoordinator";
// // import Copy, { type CopyHandle } from "@/components/Copy";

// // ─── Domain-warped FBM shader — full-field organic noise, theme-aware ────────
// // Technique: Inigo Quilez's domain-warp FBM (noise fed into its own domain).
// // The result is soft, cloud-like flow fields — reads as living paper/watercolor.
// // Extremely subtle opacity so text is always the hero.
// // Mouse: offsets the warp domain for gentle parallax feel.
// // Scroll: drifts the Y coordinate, creating true vertical parallax.
// // Renders at 0.35× resolution — plenty for smooth noise, zero perf cost.

// // function parseHsl(hslStr: string): [number, number, number] {
// //   const parts = hslStr.trim().split(/\s+/);
// //   const h = parseFloat(parts[0]) / 360;
// //   const s = parseFloat(parts[1]) / 100;
// //   const l = parseFloat(parts[2]) / 100;
// //   const hue2rgb = (p: number, q: number, t: number) => {
// //     if (t < 0) t += 1; if (t > 1) t -= 1;
// //     if (t < 1/6) return p + (q - p) * 6 * t;
// //     if (t < 1/2) return q;
// //     if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
// //     return p;
// //   };
// //   if (s === 0) return [l, l, l];
// //   const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
// //   const p = 2 * l - q;
// //   return [hue2rgb(p, q, h + 1/3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1/3)];
// // }


// function parseHsl(hslStr: string): [number, number, number] {
//   if (!hslStr) return [0, 0, 0]; // Fallback to black if CSS isn't loaded yet
  
//   // Splits by space OR comma to be extra safe against different CSS formats
//   const parts = hslStr.trim().split(/[\s,]+/); 
//   const h = parseFloat(parts[0]) / 360;
//   const s = parseFloat(parts[1]) / 100;
//   const l = parseFloat(parts[2]) / 100;

//   // If parsing fails, return a safe fallback to prevent NaN poisoning
//   if (isNaN(h) || isNaN(s) || isNaN(l)) return [0, 0, 0];

//   const hue2rgb = (p: number, q: number, t: number) => {
//     if (t < 0) t += 1; if (t > 1) t -= 1;
//     if (t < 1/6) return p + (q - p) * 6 * t;
//     if (t < 1/2) return q;
//     if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
//     return p;
//   };
  
//   if (s === 0) return [l, l, l];
//   const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
//   const p = 2 * l - q;
//   return [hue2rgb(p, q, h + 1/3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1/3)];
// }

// function getCssColor(varName: string): [number, number, number] {
//   const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
//   return parseHsl(raw);
// }

// function isDarkMode(): boolean {
//   return document.documentElement.classList.contains("dark");
// }

// const VERT_SRC = `
// attribute vec2 a_pos;
// void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
// `;

// // Domain-warped FBM fragment shader — confirmed working.
// // u_mouse: normalized mouse position, used to subtly warp domain origin.
// // u_scroll: 0→1 scroll progress — drifts Y of domain for parallax.
// // u_dark: 1.0 = dark mode, 0.0 = light mode — adjusts opacity + tint.
// // u_c1/u_c2: primary teal + accent amber from CSS vars.
// const FRAG_SRC = `
// precision mediump float;

// uniform vec2  u_res;
// uniform vec2  u_mouse;
// uniform float u_scroll;
// uniform float u_time;
// uniform float u_dark;
// uniform vec3  u_c1;
// uniform vec3  u_c2;

// float hash(vec2 p) {
//   return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
// }

// float noise(vec2 p) {
//   vec2 i = floor(p);
//   vec2 f = fract(p);
//   vec2 u = f * f * (3.0 - 2.0 * f);
//   return mix(
//     mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), u.x),
//     mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x),
//     u.y
//   );
// }

// // FBM — amplitude starts at 1.0, normalized by theoretical max (1.875)
// // so output is a true [0, 1] range. Critical fix vs prior version.
// float fbm(vec2 p) {
//   float v = 0.0;
//   float a = 1.0;
//   vec2  shift = vec2(100.0);
//   mat2  rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
//   for (int i = 0; i < 4; i++) {
//     v += a * noise(p);
//     p  = rot * p * 2.1 + shift;
//     a *= 0.5;
//   }
//   return v / 1.875;
// }

// void main() {
//   // 1. Normalize and fix aspect ratio immediately
//   // We divide by u_res.y to ensure the vertical scale is 1.0 
//   // and the horizontal scale adjusts based on the container width.
//   vec2 st = gl_FragCoord.xy / u_res.y;

//   // 2. Dynamic Zoom: Apply to the already aspect-corrected coordinate
//   float zoom = u_res.x < u_res.y ? 1.5 : 1.0;
//   st *= zoom;

//   // Center the coordinates (Optional but recommended for swirling effects)
//   // This ensures the "zoom" happens from the middle, not the bottom-left corner
//   st -= 0.5 * vec2(u_res.x / u_res.y * zoom, zoom);

//   float t = u_time * 0.04;
//   vec2 mouseWarp = (u_mouse - 0.5) * 0.12;
//   float scrollDrift = u_scroll * 0.22;

//   // 3. Noise generation (using your st)
//   vec2 q = vec2(
//     fbm(st + t + mouseWarp + vec2(0.0, scrollDrift * 0.3)),
//     fbm(st + vec2(5.20, 1.30) + t + mouseWarp + vec2(0.0, scrollDrift * 0.3))
//   );

//   float f = fbm(st + 0.7 * q + vec2(0.0, scrollDrift * 0.5) + t * 0.6);
//   // f = pow(f, 0.8);

//   // // 4. Color and Alpha
//   // // vec3 col = mix(u_c1 * 0.5, u_c1 * 1.1, f) + u_c2 * pow(f, 4.0) * 0.35;
//   // // float alpha = mix(0.12, 0.20, u_dark) * f;
//   // // 4. Color and Alpha
//   // // Light mode needs more contrast against a light backdrop than dark mode does
//   // // against near-black — same alpha reads very differently depending on surface.
//   // vec3 col = mix(u_c1 * 0.55, u_c1 * 1.05, f) + u_c2 * pow(f, 4.0) * mix(0.55, 0.35, u_dark);
//   // float alpha = mix(0.4, 0.15, u_dark) * f;
//   f = pow(f, 0.8);

// // Contrast-boosted version — only used for light mode, where noise needs to
// // read as distinct light/dark passages instead of flat gray. Dark mode keeps
// // using raw f untouched, since that's the version you're already happy with.
// float fc = smoothstep(0.30, 0.70, f);

// // ── Dark mode — exactly the values you confirmed look good. Untouched. ──
// vec3  colDark   = mix(u_c1 * 0.55, u_c1 * 1.05, f) + u_c2 * pow(f, 4.0) * 0.35;
// float alphaDark = 0.15 * f;

// // ── Light mode — wider contrast range, separate from dark mode entirely. ──
// vec3  colLight   = mix(u_c1 * 2.6, u_c1 * 3.1, fc) + u_c2 * pow(fc, 3.0) * 0.45;
// float alphaLight = 0.25 * mix(0.4, 1.0, fc);

// // Select branch by mode — no shared range, no cross-contamination.
// vec3  col   = mix(colLight, colDark, u_dark);
// float alpha = mix(alphaLight, alphaDark, u_dark);

// gl_FragColor = vec4(col * alpha, alpha);

//   gl_FragColor = vec4(col * alpha, alpha);
// }
// `;

// const i = 1;


// function useShaderBackground(
//   canvasRef: React.RefObject<HTMLCanvasElement>,
//   scrollProgressRef: React.MutableRefObject<number>
// ) {
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const gl = canvas.getContext("webgl", {
//       alpha: true,
//       premultipliedAlpha: true,
//       antialias: false,
//       powerPreference: "low-power",
//     });
//     if (!gl) return;

//     const compile = (type: number, src: string) => {
//       const sh = gl.createShader(type)!;
//       gl.shaderSource(sh, src);
//       gl.compileShader(sh);
//       if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
//         console.warn("[shader]", gl.getShaderInfoLog(sh));
//       }
//       return sh;
//     };
    
//     const prog = gl.createProgram()!;
//     gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT_SRC));
//     gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG_SRC));
//     gl.linkProgram(prog);
//     gl.useProgram(prog);

//     const buf = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, buf);
//     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
//     const aPos = gl.getAttribLocation(prog, "a_pos");
//     gl.enableVertexAttribArray(aPos);
//     gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

//     const uRes    = gl.getUniformLocation(prog, "u_res");
//     const uMouse  = gl.getUniformLocation(prog, "u_mouse");
//     const uScroll = gl.getUniformLocation(prog, "u_scroll");
//     const uTime   = gl.getUniformLocation(prog, "u_time");
//     const uDark   = gl.getUniformLocation(prog, "u_dark");
//     const uC1     = gl.getUniformLocation(prog, "u_c1");
//     const uC2     = gl.getUniformLocation(prog, "u_c2");

//     const getScale = () => window.screen.width <= 768 ? 0.25 : 0.35;

//     const resize = () => {
//       if (!canvas) return;
//       const SCALE = getScale();
//       canvas.width  = Math.floor(canvas.clientWidth  * SCALE);
//       canvas.height = Math.floor(canvas.clientHeight * SCALE);
//       gl.viewport(0, 0, canvas.width, canvas.height);
//     };
    
//     resize();
//     const ro = new ResizeObserver(resize);
//     ro.observe(canvas);

//     let mouseTarget = { x: 0.5, y: 0.5 };
//     let mouseCurrent = { x: 0.5, y: 0.5 };
//     const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

//     const onMouseMove = (e: MouseEvent) => {
//       const rect = canvas.getBoundingClientRect();
//       mouseTarget.x = (e.clientX - rect.left) / rect.width;
//       mouseTarget.y = (e.clientY - rect.top) / rect.height;
//     };
//     window.addEventListener("mousemove", onMouseMove, { passive: true });

//     // Track state of CSS variables to handle the initial load race condition
//     let cachedDark = isDarkMode();
//     let hasFoundValidColors = false;
//     let cachedC1: [number, number, number] = [0, 0, 0];
//     let cachedC2: [number, number, number] = [0, 0, 0];

//     const updateColors = () => {
//       // cachedDark = isDarkMode();
//       // const rawC1 = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
//       // const rawC2 = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      
//       // // Only flag as found if the CSS has actually loaded and populated the variables
//       // if (rawC1 && rawC2) {
//       //   hasFoundValidColors = true;
//       //   cachedC1 = parseHsl(rawC1);
//       //   cachedC2 = parseHsl(rawC2);
//       // }

//       cachedDark = isDarkMode();
//       // Light mode: use the foreground/text color so the shader reads as a soft
//       // ink-like wash tied to the typography, instead of teal competing with
//       // the CTA accent color against the cream background.
//       // Dark mode: keep primary teal — it already reads well against near-black.
//       const c1Var = cachedDark ? "--primary" : "--foreground";
//       const c2Var = cachedDark ? "--accent" : "--muted-foreground";
//       const rawC1 = getComputedStyle(document.documentElement).getPropertyValue(c1Var).trim();
//       const rawC2 = getComputedStyle(document.documentElement).getPropertyValue(c2Var).trim();

//       if (rawC1 && rawC2) {
//         hasFoundValidColors = true;
//         cachedC1 = parseHsl(rawC1);
//         cachedC2 = parseHsl(rawC2);
//       }
//     };

//     // Initial fetch attempt
//     updateColors();

//     let rafId: number;

//     const render = (now: number) => {
//       // 1. FIX ROUTE TRANSITION RACE: 
//       // Force resize if dimensions are out of sync (e.g., missed by ResizeObserver during page transition)
//       const expectedW = Math.floor(canvas.clientWidth * getScale());
//       const expectedH = Math.floor(canvas.clientHeight * getScale());
//       if (canvas.width !== expectedW || canvas.height !== expectedH) {
//         resize();
//       }

//       // 2. FIX CSS RACE:
//       // Keep trying to fetch colors if the first attempt returned empty strings
//       const currentDark = isDarkMode();
//       if (!hasFoundValidColors || currentDark !== cachedDark) {
//         updateColors();
//       }

//       const t = now * 0.001;

//       mouseCurrent.x = lerp(mouseCurrent.x, mouseTarget.x, 0.018);
//       mouseCurrent.y = lerp(mouseCurrent.y, mouseTarget.y, 0.018);

//       gl.clearColor(0, 0, 0, 0);
//       gl.clear(gl.COLOR_BUFFER_BIT);

//       gl.uniform2f(uRes, canvas.width, canvas.height);
//       gl.uniform2f(uMouse, mouseCurrent.x, mouseCurrent.y);
//       gl.uniform1f(uScroll, scrollProgressRef.current);
//       gl.uniform1f(uTime, t);
//       gl.uniform1f(uDark, cachedDark ? 1.0 : 0.0);
//       gl.uniform3fv(uC1, cachedC1);
//       gl.uniform3fv(uC2, cachedC2);

//       gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
//       rafId = requestAnimationFrame(render);
//     };

//     rafId = requestAnimationFrame(render);

//     return () => {
//       cancelAnimationFrame(rafId);
//       window.removeEventListener("mousemove", onMouseMove);
//       ro.disconnect();
//       gl.deleteProgram(prog);
//       gl.deleteBuffer(buf);
//     };
//   }, [canvasRef, scrollProgressRef]);
// }
// const TICKER_ITEMS = [
//   "78 families supported this quarter",
//   "ቤተሰቦች",
//   "Urgent: 17 pending aid requests",
//   "ምሕረት",
//   "Food distribution — Bole, Addis Ababa",
//   "ተስፋ",
//   "Donor threshold reached: ETB 2.4M",
//   "ሰላም",
//   "New campaign live — education fund",
//   "ፍቅር",
//   "Medical supply convoy dispatched",
//   "አሚን",
// ];

// // ─── The diagonal shard boundary angles match the Preloader's SLICES exactly ──
// // Preloader shard lines: 20/40/60/80% x-intercepts top → 40/60/80/100% x-intercepts bottom
// // We mirror the rightmost shard boundary for the panel clip

// const COUNTER_TARGETS = [
//   { value: 78, label: t("hero.counters.families", "Families"), sublabel: t("hero.counters.familiesSub", "directly supported") },
//   { value: 24, label: t("hero.counters.events", "Events"), sublabel: t("hero.counters.eventsSub", "this year") },
//   { value: 125, label: t("hero.counters.raised", "ETB (K)"), sublabel: t("hero.counters.raisedSub", "raised to date") },
// ];

// function useCountUp(target: number, duration = 1.6, start = false) {
//   const [count, setCount] = useState(0);
//   useEffect(() => {
//     if (!start) return;
//     const startTime = performance.now();
//     const raf = (now: number) => {
//       const elapsed = (now - startTime) / 1000;
//       const t = Math.min(elapsed / duration, 1);
//       // ease out expo
//       const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
//       setCount(Math.round(eased * target));
//       if (t < 1) requestAnimationFrame(raf);
//     };
//     requestAnimationFrame(raf);
//   }, [start, target, duration]);
//   return count;
// }

// function CounterCard({
//   item,
//   active,
//   index,
// }: {
//   item: { value: number; labelKey: string; label: string; sublabelKey: string; sublabel: string; };
//   active: boolean;
//   index: number;
// }) {
//   const count = useCountUp(item.value, 1.4 + index * 0.2, active);
//   return (
//     <div className="border-l border-border/60 pl-4 py-1">
//       <div className="font-display font-black text-[clamp(1.6rem,3.5vw,2.6rem)] leading-none tabular-nums text-foreground">
//         {count}
//         {item.label === "ETB (K)" && "K"}
//       </div>
//       <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
//         {item.label}
//         <span className="block text-muted-foreground/50 tracking-[0.1em] normal-case font-sans text-[10px] mt-0.5">
//           {item.sublabel}
//         </span>
//       </div>
//     </div>
//   );
// }

// // Splits a line into individual masked words instead of masking the whole
// // line as one block — this is what actually reads as a tight, cascading
// // reveal rather than three big blocks landing one after another.
// function MaskedWords({
//   text,
//   className,
//   wordRefs,
// }: {
//   text: string;
//   className: string;
//   wordRefs: React.MutableRefObject<HTMLSpanElement[]>;
// }) {
//   const words = text.split(" ");
//   return (
//     <span className="block">
//       {words.map((word, idx) => (
//         <span key={idx} className="inline-block overflow-hidden align-top">
//           <span
//             ref={(el) => {
//               if (el) wordRefs.current[idx] = el;
//             }}
//             className={`inline-block will-change-transform ${className}`}
//           >
//             {word}
//             {idx < words.length - 1 ? "\u00A0" : ""}
//           </span>
//         </span>
//       ))}
//     </span>
//   );
// }

// export default function HeroSection() {
//   const { t } = useTranslation();
//   const lenis = useLenis();
//   const { registerAnimation } = useAnimationCoordinator();

//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const sectionRef = useRef<HTMLElement>(null);
//   // Ref instead of state — written every scroll frame, read in rAF loop, no re-render needed
//   const scrollProgressRef = useRef<number>(0);
//   useShaderBackground(canvasRef, scrollProgressRef);

//   // Wire ScrollTrigger to update scrollProgressRef for shader parallax
//   useEffect(() => {
//     gsap.registerPlugin(ScrollTrigger);
//     const section = sectionRef.current;
//     if (!section) return;
//     const st = ScrollTrigger.create({
//       trigger: section,
//       start: "top top",
//       end: "bottom top",
//       onUpdate: (self) => { scrollProgressRef.current = self.progress; },
//     });
//     return () => st.kill();
//   }, []);

//   // Refs for GSAP targets
//   const eyebrowRef = useRef<HTMLDivElement>(null);
//   // Three separate Copy refs — one per headline line for staggered word-mask reveal
//   // const line1Ref = useRef<CopyHandle>(null);
//   // const line2Ref = useRef<CopyHandle>(null);
//   // const line3Ref = useRef<CopyHandle>(null);
//   //   const line1Ref = useRef<HTMLSpanElement>(null);
//   // const line2Ref = useRef<HTMLSpanElement>(null);
//   // const line3Ref = useRef<HTMLSpanElement>(null);
//     const line1WordRefs = useRef<HTMLSpanElement[]>([]);
//   const line2WordRefs = useRef<HTMLSpanElement[]>([]);
//   const line3WordRefs = useRef<HTMLSpanElement[]>([]);
//   const subRef = useRef<HTMLDivElement>(null);
//   const ctaRef = useRef<HTMLDivElement>(null);
//   const panelRef = useRef<HTMLDivElement>(null);
//   const tickerRef = useRef<HTMLDivElement>(null);
//   const tickerInnerRef = useRef<HTMLDivElement>(null);
//   const [countersActive, setCountersActive] = useState(false);

//     // "Gradient introduction" layer — the shader wash + structural hairlines,
//   // held at 0 opacity until the headline has landed, then breathed in.
//   const hairlinesRef = useRef<SVGSVGElement>(null);
//   const cornerTLRef = useRef<SVGSVGElement>(null);
//   const cornerTRRef = useRef<SVGSVGElement>(null);
//   const bloomRef = useRef<HTMLDivElement>(null);

//   // Ticker loop
//   /*
//   // Old version — didn't wait for fonts, causing scrollWidth mismatch on refresh / logged-in
//   useEffect(() => {
//     const ticker = tickerInnerRef.current;
//     if (!ticker) return;
//     const clone = ticker.cloneNode(true) as HTMLElement;
//     clone.setAttribute("aria-hidden", "true");
//     tickerRef.current?.appendChild(clone);
//     const totalWidth = ticker.scrollWidth;
//     let x = 0;
//     let rafId: number;
//     const speed = 0.55;
//     const animate = () => {
//       x -= speed;
//       if (Math.abs(x) >= totalWidth) x = 0;
//       if (tickerRef.current) tickerRef.current.style.transform = `translateX(${x}px)`;
//       rafId = requestAnimationFrame(animate);
//     };
//     rafId = requestAnimationFrame(animate);
//     return () => cancelAnimationFrame(rafId);
//   }, []);
//   */

//   useEffect(() => {
//     const ticker = tickerInnerRef.current;
//     if (!ticker) return;

//     let rafId: number;
//     let cancelled = false;

//     const init = () => {
//       if (cancelled) return;

//       // Duplicate for seamless loop
//       const clone = ticker.cloneNode(true) as HTMLElement;
//       clone.setAttribute("aria-hidden", "true");
//       tickerRef.current?.appendChild(clone);

//       const totalWidth = ticker.scrollWidth;
//       let x = 0;
//       const speed = 0.55; // px per frame

//       const animate = () => {
//         x -= speed;
//         if (Math.abs(x) >= totalWidth) x = 0;
//         if (tickerRef.current) {
//           tickerRef.current.style.transform = `translateX(${x}px)`;
//         }
//         rafId = requestAnimationFrame(animate);
//       };

//       rafId = requestAnimationFrame(animate);
//     };

//     // Wait for fonts so scrollWidth is correct
//     document.fonts.ready.then(init);

//     return () => {
//       cancelled = true;
//       cancelAnimationFrame(rafId);
//     };
//   }, []);

//   // GSAP animation orchestration
//   // const runAnimation = (mode: AnimationMode) => {
//   //   const ease = mode === "reveal" ? "expo.out" : "power3.out";
//   //   const baseDuration = mode === "reveal" ? 0.9 : 0.65;
//   //   const baseDelay = mode === "reveal" ? 0.05 : 0.3;

//   //   const tl = gsap.timeline();

//   //   // Initial state for non-Copy elements
//   //   gsap.set([eyebrowRef.current, subRef.current, ctaRef.current], { y: 40, opacity: 0 });
//   //   gsap.set(panelRef.current, { x: 60, opacity: 0 });

//   //   // Eyebrow
//   //   tl.to(
//   //     eyebrowRef.current,
//   //     { y: 0, opacity: 1, duration: baseDuration * 0.7, ease },
//   //     baseDelay
//   //   );

//   //   // Headline — fire each Copy line's word-mask reveal with staggered delays.
//   //   const lineDelay = baseDelay + baseDuration * 0.3;
//   //   tl.call(() => {
//   //     // Counters activate in sync with the headline reveal
//   //     setCountersActive(true);
//   //     if (mode === "reveal") {
//   //       line1Ref.current?.play();
//   //       setTimeout(() => line2Ref.current?.play(), 100);
//   //       setTimeout(() => line3Ref.current?.play(), 200);
//   //     } else {
//   //       line1Ref.current?.fadeIn();
//   //       setTimeout(() => line2Ref.current?.fadeIn(), 80);
//   //       setTimeout(() => line3Ref.current?.fadeIn(), 160);
//   //     }
//   //   }, [], lineDelay);

//   //   // Sub + CTA — appear after headline words start landing
//   //   tl.to(
//   //     subRef.current,
//   //     { y: 0, opacity: 1, duration: baseDuration * 0.85, ease },
//   //     lineDelay + 0.55
//   //   );
//   //   tl.to(
//   //     ctaRef.current,
//   //     { y: 0, opacity: 1, duration: baseDuration * 0.75, ease },
//   //     lineDelay + 0.7
//   //   );

//   //   // Panel slides in from the right
//   //   tl.to(
//   //     panelRef.current,
//   //     { x: 0, opacity: 1, duration: baseDuration * 1.1, ease },
//   //     lineDelay + 0.2
//   //   );
//   // };
//   // const runAnimation = (mode: AnimationMode) => {
//   //   const isReveal = mode === "reveal";
//   //   const ease = isReveal ? "expo.out" : "power3.out";
//   //   const baseDuration = isReveal ? 0.9 : 0.65;
//   //   const baseDelay = isReveal ? 0.05 : 0.3;

//   //   const tl = gsap.timeline();

//   //   // Initial state
//   //   gsap.set([eyebrowRef.current, subRef.current, ctaRef.current], {
//   //     y: 32,
//   //     opacity: 0,
//   //     filter: "blur(10px)",
//   //   });
//   //   gsap.set(panelRef.current, { x: 60, opacity: 0 });
//   //   gsap.set([line1Ref.current, line2Ref.current, line3Ref.current], {
//   //     yPercent: isReveal ? 115 : 40,
//   //     opacity: 0,
//   //     filter: isReveal ? "blur(16px)" : "blur(4px)",
//   //   });
//   //   gsap.set(
//   //     [canvasRef.current, hairlinesRef.current, cornerTLRef.current, cornerTRRef.current, bloomRef.current],
//   //     { opacity: 0 }
//   //   );
//   //   gsap.set(bloomRef.current, { scale: 0.85 });

//   //   // Eyebrow
//   //   tl.to(
//   //     eyebrowRef.current,
//   //     { y: 0, opacity: 1, filter: "blur(0px)", duration: baseDuration * 0.7, ease, clearProps: "filter" },
//   //     baseDelay
//   //   );

//   //   // Headline — three masked lines, staggered, blur settling into focus.
//   //   // This is the reveal itself; everything else in the hero is built around it.
//   //   const lineDelay = baseDelay + baseDuration * 0.3;
//   //   const lineDuration = isReveal ? 1.1 : 0.7;
//   //   const lineStagger = isReveal ? 0.12 : 0.08;

//   //   tl.call(() => setCountersActive(true), [], lineDelay);
//   //   tl.to(
//   //     [line1Ref.current, line2Ref.current, line3Ref.current],
//   //     {
//   //       yPercent: 0,
//   //       opacity: 1,
//   //       filter: "blur(0px)",
//   //       duration: lineDuration,
//   //       stagger: lineStagger,
//   //       ease: isReveal ? "expo.out" : "power3.out",
//   //       clearProps: "filter",
//   //     },
//   //     lineDelay
//   //   );

//   //   // Sub + CTA — land as the headline settles
//   //   tl.to(
//   //     subRef.current,
//   //     { y: 0, opacity: 1, filter: "blur(0px)", duration: baseDuration * 0.85, ease, clearProps: "filter" },
//   //     lineDelay + 0.5
//   //   );
//   //   tl.to(
//   //     ctaRef.current,
//   //     { y: 0, opacity: 1, filter: "blur(0px)", duration: baseDuration * 0.75, ease, clearProps: "filter" },
//   //     lineDelay + 0.65
//   //   );

//   //   // Panel slides in from the right
//   //   tl.to(
//   //     panelRef.current,
//   //     { x: 0, opacity: 1, duration: baseDuration * 1.1, ease },
//   //     lineDelay + 0.15
//   //   );

//   //   // The gradient introduction — shader wash + structural hairlines breathe
//   //   // in once the words have landed, so the atmosphere arrives around the
//   //   // content instead of competing with it on the way in.
//   //   const atmosphereDelay = lineDelay + (isReveal ? 1.35 : 0.75);
//   //   tl.to(
//   //     canvasRef.current,
//   //     { opacity: 1, duration: isReveal ? 2.2 : 1.1, ease: "sine.out" },
//   //     atmosphereDelay
//   //   );
//   //   tl.to(
//   //     bloomRef.current,
//   //     { opacity: 1, scale: 1, duration: isReveal ? 2.4 : 1.2, ease: "sine.out" },
//   //     atmosphereDelay
//   //   );
//   //   tl.to(
//   //     hairlinesRef.current,
//   //     { opacity: 1, duration: isReveal ? 1.6 : 0.8, ease: "power2.out" },
//   //     atmosphereDelay + 0.2
//   //   );
//   //   tl.to(
//   //     [cornerTLRef.current, cornerTRRef.current],
//   //     { opacity: 0.2, duration: isReveal ? 1.4 : 0.7, ease: "power2.out", stagger: 0.06 },
//   //     atmosphereDelay + 0.2
//   //   );
//   // };
//   const runAnimation = (mode: AnimationMode) => {
//     const isReveal = mode === "reveal";
//     const ease = isReveal ? "expo.out" : "power3.out";
//     const baseDuration = isReveal ? 0.7 : 0.5;
//     const baseDelay = isReveal ? 0.05 : 0.2;

//     const tl = gsap.timeline();

//     const words = [...line1WordRefs.current, ...line2WordRefs.current, ...line3WordRefs.current];

//     // Initial state
//     gsap.set([eyebrowRef.current, subRef.current, ctaRef.current], {
//       y: 28,
//       opacity: 0,
//       filter: "blur(8px)",
//     });
//     gsap.set(panelRef.current, { x: 60, opacity: 0 });
//     gsap.set(words, {
//       yPercent: isReveal ? 115 : 40,
//       opacity: 0,
//       filter: isReveal ? "blur(10px)" : "blur(3px)",
//     });
//     gsap.set(
//       [canvasRef.current, hairlinesRef.current, cornerTLRef.current, cornerTRRef.current, bloomRef.current],
//       { opacity: 0 }
//     );
//     gsap.set(bloomRef.current, { scale: 0.92 });

//     // Eyebrow
//     tl.to(
//       eyebrowRef.current,
//       { y: 0, opacity: 1, filter: "blur(0px)", duration: baseDuration * 0.7, ease, clearProps: "filter" },
//       baseDelay
//     );

//     // Headline — word-level masked reveal, tight stagger. This is the
//     // reveal itself; everything else is timed off when it actually lands.
//     const lineDelay = baseDelay + baseDuration * 0.3;
//     const wordDuration = isReveal ? 0.7 : 0.45;
//     const wordStagger = isReveal ? 0.055 : 0.04;

//     tl.call(() => setCountersActive(true), [], lineDelay);
//     tl.to(
//       words,
//       {
//         yPercent: 0,
//         opacity: 1,
//         filter: "blur(0px)",
//         duration: wordDuration,
//         stagger: wordStagger,
//         ease,
//         clearProps: "filter",
//       },
//       lineDelay
//     );
//     const headlineEnd = lineDelay + Math.max(0, words.length - 1) * wordStagger + wordDuration;

//     // Sub + CTA — land right behind the headline, not long after it
//     tl.to(
//       subRef.current,
//       { y: 0, opacity: 1, filter: "blur(0px)", duration: baseDuration * 0.85, ease, clearProps: "filter" },
//       lineDelay + 0.3
//     );
//     tl.to(
//       ctaRef.current,
//       { y: 0, opacity: 1, filter: "blur(0px)", duration: baseDuration * 0.75, ease, clearProps: "filter" },
//       lineDelay + 0.4
//     );

//     // Panel slides in from the right, alongside the headline
//     tl.to(
//       panelRef.current,
//       { x: 0, opacity: 1, duration: baseDuration * 1.1, ease },
//       lineDelay + 0.1
//     );

//     // The gradient introduction — tight on the heels of the headline now,
//     // not a separate beat with dead air before it.
//     const atmosphereDelay = headlineEnd + (isReveal ? 0.15 : 0.1);
//     tl.to(
//       canvasRef.current,
//       { opacity: 1, duration: isReveal ? 1.1 : 0.7, ease: "sine.out" },
//       atmosphereDelay
//     );
//     tl.to(
//       bloomRef.current,
//       { opacity: 1, scale: 1, duration: isReveal ? 1.2 : 0.75, ease: "sine.out" },
//       atmosphereDelay
//     );
//     tl.to(
//       hairlinesRef.current,
//       { opacity: 1, duration: isReveal ? 0.8 : 0.5, ease: "power2.out" },
//       atmosphereDelay + 0.1
//     );
//     tl.to(
//       [cornerTLRef.current, cornerTRRef.current],
//       { opacity: 0.2, duration: isReveal ? 0.7 : 0.45, ease: "power2.out", stagger: 0.05 },
//       atmosphereDelay + 0.1
//     );
//   };

//   // useLayoutEffect(() => {
//   //   // Only hide non-Copy elements here — Copy manages its own word initial state internally
//   //   gsap.set([eyebrowRef.current, subRef.current, ctaRef.current], { opacity: 0, y: 40 });
//   //   gsap.set(panelRef.current, { opacity: 0 });

//   //   const unsub = registerAnimation(runAnimation);
//   //   return unsub;
//   //   // eslint-disable-next-line react-hooks/exhaustive-deps
//   // }, [registerAnimation]);
//   useLayoutEffect(() => {
//     // Hide everything before first paint — runAnimation re-sets these per
//     // mode anyway, this just prevents a flash of fully-visible content
//     // before GSAP takes over.
//     // gsap.set([eyebrowRef.current, subRef.current, ctaRef.current], { opacity: 0, y: 32 });
//     // gsap.set(panelRef.current, { opacity: 0, x: 60 });
//     // gsap.set([line1Ref.current, line2Ref.current, line3Ref.current], { opacity: 0, yPercent: 115 });
//     gsap.set([eyebrowRef.current, subRef.current, ctaRef.current], { opacity: 0, y: 28 });
//     gsap.set(panelRef.current, { opacity: 0, x: 60 });
//     gsap.set([...line1WordRefs.current, ...line2WordRefs.current, ...line3WordRefs.current], {
//       opacity: 0,
//       yPercent: 115,
//     });
//     gsap.set(
//       [canvasRef.current, hairlinesRef.current, cornerTLRef.current, cornerTRRef.current, bloomRef.current],
//       { opacity: 0 }
//     );

//     const unsub = registerAnimation(runAnimation);
//     return unsub;
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [registerAnimation]);

//   return (
//     <section
//       ref={sectionRef}
//       className="relative h-dvh lg:h-screen flex flex-col overflow-hidden bg-background"
//     >
// {/*       
//       <canvas
//         ref={canvasRef}
//         aria-hidden="true"
//         className="absolute inset-0 w-full h-full pointer-events-none"
//         style={{ zIndex: 0, imageRendering: "auto" }}
//       />

      
//       <svg
//         className="absolute inset-0 w-full h-full pointer-events-none"
//         xmlns="http://www.w3.org/2000/svg"
//         aria-hidden="true"
//       >
        
//         <line
//           x1="60%"
//           y1="0%"
//           x2="80%"
//           y2="100%"
//           stroke="currentColor"
//           strokeWidth="0.5"
//           strokeOpacity="0.08"
//         />

//         <line
//           x1="58%"
//           y1="0%"
//           x2="77%"
//           y2="100%"
//           stroke="currentColor"
//           strokeWidth="0.5"
//           strokeOpacity="0.05"
//         />
//       </svg>

      
//       <svg
//         className="absolute top-6 left-6 pointer-events-none"
//         width="22"
//         height="22"
//         viewBox="0 0 28 28"
//         aria-hidden="true"
//         style={{ opacity: 0.2 }}
//       >
//         <path d="M 0 28 L 0 0 L 28 0" fill="none" stroke="currentColor" strokeWidth="1" />
//       </svg>
//       <svg
//         className="absolute top-6 right-6 pointer-events-none"
//         width="22"
//         height="22"
//         viewBox="0 0 28 28"
//         aria-hidden="true"
//         style={{ opacity: 0.2 }}
//       >
//         <path d="M 28 28 L 28 0 L 0 0" fill="none" stroke="currentColor" strokeWidth="1" />
//       </svg> */}
//       {/* ── WebGL shader background — held at 0 opacity until the gradient-intro beat ── */}
//       <canvas
//         ref={canvasRef}
//         aria-hidden="true"
//         className="absolute inset-0 w-full h-full pointer-events-none"
//         style={{ zIndex: 0, imageRendering: "auto" }}
//       />

//       {/* ── Soft radial bloom — the other half of the "gradient introduction".
//           Two low-opacity washes in the existing brand colors, no new palette. ── */}
//       {/* <div
//         ref={bloomRef}
//         aria-hidden="true"
//         className="absolute inset-0 pointer-events-none"
//         style={{
//           zIndex: 0,
//           background:
//             "radial-gradient(ellipse 55% 45% at 72% 38%, hsl(var(--primary) / 0.16), transparent 70%), radial-gradient(ellipse 40% 35% at 12% 85%, hsl(var(--accent) / 0.10), transparent 70%)",
//         }}
//       /> */}
//       {/* ── The gradient introduction: a soft glow with a halftone dot texture
//           masked to the same shape, so the dots read as "on top of" the
//           gradient rather than as a separate flat layer. One hotspot, one
//           color (your existing --primary), nothing added to the palette. ── */}
//       <div
//         ref={bloomRef}
//         aria-hidden="true"
//         className="absolute inset-0 pointer-events-none"
//         style={{
//           zIndex: 0,
//           backgroundImage:
//             "radial-gradient(circle, hsl(var(--foreground) / 0.55) 1.4px, transparent 1.4px), radial-gradient(ellipse 50% 45% at 74% 38%, hsl(var(--primary) / 0.32), transparent 70%)",
//           backgroundSize: "16px 16px, 100% 100%",
//           WebkitMaskImage:
//             "radial-gradient(ellipse 58% 52% at 74% 38%, black, transparent 78%)",
//           maskImage:
//             "radial-gradient(ellipse 58% 52% at 74% 38%, black, transparent 78%)",
//         }}
//       />

//       {/* ── Diagonal shard-echo geometry — SVG hairlines that mirror Preloader ── */}
//       <svg
//         ref={hairlinesRef}
//         className="absolute inset-0 w-full h-full pointer-events-none"
//         xmlns="http://www.w3.org/2000/svg"
//         aria-hidden="true"
//       >
//         <line x1="60%" y1="0%" x2="80%" y2="100%" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.08" />
//         <line x1="58%" y1="0%" x2="77%" y2="100%" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.05" />
//       </svg>

//       {/* ── Corner brackets (echo Preloader decor) ── */}
//       <svg
//         ref={cornerTLRef}
//         className="absolute top-6 left-6 pointer-events-none"
//         width="22" height="22" viewBox="0 0 28 28" aria-hidden="true"
//         style={{ opacity: 0.2 }}
//       >
//         <path d="M 0 28 L 0 0 L 28 0" fill="none" stroke="currentColor" strokeWidth="1" />
//       </svg>
//       <svg
//         ref={cornerTRRef}
//         className="absolute top-6 right-6 pointer-events-none"
//         width="22" height="22" viewBox="0 0 28 28" aria-hidden="true"
//         style={{ opacity: 0.2 }}
//       >
//         <path d="M 28 28 L 28 0 L 0 0" fill="none" stroke="currentColor" strokeWidth="1" />
//       </svg>

//       {/* ─── Main content grid ─────────────────────────────────────────────── */}
//       <div className="flex-1 min-h-0 container mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-0 items-center pt-14 pb-10 sm:pt-20 sm:pb-14 lg:pt-24 lg:pb-16 relative z-10">

//         {/* LEFT — Typographic core */}
//         <div className="flex flex-col justify-center max-w-3xl">

//           {/* Eyebrow — system label style from Preloader */}
//           <div ref={eyebrowRef} className="flex items-center gap-3 mb-8">
//             <div className="w-6 h-px bg-primary" />
//             <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
//               {t("hero.eyebrow", "Aid dispatch — Addis Ababa")}
//             </span>
//             {/* Live pulse dot */}
//             <span className="relative flex h-[6px] w-[6px]">
//               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
//               <span className="relative inline-flex rounded-full h-[6px] w-[6px] bg-primary" />
//             </span>
//           </div>

//           {/* Headline — three Copy word-mask reveals, coordinator-triggered */}
//           {/* <div className="mb-8">
//             <h1 className="font-display font-black leading-[0.93] tracking-[-0.03em] text-[clamp(3rem,8.5vw,6.5rem)]">
//               <Copy ref={line1Ref} animateOnScroll={false} revealDelay={0} fadeDelay={0.3}>
//                 <span className="block text-foreground">
//                   {t("hero.line1", "Aid that")}
//                 </span>
//               </Copy>
//               <Copy ref={line2Ref} animateOnScroll={false} revealDelay={0} fadeDelay={0.38}>
//                 <span className="block text-foreground">
//                   {t("hero.line2", "actually")}
//                 </span>
//               </Copy>
//               <Copy ref={line3Ref} animateOnScroll={false} revealDelay={0} fadeDelay={0.46}>
//                 <span className="block text-primary">
//                   {t("hero.line3", "arrives.")}
//                 </span>
//               </Copy>
//             </h1>
//           </div> */}
//           {/* Headline — three masked lines, blur settling into focus on reveal */}
//           <div className="mb-8">
//             <h1 className="font-display font-black leading-[0.93] tracking-[-0.03em] text-[clamp(3rem,8.5vw,6.5rem)]">
//               {/* <span className="block overflow-hidden">
//                 <span ref={line1Ref} className="block text-foreground will-change-transform">
//                   {t("hero.line1", "Aid that")}
//                 </span>
//               </span>
//               <span className="block overflow-hidden">
//                 <span ref={line2Ref} className="block text-foreground will-change-transform">
//                   {t("hero.line2", "actually")}
//                 </span>
//               </span>
//               <span className="block overflow-hidden">
//                 <span ref={line3Ref} className="block text-primary will-change-transform">
//                   {t("hero.line3", "arrives.")}
//                 </span>
//               </span> */}
//               <MaskedWords text={t("hero.line1", "Aid that")} className="text-foreground" wordRefs={line1WordRefs} />
//               <MaskedWords text={t("hero.line2", "actually")} className="text-foreground" wordRefs={line2WordRefs} />
//               <MaskedWords text={t("hero.line3", "arrives.")} className="text-primary" wordRefs={line3WordRefs} />
//             </h1>
//           </div>

//           {/* Sub */}
//           <p
//             ref={subRef}
//             className="text-[clamp(0.95rem,1.5vw,1.1rem)] leading-relaxed text-muted-foreground max-w-[42ch] mb-10"
//           >
//             {t(
//               "hero.subtitle",
//               "Amana connects donors directly with families in Addis Ababa. No black box. Every birr tracked, every family named."
//             )}
//           </p>

//           {/* CTAs */}
//           <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
//             <Link to="/payment">
//               <button className="group inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-7 h-12 rounded-xl hover:bg-primary/90 transition-colors shadow-md hover:shadow-glow">
//                 {t("hero.ctaPrimary", "Donate now")}
//                 <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
//               </button>
//             </Link>
//             <button
//               onClick={(e) => {
//                 e.preventDefault();
//                 lenis?.scrollTo("#impact");
//               }}
//               className="inline-flex items-center gap-2 border border-border text-foreground font-medium text-sm px-7 h-12 rounded-xl hover:bg-secondary/60 transition-colors"
//             >
//               {t("hero.ctaSecondary", "See our impact")}
//             </button>
//           </div>
//         </div>

//         {/* RIGHT — The field dispatch panel */}
//         <div
//           ref={panelRef}
//           className="hidden lg:flex flex-col self-stretch justify-center ml-16 xl:ml-24 relative"
//           style={{ minWidth: "260px" }}
//         >
//           {/* Vertical mono label */}
//           <div
//             className="absolute -left-5 top-1/2 -translate-y-1/2 font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40"
//             style={{ writingMode: "vertical-rl", transform: "translateY(-50%) rotate(180deg)" }}
//           >
//             FIELD / STATUS
//           </div>

//           {/* Panel header */}
//           <div className="border-t border-b border-border/50 py-3 mb-6">
//             <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/60 flex justify-between">
//               <span>AMANA / OS — v2.4.1</span>
//               <span>15°N 38°E</span>
//             </div>
//           </div>

//           {/* Live counters */}
//           <div className="flex flex-col gap-5 mb-8">
//             {COUNTER_TARGETS.map((item, i) => (
//               <CounterCard key={item.label} item={item} active={countersActive} index={i} />
//             ))}
//           </div>

//           {/* Campaign urgency bar */}
//           <div className="mt-auto">
//             <div className="flex justify-between items-baseline mb-2">
//             <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
//               {t("hero.counters.fundProgress", "FUND PROGRESS")}
//             </span>
//             <span className="font-mono text-[10px] text-foreground/60">62.5%</span>
//           </div>
//           <div className="h-[2px] w-full bg-border/60 rounded-full overflow-hidden">
//             <div
//               className="h-full bg-primary rounded-full transition-all duration-[1400ms] ease-out"
//               style={{ width: countersActive ? "62.5%" : "0%" }}
//             />
//           </div>
//           <p className="font-mono text-[9px] text-muted-foreground/40 mt-2 tracking-[0.1em]">
//             {t("hero.counters.raisedOf", "ETB {{raised}}K of {{goal}}K RAISED", { raised: 125, goal: 200 })}
//           </p>
//           </div>

//           {/* Corner bracket (decorative, panel-level) */}
//           <svg
//             className="absolute bottom-0 right-0"
//             width="16"
//             height="16"
//             viewBox="0 0 28 28"
//             aria-hidden="true"
//             style={{ opacity: 0.15 }}
//           >
//             <path d="M 28 0 L 28 28 L 0 28" fill="none" stroke="currentColor" strokeWidth="1.5" />
//           </svg>
//         </div>
//       </div>

//       {/* ── TICKER TAPE — The signature element ──────────────────────────────── */}
//       <div
//         className="relative z-10 border-t border-border/40 overflow-hidden select-none"
//         aria-hidden="true"
//       >
//         {/* Gradient fade masks at edges */}
//         <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
//           style={{ background: "linear-gradient(to right, hsl(var(--background)), transparent)" }}
//         />
//         <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
//           style={{ background: "linear-gradient(to left, hsl(var(--background)), transparent)" }}
//         />

//         <div
//           ref={tickerRef}
//           className="flex items-center will-change-transform py-3"
//           style={{ width: "max-content" }}
//         >
//           <div
//             ref={tickerInnerRef}
//             className="flex items-center gap-0 shrink-0"
//           >
//             {TICKER_ITEMS.map((item, i) => (
//               <div key={i} className="flex items-center shrink-0">
//                 <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 whitespace-nowrap px-4">
//                   {item}
//                 </span>
//                 <span className="text-muted-foreground/20 text-xs">◆</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// import React, { useRef, useLayoutEffect, useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import { useLenis } from "lenis/react";
// import { ArrowRight } from "lucide-react";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { useAnimationCoordinator, type AnimationMode } from "@/components/AnimationCoordinator";
// // import Copy, { type CopyHandle } from "@/components/Copy";

// // ─── Domain-warped FBM shader — full-field organic noise, theme-aware ────────
// // Technique: Inigo Quilez's domain-warp FBM (noise fed into its own domain).
// // The result is soft, cloud-like flow fields — reads as living paper/watercolor.
// // Extremely subtle opacity so text is always the hero.
// // Mouse: offsets the warp domain for gentle parallax feel.
// // Scroll: drifts the Y coordinate, creating true vertical parallax.
// // Renders at 0.35× resolution — plenty for smooth noise, zero perf cost.

// // function parseHsl(hslStr: string): [number, number, number] {
// //   const parts = hslStr.trim().split(/\s+/);
// //   const h = parseFloat(parts[0]) / 360;
// //   const s = parseFloat(parts[1]) / 100;
// //   const l = parseFloat(parts[2]) / 100;
// //   const hue2rgb = (p: number, q: number, t: number) => {
// //     if (t < 0) t += 1; if (t > 1) t -= 1;
// //     if (t < 1/6) return p + (q - p) * 6 * t;
// //     if (t < 1/2) return q;
// //     if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
// //     return p;
// //   };
// //   if (s === 0) return [l, l, l];
// //   const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
// //   const p = 2 * l - q;
// //   return [hue2rgb(p, q, h + 1/3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1/3)];
// // }


// function parseHsl(hslStr: string): [number, number, number] {
//   if (!hslStr) return [0, 0, 0]; // Fallback to black if CSS isn't loaded yet
  
//   // Splits by space OR comma to be extra safe against different CSS formats
//   const parts = hslStr.trim().split(/[\s,]+/); 
//   const h = parseFloat(parts[0]) / 360;
//   const s = parseFloat(parts[1]) / 100;
//   const l = parseFloat(parts[2]) / 100;

//   // If parsing fails, return a safe fallback to prevent NaN poisoning
//   if (isNaN(h) || isNaN(s) || isNaN(l)) return [0, 0, 0];

//   const hue2rgb = (p: number, q: number, t: number) => {
//     if (t < 0) t += 1; if (t > 1) t -= 1;
//     if (t < 1/6) return p + (q - p) * 6 * t;
//     if (t < 1/2) return q;
//     if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
//     return p;
//   };
  
//   if (s === 0) return [l, l, l];
//   const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
//   const p = 2 * l - q;
//   return [hue2rgb(p, q, h + 1/3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1/3)];
// }

// function getCssColor(varName: string): [number, number, number] {
//   const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
//   return parseHsl(raw);
// }

// function isDarkMode(): boolean {
//   return document.documentElement.classList.contains("dark");
// }

// const VERT_SRC = `
// attribute vec2 a_pos;
// void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
// `;

// // Domain-warped FBM fragment shader — confirmed working.
// // u_mouse: normalized mouse position, used to subtly warp domain origin.
// // u_scroll: 0→1 scroll progress — drifts Y of domain for parallax.
// // u_dark: 1.0 = dark mode, 0.0 = light mode — adjusts opacity + tint.
// // u_c1/u_c2: primary teal + accent amber from CSS vars.
// const FRAG_SRC = `
// precision mediump float;

// uniform vec2  u_res;
// uniform vec2  u_mouse;
// uniform float u_scroll;
// uniform float u_time;
// uniform float u_dark;
// uniform vec3  u_c1;
// uniform vec3  u_c2;

// float hash(vec2 p) {
//   return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
// }

// float noise(vec2 p) {
//   vec2 i = floor(p);
//   vec2 f = fract(p);
//   vec2 u = f * f * (3.0 - 2.0 * f);
//   return mix(
//     mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), u.x),
//     mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x),
//     u.y
//   );
// }

// // FBM — amplitude starts at 1.0, normalized by theoretical max (1.875)
// // so output is a true [0, 1] range. Critical fix vs prior version.
// float fbm(vec2 p) {
//   float v = 0.0;
//   float a = 1.0;
//   vec2  shift = vec2(100.0);
//   mat2  rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
//   for (int i = 0; i < 4; i++) {
//     v += a * noise(p);
//     p  = rot * p * 2.1 + shift;
//     a *= 0.5;
//   }
//   return v / 1.875;
// }

// void main() {
//   // 1. Normalize and fix aspect ratio immediately
//   // We divide by u_res.y to ensure the vertical scale is 1.0 
//   // and the horizontal scale adjusts based on the container width.
//   vec2 st = gl_FragCoord.xy / u_res.y;

//   // 2. Dynamic Zoom: Apply to the already aspect-corrected coordinate
//   float zoom = u_res.x < u_res.y ? 1.5 : 1.0;
//   st *= zoom;

//   // Center the coordinates (Optional but recommended for swirling effects)
//   // This ensures the "zoom" happens from the middle, not the bottom-left corner
//   st -= 0.5 * vec2(u_res.x / u_res.y * zoom, zoom);

//   float t = u_time * 0.04;
//   vec2 mouseWarp = (u_mouse - 0.5) * 0.12;
//   float scrollDrift = u_scroll * 0.22;

//   // 3. Noise generation (using your st)
//   vec2 q = vec2(
//     fbm(st + t + mouseWarp + vec2(0.0, scrollDrift * 0.3)),
//     fbm(st + vec2(5.20, 1.30) + t + mouseWarp + vec2(0.0, scrollDrift * 0.3))
//   );

//   float f = fbm(st + 0.7 * q + vec2(0.0, scrollDrift * 0.5) + t * 0.6);
//   // f = pow(f, 0.8);

//   // // 4. Color and Alpha
//   // // vec3 col = mix(u_c1 * 0.5, u_c1 * 1.1, f) + u_c2 * pow(f, 4.0) * 0.35;
//   // // float alpha = mix(0.12, 0.20, u_dark) * f;
//   // // 4. Color and Alpha
//   // // Light mode needs more contrast against a light backdrop than dark mode does
//   // // against near-black — same alpha reads very differently depending on surface.
//   // vec3 col = mix(u_c1 * 0.55, u_c1 * 1.05, f) + u_c2 * pow(f, 4.0) * mix(0.55, 0.35, u_dark);
//   // float alpha = mix(0.4, 0.15, u_dark) * f;
//   f = pow(f, 0.8);

// // Contrast-boosted version — only used for light mode, where noise needs to
// // read as distinct light/dark passages instead of flat gray. Dark mode keeps
// // using raw f untouched, since that's the version you're already happy with.
// float fc = smoothstep(0.30, 0.70, f);

// // ── Dark mode — exactly the values you confirmed look good. Untouched. ──
// vec3  colDark   = mix(u_c1 * 0.55, u_c1 * 1.05, f) + u_c2 * pow(f, 4.0) * 0.35;
// float alphaDark = 0.15 * f;

// // ── Light mode — wider contrast range, separate from dark mode entirely. ──
// vec3  colLight   = mix(u_c1 * 2.6, u_c1 * 3.1, fc) + u_c2 * pow(fc, 3.0) * 0.45;
// float alphaLight = 0.25 * mix(0.4, 1.0, fc);

// // Select branch by mode — no shared range, no cross-contamination.
// vec3  col   = mix(colLight, colDark, u_dark);
// float alpha = mix(alphaLight, alphaDark, u_dark);

// gl_FragColor = vec4(col * alpha, alpha);

//   gl_FragColor = vec4(col * alpha, alpha);
// }
// `;

// const i = 1;


// function useShaderBackground(
//   canvasRef: React.RefObject<HTMLCanvasElement>,
//   scrollProgressRef: React.MutableRefObject<number>
// ) {
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const gl = canvas.getContext("webgl", {
//       alpha: true,
//       premultipliedAlpha: true,
//       antialias: false,
//       powerPreference: "low-power",
//     });
//     if (!gl) return;

//     const compile = (type: number, src: string) => {
//       const sh = gl.createShader(type)!;
//       gl.shaderSource(sh, src);
//       gl.compileShader(sh);
//       if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
//         console.warn("[shader]", gl.getShaderInfoLog(sh));
//       }
//       return sh;
//     };
    
//     const prog = gl.createProgram()!;
//     gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT_SRC));
//     gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG_SRC));
//     gl.linkProgram(prog);
//     gl.useProgram(prog);

//     const buf = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, buf);
//     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
//     const aPos = gl.getAttribLocation(prog, "a_pos");
//     gl.enableVertexAttribArray(aPos);
//     gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

//     const uRes    = gl.getUniformLocation(prog, "u_res");
//     const uMouse  = gl.getUniformLocation(prog, "u_mouse");
//     const uScroll = gl.getUniformLocation(prog, "u_scroll");
//     const uTime   = gl.getUniformLocation(prog, "u_time");
//     const uDark   = gl.getUniformLocation(prog, "u_dark");
//     const uC1     = gl.getUniformLocation(prog, "u_c1");
//     const uC2     = gl.getUniformLocation(prog, "u_c2");

//     const getScale = () => window.screen.width <= 768 ? 0.25 : 0.35;

//     const resize = () => {
//       if (!canvas) return;
//       const SCALE = getScale();
//       canvas.width  = Math.floor(canvas.clientWidth  * SCALE);
//       canvas.height = Math.floor(canvas.clientHeight * SCALE);
//       gl.viewport(0, 0, canvas.width, canvas.height);
//     };
    
//     resize();
//     const ro = new ResizeObserver(resize);
//     ro.observe(canvas);

//     let mouseTarget = { x: 0.5, y: 0.5 };
//     let mouseCurrent = { x: 0.5, y: 0.5 };
//     const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

//     const onMouseMove = (e: MouseEvent) => {
//       const rect = canvas.getBoundingClientRect();
//       mouseTarget.x = (e.clientX - rect.left) / rect.width;
//       mouseTarget.y = (e.clientY - rect.top) / rect.height;
//     };
//     window.addEventListener("mousemove", onMouseMove, { passive: true });

//     // Track state of CSS variables to handle the initial load race condition
//     let cachedDark = isDarkMode();
//     let hasFoundValidColors = false;
//     let cachedC1: [number, number, number] = [0, 0, 0];
//     let cachedC2: [number, number, number] = [0, 0, 0];

//     const updateColors = () => {
//       // cachedDark = isDarkMode();
//       // const rawC1 = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
//       // const rawC2 = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      
//       // // Only flag as found if the CSS has actually loaded and populated the variables
//       // if (rawC1 && rawC2) {
//       //   hasFoundValidColors = true;
//       //   cachedC1 = parseHsl(rawC1);
//       //   cachedC2 = parseHsl(rawC2);
//       // }

//       cachedDark = isDarkMode();
//       // Light mode: use the foreground/text color so the shader reads as a soft
//       // ink-like wash tied to the typography, instead of teal competing with
//       // the CTA accent color against the cream background.
//       // Dark mode: keep primary teal — it already reads well against near-black.
//       const c1Var = cachedDark ? "--primary" : "--foreground";
//       const c2Var = cachedDark ? "--accent" : "--muted-foreground";
//       const rawC1 = getComputedStyle(document.documentElement).getPropertyValue(c1Var).trim();
//       const rawC2 = getComputedStyle(document.documentElement).getPropertyValue(c2Var).trim();

//       if (rawC1 && rawC2) {
//         hasFoundValidColors = true;
//         cachedC1 = parseHsl(rawC1);
//         cachedC2 = parseHsl(rawC2);
//       }
//     };

//     // Initial fetch attempt
//     updateColors();

//     let rafId: number;

//     const render = (now: number) => {
//       // 1. FIX ROUTE TRANSITION RACE: 
//       // Force resize if dimensions are out of sync (e.g., missed by ResizeObserver during page transition)
//       const expectedW = Math.floor(canvas.clientWidth * getScale());
//       const expectedH = Math.floor(canvas.clientHeight * getScale());
//       if (canvas.width !== expectedW || canvas.height !== expectedH) {
//         resize();
//       }

//       // 2. FIX CSS RACE:
//       // Keep trying to fetch colors if the first attempt returned empty strings
//       const currentDark = isDarkMode();
//       if (!hasFoundValidColors || currentDark !== cachedDark) {
//         updateColors();
//       }

//       const t = now * 0.001;

//       mouseCurrent.x = lerp(mouseCurrent.x, mouseTarget.x, 0.018);
//       mouseCurrent.y = lerp(mouseCurrent.y, mouseTarget.y, 0.018);

//       gl.clearColor(0, 0, 0, 0);
//       gl.clear(gl.COLOR_BUFFER_BIT);

//       gl.uniform2f(uRes, canvas.width, canvas.height);
//       gl.uniform2f(uMouse, mouseCurrent.x, mouseCurrent.y);
//       gl.uniform1f(uScroll, scrollProgressRef.current);
//       gl.uniform1f(uTime, t);
//       gl.uniform1f(uDark, cachedDark ? 1.0 : 0.0);
//       gl.uniform3fv(uC1, cachedC1);
//       gl.uniform3fv(uC2, cachedC2);

//       gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
//       rafId = requestAnimationFrame(render);
//     };

//     rafId = requestAnimationFrame(render);

//     return () => {
//       cancelAnimationFrame(rafId);
//       window.removeEventListener("mousemove", onMouseMove);
//       ro.disconnect();
//       gl.deleteProgram(prog);
//       gl.deleteBuffer(buf);
//     };
//   }, [canvasRef, scrollProgressRef]);
// }
// const TICKER_ITEMS = [
//   "78 families supported this quarter",
//   "ቤተሰቦች",
//   "Urgent: 17 pending aid requests",
//   "ምሕረት",
//   "Food distribution — Bole, Addis Ababa",
//   "ተስፋ",
//   "Donor threshold reached: ETB 2.4M",
//   "ሰላም",
//   "New campaign live — education fund",
//   "ፍቅር",
//   "Medical supply convoy dispatched",
//   "አሚን",
// ];

// // ─── The diagonal shard boundary angles match the Preloader's SLICES exactly ──
// // Preloader shard lines: 20/40/60/80% x-intercepts top → 40/60/80/100% x-intercepts bottom
// // We mirror the rightmost shard boundary for the panel clip

// const COUNTER_TARGETS = [
//   { value: 78, label: t("hero.counters.families", "Families"), sublabel: t("hero.counters.familiesSub", "directly supported") },
//   { value: 24, label: t("hero.counters.events", "Events"), sublabel: t("hero.counters.eventsSub", "this year") },
//   { value: 125, label: t("hero.counters.raised", "ETB (K)"), sublabel: t("hero.counters.raisedSub", "raised to date") },
// ];

// function useCountUp(target: number, duration = 1.6, start = false) {
//   const [count, setCount] = useState(0);
//   useEffect(() => {
//     if (!start) return;
//     const startTime = performance.now();
//     const raf = (now: number) => {
//       const elapsed = (now - startTime) / 1000;
//       const t = Math.min(elapsed / duration, 1);
//       // ease out expo
//       const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
//       setCount(Math.round(eased * target));
//       if (t < 1) requestAnimationFrame(raf);
//     };
//     requestAnimationFrame(raf);
//   }, [start, target, duration]);
//   return count;
// }

// function CounterCard({
//   item,
//   active,
//   index,
// }: {
//   item: { value: number; labelKey: string; label: string; sublabelKey: string; sublabel: string; };
//   active: boolean;
//   index: number;
// }) {
//   const count = useCountUp(item.value, 1.4 + index * 0.2, active);
//   return (
//     <div className="border-l border-border/60 pl-4 py-1">
//       <div className="font-display font-black text-[clamp(1.6rem,3.5vw,2.6rem)] leading-none tabular-nums text-foreground">
//         {count}
//         {item.label === "ETB (K)" && "K"}
//       </div>
//       <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
//         {item.label}
//         <span className="block text-muted-foreground/50 tracking-[0.1em] normal-case font-sans text-[10px] mt-0.5">
//           {item.sublabel}
//         </span>
//       </div>
//     </div>
//   );
// }

// // Splits a line into individual masked words instead of masking the whole
// // line as one block — this is what actually reads as a tight, cascading
// // reveal rather than three big blocks landing one after another.
// function MaskedWords({
//   text,
//   className,
//   wordRefs,
// }: {
//   text: string;
//   className: string;
//   wordRefs: React.MutableRefObject<HTMLSpanElement[]>;
// }) {
//   const words = text.split(" ");
//   return (
//     <span className="block">
//       {words.map((word, idx) => (
//         <span key={idx} className="inline-block overflow-hidden align-top">
//           <span
//             ref={(el) => {
//               if (el) wordRefs.current[idx] = el;
//             }}
//             className={`inline-block will-change-transform ${className}`}
//           >
//             {word}
//             {idx < words.length - 1 ? "\u00A0" : ""}
//           </span>
//         </span>
//       ))}
//     </span>
//   );
// }

// export default function HeroSection() {
//   const { t } = useTranslation();
//   const lenis = useLenis();
//   const { registerAnimation } = useAnimationCoordinator();

//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const sectionRef = useRef<HTMLElement>(null);
//   // Ref instead of state — written every scroll frame, read in rAF loop, no re-render needed
//   const scrollProgressRef = useRef<number>(0);
//   useShaderBackground(canvasRef, scrollProgressRef);

//   // Wire ScrollTrigger to update scrollProgressRef for shader parallax
//   useEffect(() => {
//     gsap.registerPlugin(ScrollTrigger);
//     const section = sectionRef.current;
//     if (!section) return;
//     const st = ScrollTrigger.create({
//       trigger: section,
//       start: "top top",
//       end: "bottom top",
//       onUpdate: (self) => { scrollProgressRef.current = self.progress; },
//     });
//     return () => st.kill();
//   }, []);

//   // Refs for GSAP targets
//   const eyebrowRef = useRef<HTMLDivElement>(null);
//   // Three separate Copy refs — one per headline line for staggered word-mask reveal
//   // const line1Ref = useRef<CopyHandle>(null);
//   // const line2Ref = useRef<CopyHandle>(null);
//   // const line3Ref = useRef<CopyHandle>(null);
//   //   const line1Ref = useRef<HTMLSpanElement>(null);
//   // const line2Ref = useRef<HTMLSpanElement>(null);
//   // const line3Ref = useRef<HTMLSpanElement>(null);
//     const line1WordRefs = useRef<HTMLSpanElement[]>([]);
//   const line2WordRefs = useRef<HTMLSpanElement[]>([]);
//   const line3WordRefs = useRef<HTMLSpanElement[]>([]);
//   const subRef = useRef<HTMLDivElement>(null);
//   const ctaRef = useRef<HTMLDivElement>(null);
//   const panelRef = useRef<HTMLDivElement>(null);
//   const tickerRef = useRef<HTMLDivElement>(null);
//   const tickerInnerRef = useRef<HTMLDivElement>(null);
//   const [countersActive, setCountersActive] = useState(false);

//     // "Gradient introduction" layer — the shader wash + structural hairlines,
//   // held at 0 opacity until the headline has landed, then breathed in.
//   const hairlinesRef = useRef<SVGSVGElement>(null);
//   const cornerTLRef = useRef<SVGSVGElement>(null);
//   const cornerTRRef = useRef<SVGSVGElement>(null);
//   const bloomRef = useRef<HTMLDivElement>(null);
//   // Dispatch-signal layer — concentric pings radiating from the panel's
//   // coordinate origin. Replaces the dot-grid texture with something that
//   // actually reads as "live signal" rather than generic background noise.
//   const signalRef = useRef<SVGSVGElement>(null);
//   const ringRefs = useRef<SVGCircleElement[]>([]);

//   // Dispatch-signal loop — continuous radar-style ping expanding from the
//   // panel's coordinate origin, direct echo of the eyebrow's live-status dot.
//   // Independent of the reveal timeline, like the shader's own rAF loop: it
//   // starts on mount and just stays invisible until runAnimation fades
//   // signalRef in, so re-triggering the reveal (route changes, etc.) never
//   // restarts or doubles up the pulse. Gated behind prefers-reduced-motion —
//   // note this only covers the new signal layer; the rest of the timeline
//   // below doesn't have a reduced-motion branch yet.
//   useEffect(() => {
//     if (ringRefs.current.length === 0) return;

//     const mm = gsap.matchMedia();

//     mm.add({ reduceMotion: "(prefers-reduced-motion: reduce)" }, (context) => {
//       const { reduceMotion } = context.conditions as { reduceMotion: boolean };

//       if (reduceMotion) {
//         // Signal is present, just not animated — three static rings.
//         ringRefs.current.forEach((ring, idx) => {
//           gsap.set(ring, { attr: { r: 60 + idx * 34 }, opacity: 0.14 });
//         });
//         return;
//       }

//       gsap.set(ringRefs.current, { attr: { r: 4 }, opacity: 0 });

//       const loop = gsap.timeline({ repeat: -1 });
//       ringRefs.current.forEach((ring, idx) => {
//         loop.fromTo(
//           ring,
//           { attr: { r: 4 }, opacity: 0.5 },
//           { attr: { r: 170 }, opacity: 0, duration: 2.6, ease: "power2.out" },
//           idx * 1.05
//         );
//       });

//       return () => { loop.kill(); };
//     });

//     return () => mm.revert();
//   }, []);

//   // Ticker loop
//   /*
//   // Old version — didn't wait for fonts, causing scrollWidth mismatch on refresh / logged-in
//   useEffect(() => {
//     const ticker = tickerInnerRef.current;
//     if (!ticker) return;
//     const clone = ticker.cloneNode(true) as HTMLElement;
//     clone.setAttribute("aria-hidden", "true");
//     tickerRef.current?.appendChild(clone);
//     const totalWidth = ticker.scrollWidth;
//     let x = 0;
//     let rafId: number;
//     const speed = 0.55;
//     const animate = () => {
//       x -= speed;
//       if (Math.abs(x) >= totalWidth) x = 0;
//       if (tickerRef.current) tickerRef.current.style.transform = `translateX(${x}px)`;
//       rafId = requestAnimationFrame(animate);
//     };
//     rafId = requestAnimationFrame(animate);
//     return () => cancelAnimationFrame(rafId);
//   }, []);
//   */

//   useEffect(() => {
//     const ticker = tickerInnerRef.current;
//     if (!ticker) return;

//     let rafId: number;
//     let cancelled = false;

//     const init = () => {
//       if (cancelled) return;

//       // Duplicate for seamless loop
//       const clone = ticker.cloneNode(true) as HTMLElement;
//       clone.setAttribute("aria-hidden", "true");
//       tickerRef.current?.appendChild(clone);

//       const totalWidth = ticker.scrollWidth;
//       let x = 0;
//       const speed = 0.55; // px per frame

//       const animate = () => {
//         x -= speed;
//         if (Math.abs(x) >= totalWidth) x = 0;
//         if (tickerRef.current) {
//           tickerRef.current.style.transform = `translateX(${x}px)`;
//         }
//         rafId = requestAnimationFrame(animate);
//       };

//       rafId = requestAnimationFrame(animate);
//     };

//     // Wait for fonts so scrollWidth is correct
//     document.fonts.ready.then(init);

//     return () => {
//       cancelled = true;
//       cancelAnimationFrame(rafId);
//     };
//   }, []);

//   // GSAP animation orchestration
//   // const runAnimation = (mode: AnimationMode) => {
//   //   const ease = mode === "reveal" ? "expo.out" : "power3.out";
//   //   const baseDuration = mode === "reveal" ? 0.9 : 0.65;
//   //   const baseDelay = mode === "reveal" ? 0.05 : 0.3;

//   //   const tl = gsap.timeline();

//   //   // Initial state for non-Copy elements
//   //   gsap.set([eyebrowRef.current, subRef.current, ctaRef.current], { y: 40, opacity: 0 });
//   //   gsap.set(panelRef.current, { x: 60, opacity: 0 });

//   //   // Eyebrow
//   //   tl.to(
//   //     eyebrowRef.current,
//   //     { y: 0, opacity: 1, duration: baseDuration * 0.7, ease },
//   //     baseDelay
//   //   );

//   //   // Headline — fire each Copy line's word-mask reveal with staggered delays.
//   //   const lineDelay = baseDelay + baseDuration * 0.3;
//   //   tl.call(() => {
//   //     // Counters activate in sync with the headline reveal
//   //     setCountersActive(true);
//   //     if (mode === "reveal") {
//   //       line1Ref.current?.play();
//   //       setTimeout(() => line2Ref.current?.play(), 100);
//   //       setTimeout(() => line3Ref.current?.play(), 200);
//   //     } else {
//   //       line1Ref.current?.fadeIn();
//   //       setTimeout(() => line2Ref.current?.fadeIn(), 80);
//   //       setTimeout(() => line3Ref.current?.fadeIn(), 160);
//   //     }
//   //   }, [], lineDelay);

//   //   // Sub + CTA — appear after headline words start landing
//   //   tl.to(
//   //     subRef.current,
//   //     { y: 0, opacity: 1, duration: baseDuration * 0.85, ease },
//   //     lineDelay + 0.55
//   //   );
//   //   tl.to(
//   //     ctaRef.current,
//   //     { y: 0, opacity: 1, duration: baseDuration * 0.75, ease },
//   //     lineDelay + 0.7
//   //   );

//   //   // Panel slides in from the right
//   //   tl.to(
//   //     panelRef.current,
//   //     { x: 0, opacity: 1, duration: baseDuration * 1.1, ease },
//   //     lineDelay + 0.2
//   //   );
//   // };
//   // const runAnimation = (mode: AnimationMode) => {
//   //   const isReveal = mode === "reveal";
//   //   const ease = isReveal ? "expo.out" : "power3.out";
//   //   const baseDuration = isReveal ? 0.9 : 0.65;
//   //   const baseDelay = isReveal ? 0.05 : 0.3;

//   //   const tl = gsap.timeline();

//   //   // Initial state
//   //   gsap.set([eyebrowRef.current, subRef.current, ctaRef.current], {
//   //     y: 32,
//   //     opacity: 0,
//   //     filter: "blur(10px)",
//   //   });
//   //   gsap.set(panelRef.current, { x: 60, opacity: 0 });
//   //   gsap.set([line1Ref.current, line2Ref.current, line3Ref.current], {
//   //     yPercent: isReveal ? 115 : 40,
//   //     opacity: 0,
//   //     filter: isReveal ? "blur(16px)" : "blur(4px)",
//   //   });
//   //   gsap.set(
//   //     [canvasRef.current, hairlinesRef.current, cornerTLRef.current, cornerTRRef.current, bloomRef.current],
//   //     { opacity: 0 }
//   //   );
//   //   gsap.set(bloomRef.current, { scale: 0.85 });

//   //   // Eyebrow
//   //   tl.to(
//   //     eyebrowRef.current,
//   //     { y: 0, opacity: 1, filter: "blur(0px)", duration: baseDuration * 0.7, ease, clearProps: "filter" },
//   //     baseDelay
//   //   );

//   //   // Headline — three masked lines, staggered, blur settling into focus.
//   //   // This is the reveal itself; everything else in the hero is built around it.
//   //   const lineDelay = baseDelay + baseDuration * 0.3;
//   //   const lineDuration = isReveal ? 1.1 : 0.7;
//   //   const lineStagger = isReveal ? 0.12 : 0.08;

//   //   tl.call(() => setCountersActive(true), [], lineDelay);
//   //   tl.to(
//   //     [line1Ref.current, line2Ref.current, line3Ref.current],
//   //     {
//   //       yPercent: 0,
//   //       opacity: 1,
//   //       filter: "blur(0px)",
//   //       duration: lineDuration,
//   //       stagger: lineStagger,
//   //       ease: isReveal ? "expo.out" : "power3.out",
//   //       clearProps: "filter",
//   //     },
//   //     lineDelay
//   //   );

//   //   // Sub + CTA — land as the headline settles
//   //   tl.to(
//   //     subRef.current,
//   //     { y: 0, opacity: 1, filter: "blur(0px)", duration: baseDuration * 0.85, ease, clearProps: "filter" },
//   //     lineDelay + 0.5
//   //   );
//   //   tl.to(
//   //     ctaRef.current,
//   //     { y: 0, opacity: 1, filter: "blur(0px)", duration: baseDuration * 0.75, ease, clearProps: "filter" },
//   //     lineDelay + 0.65
//   //   );

//   //   // Panel slides in from the right
//   //   tl.to(
//   //     panelRef.current,
//   //     { x: 0, opacity: 1, duration: baseDuration * 1.1, ease },
//   //     lineDelay + 0.15
//   //   );

//   //   // The gradient introduction — shader wash + structural hairlines breathe
//   //   // in once the words have landed, so the atmosphere arrives around the
//   //   // content instead of competing with it on the way in.
//   //   const atmosphereDelay = lineDelay + (isReveal ? 1.35 : 0.75);
//   //   tl.to(
//   //     canvasRef.current,
//   //     { opacity: 1, duration: isReveal ? 2.2 : 1.1, ease: "sine.out" },
//   //     atmosphereDelay
//   //   );
//   //   tl.to(
//   //     bloomRef.current,
//   //     { opacity: 1, scale: 1, duration: isReveal ? 2.4 : 1.2, ease: "sine.out" },
//   //     atmosphereDelay
//   //   );
//   //   tl.to(
//   //     hairlinesRef.current,
//   //     { opacity: 1, duration: isReveal ? 1.6 : 0.8, ease: "power2.out" },
//   //     atmosphereDelay + 0.2
//   //   );
//   //   tl.to(
//   //     [cornerTLRef.current, cornerTRRef.current],
//   //     { opacity: 0.2, duration: isReveal ? 1.4 : 0.7, ease: "power2.out", stagger: 0.06 },
//   //     atmosphereDelay + 0.2
//   //   );
//   // };
//   const runAnimation = (mode: AnimationMode) => {
//     const isReveal = mode === "reveal";
//     const ease = isReveal ? "expo.out" : "power3.out";
//     const baseDuration = isReveal ? 0.7 : 0.5;
//     const baseDelay = isReveal ? 0.05 : 0.2;

//     const tl = gsap.timeline();

//     const words = [...line1WordRefs.current, ...line2WordRefs.current, ...line3WordRefs.current];

//     // Initial state
//     gsap.set([eyebrowRef.current, subRef.current, ctaRef.current], {
//       y: 28,
//       opacity: 0,
//       filter: "blur(8px)",
//     });
//     gsap.set(panelRef.current, { x: 60, opacity: 0 });
//     gsap.set(words, {
//       yPercent: isReveal ? 115 : 40,
//       opacity: 0,
//       filter: isReveal ? "blur(10px)" : "blur(3px)",
//     });
//     gsap.set(
//       [canvasRef.current, hairlinesRef.current, cornerTLRef.current, cornerTRRef.current, bloomRef.current, signalRef.current],
//       { opacity: 0 }
//     );
//     gsap.set(bloomRef.current, { scale: 0.92 });

//     // Eyebrow
//     tl.to(
//       eyebrowRef.current,
//       { y: 0, opacity: 1, filter: "blur(0px)", duration: baseDuration * 0.7, ease, clearProps: "filter" },
//       baseDelay
//     );

//     // Headline — word-level masked reveal, tight stagger. This is the
//     // reveal itself; everything else is timed off when it actually lands.
//     const lineDelay = baseDelay + baseDuration * 0.3;
//     const wordDuration = isReveal ? 0.7 : 0.45;
//     const wordStagger = isReveal ? 0.055 : 0.04;

//     tl.call(() => setCountersActive(true), [], lineDelay);
//     tl.to(
//       words,
//       {
//         yPercent: 0,
//         opacity: 1,
//         filter: "blur(0px)",
//         duration: wordDuration,
//         stagger: wordStagger,
//         ease,
//         clearProps: "filter",
//       },
//       lineDelay
//     );
//     const headlineEnd = lineDelay + Math.max(0, words.length - 1) * wordStagger + wordDuration;

//     // Sub + CTA — land right behind the headline, not long after it
//     tl.to(
//       subRef.current,
//       { y: 0, opacity: 1, filter: "blur(0px)", duration: baseDuration * 0.85, ease, clearProps: "filter" },
//       lineDelay + 0.3
//     );
//     tl.to(
//       ctaRef.current,
//       { y: 0, opacity: 1, filter: "blur(0px)", duration: baseDuration * 0.75, ease, clearProps: "filter" },
//       lineDelay + 0.4
//     );

//     // Panel slides in from the right, alongside the headline
//     tl.to(
//       panelRef.current,
//       { x: 0, opacity: 1, duration: baseDuration * 1.1, ease },
//       lineDelay + 0.1
//     );

//     // The gradient introduction — tight on the heels of the headline now,
//     // not a separate beat with dead air before it.
//     const atmosphereDelay = headlineEnd + (isReveal ? 0.15 : 0.1);
//     tl.to(
//       canvasRef.current,
//       { opacity: 1, duration: isReveal ? 1.1 : 0.7, ease: "sine.out" },
//       atmosphereDelay
//     );
//     tl.to(
//       bloomRef.current,
//       { opacity: 1, scale: 1, duration: isReveal ? 1.2 : 0.75, ease: "sine.out" },
//       atmosphereDelay
//     );
//     tl.to(
//       hairlinesRef.current,
//       { opacity: 1, duration: isReveal ? 0.8 : 0.5, ease: "power2.out" },
//       atmosphereDelay + 0.1
//     );
//     tl.to(
//       signalRef.current,
//       { opacity: 1, duration: isReveal ? 1 : 0.6, ease: "power2.out" },
//       atmosphereDelay + 0.15
//     );
//     tl.to(
//       [cornerTLRef.current, cornerTRRef.current],
//       { opacity: 0.2, duration: isReveal ? 0.7 : 0.45, ease: "power2.out", stagger: 0.05 },
//       atmosphereDelay + 0.1
//     );
//   };

//   // useLayoutEffect(() => {
//   //   // Only hide non-Copy elements here — Copy manages its own word initial state internally
//   //   gsap.set([eyebrowRef.current, subRef.current, ctaRef.current], { opacity: 0, y: 40 });
//   //   gsap.set(panelRef.current, { opacity: 0 });

//   //   const unsub = registerAnimation(runAnimation);
//   //   return unsub;
//   //   // eslint-disable-next-line react-hooks/exhaustive-deps
//   // }, [registerAnimation]);
//   useLayoutEffect(() => {
//     // Hide everything before first paint — runAnimation re-sets these per
//     // mode anyway, this just prevents a flash of fully-visible content
//     // before GSAP takes over.
//     // gsap.set([eyebrowRef.current, subRef.current, ctaRef.current], { opacity: 0, y: 32 });
//     // gsap.set(panelRef.current, { opacity: 0, x: 60 });
//     // gsap.set([line1Ref.current, line2Ref.current, line3Ref.current], { opacity: 0, yPercent: 115 });
//     gsap.set([eyebrowRef.current, subRef.current, ctaRef.current], { opacity: 0, y: 28 });
//     gsap.set(panelRef.current, { opacity: 0, x: 60 });
//     gsap.set([...line1WordRefs.current, ...line2WordRefs.current, ...line3WordRefs.current], {
//       opacity: 0,
//       yPercent: 115,
//     });
//     gsap.set(
//       [canvasRef.current, hairlinesRef.current, cornerTLRef.current, cornerTRRef.current, bloomRef.current, signalRef.current],
//       { opacity: 0 }
//     );

//     const unsub = registerAnimation(runAnimation);
//     return unsub;
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [registerAnimation]);

//   return (
//     <section
//       ref={sectionRef}
//       className="relative h-dvh lg:h-screen flex flex-col overflow-hidden bg-background"
//     >
// {/*       
//       <canvas
//         ref={canvasRef}
//         aria-hidden="true"
//         className="absolute inset-0 w-full h-full pointer-events-none"
//         style={{ zIndex: 0, imageRendering: "auto" }}
//       />

      
//       <svg
//         className="absolute inset-0 w-full h-full pointer-events-none"
//         xmlns="http://www.w3.org/2000/svg"
//         aria-hidden="true"
//       >
        
//         <line
//           x1="60%"
//           y1="0%"
//           x2="80%"
//           y2="100%"
//           stroke="currentColor"
//           strokeWidth="0.5"
//           strokeOpacity="0.08"
//         />

//         <line
//           x1="58%"
//           y1="0%"
//           x2="77%"
//           y2="100%"
//           stroke="currentColor"
//           strokeWidth="0.5"
//           strokeOpacity="0.05"
//         />
//       </svg>

      
//       <svg
//         className="absolute top-6 left-6 pointer-events-none"
//         width="22"
//         height="22"
//         viewBox="0 0 28 28"
//         aria-hidden="true"
//         style={{ opacity: 0.2 }}
//       >
//         <path d="M 0 28 L 0 0 L 28 0" fill="none" stroke="currentColor" strokeWidth="1" />
//       </svg>
//       <svg
//         className="absolute top-6 right-6 pointer-events-none"
//         width="22"
//         height="22"
//         viewBox="0 0 28 28"
//         aria-hidden="true"
//         style={{ opacity: 0.2 }}
//       >
//         <path d="M 28 28 L 28 0 L 0 0" fill="none" stroke="currentColor" strokeWidth="1" />
//       </svg> */}
//       {/* ── WebGL shader background — held at 0 opacity until the gradient-intro beat ── */}
//       <canvas
//         ref={canvasRef}
//         aria-hidden="true"
//         className="absolute inset-0 w-full h-full pointer-events-none"
//         style={{ zIndex: 0, imageRendering: "auto" }}
//       />

//       {/* ── Soft radial bloom — the other half of the "gradient introduction".
//           Two low-opacity washes in the existing brand colors, no new palette. ── */}
//       {/* <div
//         ref={bloomRef}
//         aria-hidden="true"
//         className="absolute inset-0 pointer-events-none"
//         style={{
//           zIndex: 0,
//           background:
//             "radial-gradient(ellipse 55% 45% at 72% 38%, hsl(var(--primary) / 0.16), transparent 70%), radial-gradient(ellipse 40% 35% at 12% 85%, hsl(var(--accent) / 0.10), transparent 70%)",
//         }}
//       /> */}
//       {/* ── Ambient wash — soft primary-color glow behind the signal, no dot
//           texture. The halftone grid this used to carry read as stock/default
//           on a page whose whole point is "nothing here is generic"; the
//           signal rings below now carry the "something is live" idea instead,
//           so this layer just needs to be a quiet backdrop for them. ── */}
//       <div
//         ref={bloomRef}
//         aria-hidden="true"
//         className="absolute inset-0 pointer-events-none"
//         style={{
//           zIndex: 0,
//           background:
//             "radial-gradient(ellipse 52% 46% at 74% 38%, hsl(var(--primary) / 0.14), transparent 72%)",
//         }}
//       />

//       {/* ── Dispatch signal — concentric pings radiating from the field panel's
//           coordinate origin (same anchor the glow above uses). Direct echo of
//           the eyebrow's live-status dot further down, scaled up into the
//           section's structural anchor instead of a generic texture. Loops
//           continuously once revealed — see the effect above that drives the
//           rings themselves; this svg only handles the one-time fade-in. ── */}
//       <svg
//         ref={signalRef}
//         className="absolute inset-0 w-full h-full pointer-events-none"
//         xmlns="http://www.w3.org/2000/svg"
//         aria-hidden="true"
//         style={{ zIndex: 0 }}
//       >
//         <circle cx="74%" cy="38%" r="3" fill="hsl(var(--primary))" />
//         {[0, 1, 2].map((idx) => (
//           <circle
//             key={idx}
//             ref={(el) => {
//               if (el) ringRefs.current[idx] = el;
//             }}
//             cx="74%"
//             cy="38%"
//             r="4"
//             fill="none"
//             stroke="hsl(var(--primary))"
//             strokeWidth="1"
//           />
//         ))}
//       </svg>

//       {/* ── Diagonal shard-echo geometry — SVG hairlines that mirror Preloader ── */}
//       <svg
//         ref={hairlinesRef}
//         className="absolute inset-0 w-full h-full pointer-events-none"
//         xmlns="http://www.w3.org/2000/svg"
//         aria-hidden="true"
//       >
//         <line x1="60%" y1="0%" x2="80%" y2="100%" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.08" />
//         <line x1="58%" y1="0%" x2="77%" y2="100%" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.05" />
//       </svg>

//       {/* ── Corner brackets (echo Preloader decor) ── */}
//       <svg
//         ref={cornerTLRef}
//         className="absolute top-6 left-6 pointer-events-none"
//         width="22" height="22" viewBox="0 0 28 28" aria-hidden="true"
//         style={{ opacity: 0.2 }}
//       >
//         <path d="M 0 28 L 0 0 L 28 0" fill="none" stroke="currentColor" strokeWidth="1" />
//       </svg>
//       <svg
//         ref={cornerTRRef}
//         className="absolute top-6 right-6 pointer-events-none"
//         width="22" height="22" viewBox="0 0 28 28" aria-hidden="true"
//         style={{ opacity: 0.2 }}
//       >
//         <path d="M 28 28 L 28 0 L 0 0" fill="none" stroke="currentColor" strokeWidth="1" />
//       </svg>

//       {/* ─── Main content grid ─────────────────────────────────────────────── */}
//       <div className="flex-1 min-h-0 container mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-0 items-center pt-14 pb-10 sm:pt-20 sm:pb-14 lg:pt-24 lg:pb-16 relative z-10">

//         {/* LEFT — Typographic core */}
//         <div className="flex flex-col justify-center max-w-3xl">

//           {/* Eyebrow — system label style from Preloader */}
//           <div ref={eyebrowRef} className="flex items-center gap-3 mb-8">
//             <div className="w-6 h-px bg-primary" />
//             <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
//               {t("hero.eyebrow", "Aid dispatch — Addis Ababa")}
//             </span>
//             {/* Live pulse dot */}
//             <span className="relative flex h-[6px] w-[6px]">
//               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
//               <span className="relative inline-flex rounded-full h-[6px] w-[6px] bg-primary" />
//             </span>
//           </div>

//           {/* Headline — three Copy word-mask reveals, coordinator-triggered */}
//           {/* <div className="mb-8">
//             <h1 className="font-display font-black leading-[0.93] tracking-[-0.03em] text-[clamp(3rem,8.5vw,6.5rem)]">
//               <Copy ref={line1Ref} animateOnScroll={false} revealDelay={0} fadeDelay={0.3}>
//                 <span className="block text-foreground">
//                   {t("hero.line1", "Aid that")}
//                 </span>
//               </Copy>
//               <Copy ref={line2Ref} animateOnScroll={false} revealDelay={0} fadeDelay={0.38}>
//                 <span className="block text-foreground">
//                   {t("hero.line2", "actually")}
//                 </span>
//               </Copy>
//               <Copy ref={line3Ref} animateOnScroll={false} revealDelay={0} fadeDelay={0.46}>
//                 <span className="block text-primary">
//                   {t("hero.line3", "arrives.")}
//                 </span>
//               </Copy>
//             </h1>
//           </div> */}
//           {/* Headline — three masked lines, blur settling into focus on reveal */}
//           <div className="mb-8">
//             <h1 className="font-display font-black leading-[0.93] tracking-[-0.03em] text-[clamp(3rem,8.5vw,6.5rem)]">
//               {/* <span className="block overflow-hidden">
//                 <span ref={line1Ref} className="block text-foreground will-change-transform">
//                   {t("hero.line1", "Aid that")}
//                 </span>
//               </span>
//               <span className="block overflow-hidden">
//                 <span ref={line2Ref} className="block text-foreground will-change-transform">
//                   {t("hero.line2", "actually")}
//                 </span>
//               </span>
//               <span className="block overflow-hidden">
//                 <span ref={line3Ref} className="block text-primary will-change-transform">
//                   {t("hero.line3", "arrives.")}
//                 </span>
//               </span> */}
//               <MaskedWords text={t("hero.line1", "Aid that")} className="text-foreground" wordRefs={line1WordRefs} />
//               <MaskedWords text={t("hero.line2", "actually")} className="text-foreground" wordRefs={line2WordRefs} />
//               <MaskedWords text={t("hero.line3", "arrives.")} className="text-primary" wordRefs={line3WordRefs} />
//             </h1>
//           </div>

//           {/* Sub */}
//           <p
//             ref={subRef}
//             className="text-[clamp(0.95rem,1.5vw,1.1rem)] leading-relaxed text-muted-foreground max-w-[42ch] mb-10"
//           >
//             {t(
//               "hero.subtitle",
//               "Amana connects donors directly with families in Addis Ababa. No black box. Every birr tracked, every family named."
//             )}
//           </p>

//           {/* CTAs */}
//           <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
//             <Link to="/payment">
//               <button className="group inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-7 h-12 rounded-xl hover:bg-primary/90 transition-colors shadow-md hover:shadow-glow">
//                 {t("hero.ctaPrimary", "Donate now")}
//                 <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
//               </button>
//             </Link>
//             <button
//               onClick={(e) => {
//                 e.preventDefault();
//                 lenis?.scrollTo("#impact");
//               }}
//               className="inline-flex items-center gap-2 border border-border text-foreground font-medium text-sm px-7 h-12 rounded-xl hover:bg-secondary/60 transition-colors"
//             >
//               {t("hero.ctaSecondary", "See our impact")}
//             </button>
//           </div>
//         </div>

//         {/* RIGHT — The field dispatch panel */}
//         <div
//           ref={panelRef}
//           className="hidden lg:flex flex-col self-stretch justify-center ml-16 xl:ml-24 relative"
//           style={{ minWidth: "260px" }}
//         >
//           {/* Vertical mono label */}
//           <div
//             className="absolute -left-5 top-1/2 -translate-y-1/2 font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40"
//             style={{ writingMode: "vertical-rl", transform: "translateY(-50%) rotate(180deg)" }}
//           >
//             FIELD / STATUS
//           </div>

//           {/* Panel header */}
//           <div className="border-t border-b border-border/50 py-3 mb-6">
//             <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/60 flex justify-between">
//               <span>AMANA / OS — v2.4.1</span>
//               <span>15°N 38°E</span>
//             </div>
//           </div>

//           {/* Live counters */}
//           <div className="flex flex-col gap-5 mb-8">
//             {COUNTER_TARGETS.map((item, i) => (
//               <CounterCard key={item.label} item={item} active={countersActive} index={i} />
//             ))}
//           </div>

//           {/* Campaign urgency bar */}
//           <div className="mt-auto">
//             <div className="flex justify-between items-baseline mb-2">
//             <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
//               {t("hero.counters.fundProgress", "FUND PROGRESS")}
//             </span>
//             <span className="font-mono text-[10px] text-foreground/60">62.5%</span>
//           </div>
//           <div className="h-[2px] w-full bg-border/60 rounded-full overflow-hidden">
//             <div
//               className="h-full bg-primary rounded-full transition-all duration-[1400ms] ease-out"
//               style={{ width: countersActive ? "62.5%" : "0%" }}
//             />
//           </div>
//           <p className="font-mono text-[9px] text-muted-foreground/40 mt-2 tracking-[0.1em]">
//             {t("hero.counters.raisedOf", "ETB {{raised}}K of {{goal}}K RAISED", { raised: 125, goal: 200 })}
//           </p>
//           </div>

//           {/* Corner bracket (decorative, panel-level) */}
//           <svg
//             className="absolute bottom-0 right-0"
//             width="16"
//             height="16"
//             viewBox="0 0 28 28"
//             aria-hidden="true"
//             style={{ opacity: 0.15 }}
//           >
//             <path d="M 28 0 L 28 28 L 0 28" fill="none" stroke="currentColor" strokeWidth="1.5" />
//           </svg>
//         </div>
//       </div>

//       {/* ── TICKER TAPE — The signature element ──────────────────────────────── */}
//       <div
//         className="relative z-10 border-t border-border/40 overflow-hidden select-none"
//         aria-hidden="true"
//       >
//         {/* Gradient fade masks at edges */}
//         <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
//           style={{ background: "linear-gradient(to right, hsl(var(--background)), transparent)" }}
//         />
//         <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
//           style={{ background: "linear-gradient(to left, hsl(var(--background)), transparent)" }}
//         />

//         <div
//           ref={tickerRef}
//           className="flex items-center will-change-transform py-3"
//           style={{ width: "max-content" }}
//         >
//           <div
//             ref={tickerInnerRef}
//             className="flex items-center gap-0 shrink-0"
//           >
//             {TICKER_ITEMS.map((item, i) => (
//               <div key={i} className="flex items-center shrink-0">
//                 <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 whitespace-nowrap px-4">
//                   {item}
//                 </span>
//                 <span className="text-muted-foreground/20 text-xs">◆</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// // src/components/Preloader.tsx
// import { useEffect, useRef, useState } from "react";
// import { useLenis } from "lenis/react";
// import gsap from "gsap";
// import { useAnimationCoordinator } from "@/components/AnimationCoordinator";

// const BLOCK_COUNT = 12; // matches TransitionSkeleton's grid, on purpose
// const SESSION_KEY = "amana-preloader-shown";

// const HEART_PATH =
//   "M12 35.5C12 19.5 24.5 7 40 7C49.5 7 57.5 12.5 61 21C64.5 12.5 72.5 7 82 7C97.5 7 110 19.5 110 35.5C110 60 85 82 61 101C37 82 12 60 12 35.5Z";

// function safeSessionGet(key: string) {
//   try {
//     return sessionStorage.getItem(key);
//   } catch {
//     return null;
//   }
// }
// function safeSessionSet(key: string, value: string) {
//   try {
//     sessionStorage.setItem(key, value);
//   } catch {
//     /* ignore — private mode etc. */
//   }
// }

// export default function Preloader() {
//   const [mounted, setMounted] = useState(() => {
//     if (typeof window === "undefined") return true;
//     return !safeSessionGet(SESSION_KEY);
//   });

//   const rootRef = useRef<HTMLDivElement>(null);
//   const blocksRef = useRef<HTMLDivElement[]>([]);
//   const heartPathRef = useRef<SVGPathElement>(null);
//   const squircleRef = useRef<HTMLDivElement>(null);
//   const pctRef = useRef<HTMLSpanElement>(null);
//   const lastTens = useRef(0);
//   const lenis = useLenis();
//   const { triggerAnimations, claim } = useAnimationCoordinator();

//   useEffect(() => {
//     if (!mounted) return;

//     claim();
//     lenis?.stop();
//     document.body.style.overflow = "hidden";

//     const cs = getComputedStyle(document.documentElement);
//     const primaryColor = `hsl(${cs.getPropertyValue("--primary").trim()})`;

//     const pathLength = heartPathRef.current?.getTotalLength() ?? 0;
//     gsap.set(heartPathRef.current, {
//       strokeDasharray: pathLength,
//       strokeDashoffset: pathLength,
//       fill: "transparent",
//     });
//     gsap.set(squircleRef.current, { opacity: 0, scale: 0.85 });

//     const state = { value: 0 };

//     const setProgress = (v: number) => {
//       const clamped = Math.min(100, Math.max(0, v));

//       if (pctRef.current) {
//         const floored = Math.floor(clamped);
//         pctRef.current.textContent = String(floored).padStart(2, "0");
//         const tens = Math.floor(floored / 10);
//         if (tens !== lastTens.current) {
//           lastTens.current = tens;
//           gsap.fromTo(
//             pctRef.current,
//             { scale: 1 },
//             { scale: 1.08, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" }
//           );
//         }
//       }

//       gsap.set(heartPathRef.current, { strokeDashoffset: pathLength * (1 - clamped / 100) });

//       const wobbleDampen = Math.max(0, 1 - Math.max(0, clamped - 90) / 10);

//       blocksRef.current.forEach((el, i) => {
//         // Each column lags/leads slightly so the rise feels organic, not mechanical
//         const wobble = Math.sin((i / BLOCK_COUNT) * Math.PI * 2 + i) * 6 * wobbleDampen;
//         const fill = Math.min(100, Math.max(0, clamped + wobble));
//         el.style.setProperty("--fill", `${fill}%`);
//       });

//       rootRef.current?.setAttribute("aria-valuenow", String(Math.floor(clamped)));
//     };

//     setProgress(0);

//     const tl = gsap.timeline();

//     // Phase 1 — an uneven, "actually working" climb to 85%. Never reaches 100
//     // on a timer alone; that's gated below on real readiness.
//     tl.to(state, { value: 38, duration: 0.7, ease: "power3.out", onUpdate: () => setProgress(state.value) })
//       .to(state, { value: 52, duration: 0.9, ease: "power1.inOut", onUpdate: () => setProgress(state.value) })
//       .to(state, { value: 85, duration: 0.6, ease: "power3.in", onUpdate: () => setProgress(state.value) });

//     const ready = Promise.all([
//       document.fonts ? document.fonts.ready : Promise.resolve(),
//       document.readyState === "complete"
//         ? Promise.resolve()
//         : new Promise<void>((resolve) => window.addEventListener("load", () => resolve(), { once: true })),
//       new Promise((resolve) => setTimeout(resolve, 400)), // floor so it never feels instant/fake
//     ]);

//     tl.eventCallback("onComplete", () => {
//       // Held at 85% — idle "heartbeat" so it reads as alive, not frozen, while we wait.
//       const idlePulse = gsap.to(heartPathRef.current, {
//         opacity: 0.45,
//         duration: 0.6,
//         yoyo: true,
//         repeat: -1,
//         ease: "sine.inOut",
//       });

//       ready.then(() => {
//         idlePulse.kill();
//         gsap.set(heartPathRef.current, { opacity: 1 });

//         const finishTl = gsap.timeline();
//         finishTl
//           .to(state, { value: 100, duration: 0.5, ease: "power2.out", onUpdate: () => setProgress(state.value) })
//           .to(squircleRef.current, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(1.8)" }, "-=0.1")
//           .to(heartPathRef.current, { fill: primaryColor, duration: 0.3, ease: "power2.in" }, "+=0.05")
//           .to([pctRef.current, ".preloader-label"], { opacity: 0, duration: 0.25, ease: "power1.in" }, "+=0.05")
//           .to(squircleRef.current, { opacity: 0, scale: 0.85, duration: 0.25, ease: "power2.in" }, "+=0.05")
//           .set(blocksRef.current, { transformOrigin: "left center" })
//           .to(
//             blocksRef.current,
//             {
//               scaleX: 0,
//               duration: 0.75,
//               stagger: { each: 0.035, from: "center" },
//               ease: "expo.inOut",
//             },
//             "-=0.1"
//           )
//           .call(() => { triggerAnimations("reveal"); }, [], "-=0.25")
//           .to(
//             rootRef.current,
//             {
//               opacity: 0,
//               duration: 0.3,
//               onComplete: () => {
//                 document.body.style.overflow = "";
//                 lenis?.start();
//                 safeSessionSet(SESSION_KEY, "1");
//                 setMounted(false);
//               },
//             },
//             "-=0.2"
//           );
//       });
//     });

//     return () => {
//       tl.kill();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [mounted]);

//   if (!mounted) return null;

//   return (
//     <div
//       ref={rootRef}
//       role="progressbar"
//       aria-valuemin={0}
//       aria-valuemax={100}
//       aria-label="Page loading"
//       className="fixed inset-0 z-[100] bg-background"
//     >
//       <div className="absolute inset-0 flex">
//         {Array.from({ length: BLOCK_COUNT }).map((_, i) => (
//           <div
//             key={i}
//             ref={(el) => {
//               if (el) blocksRef.current[i] = el;
//             }}
//             className="relative flex-1 border-r border-background last:border-r-0 overflow-hidden bg-card"
//             style={{ "--fill": "0%" } as React.CSSProperties}
//           >
//             <div
//               className="absolute inset-x-0 bottom-0 bg-primary/90"
//               style={{ height: "var(--fill)", transition: "height 60ms linear" }}
//             />
//           </div>
//         ))}
//       </div>

//       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//         <div ref={squircleRef} className="relative">
//           <svg viewBox="0 0 122 110" className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-lg">
//             <path ref={heartPathRef} d={HEART_PATH} stroke="currentColor" strokeWidth={5} className="text-primary" />
//           </svg>
//         </div>
//       </div>

//       <div className="absolute bottom-8 sm:bottom-12 inset-x-0 px-5 sm:px-10 flex items-end justify-between" aria-live="polite">
//         <span className="preloader-label inline-block rounded-full bg-background/85 backdrop-blur px-3 py-1.5 font-mono text-[0.65rem] sm:text-xs uppercase tracking-[0.25em] text-foreground border border-border">
//           Amana
//         </span>
//         <span
//           ref={pctRef}
//           className="font-display font-bold text-[clamp(2.25rem,7vw,4.5rem)] leading-none tabular-nums text-foreground"
//         >
//           00
//         </span>
//       </div>
//     </div>
//   );
// }

// import { useEffect, useRef, useState } from "react";
// import { useLenis } from "lenis/react";
// import gsap from "gsap";
// import { useAnimationCoordinator } from "@/components/AnimationCoordinator";
// import { useTranslation } from "react-i18next";

// const BLOCK_COUNT = 12; // Matches TransitionSkeleton
// const SESSION_KEY = "amana-preloader-shown";

// function safeSessionGet(key: string) {
//   try {
//     return sessionStorage.getItem(key);
//   } catch {
//     return null;
//   }
// }
// function safeSessionSet(key: string, value: string) {
//   try {
//     sessionStorage.setItem(key, value);
//   } catch {
//     // ignore
//   }
// }

// export default function Preloader() {
//   const { t } = useTranslation();
//   const [mounted, setMounted] = useState(() => {
//     if (typeof window === "undefined") return true;
//     return !safeSessionGet(SESSION_KEY);
//   });

//   const rootRef = useRef<HTMLDivElement>(null);
//   const blocksRef = useRef<HTMLDivElement[]>([]);
//   const pctRef = useRef<HTMLSpanElement>(null);
//   const brandRef = useRef<HTMLDivElement>(null);
//   const progressLineRef = useRef<HTMLDivElement>(null);
  
//   const lenis = useLenis();
//   const { triggerAnimations, claim } = useAnimationCoordinator();

//   useEffect(() => {
//     if (!mounted) return;

//     claim();
//     lenis?.stop();
//     document.body.style.overflow = "hidden";

//     // Initial GSAP Setup
//     gsap.set(blocksRef.current, { transformOrigin: "top" });
//     gsap.set(progressLineRef.current, { scaleX: 0, transformOrigin: "left" });
    
//     // Split the brand text and percentage into initial hidden states for the reveal
//     gsap.set(".preloader-text-inner", { yPercent: 110, skewY: 5 });

//     const state = { value: 0 };

//     const setProgress = (v: number) => {
//       const clamped = Math.min(100, Math.max(0, v));
      
//       // Update Tabular Numbers
//       if (pctRef.current) {
//         pctRef.current.textContent = Math.floor(clamped).toString().padStart(3, "0");
//       }
      
//       // Update sleek progress line
//       if (progressLineRef.current) {
//         gsap.set(progressLineRef.current, { scaleX: clamped / 100 });
//       }

//       rootRef.current?.setAttribute("aria-valuenow", String(Math.floor(clamped)));
//     };

//     setProgress(0);

//     const tl = gsap.timeline();

//     // Intro Animation: Text slides up dramatically upon mount
//     tl.to(".preloader-text-inner", {
//       yPercent: 0,
//       skewY: 0,
//       duration: 1.2,
//       stagger: 0.1,
//       ease: "expo.out",
//     });

//     // Phase 1: Climb to 85% with variable easing to simulate real loading
//     tl.to(state, { value: 38, duration: 0.8, ease: "power3.out", onUpdate: () => setProgress(state.value) }, "-=0.5")
//       .to(state, { value: 65, duration: 0.9, ease: "power1.inOut", onUpdate: () => setProgress(state.value) })
//       .to(state, { value: 85, duration: 0.6, ease: "power3.in", onUpdate: () => setProgress(state.value) });

//     const ready = Promise.all([
//       document.fonts ? document.fonts.ready : Promise.resolve(),
//       document.readyState === "complete"
//         ? Promise.resolve()
//         : new Promise<void>((resolve) => window.addEventListener("load", () => resolve(), { once: true })),
//       new Promise((resolve) => setTimeout(resolve, 800)), // Floor time so the typography can be appreciated
//     ]);

//     tl.eventCallback("onComplete", () => {
//       // Gentle pulse on the progress line while waiting for the window to finish loading
//       const idlePulse = gsap.to(progressLineRef.current, {
//         opacity: 0.5,
//         duration: 0.8,
//         yoyo: true,
//         repeat: -1,
//         ease: "sine.inOut",
//       });

//       ready.then(() => {
//         idlePulse.kill();
//         gsap.set(progressLineRef.current, { opacity: 1 });

//         const finishTl = gsap.timeline();
        
//         finishTl
//           // 1. Snap to 100%
//           .to(state, { value: 100, duration: 0.4, ease: "power2.out", onUpdate: () => setProgress(state.value) })
          
//           // 2. The Exit: Text aggressively recedes upwards
//           .to(".preloader-text-inner", {
//             yPercent: -110,
//             skewY: -5,
//             duration: 0.8,
//             stagger: 0.05,
//             ease: "power4.in",
//           }, "+=0.2")
          
//           // Hide progress line
//           .to(progressLineRef.current, { opacity: 0, duration: 0.3 }, "-=0.6")
          
//           // 3. The Grand Reveal: 12 Columns wipe away via scaleY
//           .to(
//             blocksRef.current,
//             {
//               scaleY: 0,
//               duration: 1,
//               stagger: { each: 0.04, from: "center" }, // Wipes from the center outwards
//               ease: "expo.inOut",
//             },
//             "-=0.3"
//           )
          
//           // 4. Trigger the page reveal slightly before columns finish wiping
//           .call(() => { triggerAnimations("reveal"); }, [], "-=0.6")
          
//           // Cleanup
//           .to(
//             rootRef.current,
//             {
//               opacity: 0,
//               duration: 0.1,
//               onComplete: () => {
//                 document.body.style.overflow = "";
//                 lenis?.start();
//                 safeSessionSet(SESSION_KEY, "1");
//                 setMounted(false);
//               },
//             }
//           );
//       });
//     });

//     return () => {
//       tl.kill();
//     };
//   }, [mounted, claim, lenis, triggerAnimations]);

//   if (!mounted) return null;

//   return (
//     <div
//       ref={rootRef}
//       role="progressbar"
//       aria-valuemin={0}
//       aria-valuemax={100}
//       aria-label="Page loading"
//       className="fixed inset-0 z-[100] bg-transparent pointer-events-none"
//     >
//       {/* 12-Column Structural Grid Background */}
//       <div className="absolute inset-0 flex pointer-events-auto">
//         {Array.from({ length: BLOCK_COUNT }).map((_, i) => (
//           <div
//             key={i}
//             ref={(el) => {
//               if (el) blocksRef.current[i] = el;
//             }}
//             className="flex-1 bg-background border-r border-border/20 last:border-r-0 will-change-transform"
//           />
//         ))}
//       </div>

//       {/* High-End Typographic Centerpiece */}
//       <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6">
        
//         {/* Brand Name */}
//         <div className="overflow-hidden mb-4">
//           <div ref={brandRef} className="preloader-text-inner text-sm md:text-base font-mono uppercase tracking-[0.3em] text-muted-foreground">
//             {t("brand.amana", "HopeBridge")}
//           </div>
//         </div>

//         {/* Massive Percentage Counter */}
//         <div className="overflow-hidden leading-[0.8]">
//           <span
//             ref={pctRef}
//             className="preloader-text-inner block font-display font-black text-[25vw] md:text-[20vw] tracking-tighter text-foreground tabular-nums"
//           >
//             000
//           </span>
//         </div>
//       </div>

//       {/* Sleek Progress Line */}
//       <div className="absolute bottom-10 left-10 right-10 md:left-20 md:right-20 h-[2px] bg-border overflow-hidden rounded-full pointer-events-none">
//         <div 
//           ref={progressLineRef} 
//           className="w-full h-full bg-primary will-change-transform"
//         />
//       </div>
//     </div>
//   );
// }

// import { useEffect, useRef, useState } from "react";
// import { useLenis } from "lenis/react";
// import gsap from "gsap";
// import { useAnimationCoordinator } from "@/components/AnimationCoordinator";
// import { useTranslation } from "react-i18next";

// const BLOCK_COUNT = 12; // Matches TransitionSkeleton
// const SESSION_KEY = "amana-preloader-shown";

// function safeSessionGet(key: string) {
//   try { return sessionStorage.getItem(key); } catch { return null; }
// }
// function safeSessionSet(key: string, value: string) {
//   try { sessionStorage.setItem(key, value); } catch {}
// }

// export default function Preloader() {
//   const { t } = useTranslation();
//   const [mounted, setMounted] = useState(() => {
//     if (typeof window === "undefined") return true;
//     return !safeSessionGet(SESSION_KEY);
//   });
  
//   // Using state to drive the micro-copy
//   const [status, setStatus] = useState("INITIALIZING SEQUENCE");

//   const rootRef = useRef<HTMLDivElement>(null);
//   const blocksRef = useRef<HTMLDivElement[]>([]);
//   const pctRef = useRef<HTMLSpanElement>(null);
//   const progressLineRef = useRef<HTMLDivElement>(null);
  
//   const lenis = useLenis();
//   const { triggerAnimations, claim } = useAnimationCoordinator();

//   useEffect(() => {
//     if (!mounted) return;

//     claim();
//     lenis?.stop();
//     document.body.style.overflow = "hidden";

//     gsap.set(blocksRef.current, { transformOrigin: "bottom" }); // We'll lift them UP and out
//     gsap.set(progressLineRef.current, { scaleX: 0, transformOrigin: "left" });
//     gsap.set(".reveal-text", { yPercent: 120, skewY: 8, opacity: 0 });

//     const state = { value: 0 };

//     const setProgress = (v: number) => {
//       const clamped = Math.min(100, Math.max(0, v));
      
//       if (pctRef.current) {
//         pctRef.current.textContent = Math.floor(clamped).toString().padStart(3, "0");
//       }
      
//       if (progressLineRef.current) {
//         gsap.set(progressLineRef.current, { scaleX: clamped / 100 });
//       }

//       // Dynamic Micro-copy updates
//       if (clamped > 80) setStatus("SYSTEM READY");
//       else if (clamped > 50) setStatus("RENDERING ASSETS");
//       else if (clamped > 25) setStatus("ESTABLISHING CONNECTION");

//       rootRef.current?.setAttribute("aria-valuenow", String(Math.floor(clamped)));
//     };

//     setProgress(0);
//     const tl = gsap.timeline();

//     // The SOTD Intro: Razor-sharp reveal
//     tl.to(".reveal-text", {
//       yPercent: 0,
//       skewY: 0,
//       opacity: 1,
//       duration: 1.4,
//       stagger: 0.1,
//       ease: "power4.out",
//     });

//     // The Climb: Variable speeds feel organic
//     tl.to(state, { value: 38, duration: 0.7, ease: "circ.out", onUpdate: () => setProgress(state.value) }, "-=0.8")
//       .to(state, { value: 65, duration: 1.2, ease: "power2.inOut", onUpdate: () => setProgress(state.value) })
//       .to(state, { value: 85, duration: 0.5, ease: "power3.in", onUpdate: () => setProgress(state.value) });

//     const ready = Promise.all([
//       document.fonts ? document.fonts.ready : Promise.resolve(),
//       document.readyState === "complete"
//         ? Promise.resolve()
//         : new Promise<void>((resolve) => window.addEventListener("load", () => resolve(), { once: true })),
//       new Promise((resolve) => setTimeout(resolve, 1000)), // Extended floor time to appreciate the design
//     ]);

//     tl.eventCallback("onComplete", () => {
//       const idlePulse = gsap.to(progressLineRef.current, {
//         opacity: 0.3,
//         duration: 0.6,
//         yoyo: true,
//         repeat: -1,
//         ease: "sine.inOut",
//       });

//       ready.then(() => {
//         idlePulse.kill();
//         gsap.set(progressLineRef.current, { opacity: 1 });

//         const finishTl = gsap.timeline();
        
//         finishTl
//           .to(state, { value: 100, duration: 0.4, ease: "power2.out", onUpdate: () => setProgress(state.value) })
          
//           // The Exit: Aggressive pull up
//           .to(".reveal-text", {
//             yPercent: -120,
//             skewY: -8,
//             opacity: 0,
//             duration: 0.8,
//             stagger: 0.05,
//             ease: "expo.in",
//           }, "+=0.1")
          
//           .to(progressLineRef.current, { scaleX: 0, transformOrigin: "right", duration: 0.5, ease: "power3.inOut" }, "-=0.6")
          
//           // The Grand Curtain: Edge-to-Center stagger feels like an aperture opening
//           .to(
//             blocksRef.current,
//             {
//               scaleY: 0,
//               duration: 1.2,
//               stagger: { each: 0.05, from: "edges" }, 
//               ease: "expo.inOut",
//             },
//             "-=0.2"
//           )
          
//           .call(() => { triggerAnimations("reveal"); }, [], "-=0.8")
          
//           .to(
//             rootRef.current,
//             {
//               opacity: 0,
//               duration: 0.1,
//               onComplete: () => {
//                 document.body.style.overflow = "";
//                 lenis?.start();
//                 safeSessionSet(SESSION_KEY, "1");
//                 setMounted(false);
//               },
//             }
//           );
//       });
//     });

//     return () => { tl.kill(); };
//   }, [mounted, claim, lenis, triggerAnimations]);

//   if (!mounted) return null;

//   return (
//     <div
//       ref={rootRef}
//       role="progressbar"
//       aria-valuemin={0}
//       aria-valuemax={100}
//       aria-label="Page loading"
//       className="fixed inset-0 z-[100] bg-transparent pointer-events-none"
//     >
//       {/* SOTD Polish: SVG Film Grain Overlay */}
//       <svg className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.03] mix-blend-difference">
//         <filter id="noiseFilter">
//           <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
//         </filter>
//         <rect width="100%" height="100%" filter="url(#noiseFilter)" />
//       </svg>

//       {/* 12-Column Grid */}
//       <div className="absolute inset-0 flex pointer-events-auto">
//         {Array.from({ length: BLOCK_COUNT }).map((_, i) => (
//           <div
//             key={i}
//             ref={(el) => { if (el) blocksRef.current[i] = el; }}
//             className="flex-1 bg-background border-r border-border/10 last:border-r-0 will-change-transform"
//           />
//         ))}
//       </div>

//       {/* Typographic Centerpiece */}
//       <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6">
        
//         {/* Dynamic Micro-Copy */}
//         <div className="overflow-hidden mb-6">
//           <div className="reveal-text text-xs md:text-sm font-mono uppercase tracking-[0.4em] text-muted-foreground/80">
//             {status}
//           </div>
//         </div>

//         {/* Massive Percentage Counter */}
//         <div className="overflow-hidden leading-[0.75] pb-4">
//           <span
//             ref={pctRef}
//             className="reveal-text block font-display font-black text-[28vw] md:text-[22vw] tracking-tighter text-foreground tabular-nums drop-shadow-sm"
//           >
//             000
//           </span>
//         </div>

//         {/* Brand Name */}
//         <div className="overflow-hidden mt-2">
//           <div className="reveal-text text-sm md:text-base font-medium uppercase tracking-[0.2em] text-foreground">
//             {t("brand.amana", "HopeBridge")}
//           </div>
//         </div>
//       </div>

//       {/* Editorial Hairline Progress */}
//       <div className="absolute bottom-8 left-8 right-8 md:bottom-12 md:left-12 md:right-12 h-[1px] bg-border/30 overflow-hidden pointer-events-none">
//         <div 
//           ref={progressLineRef} 
//           className="w-full h-full bg-foreground will-change-transform"
//         />
//       </div>
//     </div>
//   );
// }

// import { useEffect, useRef, useState } from "react";
// import { useLenis } from "lenis/react";
// import gsap from "gsap";
// import { useAnimationCoordinator } from "@/components/AnimationCoordinator";
// import { useTranslation } from "react-i18next";

// const SESSION_KEY = "amana-preloader-shown";

// // 5 mathematically angled shards that overlap by 0.5% to prevent sub-pixel hairline cracks
// const SLICES = [
//   { clipPath: "polygon(0% 0%, 20.5% 0%, 40.5% 100%, 0% 100%)", dir: -1 },
//   { clipPath: "polygon(20% 0%, 40.5% 0%, 60.5% 100%, 40% 100%)", dir: 1 },
//   { clipPath: "polygon(40% 0%, 60.5% 0%, 80.5% 100%, 60% 100%)", dir: -1 },
//   { clipPath: "polygon(60% 0%, 80.5% 0%, 100% 100%, 80% 100%)", dir: 1 },
//   { clipPath: "polygon(80% 0%, 100% 0%, 100% 100%, 100% 100%)", dir: -1 }, // Fills the top-right triangle
// ];

// function safeSessionGet(key: string) {
//   try { return sessionStorage.getItem(key); } catch { return null; }
// }
// function safeSessionSet(key: string, value: string) {
//   try { sessionStorage.setItem(key, value); } catch {}
// }

// export default function Preloader() {
//   const { t } = useTranslation();
//   const [mounted, setMounted] = useState(() => {
//     if (typeof window === "undefined") return true;
//     if (safeSessionGet(SESSION_KEY)) return false;
//     try {
//       if (localStorage.getItem('token')) {
//         safeSessionSet(SESSION_KEY, "1");
//         return false;
//       }
//     } catch {}
//     return true;
//   });
  
//   const [status, setStatus] = useState("INITIALIZING SEQUENCE");

//   const rootRef = useRef<HTMLDivElement>(null);
//   const decorRef = useRef<HTMLDivElement>(null);
//   const slicesRef = useRef<HTMLDivElement[]>([]);
//   const pctRef = useRef<HTMLSpanElement>(null);
//   const progressLineRef = useRef<HTMLDivElement>(null);
  
//   const lenis = useLenis();
//   const { triggerAnimations, claim } = useAnimationCoordinator();

//   useEffect(() => {
//     if (!mounted) return;

//     claim();
//     lenis?.stop();
//     document.body.style.overflow = "hidden";

//     gsap.set(progressLineRef.current, { scaleX: 0, transformOrigin: "center" });
    
//     // Set initial 3D transform for the mechanical flip-in
//     gsap.set(".reveal-text", { 
//       rotateX: 90, 
//       yPercent: 50, 
//       opacity: 0, 
//       transformOrigin: "bottom center",
//       perspective: 1000 
//     });

//     const state = { value: 0 };

//     const setProgress = (v: number) => {
//       const clamped = Math.min(100, Math.max(0, v));
      
//       if (pctRef.current) {
//         pctRef.current.textContent = Math.floor(clamped).toString().padStart(3, "0");
//       }
//       if (progressLineRef.current) {
//         gsap.set(progressLineRef.current, { scaleX: clamped / 100 });
//       }

//       if (clamped > 80) setStatus("SYSTEM READY");
//       else if (clamped > 50) setStatus("RENDERING ASSETS");
//       else if (clamped > 25) setStatus("ESTABLISHING CONNECTION");

//       rootRef.current?.setAttribute("aria-valuenow", String(Math.floor(clamped)));
//     };

//     setProgress(0);
//     const tl = gsap.timeline();

//     // The Intro: Mechanical 3D flip-up
//     tl.to(".reveal-text", {
//       rotateX: 0,
//       yPercent: 0,
//       opacity: 1,
//       duration: 1.2,
//       stagger: 0.1,
//       ease: "expo.out",
//     });

//     // The Climb
//     tl.to(state, { value: 38, duration: 0.7, ease: "circ.out", onUpdate: () => setProgress(state.value) }, "-=0.6")
//       .to(state, { value: 65, duration: 1.2, ease: "power2.inOut", onUpdate: () => setProgress(state.value) })
//       .to(state, { value: 85, duration: 0.5, ease: "power3.in", onUpdate: () => setProgress(state.value) });

//     const ready = Promise.all([
//       document.fonts ? document.fonts.ready : Promise.resolve(),
//       document.readyState === "complete"
//         ? Promise.resolve()
//         : new Promise<void>((resolve) => window.addEventListener("load", () => resolve(), { once: true })),
//       new Promise((resolve) => setTimeout(resolve, 1200)), // Hold to let them admire the aesthetic
//     ]);

//     tl.eventCallback("onComplete", () => {
//       const idlePulse = gsap.to(progressLineRef.current, {
//         opacity: 0.2,
//         duration: 0.6,
//         yoyo: true,
//         repeat: -1,
//         ease: "sine.inOut",
//       });

//       ready.then(() => {
//         idlePulse.kill();
//         gsap.set(progressLineRef.current, { opacity: 1 });

//         const finishTl = gsap.timeline();
        
//         finishTl
//           .to(state, { value: 100, duration: 0.3, ease: "power2.out", onUpdate: () => setProgress(state.value) })
          
//           // 1. Shrink progress line to the center
//           .to(progressLineRef.current, { scaleX: 0, duration: 0.5, ease: "expo.inOut" }, "+=0.1")
          
//           // 2. The Text Exit: Fold backwards into the floor
//           .to(".reveal-text", {
//             rotateX: -90,
//             yPercent: 50,
//             opacity: 0,
//             duration: 0.6,
//             stagger: 0.05,
//             ease: "power3.in",
//           }, "-=0.3")

//           // 3. Exactly 0.1s later, make the decorative layer disappear completely
//           .to(decorRef.current, {
//             opacity: 0,
//             duration: 0.4,
//             ease: "power2.out"
//           }, "-=0.1")
          
//           // 4. THE KINETIC SHATTER: Shards violently alternate up and down
//           .to(
//             slicesRef.current,
//             {
//               yPercent: (i) => SLICES[i].dir * 105, // Moves up or down based on dir
//               duration: 1.2,
//               stagger: 0.04,
//               ease: "expo.inOut",
//             },
            
//             "-=0.5" // Triggers just as the text finishes folding away
//           )
          
//           // 5. Signal the hero section to animate in before the shatter finishes
//           .call(() => { 
//             triggerAnimations("reveal"); }, [], "-=0.7"
            
//           )
          
//           .to(
//             rootRef.current,
//             {
//               opacity: 0,
//               duration: 0.1,
//               onComplete: () => {
//                 document.body.style.overflow = "";
//                 lenis?.start();
//                 safeSessionSet(SESSION_KEY, "1");
//                 setMounted(false);
//               },
//             },
//             "-=0.1"
//           );
//       });
//     });

//     return () => { tl.kill(); };
//   }, [mounted, claim, lenis, triggerAnimations]);

//   if (!mounted) return null;

//   return (
//     <div
//       ref={rootRef}
//       role="progressbar"
//       aria-valuemin={0}
//       aria-valuemax={100}
//       aria-label="Page loading"
//       className="fixed inset-0 z-[100] bg-transparent pointer-events-none"
//     > 

//       {/* The Kinetic Shards Background */}
//       <div  
//       className="absolute inset-0 pointer-events-auto overflow-hidden">
//         {SLICES.map((slice, i) => (
//           <div
//             key={i}
//             ref={(el) => { if (el) slicesRef.current[i] = el; }}
//             className="absolute inset-0 bg-background will-change-transform shadow-[0_0_20px_rgba(0,0,0,0.05)]"
//             style={{ clipPath: slice.clipPath }}
//           />
//         ))}
//       </div>

//       {/* ── Awwwards Decorative Layer — sits above shards, below text (z-[5] < z-10) ── */}
//       <div 
//       ref={decorRef}
//       className="absolute inset-0 pointer-events-none z-[5]">

//       {/* SOTD Polish: Film Grain Overlay */}
//       <svg className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.13] mix-blend-difference">
//         <filter id="noiseFilter">
//           <feTurbulence type="fractalNoise" baseFrequency="1" numOctaves="3" stitchTiles="stitch" />
//         </filter>
//         <rect width="100%" height="100%" filter="url(#noiseFilter)" />
//       </svg>

//         {/* Shard boundary lines */}
        
//           <svg 
//           className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
//             <line x1="20%" y1="0%" x2="40%" y2="100%" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.12" />
//             <line x1="40%" y1="0%" x2="60%" y2="100%" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.12" />
//             <line x1="60%" y1="0%" x2="80%" y2="100%" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.12" />
//             <line x1="80%" y1="0%" x2="100%" y2="100%" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.12" />
//           </svg>


//         {/* Corner brackets — one SVG per corner */}
//         <svg className="absolute top-6 left-6" width="28" height="28" viewBox="0 0 28 28" style={{ opacity: 0.35 }}>
//           <path d="M 0 28 L 0 0 L 28 0" fill="none" stroke="currentColor" strokeWidth="1" />
//         </svg>
//         <svg className="absolute top-6 right-6" width="28" height="28" viewBox="0 0 28 28" style={{ opacity: 0.35 }}>
//           <path d="M 28 28 L 28 0 L 0 0" fill="none" stroke="currentColor" strokeWidth="1" />
//         </svg>
//         <svg className="absolute bottom-6 left-6" width="28" height="28" viewBox="0 0 28 28" style={{ opacity: 0.35 }}>
//           <path d="M 0 0 L 0 28 L 28 28" fill="none" stroke="currentColor" strokeWidth="1" />
//         </svg>
//         <svg className="absolute bottom-6 right-6" width="28" height="28" viewBox="0 0 28 28" style={{ opacity: 0.35 }}>
//           <path d="M 28 0 L 28 28 L 0 28" fill="none" stroke="currentColor" strokeWidth="1" />
//         </svg>

//         {/* Corner info labels */}
//         <div className="absolute top-[18px] left-[58px] font-mono text-[9px] uppercase tracking-[0.25em] text-foreground/25 leading-tight">
//           <div>SYS:INIT</div>
//           <div>v2.4.1</div>
//         </div>
//         <div className="absolute top-[18px] right-[58px] font-mono text-[9px] uppercase tracking-[0.25em] text-foreground/25 leading-tight text-right">
//           <div>AMANA/OS</div>
//           <div>2024.12</div>
//         </div>
//         <div className="absolute bottom-[18px] left-[58px] font-mono text-[9px] uppercase tracking-[0.25em] text-foreground/25 leading-tight">
//           <div>15°N 38°E</div>
//           <div>ADDIS ABABA</div>
//         </div>
//         <div className="absolute bottom-[18px] right-[58px] font-mono text-[9px] uppercase tracking-[0.25em] text-foreground/25 leading-tight text-right">
//           <div>FRAME 001</div>
//           <div>RENDER</div>
//         </div>

//         {/* Crosshair ring behind the percentage */}
//         <svg
//           className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
//           width="260" height="260" viewBox="0 0 260 260"
//           style={{ opacity: 0.07 }}
//         >
//           <circle cx="130" cy="130" r="124" fill="none" stroke="currentColor" strokeWidth="0.75" />
//           <circle cx="130" cy="130" r="96" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 6" />
//           <line x1="130" y1="6"   x2="130" y2="86"  stroke="currentColor" strokeWidth="0.75" />
//           <line x1="130" y1="174" x2="130" y2="254" stroke="currentColor" strokeWidth="0.75" />
//           <line x1="6"   y1="130" x2="86"  y2="130" stroke="currentColor" strokeWidth="0.75" />
//           <line x1="174" y1="130" x2="254" y2="130" stroke="currentColor" strokeWidth="0.75" />
//           <line x1="130" y1="6"   x2="130" y2="18"  stroke="currentColor" strokeWidth="1.5" />
//           <line x1="130" y1="242" x2="130" y2="254" stroke="currentColor" strokeWidth="1.5" />
//           <line x1="6"   y1="130" x2="18"  y2="130" stroke="currentColor" strokeWidth="1.5" />
//           <line x1="242" y1="130" x2="254" y2="130" stroke="currentColor" strokeWidth="1.5" />
//           <circle cx="130" cy="130" r="2" fill="currentColor" />
//         </svg>

//         {/* Horizontal scan rules */}
//         <div className="absolute left-0 right-0 h-px bg-foreground/[0.06]" style={{ top: "28%" }} />
//         <div className="absolute left-0 right-0 h-px bg-foreground/[0.06]" style={{ top: "72%" }} />

//         {/* Vertical edge rules */}
//         <div className="absolute top-0 bottom-0 w-px bg-foreground/[0.05]" style={{ left: "6%" }} />
//         <div className="absolute top-0 bottom-0 w-px bg-foreground/[0.05]" style={{ right: "6%" }} />

//       </div>

//       {/* Typographic Centerpiece */}
//       <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6 z-10" style={{ perspective: "1000px" }}>
        
//         {/* Dynamic Micro-Copy */}
//         <div className="mb-6">
//           <div className="reveal-text text-xs md:text-sm font-mono uppercase tracking-[0.4em] text-muted-foreground/80">
//             {status}
//           </div>
//         </div>

//         {/* Massive Percentage Counter */}
//         <div className="leading-[0.75] pb-4">
//           <span
//             ref={pctRef}
//             className="reveal-text block font-display font-black text-[28vw] md:text-[22vw] tracking-tighter text-foreground tabular-nums drop-shadow-sm"
//           >
//             000
//           </span>
//         </div>

//         {/* Brand Name */}
//         <div className="mt-2">
//           <div className="reveal-text text-sm md:text-base font-medium uppercase tracking-[0.2em] text-foreground">
//             {t("brand.amana", "HopeBridge")}
//           </div>
//         </div>
//       </div>

//       {/* Editorial Hairline Progress */}
//       <div className="absolute bottom-8 left-8 right-8 md:bottom-12 md:left-12 md:right-12 h-[1px] bg-border/30 overflow-hidden pointer-events-none z-10">
//         <div 
//           ref={progressLineRef} 
//           className="w-full h-full bg-foreground will-change-transform"
//         />
//       </div>
//     </div>
//   );
// }

// import { useEffect, useRef, useState } from "react";
// import { useLenis } from "lenis/react";
// import gsap from "gsap";
// import { useAnimationCoordinator } from "@/components/AnimationCoordinator";
// import { useTranslation } from "react-i18next";

// const SESSION_KEY = "amana-preloader-shown";

// function safeSessionGet(key: string) {
//   try { return sessionStorage.getItem(key); } catch { return null; }
// }
// function safeSessionSet(key: string, value: string) {
//   try { sessionStorage.setItem(key, value); } catch {}
// }

// export default function Preloader() {
//   const { t } = useTranslation();
//   const [mounted, setMounted] = useState(() => {
//     if (typeof window === "undefined") return true;
//     if (safeSessionGet(SESSION_KEY)) return false;
//     try {
//       if (localStorage.getItem('token')) {
//         safeSessionSet(SESSION_KEY, "1");
//         return false;
//       }
//     } catch {}
//     return true;
//   });

//   const rootRef = useRef<HTMLDivElement>(null);
//   const wordRef = useRef<HTMLSpanElement>(null);
//   const ruleRef = useRef<HTMLDivElement>(null);
//   const cornerTLRef = useRef<SVGSVGElement>(null);
//   const cornerBRRef = useRef<SVGSVGElement>(null);

//   const lenis = useLenis();
//   const { triggerAnimations, claim } = useAnimationCoordinator();

//   useEffect(() => {
//     if (!mounted) return;

//     claim();
//     lenis?.stop();
//     document.body.style.overflow = "hidden";

//     // Initial state — wordmark sits below its mask, out of focus.
//     // gsap.set(wordRef.current, { yPercent: 115, opacity: 0, filter: "blur(16px)" });
//     // gsap.set(ruleRef.current, { scaleX: 0, transformOrigin: "left center" });
//     // gsap.set([cornerTLRef.current, cornerBRRef.current], { opacity: 0 });

//     // const tl = gsap.timeline();

//     // // The intro — one confident mask reveal. Deliberately the only "move" here;
//     // // it also mirrors the hero's own headline treatment so the two feel like
//     // // one continuous gesture rather than two separate animations.
//     // tl.to(wordRef.current, {
//     //   yPercent: 0,
//     //   opacity: 1,
//     //   filter: "blur(0px)",
//     //   duration: 1.1,
//     //   ease: "expo.out",
//     //   clearProps: "filter",
//     // })
//     //   .to(
//     //     [cornerTLRef.current, cornerBRRef.current],
//     //     { opacity: 0.35, duration: 0.6, ease: "power2.out", stagger: 0.06 },
//     //     "-=0.8"
//     //   )
//     //   .to(ruleRef.current, { scaleX: 1, duration: 1.2, ease: "power3.inOut" }, "-=0.9");

//     // Initial state — wordmark sits below its mask, out of focus.
//     gsap.set(wordRef.current, { yPercent: 115, opacity: 0, filter: "blur(10px)" });
//     gsap.set(ruleRef.current, { scaleX: 0, transformOrigin: "left center" });
//     gsap.set([cornerTLRef.current, cornerBRRef.current], { opacity: 0 });

//     const tl = gsap.timeline();

//     // The intro — one confident mask reveal. Deliberately the only "move" here;
//     // it also mirrors the hero's own headline treatment so the two feel like
//     // one continuous gesture rather than two separate animations.
//     tl.to(wordRef.current, {
//       yPercent: 0,
//       opacity: 1,
//       filter: "blur(0px)",
//       duration: 0.75,
//       ease: "expo.out",
//       clearProps: "filter",
//     })
//       .to(
//         [cornerTLRef.current, cornerBRRef.current],
//         { opacity: 0.35, duration: 0.5, ease: "power2.out", stagger: 0.06 },
//         "-=0.55"
//       )
//       .to(ruleRef.current, { scaleX: 1, duration: 0.9, ease: "power3.inOut" }, "-=0.65");

//     const ready = Promise.all([
//       document.fonts ? document.fonts.ready : Promise.resolve(),
//       document.readyState === "complete"
//         ? Promise.resolve()
//         : new Promise<void>((resolve) => window.addEventListener("load", () => resolve(), { once: true })),
//       new Promise((resolve) => setTimeout(resolve, 900)), // minimum hold so the reveal isn't cut short on fast loads
//     ]);

//     tl.eventCallback("onComplete", () => {
//       // Idle pulse on the rule while we wait on real asset readiness.
//       const idlePulse = gsap.to(ruleRef.current, {
//         opacity: 0.35,
//         duration: 0.7,
//         yoyo: true,
//         repeat: -1,
//         ease: "sine.inOut",
//       });

//       ready.then(() => {
//         idlePulse.kill();
//         gsap.set(ruleRef.current, { opacity: 1 });

//         // The exit — a clean fade, nothing more. Cheap (opacity + scale only,
//         // no filter) since the hero's WebGL canvas is spinning up underneath
//         // at the same moment.
//         const exitTl = gsap.timeline({
//           onComplete: () => {
//             document.body.style.overflow = "";
//             lenis?.start();
//             safeSessionSet(SESSION_KEY, "1");
//             setMounted(false);
//           },
//         });

//         exitTl
//           .to(rootRef.current, { opacity: 0, scale: 1.02, duration: 0.9, ease: "power2.out" })
//           // Hand off to the hero slightly before we're fully gone — a clean
//           // crossfade instead of a dead gap between preloader and content.
//           .call(() => { triggerAnimations("reveal"); }, [], 0.3);
//       });
//     });

//     return () => { tl.kill(); };
//   }, [mounted, claim, lenis, triggerAnimations]);

//   if (!mounted) return null;

//   return (
//     <div
//       ref={rootRef}
//       role="status"
//       aria-live="polite"
//       aria-label={t("preloader.loading", "Loading Amana")}
//       className="fixed inset-0 z-[100] bg-background flex items-center justify-center"
//     >
//       {/* Corner brackets — quiet structural echo of the hero, nothing more */}
//       <svg ref={cornerTLRef} className="absolute top-6 left-6" width="22" height="22" viewBox="0 0 28 28" aria-hidden="true">
//         <path d="M 0 28 L 0 0 L 28 0" fill="none" stroke="currentColor" strokeWidth="1" className="text-foreground" />
//       </svg>
//       <svg ref={cornerBRRef} className="absolute bottom-6 right-6" width="22" height="22" viewBox="0 0 28 28" aria-hidden="true">
//         <path d="M 28 0 L 28 28 L 0 28" fill="none" stroke="currentColor" strokeWidth="1" className="text-foreground" />
//       </svg>

//       <div className="flex flex-col items-center px-6">
//         <div className="overflow-hidden py-2">
//           <span
//             ref={wordRef}
//             className="block font-display font-black text-[clamp(2.25rem,8vw,5rem)] leading-none tracking-[-0.03em] text-foreground will-change-transform"
//           >
//             {t("brand.amana", "Amana")}
//           </span>
//         </div>
//         <div className="w-[120px] h-px bg-border/60 overflow-hidden mt-6">
//           <div ref={ruleRef} className="w-full h-full bg-foreground will-change-transform" />
//         </div>
//       </div>
//     </div>
//   );
// }

// import { useEffect, useRef, useState } from "react";
// import { useLenis } from "lenis/react";
// import gsap from "gsap";
// import { useAnimationCoordinator } from "@/components/AnimationCoordinator";
// import { useTranslation } from "react-i18next";

// const SESSION_KEY = "amana-preloader-shown";

// function safeSessionGet(key: string) {
//   try { return sessionStorage.getItem(key); } catch { return null; }
// }
// function safeSessionSet(key: string, value: string) {
//   try { sessionStorage.setItem(key, value); } catch {}
// }

// export default function Preloader() {
//   const { t } = useTranslation();
//   const [mounted, setMounted] = useState(() => {
//     if (typeof window === "undefined") return true;
//     if (safeSessionGet(SESSION_KEY)) return false;
//     try {
//       if (localStorage.getItem('token')) {
//         safeSessionSet(SESSION_KEY, "1");
//         return false;
//       }
//     } catch {}
//     return true;
//   });

//   const rootRef = useRef<HTMLDivElement>(null);
//   const wordRef = useRef<HTMLSpanElement>(null);
//   const ruleRef = useRef<HTMLDivElement>(null);
//   const cornerTLRef = useRef<SVGSVGElement>(null);
//   const cornerBRRef = useRef<SVGSVGElement>(null);
//   // Dormant echo of the hero's dispatch-ring motif — present but static here,
//   // so the "signal" has a seed before it wakes up and starts pulsing on handoff.
//   const signalOuterRef = useRef<SVGCircleElement>(null);
//   const signalInnerRef = useRef<SVGCircleElement>(null);

//   const lenis = useLenis();
//   const { triggerAnimations, claim } = useAnimationCoordinator();

//   useEffect(() => {
//     if (!mounted) return;

//     claim();
//     lenis?.stop();
//     document.body.style.overflow = "hidden";

//     // Initial state — wordmark sits below its mask, out of focus.
//     // gsap.set(wordRef.current, { yPercent: 115, opacity: 0, filter: "blur(16px)" });
//     // gsap.set(ruleRef.current, { scaleX: 0, transformOrigin: "left center" });
//     // gsap.set([cornerTLRef.current, cornerBRRef.current], { opacity: 0 });

//     // const tl = gsap.timeline();

//     // // The intro — one confident mask reveal. Deliberately the only "move" here;
//     // // it also mirrors the hero's own headline treatment so the two feel like
//     // // one continuous gesture rather than two separate animations.
//     // tl.to(wordRef.current, {
//     //   yPercent: 0,
//     //   opacity: 1,
//     //   filter: "blur(0px)",
//     //   duration: 1.1,
//     //   ease: "expo.out",
//     //   clearProps: "filter",
//     // })
//     //   .to(
//     //     [cornerTLRef.current, cornerBRRef.current],
//     //     { opacity: 0.35, duration: 0.6, ease: "power2.out", stagger: 0.06 },
//     //     "-=0.8"
//     //   )
//     //   .to(ruleRef.current, { scaleX: 1, duration: 1.2, ease: "power3.inOut" }, "-=0.9");

//     // Initial state — wordmark sits below its mask, out of focus.
//     gsap.set(wordRef.current, { yPercent: 115, opacity: 0, filter: "blur(10px)" });
//     gsap.set(ruleRef.current, { scaleX: 0, transformOrigin: "left center" });
//     gsap.set([cornerTLRef.current, cornerBRRef.current], { opacity: 0 });
//     gsap.set([signalOuterRef.current, signalInnerRef.current], { opacity: 0 });

//     const tl = gsap.timeline();

//     // The intro — one confident mask reveal. Deliberately the only "move" here;
//     // it also mirrors the hero's own headline treatment so the two feel like
//     // one continuous gesture rather than two separate animations.
//     tl.to(wordRef.current, {
//       yPercent: 0,
//       opacity: 1,
//       filter: "blur(0px)",
//       duration: 0.75,
//       ease: "expo.out",
//       clearProps: "filter",
//     })
//       .to(
//         [cornerTLRef.current, cornerBRRef.current],
//         { opacity: 0.35, duration: 0.5, ease: "power2.out", stagger: 0.06 },
//         "-=0.55"
//       )
//       .to(ruleRef.current, { scaleX: 1, duration: 0.9, ease: "power3.inOut" }, "-=0.65");

//     // Signal seed — appended after the chain above (not inserted into it) so
//     // it can't shift the timing that's already tuned. It's allowed to settle
//     // in a beat later than everything else; it's just atmosphere.
//     tl.to(signalOuterRef.current, { opacity: 0.07, duration: 0.9, ease: "power2.out" }, "-=0.7")
//       .to(signalInnerRef.current, { opacity: 0.11, duration: 0.85, ease: "power2.out" }, "-=0.75");

//     const ready = Promise.all([
//       document.fonts ? document.fonts.ready : Promise.resolve(),
//       document.readyState === "complete"
//         ? Promise.resolve()
//         : new Promise<void>((resolve) => window.addEventListener("load", () => resolve(), { once: true })),
//       new Promise((resolve) => setTimeout(resolve, 900)), // minimum hold so the reveal isn't cut short on fast loads
//     ]);

//     tl.eventCallback("onComplete", () => {
//       // Idle pulse on the rule while we wait on real asset readiness.
//       const idlePulse = gsap.to(ruleRef.current, {
//         opacity: 0.35,
//         duration: 0.7,
//         yoyo: true,
//         repeat: -1,
//         ease: "sine.inOut",
//       });

//       ready.then(() => {
//         idlePulse.kill();
//         gsap.set(ruleRef.current, { opacity: 1 });

//         // The exit — a clean fade, nothing more. Cheap (opacity + scale only,
//         // no filter) since the hero's WebGL canvas is spinning up underneath
//         // at the same moment.
//         const exitTl = gsap.timeline({
//           onComplete: () => {
//             document.body.style.overflow = "";
//             lenis?.start();
//             safeSessionSet(SESSION_KEY, "1");
//             setMounted(false);
//           },
//         });

//         exitTl
//           .to(rootRef.current, { opacity: 0, scale: 1.02, duration: 0.9, ease: "power2.out" })
//           // Hand off to the hero slightly before we're fully gone — a clean
//           // crossfade instead of a dead gap between preloader and content.
//           .call(() => { triggerAnimations("reveal"); }, [], 0.3);
//       });
//     });

//     return () => { tl.kill(); };
//   }, [mounted, claim, lenis, triggerAnimations]);

//   if (!mounted) return null;

//   return (
//     <div
//       ref={rootRef}
//       role="status"
//       aria-live="polite"
//       aria-label={t("preloader.loading", "Loading Amana")}
//       className="fixed inset-0 z-[100] bg-background flex items-center justify-center"
//     >
//       {/* Corner brackets — quiet structural echo of the hero, nothing more */}
//       <svg ref={cornerTLRef} className="absolute top-6 left-6" width="22" height="22" viewBox="0 0 28 28" aria-hidden="true">
//         <path d="M 0 28 L 0 0 L 28 0" fill="none" stroke="currentColor" strokeWidth="1" className="text-foreground" />
//       </svg>
//       <svg ref={cornerBRRef} className="absolute bottom-6 right-6" width="22" height="22" viewBox="0 0 28 28" aria-hidden="true">
//         <path d="M 28 0 L 28 28 L 0 28" fill="none" stroke="currentColor" strokeWidth="1" className="text-foreground" />
//       </svg>

//       {/* Signal seed — dormant echo of the hero's dispatch-ring motif, centered
//           behind the wordmark. Static here; it only starts pulsing once we
//           hand off to the hero, so the two components read as one gesture. */}
//       <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
//         <circle ref={signalOuterRef} cx="50%" cy="50%" r="150" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" />
//         <circle ref={signalInnerRef} cx="50%" cy="50%" r="98" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" />
//       </svg>

//       <div className="flex flex-col items-center px-6">
//         <div className="overflow-hidden py-2">
//           <span
//             ref={wordRef}
//             className="block font-display font-black text-[clamp(2.25rem,8vw,5rem)] leading-none tracking-[-0.03em] text-foreground will-change-transform"
//           >
//             {t("brand.amana", "Amana")}
//           </span>
//         </div>
//         <div className="w-[120px] h-px bg-border/60 overflow-hidden mt-6">
//           <div ref={ruleRef} className="w-full h-full bg-foreground will-change-transform" />
//         </div>
//       </div>
//     </div>
//   );
// }