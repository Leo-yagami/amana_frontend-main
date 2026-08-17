// import { useEffect, useRef, useState, type RefObject } from "react";
// import { useLenis } from "lenis/react";
// import gsap from "gsap";
// import { useAnimationCoordinator } from "@/components/AnimationCoordinator";
// import { useTranslation } from "react-i18next";
// import { heroApi } from "@/services/api.service";
// import type { HeroStats } from "@/types/api";

// const SESSION_KEY = "amana-preloader-shown";

// // Fallback stats — keep the page looking complete if anything goes wrong.
// const FALLBACK_HERO_STATS: HeroStats = {
//   counters: { familiesSupported: 78, eventsThisYear: 24, raisedEtb: 125_000 },
//   progress: { raised: 125_000, goal: 2_000_000, percent: 6.25 },
//   ticker: {
//     donations: [],
//     support: [],
//     aggregates: { raisedThisMonth: 0, urgentFamilies: 0, totalDonors: 0 },
//   },
// };

// function safeSessionGet(key: string) {
//   try { return sessionStorage.getItem(key); } catch { return null; }
// }
// function safeSessionSet(key: string, value: string) {
//   try { sessionStorage.setItem(key, value); } catch {}
// }

// const PRELOADER_VERT_SRC = `
// attribute vec2 a_pos;
// void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
// `;

// // A soft, drifting glow — not the hero's full domain-warped fbm. This canvas
// // is only ever on screen for a couple of seconds, so two octaves of value
// // noise nudging a radial highlight around is plenty.
// const PRELOADER_FRAG_SRC = `
// precision mediump float;

// uniform vec2  u_res;
// uniform float u_time;
// uniform float u_dark;
// uniform vec3  u_c1;

// float hash(vec2 p) {
//   return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
// }

// float noise(vec2 p) {
//   vec2 i = floor(p);
//   vec2 f = fract(p);
//   vec2 u = f * f * (3.0 - 2.0 * f);
//   return mix(
//     mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
//     mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
//     u.y
//   );
// }

// float softNoise(vec2 p) {
//   float v = noise(p) * 0.6;
//   v += noise(p * 2.1) * 0.4;
//   return v;
// }

// void main() {
//   vec2 st = gl_FragCoord.xy / u_res.y;
//   vec2 center = vec2((u_res.x / u_res.y) * 0.5, 0.5);

//   // Highlight center drifts on a loose, non-repeating path — two
//   // out-of-phase sine terms read as organic rather than a perfect orbit.
//   float t = u_time * 0.045;
//   vec2 drift = vec2(sin(t * 0.8) * 0.16, cos(t * 0.63) * 0.12);
//   float n = softNoise(st * 1.6 + t * 0.3);
//   vec2 warpedCenter = center + drift + (n - 0.5) * 0.05;

//   float dist = length(st - warpedCenter);
//   float glow = smoothstep(0.6, 0.0, dist);

//   vec3 col = u_c1 * mix(0.85, 1.2, n);
//   float alpha = glow * mix(0.22, 0.14, u_dark) * (0.75 + 0.25 * n);

//   gl_FragColor = vec4(col * alpha, alpha);
// }
// `;

// // Same HSL parsing as the hero's shader hook — duplicated rather than
// // imported since the two components don't share a utils module yet. Worth
// // extracting if a third shader shows up.
// function parseHsl(hslStr: string): [number, number, number] {
//   if (!hslStr) return [0, 0, 0];
//   const parts = hslStr.trim().split(/[\s,]+/);
//   const h = parseFloat(parts[0]) / 360;
//   const s = parseFloat(parts[1]) / 100;
//   const l = parseFloat(parts[2]) / 100;
//   if (isNaN(h) || isNaN(s) || isNaN(l)) return [0, 0, 0];
//   const hue2rgb = (p: number, q: number, tt: number) => {
//     if (tt < 0) tt += 1; if (tt > 1) tt -= 1;
//     if (tt < 1 / 6) return p + (q - p) * 6 * tt;
//     if (tt < 1 / 2) return q;
//     if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
//     return p;
//   };
//   if (s === 0) return [l, l, l];
//   const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
//   const p = 2 * l - q;
//   return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)];
// }

// // A cheap, short-lived aurora wash — same WebGL setup shape as the hero's
// // useShaderBackground, stripped of mouse/scroll tracking (nothing to track
// // during a preloader) and rendered at a lower octave count and resolution,
// // since this only needs to hold up for a second or two, not a full page.
// // function usePreloaderShader(canvasRef: RefObject<HTMLCanvasElement>) {
// //   useEffect(() => {
// //     const canvas = canvasRef.current;
// //     if (!canvas) return;

// //     const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// //     const gl = canvas.getContext("webgl", {
// //       alpha: true,
// //       premultipliedAlpha: true,
// //       antialias: false,
// //       powerPreference: "low-power",
// //     });
// //     if (!gl) return;

// //     const compile = (type: number, src: string) => {
// //       const sh = gl.createShader(type)!;
// //       gl.shaderSource(sh, src);
// //       gl.compileShader(sh);
// //       if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
// //         console.warn("[preloader shader]", gl.getShaderInfoLog(sh));
// //       }
// //       return sh;
// //     };

// //     const prog = gl.createProgram()!;
// //     gl.attachShader(prog, compile(gl.VERTEX_SHADER, PRELOADER_VERT_SRC));
// //     gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, PRELOADER_FRAG_SRC));
// //     gl.linkProgram(prog);
// //     gl.useProgram(prog);

// //     const buf = gl.createBuffer();
// //     gl.bindBuffer(gl.ARRAY_BUFFER, buf);
// //     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
// //     const aPos = gl.getAttribLocation(prog, "a_pos");
// //     gl.enableVertexAttribArray(aPos);
// //     gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

// //     const uRes = gl.getUniformLocation(prog, "u_res");
// //     const uTime = gl.getUniformLocation(prog, "u_time");
// //     const uDark = gl.getUniformLocation(prog, "u_dark");
// //     const uC1 = gl.getUniformLocation(prog, "u_c1");

// //     // Short-lived and full-bleed — a flat low scale is plenty; no need for
// //     // the hero's screen-width branching.
// //     const SCALE = 0.3;
// //     const resize = () => {
// //       canvas.width = Math.floor(canvas.clientWidth * SCALE);
// //       canvas.height = Math.floor(canvas.clientHeight * SCALE);
// //       gl.viewport(0, 0, canvas.width, canvas.height);
// //     };
// //     resize();
// //     const ro = new ResizeObserver(resize);
// //     ro.observe(canvas);

// //     const isDark = () => document.documentElement.classList.contains("dark");
// //     const readC1 = (): [number, number, number] =>
// //       parseHsl(getComputedStyle(document.documentElement).getPropertyValue("--primary").trim());
// //     const cachedC1 = readC1();

// //     let rafId: number;
// //     const render = (now: number) => {
// //       gl.clearColor(0, 0, 0, 0);
// //       gl.clear(gl.COLOR_BUFFER_BIT);
// //       gl.uniform2f(uRes, canvas.width, canvas.height);
// //       gl.uniform1f(uTime, reduceMotion ? 0 : now * 0.001);
// //       gl.uniform1f(uDark, isDark() ? 1.0 : 0.0);
// //       gl.uniform3fv(uC1, cachedC1);
// //       gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
// //       if (!reduceMotion) rafId = requestAnimationFrame(render);
// //     };

// //     if (reduceMotion) {
// //       render(0); // one static frame — signal present, no motion
// //     } else {
// //       rafId = requestAnimationFrame(render);
// //     }

// //     return () => {
// //       cancelAnimationFrame(rafId);
// //       ro.disconnect();
// //       gl.deleteProgram(prog);
// //       gl.deleteBuffer(buf);
// //     };
// //   }, [canvasRef]);
// // }
// // A cheap, short-lived aurora wash — same WebGL setup shape as the hero's
// // useShaderBackground, stripped of mouse/scroll tracking (nothing to track
// // during a preloader) and rendered at a lower octave count and resolution,
// // since this only needs to hold up for a second or two, not a full page.
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

//     // Short-lived and full-bleed — a flat low scale is plenty.
//     const SCALE = 0.3;
    
//     // Moved resize logic out of a one-shot observer and into a function 
//     // we can safely call every frame to bypass the 0x0 mounting race condition.
//     const checkResize = () => {
//       const targetW = Math.floor(canvas.clientWidth * SCALE);
//       const targetH = Math.floor(canvas.clientHeight * SCALE);
//       if (canvas.width !== targetW || canvas.height !== targetH) {
//         canvas.width = targetW;
//         canvas.height = targetH;
//         gl.viewport(0, 0, canvas.width, canvas.height);
//       }
//     };

//     const isDark = () => document.documentElement.classList.contains("dark");
//     const readC1 = (): [number, number, number] =>
//       parseHsl(getComputedStyle(document.documentElement).getPropertyValue("--primary").trim());
    
//     let cachedC1 = readC1();

//     let rafId: number;
//     const render = (now: number) => {
//       // 1. Verify canvas has actual dimensions every frame
//       checkResize();

//       // 2. Race condition fallback: If our cached color is pure black (the parseHsl 
//       // fallback for an empty string), keep polling until the CSS variables resolve.
//       if (cachedC1[0] === 0 && cachedC1[1] === 0 && cachedC1[2] === 0) {
//         cachedC1 = readC1();
//       }

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
//       // In reduced motion, we still run checkResize once, but we might need 
//       // to defer it slightly if the dimensions are 0x0 right at mount.
//       // A small timeout ensures it catches the layout if reduced motion stops the loop.
//       if (canvas.clientWidth === 0) {
//         setTimeout(() => render(0), 50);
//       } else {
//         render(0);
//       }
//     } else {
//       rafId = requestAnimationFrame(render);
//     }

//     return () => {
//       cancelAnimationFrame(rafId);
//       gl.deleteProgram(prog);
//       gl.deleteBuffer(buf);
//     };
//   }, [canvasRef]);
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
//   const shaderCanvasRef = useRef<HTMLCanvasElement>(null);
//   usePreloaderShader(shaderCanvasRef);

// const lenis = useLenis();
// const { triggerAnimations, claim, setHeroStats } = useAnimationCoordinator();

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
//     gsap.set(shaderCanvasRef.current, { opacity: 0 });

//     const tl = gsap.timeline();

//     // Ambient shader wash — starts immediately alongside the wordmark, but
//     // slow enough that it reads as atmosphere settling in, not a second
//     // choreographed "move" competing with the one confident reveal below.
//     tl.to(shaderCanvasRef.current, { opacity: 1, duration: 1.4, ease: "sine.out" }, 0);

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
//     }, 0)
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

// const statsPromise = heroApi
//   .getStats()
//   .then((res) => res.data)
//   .catch((err) => {
//     console.warn("Hero stats fetch failed, using fallback:", err);
//     return FALLBACK_HERO_STATS;
//   });

// const ready = Promise.all([
//   document.fonts ? document.fonts.ready : Promise.resolve(),
//   // Deliberately NOT gated on the window `load` event. That event only fires
//   // after every resource on the page — including large event image blobs —
//   // has finished downloading, which can hold the preloader hostage for many
//   // seconds on a slow image host. By the time this effect runs React has
//   // already committed, so the DOM is parsed; waiting on anything heavier than
//   // fonts and the hero stats only delays the reveal for no benefit.
//   Promise.resolve(),
//   new Promise((resolve) => setTimeout(resolve, 900)), // minimum hold so the reveal isn't cut short on fast loads
//   statsPromise,
// ]);

//     tl.eventCallback("onComplete", () => {
//       // Idle pulse on the rule while we wait on real asset readiness.
//       const idlePulse = gsap.to(ruleRef.current, {
//         opacity: 0.35,
//         duration: 0.7,
//         yoyo: true,
//         repeat: -1,
//         ease: "sine.inOut",
//       });

//       ready.then(([_fontReady, _minHold, heroStatsResult]) => {
//         idlePulse.kill();
//         gsap.set(ruleRef.current, { opacity: 1 });
//         const stats = heroStatsResult as HeroStats;
//         setHeroStats(stats);

//         // Persist to localStorage so HeroSection renders instantly on refresh
//         // without refetching. Matches the cache layer in HeroSection5.tsx.
//         try {
//           localStorage.setItem(
//             "amana_hero_stats_cache_v1",
//             JSON.stringify({ data: stats, cachedAt: Date.now() })
//           );
//           sessionStorage.setItem("amana_hero_stats_seen", "1");
//         } catch {
//           /* ignore — private mode etc. */
//         }

//         // The exit — the wrapper's own fade + scale stays cheap (still no
//         // filter) for the same reason as before: the hero's WebGL canvas is
//         // spinning up underneath, and now this shader is too. The one
//         // addition is a small upward drift on just the wordmark/rule — text
//         // lifting away, rather than transforming the whole wrapper (which
//         // would mean animating the same element that's holding the canvas).
//         const exitTl = gsap.timeline({
//           onComplete: () => {
//             document.body.style.overflow = "";
//             lenis?.start();
//             safeSessionSet(SESSION_KEY, "1");
//             setMounted(false);
//           },
//         });

//         // exitTl
//         //   .to(rootRef.current, { opacity: 0, scale: 1.02, duration: 0.9, ease: "power2.out" })
//         //   .to([wordRef.current, ruleRef.current], { y: -24, duration: 0.9, ease: "power2.out" }, "<")
//         //   // Hand off to the hero near the END of the fade — preloader should be
//         //   // nearly gone before hero starts, avoiding the "both visible" glitch.
//         //   .call(() => { triggerAnimations("reveal", stats); }, [], 0.75);
//         exitTl
//   .to(rootRef.current, { opacity: 0, scale: 1.02, duration: 0.9, ease: "power2.out" })
//   .to([wordRef.current, ruleRef.current], { y: -24, duration: 0.9, ease: "power2.out" }, "<")
//   // Hand off to the hero only once the preloader has fully resolved —
//   // no more dual-visible frame between the two full-screen stacks.
//   .call(() => { triggerAnimations("reveal", stats); }, [], ">");
//       });
//     });

//     return () => { tl.kill(); };
//   }, [mounted, claim, lenis, triggerAnimations, setHeroStats]);

//   if (!mounted) return null;

//   return (
//     <div
//       ref={rootRef}
//       role="status"
//       aria-live="polite"
//       aria-label={t("preloader.loading", "Loading Amana")}
//       className="fixed inset-0 z-[100] bg-background flex items-center justify-center"
//     >
//       {/* Ambient shader wash — cheap 2-octave noise, not the hero's full
//           domain-warped fbm; this only needs to hold up for a second or two. */}
//       <canvas
//         ref={shaderCanvasRef}
//         aria-hidden="true"
//         className="absolute inset-0 w-full h-full pointer-events-none"
//         style={{ zIndex: 0 }}
//       />

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
//             style={{ opacity: 0 }}
//           >
//             {t("brand.amana", "Amana")}
//           </span>
//         </div>
//         <div className="w-[120px] h-px bg-border/60 overflow-hidden mt-6">
//           <div
//             ref={ruleRef}
//             className="w-full h-full bg-foreground will-change-transform"
//             style={{ transform: "scaleX(0)", transformOrigin: "left center" }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// import { useEffect, useRef, useState, type RefObject } from "react";
// import { useLenis } from "lenis/react";
// import gsap from "gsap";
// import { useAnimationCoordinator } from "@/components/AnimationCoordinator";
// import { useTranslation } from "react-i18next";
// import { heroApi } from "@/services/api.service";
// import type { HeroStats } from "@/types/api";

// const SESSION_KEY = "amana-preloader-shown";

// // Fallback stats — keep the page looking complete if anything goes wrong.
// const FALLBACK_HERO_STATS: HeroStats = {
//   counters: { familiesSupported: 78, eventsThisYear: 24, raisedEtb: 125_000 },
//   progress: { raised: 125_000, goal: 2_000_000, percent: 6.25 },
//   ticker: {
//     donations: [],
//     support: [],
//     aggregates: { raisedThisMonth: 0, urgentFamilies: 0, totalDonors: 0 },
//   },
// };

// function safeSessionGet(key: string) {
//   try { return sessionStorage.getItem(key); } catch { return null; }
// }
// function safeSessionSet(key: string, value: string) {
//   try { sessionStorage.setItem(key, value); } catch {}
// }

// // Centralizes the raw auth-storage check so there's one place to update if
// // the token key or auth mechanism moves — swap this for a real auth hook
// // if/when one exists.
// function hasAuthToken() {
//   try {
//     return Boolean(localStorage.getItem("token"));
//   } catch {
//     return false;
//   }
// }

// const PRELOADER_VERT_SRC = `
// attribute vec2 a_pos;
// void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
// `;

// // A soft, drifting glow — not the hero's full domain-warped fbm. This canvas
// // is only ever on screen for a couple of seconds, so two octaves of value
// // noise nudging a radial highlight around is plenty.
// const PRELOADER_FRAG_SRC = `
// precision mediump float;

// uniform vec2  u_res;
// uniform float u_time;
// uniform float u_dark;
// uniform vec3  u_c1;

// float hash(vec2 p) {
//   return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
// }

// float noise(vec2 p) {
//   vec2 i = floor(p);
//   vec2 f = fract(p);
//   vec2 u = f * f * (3.0 - 2.0 * f);
//   return mix(
//     mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
//     mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
//     u.y
//   );
// }

// float softNoise(vec2 p) {
//   float v = noise(p) * 0.6;
//   v += noise(p * 2.1) * 0.4;
//   return v;
// }

// void main() {
//   vec2 st = gl_FragCoord.xy / u_res.y;
//   vec2 center = vec2((u_res.x / u_res.y) * 0.5, 0.5);

//   // Highlight center drifts on a loose, non-repeating path — two
//   // out-of-phase sine terms read as organic rather than a perfect orbit.
//   float t = u_time * 0.045;
//   vec2 drift = vec2(sin(t * 0.8) * 0.16, cos(t * 0.63) * 0.12);
//   float n = softNoise(st * 1.6 + t * 0.3);
//   vec2 warpedCenter = center + drift + (n - 0.5) * 0.05;

//   float dist = length(st - warpedCenter);
//   float glow = smoothstep(0.6, 0.0, dist);

//   vec3 col = u_c1 * mix(0.85, 1.2, n);
//   float alpha = glow * mix(0.22, 0.14, u_dark) * (0.75 + 0.25 * n);

//   gl_FragColor = vec4(col * alpha, alpha);
// }
// `;

// // Same HSL parsing as the hero's shader hook
// function parseHsl(hslStr: string): [number, number, number] {
//   if (!hslStr) return [0, 0, 0];
//   const parts = hslStr.trim().split(/[\s,]+/);
//   const h = parseFloat(parts[0]) / 360;
//   const s = parseFloat(parts[1]) / 100;
//   const l = parseFloat(parts[2]) / 100;
//   if (isNaN(h) || isNaN(s) || isNaN(l)) return [0, 0, 0];
//   const hue2rgb = (p: number, q: number, tt: number) => {
//     if (tt < 0) tt += 1; if (tt > 1) tt -= 1;
//     if (tt < 1 / 6) return p + (q - p) * 6 * tt;
//     if (tt < 1 / 2) return q;
//     if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
//     return p;
//   };
//   if (s === 0) return [l, l, l];
//   const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
//   const p = 2 * l - q;
//   return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)];
// }

// // A cheap, short-lived aurora wash
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

//     // Short-lived and full-bleed — a flat low scale is plenty.
//     const SCALE = 0.3;

//     const checkResize = () => {
//       const targetW = Math.floor(canvas.clientWidth * SCALE);
//       const targetH = Math.floor(canvas.clientHeight * SCALE);
//       if (canvas.width !== targetW || canvas.height !== targetH) {
//         canvas.width = targetW;
//         canvas.height = targetH;
//         gl.viewport(0, 0, canvas.width, canvas.height);
//       }
//     };

//     const isDark = () => document.documentElement.classList.contains("dark");
//     const readC1 = (): [number, number, number] =>
//       parseHsl(getComputedStyle(document.documentElement).getPropertyValue("--primary").trim());

//     let cachedC1 = readC1();
//     let colorResolved = false;

//     let rafId: number;
//     const render = (now: number) => {
//       checkResize();

//       if (!colorResolved) {
//         const raw = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
//         if (raw) {
//           cachedC1 = parseHsl(raw);
//           colorResolved = true;
//         }
//       }

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
//       requestAnimationFrame(() => requestAnimationFrame(() => render(0)));
//     } else {
//       rafId = requestAnimationFrame(render);
//     }

//     return () => {
//       cancelAnimationFrame(rafId);
//       gl.deleteProgram(prog);
//       gl.deleteBuffer(buf);
//     };
//   }, [canvasRef]);
// }

// export default function Preloader() {
//   const { t } = useTranslation();
//   const [mounted, setMounted] = useState(() => {
//     if (typeof window === "undefined") return true;
//     if (safeSessionGet(SESSION_KEY)) return false;
//     if (hasAuthToken()) {
//       safeSessionSet(SESSION_KEY, "1");
//       return false;
//     }
//     return true;
//   });

//   const rootRef = useRef<HTMLDivElement>(null);
//   const wordRef = useRef<HTMLSpanElement>(null);
//   const ruleRef = useRef<HTMLDivElement>(null);
//   const cornerTLRef = useRef<SVGSVGElement>(null);
//   const cornerBRRef = useRef<SVGSVGElement>(null);
//   const signalOuterRef = useRef<SVGCircleElement>(null);
//   const signalInnerRef = useRef<SVGCircleElement>(null);
//   const shaderCanvasRef = useRef<HTMLCanvasElement>(null);
//   usePreloaderShader(shaderCanvasRef);

//   const lenis = useLenis();
//   const { triggerAnimations, claim, setHeroStats } = useAnimationCoordinator();

//   useEffect(() => {
//     if (!mounted) return;

//     claim();
//     lenis?.stop();
//     document.body.style.overflow = "hidden";

//     const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
//     const dur = (seconds: number) => (prefersReducedMotion ? 0.01 : seconds);

//     // Initial state — wordmark sits below its mask, slightly skewed and blurred.
//     gsap.set(wordRef.current, { yPercent: 115, skewY: 2, opacity: 0, filter: "blur(4px)" });
//     gsap.set(ruleRef.current, { scaleX: 0, transformOrigin: "left center" });
//     gsap.set([cornerTLRef.current, cornerBRRef.current], { opacity: 0 });
//     gsap.set([signalOuterRef.current, signalInnerRef.current], { opacity: 0 });
//     gsap.set(shaderCanvasRef.current, { opacity: 0 });

//     const tl = gsap.timeline();

//     // Ambient shader wash starts immediately
//     tl.to(shaderCanvasRef.current, { opacity: 1, duration: dur(1.4), ease: "sine.out" }, 0);

//     // The intro — stagger elements to allow the eye to anchor on the text first
//     tl.to(wordRef.current, {
//       yPercent: 0,
//       skewY: 0,
//       opacity: 1,
//       filter: "blur(0px)",
//       duration: dur(1.2),
//       ease: "expo.out",
//       clearProps: "filter,transform", // Clears hardware acceleration props after settling
//     }, 0.2) // Give the shader a 0.2s head start
//       .to(ruleRef.current, { scaleX: 1, duration: dur(1), ease: "expo.inOut" }, 0.5)
//       .to(
//         [cornerTLRef.current, cornerBRRef.current],
//         { opacity: 0.35, duration: dur(0.6), ease: "power2.out", stagger: 0.1 },
//         0.6
//       );

//     // Signal seed — atmosphere settles in last
//     tl.to(signalOuterRef.current, { opacity: 0.07, duration: dur(0.9), ease: "power2.out" }, 0.8)
//       .to(signalInnerRef.current, { opacity: 0.11, duration: dur(0.85), ease: "power2.out" }, 0.85);

//     const statsPromise = heroApi
//       .getStats()
//       .then((res) => res.data)
//       .catch((err) => {
//         console.warn("Hero stats fetch failed, using fallback:", err);
//         return FALLBACK_HERO_STATS;
//       });

//     const readyGates = Promise.all([
//       document.fonts ? document.fonts.ready : Promise.resolve(),
//       new Promise<void>((resolve) => setTimeout(resolve, 900)),
//     ]);

//     const ready = Promise.all([readyGates, statsPromise]);

//     tl.eventCallback("onComplete", () => {
//       // Indeterminate scanning line — scales and shifts origin for a kinetic processing feel
//       let isRightOrigin = true;
//       const idlePulse = prefersReducedMotion
//         ? null
//         : gsap.to(ruleRef.current, {
//             scaleX: 0.2,
//             duration: 0.8,
//             yoyo: true,
//             repeat: -1,
//             ease: "sine.inOut",
//             onRepeat: () => {
//               isRightOrigin = !isRightOrigin;
//               gsap.set(ruleRef.current, {
//                 transformOrigin: isRightOrigin ? "right center" : "left center",
//               });
//             },
//           });

//       ready.then(([, stats]) => {
//         idlePulse?.kill();
//         // Snap rule back to full line before exit
//         gsap.set(ruleRef.current, { scaleX: 1, transformOrigin: "left center" });
//         setHeroStats(stats);

//         try {
//           localStorage.setItem(
//             "amana_hero_stats_cache_v1",
//             JSON.stringify({ data: stats, cachedAt: Date.now() })
//           );
//           sessionStorage.setItem("amana_hero_stats_seen", "1");
//         } catch {}

//         // The exit — tactile upward acceleration pulling the curtain away.
//         const exitTl = gsap.timeline({
//           delay: dur(0.2), // Tiny pause to register completion before vanishing
//           onComplete: () => {
//             document.body.style.overflow = "";
//             lenis?.start();
//             safeSessionSet(SESSION_KEY, "1");
//             setMounted(false);
//           },
//         });

//         exitTl
//           .to(rootRef.current, { yPercent: -100, opacity: 0, duration: dur(1), ease: "expo.inOut" })
//           // Slight parallax on the inner elements drifting faster than the wrapper
//           .to([wordRef.current, ruleRef.current], { y: -40, duration: dur(0.8), ease: "power3.in" }, "<")
//           // Hand off to the hero slightly before the preloader is fully gone
//           .call(() => { triggerAnimations("reveal", stats); }, [], "-=0.4");
//       });
//     });

//     return () => { tl.kill(); };
//   }, [mounted, claim, lenis, triggerAnimations, setHeroStats]);

//   if (!mounted) return null;

//   return (
//     <div
//       ref={rootRef}
//       role="status"
//       aria-live="polite"
//       aria-label={t("preloader.loading", "Loading Amana")}
//       className="fixed inset-0 z-[100] bg-background flex items-center justify-center will-change-transform"
//     >
//       <canvas
//         ref={shaderCanvasRef}
//         aria-hidden="true"
//         className="absolute inset-0 w-full h-full pointer-events-none"
//         // translateZ(0) forces hardware acceleration & fixes sub-pixel rendering artifacts
//         style={{ zIndex: 0, transform: "translateZ(0)" }}
//       />

//       {/* Vector accents utilize mix-blend-overlay to optically react with the noise shader underneath */}
//       <svg ref={cornerTLRef} className="absolute top-6 left-6 mix-blend-overlay" width="22" height="22" viewBox="0 0 28 28" aria-hidden="true">
//         <path d="M 0 28 L 0 0 L 28 0" fill="none" stroke="currentColor" strokeWidth="1" className="text-foreground" />
//       </svg>
//       <svg ref={cornerBRRef} className="absolute bottom-6 right-6 mix-blend-overlay" width="22" height="22" viewBox="0 0 28 28" aria-hidden="true">
//         <path d="M 28 0 L 28 28 L 0 28" fill="none" stroke="currentColor" strokeWidth="1" className="text-foreground" />
//       </svg>

//       <svg className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay" aria-hidden="true">
//         <circle ref={signalOuterRef} cx="50%" cy="50%" r="150" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" />
//         <circle ref={signalInnerRef} cx="50%" cy="50%" r="98" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" />
//       </svg>

//       <div className="flex flex-col items-center px-6">
//         <div className="overflow-hidden py-2">
//           <span
//             ref={wordRef}
//             className="block font-display font-black text-[clamp(2.25rem,8vw,5rem)] leading-none tracking-[-0.03em] text-foreground"
//             // Adding filter to will-change prevents mobile paint flashing during blur interpolation
//             style={{ opacity: 0, willChange: "transform, filter" }}
//           >
//             {t("brand.amana", "Amana")}
//           </span>
//         </div>
//         <div className="w-[120px] h-px bg-border/60 overflow-hidden mt-6">
//           <div
//             ref={ruleRef}
//             className="w-full h-full bg-foreground will-change-transform"
//             style={{ transform: "scaleX(0)", transformOrigin: "left center" }}
//           />
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

function hasAuthToken() {
  try {
    return Boolean(localStorage.getItem("token"));
  } catch {
    return false;
  }
}

const PRELOADER_VERT_SRC = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

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

    const SCALE = 0.3;
    let targetW = 0;
    let targetH = 0;

    // OPTIMIZATION: Track resize passively. Reading canvas.clientWidth 
    // inside requestAnimationFrame forces layout thrashing 60 times a second.
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        targetW = Math.floor(entry.contentRect.width * SCALE);
        targetH = Math.floor(entry.contentRect.height * SCALE);
      }
    });
    observer.observe(canvas);

    const isDark = () => document.documentElement.classList.contains("dark");
    const readC1 = (): [number, number, number] =>
      parseHsl(getComputedStyle(document.documentElement).getPropertyValue("--primary").trim());

    let cachedC1 = readC1();
    let colorResolved = false;

    let rafId: number;
    const render = (now: number) => {
      // Safely apply observed dimensions without polling the DOM
      if (targetW > 0 && targetH > 0 && (canvas.width !== targetW || canvas.height !== targetH)) {
        canvas.width = targetW;
        canvas.height = targetH;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }

      if (!colorResolved) {
        const raw = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
        if (raw) {
          cachedC1 = parseHsl(raw);
          colorResolved = true;
        }
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
      requestAnimationFrame(() => requestAnimationFrame(() => render(0)));
    } else {
      rafId = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
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
    if (hasAuthToken()) {
      safeSessionSet(SESSION_KEY, "1");
      return false;
    }
    return true;
  });

  const rootRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const cornerTLRef = useRef<SVGSVGElement>(null);
  const cornerBRRef = useRef<SVGSVGElement>(null);
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

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const dur = (seconds: number) => (prefersReducedMotion ? 0.01 : seconds);

    // OPTIMIZATION: Bypassing the initial blur state entirely on mobile.
    // Mobile GPUs struggle to animate heavy DOM blurs smoothly.
    const initialBlur = isMobile ? "blur(0px)" : "blur(4px)";
    
    gsap.set(wordRef.current, { yPercent: 115, skewY: 2, opacity: 0, filter: initialBlur });
    gsap.set(ruleRef.current, { scaleX: 0, transformOrigin: "left center" });
    gsap.set([cornerTLRef.current, cornerBRRef.current], { opacity: 0 });
    gsap.set([signalOuterRef.current, signalInnerRef.current], { opacity: 0 });
    gsap.set(shaderCanvasRef.current, { opacity: 0 });

    const tl = gsap.timeline();

    tl.to(shaderCanvasRef.current, { opacity: 1, duration: dur(1.4), ease: "sine.out" }, 0);

    tl.to(wordRef.current, {
      yPercent: 0,
      skewY: 0,
      opacity: 1,
      filter: "blur(0px)",
      duration: dur(1.2),
      ease: "expo.out",
      clearProps: "filter,transform",
    }, 0.2)
      .to(ruleRef.current, { scaleX: 1, duration: dur(1), ease: "expo.inOut" }, 0.5)
      .to(
        [cornerTLRef.current, cornerBRRef.current],
        { opacity: 0.35, duration: dur(0.6), ease: "power2.out", stagger: 0.1 },
        0.6
      );

    tl.to(signalOuterRef.current, { opacity: 0.07, duration: dur(0.9), ease: "power2.out" }, 0.8)
      .to(signalInnerRef.current, { opacity: 0.11, duration: dur(0.85), ease: "power2.out" }, 0.85);

    const statsPromise = heroApi
      .getStats()
      .then((res) => res.data)
      .catch((err) => {
        console.warn("Hero stats fetch failed, using fallback:", err);
        return FALLBACK_HERO_STATS;
      });

    const readyGates = Promise.all([
      document.fonts ? document.fonts.ready : Promise.resolve(),
      new Promise<void>((resolve) => setTimeout(resolve, 900)),
    ]);

    const ready = Promise.all([readyGates, statsPromise]);

    // tl.eventCallback("onComplete", () => {
    //   let isRightOrigin = true;
    //   const idlePulse = prefersReducedMotion
    //     ? null
    //     : gsap.to(ruleRef.current, {
    //         scaleX: 0.2,
    //         duration: 0.8,
    //         yoyo: true,
    //         repeat: -1,
    //         ease: "sine.inOut",
    //         onRepeat: () => {
    //           isRightOrigin = !isRightOrigin;
    //           gsap.set(ruleRef.current, {
    //             transformOrigin: isRightOrigin ? "right center" : "left center",
    //           });
    //         },
    //       });

    //   ready.then(([, stats]) => {
    //     idlePulse?.kill();
    //     gsap.set(ruleRef.current, { scaleX: 1, transformOrigin: "left center" });
    //     setHeroStats(stats);

    // diff 1(reverting progress bar behavior)
    tl.eventCallback("onComplete", () => {
  // Gentle opacity pulse instead of changing scale/origin
  const idlePulse = prefersReducedMotion
    ? null
    : gsap.to(ruleRef.current, {
        opacity: 0.3,
        duration: 0.8,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

  ready.then(([, stats]) => {
    idlePulse?.kill();
    gsap.set(ruleRef.current, { opacity: 1, scaleX: 1 });
    setHeroStats(stats);
    
    // ... rest of your ready.then logic

        try {
          localStorage.setItem(
            "amana_hero_stats_cache_v1",
            JSON.stringify({ data: stats, cachedAt: Date.now() })
          );
          sessionStorage.setItem("amana_hero_stats_seen", "1");
        } catch {}

        const exitTl = gsap.timeline({
          delay: dur(0.2),
          onComplete: () => {
            document.body.style.overflow = "";
            lenis?.start();
            safeSessionSet(SESSION_KEY, "1");
            setMounted(false);
          },
        });

        exitTl
          .to(rootRef.current, { yPercent: -100, opacity: 0, duration: dur(1), ease: "expo.inOut" })
          .to([wordRef.current, ruleRef.current], { y: -40, duration: dur(0.8), ease: "power3.in" }, "<")
          .call(() => { triggerAnimations("reveal", stats); }, [], "-=0.4");
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
      className="fixed inset-0 z-[100] bg-background flex items-center justify-center will-change-transform"
    >
      <canvas
        ref={shaderCanvasRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0, transform: "translateZ(0)" }}
      />

      {/* OPTIMIZATION: Removed mix-blend-overlay. It forces mobile browsers into a heavy 
          layer readback loop when placed over WebGL. Standard transparency is much faster. */}
      <svg ref={cornerTLRef} className="absolute top-6 left-6" width="22" height="22" viewBox="0 0 28 28" aria-hidden="true">
        <path d="M 0 28 L 0 0 L 28 0" fill="none" stroke="currentColor" strokeWidth="1" className="text-foreground" />
      </svg>
      <svg ref={cornerBRRef} className="absolute bottom-6 right-6" width="22" height="22" viewBox="0 0 28 28" aria-hidden="true">
        <path d="M 28 0 L 28 28 L 0 28" fill="none" stroke="currentColor" strokeWidth="1" className="text-foreground" />
      </svg>

      {/* OPTIMIZATION: Added viewBox so it scales dynamically on narrow mobile screens, 
          rather than relying on hardcoded radii crossing the screen bounds. */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <circle ref={signalOuterRef} cx="200" cy="200" r="150" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" />
        <circle ref={signalInnerRef} cx="200" cy="200" r="98" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" />
      </svg>

      <div className="flex flex-col items-center px-6">
        <div className="overflow-hidden py-2">
          <span
            ref={wordRef}
            className="block font-display font-black text-[clamp(2.25rem,8vw,5rem)] leading-none tracking-[-0.03em] text-foreground"
            style={{ opacity: 0, willChange: "transform, filter" }}
          >
            {t("brand.amana", "Amana")}
          </span>
        </div>
        <div className="w-[120px] h-px bg-border/60 overflow-hidden mt-6">
          <div
            ref={ruleRef}
            className="w-full h-full bg-foreground will-change-transform"
            style={{ transform: "scaleX(0)", transformOrigin: "left center" }}
          />
        </div>
      </div>
    </div>
  );
}