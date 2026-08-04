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
import { useEffect, useRef, useState, type RefObject } from "react";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { useAnimationCoordinator } from "@/components/AnimationCoordinator";
import { useTranslation } from "react-i18next";
import { heroApi } from "@/services/api.service";
import type { HeroStats } from "@/types/api";

const SESSION_KEY = "amana-preloader-shown";

// Fallback stats — keep the page looking complete if anything goes wrong.
const FALLBACK_HERO_STATS: HeroStats = {
  counters: { familiesSupported: 78, eventsThisYear: 24, raisedEtb: 125_000 },
  progress: { raised: 125_000, goal: 2_000_000, percent: 6.25 },
  ticker: {
    donations: [],
    support: [],
    aggregates: { raisedThisMonth: 0, urgentFamilies: 0, totalDonors: 0 },
  },
};

function safeSessionGet(key: string) {
  try { return sessionStorage.getItem(key); } catch { return null; }
}
function safeSessionSet(key: string, value: string) {
  try { sessionStorage.setItem(key, value); } catch {}
}

const PRELOADER_VERT_SRC = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

// A soft, drifting glow — not the hero's full domain-warped fbm. This canvas
// is only ever on screen for a couple of seconds, so two octaves of value
// noise nudging a radial highlight around is plenty.
const PRELOADER_FRAG_SRC = `
precision mediump float;

uniform vec2  u_res;
uniform float u_time;
uniform float u_dark;
uniform vec3  u_c1;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float softNoise(vec2 p) {
  float v = noise(p) * 0.6;
  v += noise(p * 2.1) * 0.4;
  return v;
}

void main() {
  vec2 st = gl_FragCoord.xy / u_res.y;
  vec2 center = vec2((u_res.x / u_res.y) * 0.5, 0.5);

  // Highlight center drifts on a loose, non-repeating path — two
  // out-of-phase sine terms read as organic rather than a perfect orbit.
  float t = u_time * 0.045;
  vec2 drift = vec2(sin(t * 0.8) * 0.16, cos(t * 0.63) * 0.12);
  float n = softNoise(st * 1.6 + t * 0.3);
  vec2 warpedCenter = center + drift + (n - 0.5) * 0.05;

  float dist = length(st - warpedCenter);
  float glow = smoothstep(0.6, 0.0, dist);

  vec3 col = u_c1 * mix(0.85, 1.2, n);
  float alpha = glow * mix(0.22, 0.14, u_dark) * (0.75 + 0.25 * n);

  gl_FragColor = vec4(col * alpha, alpha);
}
`;

// Same HSL parsing as the hero's shader hook — duplicated rather than
// imported since the two components don't share a utils module yet. Worth
// extracting if a third shader shows up.
function parseHsl(hslStr: string): [number, number, number] {
  if (!hslStr) return [0, 0, 0];
  const parts = hslStr.trim().split(/[\s,]+/);
  const h = parseFloat(parts[0]) / 360;
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;
  if (isNaN(h) || isNaN(s) || isNaN(l)) return [0, 0, 0];
  const hue2rgb = (p: number, q: number, tt: number) => {
    if (tt < 0) tt += 1; if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)];
}

// A cheap, short-lived aurora wash — same WebGL setup shape as the hero's
// useShaderBackground, stripped of mouse/scroll tracking (nothing to track
// during a preloader) and rendered at a lower octave count and resolution,
// since this only needs to hold up for a second or two, not a full page.
// function usePreloaderShader(canvasRef: RefObject<HTMLCanvasElement>) {
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
//         console.warn("[preloader shader]", gl.getShaderInfoLog(sh));
//       }
//       return sh;
//     };

//     const prog = gl.createProgram()!;
//     gl.attachShader(prog, compile(gl.VERTEX_SHADER, PRELOADER_VERT_SRC));
//     gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, PRELOADER_FRAG_SRC));
//     gl.linkProgram(prog);
//     gl.useProgram(prog);

//     const buf = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, buf);
//     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
//     const aPos = gl.getAttribLocation(prog, "a_pos");
//     gl.enableVertexAttribArray(aPos);
//     gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

//     const uRes = gl.getUniformLocation(prog, "u_res");
//     const uTime = gl.getUniformLocation(prog, "u_time");
//     const uDark = gl.getUniformLocation(prog, "u_dark");
//     const uC1 = gl.getUniformLocation(prog, "u_c1");

//     // Short-lived and full-bleed — a flat low scale is plenty; no need for
//     // the hero's screen-width branching.
//     const SCALE = 0.3;
//     const resize = () => {
//       canvas.width = Math.floor(canvas.clientWidth * SCALE);
//       canvas.height = Math.floor(canvas.clientHeight * SCALE);
//       gl.viewport(0, 0, canvas.width, canvas.height);
//     };
//     resize();
//     const ro = new ResizeObserver(resize);
//     ro.observe(canvas);

//     const isDark = () => document.documentElement.classList.contains("dark");
//     const readC1 = (): [number, number, number] =>
//       parseHsl(getComputedStyle(document.documentElement).getPropertyValue("--primary").trim());
//     const cachedC1 = readC1();

//     let rafId: number;
//     const render = (now: number) => {
//       gl.clearColor(0, 0, 0, 0);
//       gl.clear(gl.COLOR_BUFFER_BIT);
//       gl.uniform2f(uRes, canvas.width, canvas.height);
//       gl.uniform1f(uTime, reduceMotion ? 0 : now * 0.001);
//       gl.uniform1f(uDark, isDark() ? 1.0 : 0.0);
//       gl.uniform3fv(uC1, cachedC1);
//       gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
//       if (!reduceMotion) rafId = requestAnimationFrame(render);
//     };

//     if (reduceMotion) {
//       render(0); // one static frame — signal present, no motion
//     } else {
//       rafId = requestAnimationFrame(render);
//     }

//     return () => {
//       cancelAnimationFrame(rafId);
//       ro.disconnect();
//       gl.deleteProgram(prog);
//       gl.deleteBuffer(buf);
//     };
//   }, [canvasRef]);
// }
// A cheap, short-lived aurora wash — same WebGL setup shape as the hero's
// useShaderBackground, stripped of mouse/scroll tracking (nothing to track
// during a preloader) and rendered at a lower octave count and resolution,
// since this only needs to hold up for a second or two, not a full page.
function usePreloaderShader(canvasRef: RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn("[preloader shader]", gl.getShaderInfoLog(sh));
      }
      return sh;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, PRELOADER_VERT_SRC));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, PRELOADER_FRAG_SRC));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uDark = gl.getUniformLocation(prog, "u_dark");
    const uC1 = gl.getUniformLocation(prog, "u_c1");

    // Short-lived and full-bleed — a flat low scale is plenty.
    const SCALE = 0.3;
    
    // Moved resize logic out of a one-shot observer and into a function 
    // we can safely call every frame to bypass the 0x0 mounting race condition.
    const checkResize = () => {
      const targetW = Math.floor(canvas.clientWidth * SCALE);
      const targetH = Math.floor(canvas.clientHeight * SCALE);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    const isDark = () => document.documentElement.classList.contains("dark");
    const readC1 = (): [number, number, number] =>
      parseHsl(getComputedStyle(document.documentElement).getPropertyValue("--primary").trim());
    
    let cachedC1 = readC1();

    let rafId: number;
    const render = (now: number) => {
      // 1. Verify canvas has actual dimensions every frame
      checkResize();

      // 2. Race condition fallback: If our cached color is pure black (the parseHsl 
      // fallback for an empty string), keep polling until the CSS variables resolve.
      if (cachedC1[0] === 0 && cachedC1[1] === 0 && cachedC1[2] === 0) {
        cachedC1 = readC1();
      }

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, reduceMotion ? 0 : now * 0.001);
      gl.uniform1f(uDark, isDark() ? 1.0 : 0.0);
      gl.uniform3fv(uC1, cachedC1);
      
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      if (!reduceMotion) rafId = requestAnimationFrame(render);
    };

    if (reduceMotion) {
      // In reduced motion, we still run checkResize once, but we might need 
      // to defer it slightly if the dimensions are 0x0 right at mount.
      // A small timeout ensures it catches the layout if reduced motion stops the loop.
      if (canvas.clientWidth === 0) {
        setTimeout(() => render(0), 50);
      } else {
        render(0);
      }
    } else {
      rafId = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(rafId);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, [canvasRef]);
}

export default function Preloader() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(() => {
    if (typeof window === "undefined") return true;
    if (safeSessionGet(SESSION_KEY)) return false;
    try {
      if (localStorage.getItem('token')) {
        safeSessionSet(SESSION_KEY, "1");
        return false;
      }
    } catch {}
    return true;
  });

  const rootRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const cornerTLRef = useRef<SVGSVGElement>(null);
  const cornerBRRef = useRef<SVGSVGElement>(null);
  // Dormant echo of the hero's dispatch-ring motif — present but static here,
  // so the "signal" has a seed before it wakes up and starts pulsing on handoff.
  const signalOuterRef = useRef<SVGCircleElement>(null);
  const signalInnerRef = useRef<SVGCircleElement>(null);
  const shaderCanvasRef = useRef<HTMLCanvasElement>(null);
  usePreloaderShader(shaderCanvasRef);

const lenis = useLenis();
const { triggerAnimations, claim, setHeroStats } = useAnimationCoordinator();

  useEffect(() => {
    if (!mounted) return;

    claim();
    lenis?.stop();
    document.body.style.overflow = "hidden";

    // Initial state — wordmark sits below its mask, out of focus.
    // gsap.set(wordRef.current, { yPercent: 115, opacity: 0, filter: "blur(16px)" });
    // gsap.set(ruleRef.current, { scaleX: 0, transformOrigin: "left center" });
    // gsap.set([cornerTLRef.current, cornerBRRef.current], { opacity: 0 });

    // const tl = gsap.timeline();

    // // The intro — one confident mask reveal. Deliberately the only "move" here;
    // // it also mirrors the hero's own headline treatment so the two feel like
    // // one continuous gesture rather than two separate animations.
    // tl.to(wordRef.current, {
    //   yPercent: 0,
    //   opacity: 1,
    //   filter: "blur(0px)",
    //   duration: 1.1,
    //   ease: "expo.out",
    //   clearProps: "filter",
    // })
    //   .to(
    //     [cornerTLRef.current, cornerBRRef.current],
    //     { opacity: 0.35, duration: 0.6, ease: "power2.out", stagger: 0.06 },
    //     "-=0.8"
    //   )
    //   .to(ruleRef.current, { scaleX: 1, duration: 1.2, ease: "power3.inOut" }, "-=0.9");

    // Initial state — wordmark sits below its mask, out of focus.
    gsap.set(wordRef.current, { yPercent: 115, opacity: 0, filter: "blur(10px)" });
    gsap.set(ruleRef.current, { scaleX: 0, transformOrigin: "left center" });
    gsap.set([cornerTLRef.current, cornerBRRef.current], { opacity: 0 });
    gsap.set([signalOuterRef.current, signalInnerRef.current], { opacity: 0 });
    gsap.set(shaderCanvasRef.current, { opacity: 0 });

    const tl = gsap.timeline();

    // Ambient shader wash — starts immediately alongside the wordmark, but
    // slow enough that it reads as atmosphere settling in, not a second
    // choreographed "move" competing with the one confident reveal below.
    tl.to(shaderCanvasRef.current, { opacity: 1, duration: 1.4, ease: "sine.out" }, 0);

    // The intro — one confident mask reveal. Deliberately the only "move" here;
    // it also mirrors the hero's own headline treatment so the two feel like
    // one continuous gesture rather than two separate animations.
    tl.to(wordRef.current, {
      yPercent: 0,
      opacity: 1,
      filter: "blur(0px)",
      duration: 0.75,
      ease: "expo.out",
      clearProps: "filter",
    }, 0)
      .to(
        [cornerTLRef.current, cornerBRRef.current],
        { opacity: 0.35, duration: 0.5, ease: "power2.out", stagger: 0.06 },
        "-=0.55"
      )
      .to(ruleRef.current, { scaleX: 1, duration: 0.9, ease: "power3.inOut" }, "-=0.65");

    // Signal seed — appended after the chain above (not inserted into it) so
    // it can't shift the timing that's already tuned. It's allowed to settle
    // in a beat later than everything else; it's just atmosphere.
    tl.to(signalOuterRef.current, { opacity: 0.07, duration: 0.9, ease: "power2.out" }, "-=0.7")
      .to(signalInnerRef.current, { opacity: 0.11, duration: 0.85, ease: "power2.out" }, "-=0.75");

const statsPromise = heroApi
  .getStats()
  .then((res) => res.data)
  .catch((err) => {
    console.warn("Hero stats fetch failed, using fallback:", err);
    return FALLBACK_HERO_STATS;
  });

const ready = Promise.all([
  document.fonts ? document.fonts.ready : Promise.resolve(),
  document.readyState === "complete"
    ? Promise.resolve()
    : new Promise<void>((resolve) =>
        window.addEventListener("load", () => resolve(), { once: true })
      ),
  new Promise((resolve) => setTimeout(resolve, 900)), // minimum hold so the reveal isn't cut short on fast loads
  statsPromise,
]);

    tl.eventCallback("onComplete", () => {
      // Idle pulse on the rule while we wait on real asset readiness.
      const idlePulse = gsap.to(ruleRef.current, {
        opacity: 0.35,
        duration: 0.7,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      ready.then(([_fontReady, _loadReady, _minHold, heroStatsResult]) => {
        idlePulse.kill();
        gsap.set(ruleRef.current, { opacity: 1 });
        const stats = heroStatsResult as HeroStats;
        setHeroStats(stats);

        // Persist to localStorage so HeroSection renders instantly on refresh
        // without refetching. Matches the cache layer in HeroSection5.tsx.
        try {
          localStorage.setItem(
            "amana_hero_stats_cache_v1",
            JSON.stringify({ data: stats, cachedAt: Date.now() })
          );
          sessionStorage.setItem("amana_hero_stats_seen", "1");
        } catch {
          /* ignore — private mode etc. */
        }

        // The exit — the wrapper's own fade + scale stays cheap (still no
        // filter) for the same reason as before: the hero's WebGL canvas is
        // spinning up underneath, and now this shader is too. The one
        // addition is a small upward drift on just the wordmark/rule — text
        // lifting away, rather than transforming the whole wrapper (which
        // would mean animating the same element that's holding the canvas).
        const exitTl = gsap.timeline({
          onComplete: () => {
            document.body.style.overflow = "";
            lenis?.start();
            safeSessionSet(SESSION_KEY, "1");
            setMounted(false);
          },
        });

        // exitTl
        //   .to(rootRef.current, { opacity: 0, scale: 1.02, duration: 0.9, ease: "power2.out" })
        //   .to([wordRef.current, ruleRef.current], { y: -24, duration: 0.9, ease: "power2.out" }, "<")
        //   // Hand off to the hero near the END of the fade — preloader should be
        //   // nearly gone before hero starts, avoiding the "both visible" glitch.
        //   .call(() => { triggerAnimations("reveal", stats); }, [], 0.75);
        exitTl
  .to(rootRef.current, { opacity: 0, scale: 1.02, duration: 0.9, ease: "power2.out" })
  .to([wordRef.current, ruleRef.current], { y: -24, duration: 0.9, ease: "power2.out" }, "<")
  // Hand off to the hero only once the preloader has fully resolved —
  // no more dual-visible frame between the two full-screen stacks.
  .call(() => { triggerAnimations("reveal", stats); }, [], ">");
      });
    });

    return () => { tl.kill(); };
  }, [mounted, claim, lenis, triggerAnimations, setHeroStats]);

  if (!mounted) return null;

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-label={t("preloader.loading", "Loading Amana")}
      className="fixed inset-0 z-[100] bg-background flex items-center justify-center"
    >
      {/* Ambient shader wash — cheap 2-octave noise, not the hero's full
          domain-warped fbm; this only needs to hold up for a second or two. */}
      <canvas
        ref={shaderCanvasRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Corner brackets — quiet structural echo of the hero, nothing more */}
      <svg ref={cornerTLRef} className="absolute top-6 left-6" width="22" height="22" viewBox="0 0 28 28" aria-hidden="true">
        <path d="M 0 28 L 0 0 L 28 0" fill="none" stroke="currentColor" strokeWidth="1" className="text-foreground" />
      </svg>
      <svg ref={cornerBRRef} className="absolute bottom-6 right-6" width="22" height="22" viewBox="0 0 28 28" aria-hidden="true">
        <path d="M 28 0 L 28 28 L 0 28" fill="none" stroke="currentColor" strokeWidth="1" className="text-foreground" />
      </svg>

      {/* Signal seed — dormant echo of the hero's dispatch-ring motif, centered
          behind the wordmark. Static here; it only starts pulsing once we
          hand off to the hero, so the two components read as one gesture. */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
        <circle ref={signalOuterRef} cx="50%" cy="50%" r="150" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" />
        <circle ref={signalInnerRef} cx="50%" cy="50%" r="98" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" />
      </svg>

      <div className="flex flex-col items-center px-6">
        <div className="overflow-hidden py-2">
          <span
            ref={wordRef}
            className="block font-display font-black text-[clamp(2.25rem,8vw,5rem)] leading-none tracking-[-0.03em] text-foreground will-change-transform"
          >
            {t("brand.amana", "Amana")}
          </span>
        </div>
        <div className="w-[120px] h-px bg-border/60 overflow-hidden mt-6">
          <div ref={ruleRef} className="w-full h-full bg-foreground will-change-transform" />
        </div>
      </div>
    </div>
  );
}