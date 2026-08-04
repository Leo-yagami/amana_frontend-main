import React, { useRef, useLayoutEffect, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLenis } from "lenis/react";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAnimationCoordinator, type AnimationMode } from "@/components/AnimationCoordinator";
import { heroApi } from "@/services/api.service";
import type { HeroStats } from "@/types/api";
// import Copy, { type CopyHandle } from "@/components/Copy";

// ─── Domain-warped FBM shader — full-field organic noise, theme-aware ────────
// Technique: Inigo Quilez's domain-warp FBM (noise fed into its own domain).
// The result is soft, cloud-like flow fields — reads as living paper/watercolor.
// Extremely subtle opacity so text is always the hero.
// Mouse: offsets the warp domain for gentle parallax feel.
// Scroll: drifts the Y coordinate, creating true vertical parallax.
// Renders at 0.35× resolution — plenty for smooth noise, zero perf cost.

function parseHsl(hslStr: string): [number, number, number] {
  if (!hslStr) return [0, 0, 0]; // Fallback to black if CSS isn't loaded yet

  // Splits by space OR comma to be extra safe against different CSS formats
  const parts = hslStr.trim().split(/[\s,]+/);
  const h = parseFloat(parts[0]) / 360;
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;

  // If parsing fails, return a safe fallback to prevent NaN poisoning
  if (isNaN(h) || isNaN(s) || isNaN(l)) return [0, 0, 0];

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1/3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1/3)];
}

function getCssColor(varName: string): [number, number, number] {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return parseHsl(raw);
}

function isDarkMode(): boolean {
  return document.documentElement.classList.contains("dark");
}

const VERT_SRC = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

// Domain-warped FBM fragment shader — confirmed working.
// u_mouse: normalized mouse position, used to subtly warp domain origin.
// u_scroll: 0→1 scroll progress — drifts Y of domain for parallax.
// u_dark: 1.0 = dark mode, 0.0 = light mode — adjusts opacity + tint.
// u_c1/u_c2: primary teal + accent amber from CSS vars.
const FRAG_SRC = `
precision mediump float;

uniform vec2 u_res;
uniform vec2 u_mouse; // normalized 0-1
uniform float u_scroll; // 0-1 scroll progress in section
uniform float u_time;
uniform float u_dark; // 0 = light, 1 = dark
uniform vec3 u_c1; // primary color (teal)
uniform vec3 u_c2; // accent color (amber)

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), u.x),
    mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x),
    u.y
  );
}

// FBM — amplitude starts at 1.0, normalized by theoretical max (1.875)
// so output is a true [0, 1] range. Critical fix vs prior version.
float fbm(vec2 p) {
  float v = 0.0;
  float a = 1.0;
  vec2 shift = vec2(100.0);
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = rot * p * 2.1 + shift;
    a *= 0.5;
  }
  return v / 1.875;
}

void main() {
  // 1. Normalize and fix aspect ratio immediately
  // We divide by u_res.y to ensure the vertical scale is 1.0
  // and the horizontal scale adjusts based on the container width.
  vec2 st = gl_FragCoord.xy / u_res.y;

  // 2. Dynamic Zoom: Apply to the already aspect-corrected coordinate
  float zoom = u_res.x < u_res.y ? 1.5 : 1.0;
  st *= zoom;

  // Center the coordinates (Optional but recommended for swirling effects)
  // This ensures the "zoom" happens from the middle, not the bottom-left corner
  st -= 0.5 * vec2(u_res.x / u_res.y * zoom, zoom);

  float t = u_time * 0.04;
  vec2 mouseWarp = (u_mouse - 0.5) * 0.12;
  float scrollDrift = u_scroll * 0.22;

  // 3. Noise generation (using your st)
  vec2 q = vec2(
    fbm(st + t + mouseWarp + vec2(0.0, scrollDrift * 0.3)),
    fbm(st + vec2(5.20, 1.30) + t + mouseWarp + vec2(0.0, scrollDrift * 0.3))
  );

  float f = fbm(st + 0.7 * q + vec2(0.0, scrollDrift * 0.5) + t * 0.6);
  // f = pow(f, 0.8);

  // Contrast-boosted version — only used for light mode, where noise needs to
  // read as distinct light/dark passages instead of flat gray. Dark mode keeps
  // using raw f untouched, since that's the version you're already happy with.
  float fc = smoothstep(0.30, 0.70, f);

  // ── Dark mode — exactly the values you confirmed look good. Untouched. ──
  vec3 colDark = mix(u_c1 * 0.55, u_c1 * 1.05, f) + u_c2 * pow(f, 4.0) * 0.35;
  float alphaDark = 0.15 * f;

  // ── Light mode — wider contrast range, separate from dark mode entirely. ──
  vec3 colLight = mix(u_c1 * 2.6, u_c1 * 3.1, fc) + u_c2 * pow(fc, 3.0) * 0.45;
  float alphaLight = 0.25 * mix(0.4, 1.0, fc);

  // Select branch by mode — no shared range, no cross-contamination.
  vec3 col = mix(colLight, colDark, u_dark);
  float alpha = mix(alphaLight, alphaDark, u_dark);

  gl_FragColor = vec4(col * alpha, alpha);
}
`;

const i = 1;

function useShaderBackground(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  scrollProgressRef: React.MutableRefObject<number>
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
        console.warn("[shader]", gl.getShaderInfoLog(sh));
      }
      return sh;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT_SRC));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG_SRC));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uScroll = gl.getUniformLocation(prog, "u_scroll");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uDark = gl.getUniformLocation(prog, "u_dark");
    const uC1 = gl.getUniformLocation(prog, "u_c1");
    const uC2 = gl.getUniformLocation(prog, "u_c2");

    const getScale = () => window.screen.width <= 768 ? 0.25 : 0.35;

    const resize = () => {
      if (!canvas) return;
      const SCALE = getScale();
      canvas.width = Math.floor(canvas.clientWidth * SCALE);
      canvas.height = Math.floor(canvas.clientHeight * SCALE);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const mouseTarget = { x: 0.5, y: 0.5 };
    const mouseCurrent = { x: 0.5, y: 0.5 };
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseTarget.x = (e.clientX - rect.left) / rect.width;
      mouseTarget.y = (e.clientY - rect.top) / rect.height;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // Track state of CSS variables to handle the initial load race condition
    let cachedDark = isDarkMode();
    let hasFoundValidColors = false;
    let cachedC1: [number, number, number] = [0, 0, 0];
    let cachedC2: [number, number, number] = [0, 0, 0];

    const updateColors = () => {
      cachedDark = isDarkMode();
      // Light mode: use the foreground/text color so the shader reads as a soft
      // ink-like wash tied to the typography, instead of teal competing with
      // the CTA accent color against the cream background.
      // Dark mode: keep primary teal — it already reads well against near-black.
      const c1Var = cachedDark ? "--primary" : "--foreground";
      const c2Var = cachedDark ? "--accent" : "--muted-foreground";
      const rawC1 = getComputedStyle(document.documentElement).getPropertyValue(c1Var).trim();
      const rawC2 = getComputedStyle(document.documentElement).getPropertyValue(c2Var).trim();

      if (rawC1 && rawC2) {
        hasFoundValidColors = true;
        cachedC1 = parseHsl(rawC1);
        cachedC2 = parseHsl(rawC2);
      }
    };

    // Initial fetch attempt
    updateColors();

    let rafId: number;

    const render = (now: number) => {
      // 1. FIX ROUTE TRANSITION RACE:
      // Force resize if dimensions are out of sync (e.g., missed by ResizeObserver during page transition)
      const expectedW = Math.floor(canvas.clientWidth * getScale());
      const expectedH = Math.floor(canvas.clientHeight * getScale());
      if (canvas.width !== expectedW || canvas.height !== expectedH) {
        resize();
      }

      // 2. FIX CSS RACE:
      // Keep trying to fetch colors if the first attempt returned empty strings
      const currentDark = isDarkMode();
      if (!hasFoundValidColors || currentDark !== cachedDark) {
        updateColors();
      }

      const t = now * 0.001;

      mouseCurrent.x = lerp(mouseCurrent.x, mouseTarget.x, 0.018);
      mouseCurrent.y = lerp(mouseCurrent.y, mouseTarget.y, 0.018);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouseCurrent.x, mouseCurrent.y);
      gl.uniform1f(uScroll, scrollProgressRef.current);
      gl.uniform1f(uTime, t);
      gl.uniform1f(uDark, cachedDark ? 1.0 : 0.0);
      gl.uniform3fv(uC1, cachedC1);
      gl.uniform3fv(uC2, cachedC2);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      ro.disconnect();
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, [canvasRef, scrollProgressRef]);
}

// ─── Ticker tape items — live data pulled from API, mixed with brand glyphs ───
// These are generated from heroStats so they update with live data.

// ─── The diagonal shard boundary angles match the Preloader's SLICES exactly ──
// Preloader shard lines: 20/40/60/80% x-intercepts top → 40/60/80/100% x-intercepts bottom
// We mirror the rightmost shard boundary for the panel clip

function CounterCard({
  item,
  active,
  index,
}: {
  item: { value: number; labelKey: string; label: string; sublabelKey: string; sublabel: string };
  active: boolean;
  index: number;
}) {
  const { t } = useTranslation();
  const count = useCountUp(item.value, 1.4 + index * 0.2, active);
  const label = t(item.labelKey, item.label);
  const sublabel = t(item.sublabelKey, item.sublabel);
  return (
    <div className="border-l border-border/60 pl-4 py-1">
      <div className="font-display font-black text-[clamp(1.6rem,3.5vw,2.6rem)] leading-none tabular-nums text-foreground">
        {count}
        {item.label === "ETB (K)" && "K"}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
        {label}
        <span className="block text-muted-foreground/50 tracking-[0.1em] normal-case font-sans text-[10px] mt-0.5">
          {sublabel}
        </span>
      </div>
    </div>
  );
}

function useCountUp(target: number, duration = 1.6, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const raf = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const t = Math.min(elapsed / duration, 1);
      // ease out expo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setCount(Math.round(eased * target));
      if (t < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [start, target, duration]);
  return count;
}

// Splits a line into individual masked words instead of masking the whole
// line as one block — this is what actually reads as a tight, cascading
// reveal rather than three big blocks landing one after another.
function MaskedWords({
  text,
  className,
  wordRefs,
}: {
  text: string;
  className: string;
  wordRefs: React.MutableRefObject<HTMLSpanElement[]>;
}) {
  const words = text.split(" ");
  return (
    <span className="block">
      {words.map((word, idx) => (
        <span key={idx} className="inline-block overflow-hidden align-top">
          <span
            ref={(el) => {
              if (el) wordRefs.current[idx] = el;
            }}
            className={`inline-block will-change-transform ${className}`}
          >
            {word}
            {idx < words.length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </span>
  );
}

// ─── Cache layer ────────────────────────────────────────────────────────────
// Pattern lifted directly from pages/dashboard/Reports2_0.tsx: read fresh data
// from localStorage on init, write back when a fetch lands. This means
// refresh/navigation doesn't keep hammering /api/hero-stats and the page
// renders with real numbers immediately on revisit.
const CACHE_KEY = "amana_hero_stats_cache_v1";
const SEEN_KEY = "amana_hero_stats_seen"; // sessionStorage — clears on tab close
const STALE_MS = 5 * 60 * 1000;            // 5 min, matches Reports2_0

const readStatsCache = (): { data: HeroStats; cachedAt: number } | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.data?.counters || !parsed?.data?.progress || !parsed?.data?.ticker) return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeStatsCache = (data: HeroStats) => {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data, cachedAt: Date.now() })
    );
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* ignore — private mode etc. */
  }
};

export default function HeroSection() {
  const { t } = useTranslation();
  const lenis = useLenis();
  const { registerAnimation, heroStats: coordinatorStats } = useAnimationCoordinator();

  // First-load gate so we don't refetch on every page navigation.
  // Matches the cookie-style "has the user seen this before?" feel of Reports2_0.
  const hasSeenBefore = (() => {
    try {
      return sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      return false;
    }
  })();

  // Seed from localStorage so the page renders instantly after refresh — no
  // blank panel, no fetch flicker.
  const [heroStats, setHeroStats] = useState<HeroStats | null>(() => {
    const cached = readStatsCache();
    return cached?.data ?? null;
  });

  // When the coordinator receives stats from the preloader, adopt them
  // AND persist so refreshes will be instant.
  useEffect(() => {
    if (coordinatorStats) {
      setHeroStats(coordinatorStats);
      writeStatsCache(coordinatorStats);
    }
  }, [coordinatorStats]);

  // Cache-only fetch: only hit the network if (a) we have no cache yet, or
  // (b) the cache has gone stale. SessionStorage gates the "no cache" path
  // so we don't refetch on every route bounce once the user has landed here.
  useEffect(() => {
    if (coordinatorStats) return;

    const cached = readStatsCache();
    const isFresh = cached && Date.now() - cached.cachedAt < STALE_MS;

    if (isFresh) return;

    // Already saw this session — skip the fetch unless cache is stale
    if (hasSeenBefore && cached) return;

    heroApi
      .getStats()
      .then((res) => {
        setHeroStats(res.data);
        writeStatsCache(res.data);
      })
      .catch((err) => console.warn("Hero stats fetch failed:", err));
  }, [coordinatorStats, hasSeenBefore, heroStats]);

  // Live ticker items — recomputed whenever heroStats changes
  const TICKER_ITEMS = useMemo(() => {
    if (!heroStats) return [];
    const glyphs = ["ቤተሰቦች", "ምሕረት", "ተስፋ", "ሰላም", "ፍቅር", "አሚን"];
    

    function pickGlyph() {
      return glyphs[Math.floor(Math.random() * glyphs.length)];
    }

    const items: string[] = [];

    heroStats.ticker.donations?.forEach((d) => {
      items.push(
        t("ticker.donation", "{{name}} · ETB {{amount}}", {
          name: d.donorName?.split(" ")[0] || t("ticker.someone", "Someone"),
          amount: d.etbEquivalent.toLocaleString(),
        })
      );
      items.push(pickGlyph());
    });

    heroStats.ticker.support?.forEach((s) => {
      const typeLabel = t(`ticker.supportType.${s.supportType}`, s.supportType);
      items.push(
        t("ticker.support", "{{type}} delivered — {{family}}", {
          type: typeLabel,
          family: s.familyCode || t("ticker.aFamily", "a family"),
        })
      );
      items.push(pickGlyph());
    });

    if (heroStats.ticker.aggregates.raisedThisMonth > 0) {
      items.push(
        t("ticker.raisedThisMonth", "ETB {{amount}} raised this month", {
          amount: heroStats.ticker.aggregates.raisedThisMonth.toLocaleString(),
        })
      );
      items.push(pickGlyph());
    }

    if (heroStats.ticker.aggregates.urgentFamilies > 0) {
      items.push(
        t("ticker.urgentFamilies", "{{count}} families need urgent support", {
          count: heroStats.ticker.aggregates.urgentFamilies,
        })
      );
      items.push(pickGlyph());
    }

    if (heroStats.ticker.aggregates.totalDonors) {
      items.push(
        t("ticker.donorCount", "{{count}} donors registered", {
          count: heroStats.ticker.aggregates.totalDonors,
        })
      );
      items.push(pickGlyph());
    }

    items.push(t("ticker.dispatch", "Live dispatch — Addis Ababa"));
    items.push(...glyphs);

    return items;
  }, [heroStats, t]);

  // Counter targets derived from live stats (displayed in K for ETB)
  const COUNTER_TARGETS = useMemo(() => {
    if (!heroStats) return [];
    return [
      {
        value: heroStats.counters.familiesSupported,
        labelKey: "hero.counters.families",
        label: "Families",
        sublabelKey: "hero.counters.familiesSub",
        sublabel: "directly supported",
      },
      {
        value: heroStats.counters.eventsThisYear,
        labelKey: "hero.counters.events",
        label: "Events",
        sublabelKey: "hero.counters.eventsSub",
        sublabel: "this year",
      },
      {
        value: Math.round(heroStats.counters.raisedEtb / 1000),
        labelKey: "hero.counters.raised",
        label: "ETB (K)",
        sublabelKey: "hero.counters.raisedSub",
        sublabel: "raised to date",
      },
    ];
  }, [heroStats]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const glintRef = useRef<HTMLDivElement>(null);
  const tickerWrapperRef = useRef<HTMLDivElement>(null);
  // Ref instead of state — written every scroll frame, read in rAF loop, no re-render needed
  const scrollProgressRef = useRef<number>(0);
  useShaderBackground(canvasRef, scrollProgressRef);

  // Wire ScrollTrigger to update scrollProgressRef for shader parallax
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    if (!section) return;
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => { scrollProgressRef.current = self.progress; },
    });
    return () => st.kill();
  }, []);

  // Refs for GSAP targets
  const eyebrowRef = useRef<HTMLDivElement>(null);
  // Three separate Copy refs — one per headline line for staggered word-mask reveal
  // const line1Ref = useRef<CopyHandle>(null);
  // const line2Ref = useRef<CopyHandle>(null);
  // const line3Ref = useRef<CopyHandle>(null);
  // const line1Ref = useRef<HTMLSpanElement>(null);
  // const line2Ref = useRef<HTMLSpanElement>(null);
  // const line3Ref = useRef<HTMLSpanElement>(null);
  const line1WordRefs = useRef<HTMLSpanElement[]>([]);
  const line2WordRefs = useRef<HTMLSpanElement[]>([]);
  const line3WordRefs = useRef<HTMLSpanElement[]>([]);
  const subRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);
  const tickerInnerRef = useRef<HTMLDivElement>(null);
  const tickerItemRefs = useRef<HTMLDivElement[]>([]);
  const tickerRevealedRef = useRef(false);
  const [countersActive, setCountersActive] = useState(false);

  // "Gradient introduction" layer — the shader wash + structural hairlines,
  // held at 0 opacity until the headline has landed, then breathed in.
  const hairlinesRef = useRef<SVGSVGElement>(null);
  const cornerTLRef = useRef<SVGSVGElement>(null);
  const cornerTRRef = useRef<SVGSVGElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  // Dispatch-signal layer — concentric pings radiating from the panel's
  // coordinate origin. Replaces the dot-grid texture with something that
  // actually reads as "live signal" rather than generic background noise.
  const signalRef = useRef<SVGSVGElement>(null);
  const ringRefs = useRef<SVGCircleElement[]>([]);

  // Dispatch-signal loop — continuous radar-style ping expanding from the
  // panel's coordinate origin, direct echo of the eyebrow's live-status dot.
  // Independent of the reveal timeline, like the shader's own rAF loop: it
  // starts on mount and just stays invisible until runAnimation fades
  // signalRef in, so re-triggering the reveal (route changes, etc.) never
  // restarts or doubles up the pulse. Gated behind prefers-reduced-motion —
  // note this only covers the new signal layer; the rest of the timeline
  // below doesn't have a reduced-motion branch yet.
  useEffect(() => {
    if (ringRefs.current.length === 0) return;

    const mm = gsap.matchMedia();

    mm.add({ reduceMotion: "(prefers-reduced-motion: reduce)" }, (context) => {
      const { reduceMotion } = context.conditions as { reduceMotion: boolean };

      if (reduceMotion) {
        // Signal is present, just not animated — three static rings.
        ringRefs.current.forEach((ring, idx) => {
          gsap.set(ring, { attr: { r: 60 + idx * 34 }, opacity: 0.14 });
        });
        return;
      }

      gsap.set(ringRefs.current, { attr: { r: 4 }, opacity: 0 });

      const loop = gsap.timeline({ repeat: -1 });
      ringRefs.current.forEach((ring, idx) => {
        loop.fromTo(
          ring,
          { attr: { r: 4 }, opacity: 0.5 },
          { attr: { r: 170 }, opacity: 0, duration: 2.6, ease: "power2.out" },
          idx * 1.05
        );
      });

      return () => { loop.kill(); };
    });

    return () => mm.revert();
  }, []);

  // Ticker loop
  /* Old version — didn't wait for fonts, causing scrollWidth mismatch on refresh / logged-in
  useEffect(() => {
    const ticker = tickerInnerRef.current;
    if (!ticker) return;
    const clone = ticker.cloneNode(true) as HTMLElement;
    clone.setAttribute("aria-hidden", "true");
    tickerRef.current?.appendChild(clone);
    const totalWidth = ticker.scrollWidth;
    let x = 0;
    let rafId: number;
    const speed = 0.55;
    const animate = () => {
      x -= speed;
      if (Math.abs(x) >= totalWidth) x = 0;
      if (tickerRef.current) tickerRef.current.style.transform = `translateX(${x}px)`;
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, []);
  */

// Ticker loop — gated behind reveal completion so it never scrolls
// while opacity === 0 or before fonts are measured. Delta-time speed
// keeps it consistent across refresh rates. Clone is removed on cleanup
// to prevent accumulation across re-mounts.
useEffect(() => {
  const ticker = tickerInnerRef.current;
  const wrapper = tickerWrapperRef.current;
  if (!ticker || !wrapper) return;

  let rafId: number;
  let cancelled = false;
  let cloneEl: HTMLElement | null = null;
  let lastTime = performance.now();
  const pxPerSec = 33; // ~0.55px/frame at 60Hz, consistent everywhere

  const init = () => {
    if (cancelled) return;

    // Duplicate for seamless loop
    const clone = ticker.cloneNode(true) as HTMLElement;
    clone.setAttribute("aria-hidden", "true");
    cloneEl = clone;
    tickerRef.current?.appendChild(clone);

    const totalWidth = ticker.scrollWidth;
    let x = 0;

    const animate = (now: number) => {
      if (cancelled) return;
      if (!tickerRevealedRef.current) {
        // Still hidden — keep re-checking each frame but skip work
        rafId = requestAnimationFrame(animate);
        lastTime = now;
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.1); // cap to avoid jumps on tab-reveal
      lastTime = now;
      x -= pxPerSec * dt;
      if (Math.abs(x) >= totalWidth) x = 0;
      if (tickerRef.current) {
        tickerRef.current.style.transform = `translateX(${x}px)`;
      }
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
  };

  // Wait for fonts so scrollWidth is correct, then initialise
  document.fonts.ready.then(init);

  return () => {
    cancelled = true;
    cancelAnimationFrame(rafId);
    // Remove clone node to prevent accumulation on re-mount / route change
    if (cloneEl && cloneEl.parentNode) {
      cloneEl.parentNode.removeChild(cloneEl);
    }
  };
}, []);

  // GSAP animation orchestration
  const runAnimation = (mode: AnimationMode, payload?: HeroStats | null) => {
    if (payload) setHeroStats(payload);
    const isReveal = mode === "reveal";
    const ease = isReveal ? "expo.out" : "power3.out";
    const baseDuration = isReveal ? 0.7 : 0.5;
    const baseDelay = isReveal ? 0.05 : 0.2;

    const tl = gsap.timeline();

    const words = [...line1WordRefs.current, ...line2WordRefs.current, ...line3WordRefs.current];



    // Initial state — only data-dependent parts start hidden.
    // Shader / hairlines / corners / bloom / signal are already up
    // (set up in useLayoutEffect without being hidden).
    gsap.set([eyebrowRef.current, subRef.current, ctaRef.current], { y: 28, opacity: 0, filter: "blur(8px)" });
    gsap.set(panelRef.current, { x: 60, opacity: 0 });
    gsap.set(words, { yPercent: isReveal ? 115 : 40, opacity: 0, filter: isReveal ? "blur(10px)" : "blur(3px)" });

    // Eyebrow
    tl.to(
      eyebrowRef.current,
      { y: 0, opacity: 1, filter: "blur(0px)", duration: baseDuration * 0.7, ease, clearProps: "filter" },
      baseDelay
    );

    // Headline — word-level masked reveal, tight stagger. This is the
    // reveal itself; everything else is timed off when it actually lands.
    const lineDelay = baseDelay + baseDuration * 0.3;
    const wordDuration = isReveal ? 0.7 : 0.45;
    const wordStagger = isReveal ? 0.055 : 0.04;

    tl.call(() => setCountersActive(true), [], lineDelay);
    tl.to(
      words,
      {
        yPercent: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: wordDuration,
        stagger: wordStagger,
        ease,
        clearProps: "filter",
      },
      lineDelay
    );
    const headlineEnd = lineDelay + Math.max(0, words.length - 1) * wordStagger + wordDuration;

    // Sub + CTA — land right behind the headline, not long after it
    tl.to(
      subRef.current,
      { y: 0, opacity: 1, filter: "blur(0px)", duration: baseDuration * 0.85, ease, clearProps: "filter" },
      lineDelay + 0.3
    );
    tl.to(
      ctaRef.current,
      { y: 0, opacity: 1, filter: "blur(0px)", duration: baseDuration * 0.75, ease, clearProps: "filter" },
      lineDelay + 0.4
    );

    // Panel slides in from the right, alongside the headline
    tl.to(
      panelRef.current,
      { x: 0, opacity: 1, duration: baseDuration * 1.1, ease },
      lineDelay + 0.1
    );

    // Single anchor point for the entire ticker "coming online" beat —
// wrapper fade-in and glint sweep both reference this same timestamp,
// so they read as one event instead of two.
// const tickerRevealAt = lineDelay + 0.5;
// const tickerRevealAt = headlineEnd - 0.5; // ticker only starts once headline is fully settled

// tl.to(
//   tickerWrapperRef.current,
//   { opacity: 1, duration: baseDuration * 0.8, ease },
//   tickerRevealAt
// );

// if (isReveal && glintRef.current) {
//   const ticker = tickerRef.current;
//   const sweepDistance = (ticker?.clientWidth ?? window.innerWidth) + 192;

//   gsap.set(glintRef.current, { x: 0, opacity: 0 });

//   // Glint starts at the SAME timestamp as the wrapper fade, not headlineEnd.
//   // It rides in on top of the wrapper becoming visible instead of arriving
//   // as a separate later event.
//   tl.to(glintRef.current, { opacity: 1, duration: 0.15, ease: "power1.out" }, tickerRevealAt)
//     .to(glintRef.current, { x: sweepDistance, duration: 1.1, ease: "power2.inOut" }, tickerRevealAt)
//     .to(glintRef.current, { opacity: 0, duration: 0.3, ease: "power1.in" }, tickerRevealAt + 0.75);
// }

// // Ticker starts scrolling right as the glint sweep clears — anchored off
// // the SAME tickerRevealAt + the glint's own known duration, not a second
// // independently-computed timestamp.
// const tickerScrollStart = isReveal ? tickerRevealAt + 1.1 : tickerRevealAt;
// tl.call(() => { tickerRevealedRef.current = true; }, [], tickerScrollStart);
// console.log("[ticker timing]", { lineDelay, tickerRevealAt, headlineEnd, tickerScrollStart: isReveal ? tickerRevealAt + 1.1 : tickerRevealAt });

// ── Ticker item reveal — dispatch feed "coming online" ──────────────────
// Each ticker entry masks in individually, fast and tight — reads as data
// populating a live terminal line rather than a title card unveiling.
// Runs on both reveal and fade (ticker should never just be static-visible
// on refresh either), but reveal gets the full blur+longer duration
// treatment while fade is quicker/lighter, matching the headline's own
// isReveal branching.
const tickerRevealAt = headlineEnd - 0.3;
const itemDuration = isReveal ? 0.45 : 0.3;
const itemStagger = isReveal ? 0.028 : 0.018; // much tighter than the headline's 0.055 — terminal-line speed, not title-card speed

if (tickerItemRefs.current.length > 0) {
  tl.to(
    tickerItemRefs.current,
    {
      yPercent: 0,
      opacity: 1,
      duration: itemDuration,
      stagger: itemStagger,
      ease: isReveal ? "power3.out" : "power2.out",
    },
    tickerRevealAt
  );
}

// Ticker starts actually scrolling once every item has landed — computed
// from the real stagger math, not a guessed constant, so it stays correct
// if TICKER_ITEMS length changes.
const itemRevealSpan = Math.max(0, tickerItemRefs.current.length - 1) * itemStagger + itemDuration;
const tickerScrollStart = tickerRevealAt + itemRevealSpan + 0.1; // +0.1 breathing room before motion starts
tl.call(() => { tickerRevealedRef.current = true; }, [], tickerScrollStart);

    // NOTE: The gradient introduction (canvas / bloom / hairlines / signal / corners)
    // is now handled in useLayoutEffect — those elements stay visible immediately
    // so the page reads as "gradient + data pops in when ready".
  };

  useLayoutEffect(() => {
    // Hide only the data-dependent bits before first paint (panel + words +
    // eyebrow/sub/cta) so the gradient background is up immediately. This
    // matches the user intent: "let the gradient sit there until data is
    // loaded, then display the content."
    gsap.set([eyebrowRef.current, subRef.current, ctaRef.current], { opacity: 0, y: 28 });
    gsap.set(panelRef.current, { opacity: 0, x: 60 });
    gsap.set([...line1WordRefs.current, ...line2WordRefs.current, ...line3WordRefs.current], {
      opacity: 0,
      yPercent: 115,
    });

      // Ticker wrapper starts hidden too — this is what the glint sweeps in on.
  // gsap.set(tickerWrapperRef.current, { opacity: 0 });
    if (tickerItemRefs.current.length > 0) {
    gsap.set(tickerItemRefs.current, { yPercent: 100, opacity: 0 });
  }

    // Shader / hairlines / corners / bloom / signal — NOT hidden. They're
    // the gradient the user wants visible immediately on refresh.

    const unsub = registerAnimation(runAnimation);
    return unsub;
  }, [registerAnimation]);

  return (
    <section
    ref={sectionRef}
    className="relative h-dvh lg:h-screen flex flex-col overflow-hidden bg-background"
    >
      {/* ── WebGL shader background — held at 0 opacity until the gradient-intro beat ── */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0, imageRendering: "auto" }}
      />

      {/* ── Soft radial bloom — the other half of the "gradient introduction".
      Two low-opacity washes in the existing brand colors, no new palette. ── */}
      {/* <div
        ref={bloomRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background:
            "radial-gradient(ellipse 55% 45% at 72% 38%, hsl(var(--primary) / 0.16), transparent 70%), radial-gradient(ellipse 40% 35% at 12% 85%, hsl(var(--accent) / 0.10), transparent 70%)",
        }}
      /> */}

      {/* ── Ambient wash — soft primary-color glow behind the signal, no dot
      texture. The halftone grid this used to carry read as stock/default
      on a page whose whole point is "nothing here is generic"; the
      signal rings below now carry the "something is live" idea instead,
      so this layer just needs to be a quiet backdrop for them. ── */}
      {/* <div
        ref={bloomRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background:
            "radial-gradient(ellipse 52% 46% at 74% 38%, hsl(var(--primary) / 0.14), transparent 72%)",
        }}
      /> */}

      {/* ── Dispatch signal — concentric pings radiating from the field panel's
      coordinate origin (same anchor the glow above uses). Direct echo of
      the eyebrow's live-status dot further down, scaled up into the
      section's structural anchor instead of a generic texture. Loops
      continuously once revealed — see the effect above that drives the
      rings themselves; this svg only handles the one-time fade-in. ── */}
      {/* <svg
        ref={signalRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ zIndex: 0 }}
      ></svg> */}

      {/* ── Diagonal shard-echo geometry — SVG hairlines that mirror Preloader ── */}
      <svg
        ref={hairlinesRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <line x1="60%" y1="0%" x2="80%" y2="100%" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.08" />
        <line x1="58%" y1="0%" x2="77%" y2="100%" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.05" />
      </svg>

      {/* ── Corner brackets (echo Preloader decor) ── */}
      <svg
        ref={cornerTLRef}
        className="absolute top-6 left-6 pointer-events-none"
        width="22"
        height="22"
        viewBox="0 0 28 28"
        aria-hidden="true"
        style={{ opacity: 0.2 }}
      >
        <path d="M 0 28 L 0 0 L 28 0" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg
        ref={cornerTRRef}
        className="absolute top-6 right-6 pointer-events-none"
        width="22"
        height="22"
        viewBox="0 0 28 28"
        aria-hidden="true"
        style={{ opacity: 0.2 }}
      >
        <path d="M 28 28 L 28 0 L 0 0" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>

      {/* ─── Main content grid ─────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 container mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-0 items-center pt-14 pb-10 sm:pt-20 sm:pb-14 lg:pt-24 lg:pb-16 relative z-10">

        {/* LEFT — Typographic core */}
        <div className="flex flex-col justify-center max-w-3xl">

          {/* Eyebrow — system label style from Preloader */}
          <div ref={eyebrowRef} className="flex items-center gap-3 mb-8">
            <div className="w-6 h-px bg-primary" />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              {t("hero.eyebrow", "Aid dispatch — Addis Ababa")}
            </span>
            {/* Live pulse dot */}
            <span className="relative flex h-[6px] w-[6px]">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex rounded-full h-[6px] w-[6px] bg-primary" />
            </span>
          </div>

          {/* Headline — three masked lines, blur settling into focus on reveal */}
          <div className="mb-8">
            <h1 className="font-display font-black leading-[0.93] tracking-[-0.03em] text-[clamp(3rem,8.5vw,6.5rem)]">
              {/* <span className="block overflow-hidden">
                <span ref={line1Ref} className="block text-foreground will-change-transform">
                  {t("hero.line1", "Aid that")}
                </span>
              </span>
              <span className="block overflow-hidden">
                <span ref={line2Ref} className="block text-foreground will-change-transform">
                  {t("hero.line2", "actually")}
                </span>
              </span>
              <span className="block overflow-hidden">
                <span ref={line3Ref} className="block text-primary will-change-transform">
                  {t("hero.line3", "arrives.")}
                </span>
              </span> */}
              <MaskedWords text={t("hero.line1", "Aid that")} className="text-foreground" wordRefs={line1WordRefs} />
              <MaskedWords text={t("hero.line2", "actually")} className="text-foreground" wordRefs={line2WordRefs} />
              <MaskedWords text={t("hero.line3", "arrives.")} className="text-primary" wordRefs={line3WordRefs} />
            </h1>
          </div>

          {/* Sub */}
          <p
            ref={subRef}
            className="text-[clamp(0.95rem,1.5vw,1.1rem)] leading-relaxed text-muted-foreground max-w-[42ch] mb-10"
          >
            {t(
              "hero.subtitle",
              "Amana connects donors directly with families in Addis Ababa. No black box. Every birr tracked, every family named."
            )}
          </p>

          {/* CTAs */}
          <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
            <Link to="/payment">
              <button className="group inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-7 h-12 rounded-xl hover:bg-primary/90 transition-colors shadow-md hover:shadow-glow">
                {t("hero.ctaPrimary", "Donate now")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                lenis?.scrollTo("#impact");
              }}
              className="inline-flex items-center gap-2 border border-border text-foreground font-medium text-sm px-7 h-12 rounded-xl hover:bg-secondary/60 transition-colors"
            >
              {t("hero.ctaSecondary", "See our impact")}
            </button>
          </div>
        </div>

        {/* RIGHT — The field dispatch panel */}
        <div
          ref={panelRef}
          className="hidden lg:flex flex-col self-stretch justify-center ml-16 xl:ml-24 relative"
          style={{ minWidth: "260px" }}
        >
          {/* Vertical mono label */}
          <div
            className="absolute -left-5 top-1/2 -translate-y-1/2 font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40"
            style={{ writingMode: "vertical-rl", transform: "translateY(-50%) rotate(180deg)" }}
          >
            FIELD / STATUS
          </div>

          {/* Panel header */}
          <div className="border-t border-b border-border/50 py-3 mb-6">
            <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/60 flex justify-between">
              <span>AMANA / OS — v2.4.1</span>
              <span>15°N 38°E</span>
            </div>
          </div>

          {/* Live counters */}
          <div className="flex flex-col gap-5 mb-8">
            {COUNTER_TARGETS.map((item, i) => (
              <CounterCard key={item.label} item={item} active={countersActive} index={i} />
            ))}
          </div>

          {/* Campaign urgency bar */}
          <div className="mt-auto">
            <div className="flex justify-between items-baseline mb-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
                {t("hero.counters.fundProgress", "FUND PROGRESS")}
              </span>
              <span className="font-mono text-[10px] text-foreground/60">{heroStats?.progress?.percent ?? 0}%</span>
            </div>
            <div className="h-[2px] w-full bg-border/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-[1400ms] ease-out"
                style={{ width: countersActive ? `${heroStats?.progress?.percent ?? 0}%` : "0%" }}
              />
            </div>
            <p className="font-mono text-[9px] text-muted-foreground/40 mt-2 tracking-[0.1em]">
              {t("hero.counters.raisedOf", "ETB {{raised}}K of {{goal}}K RAISED", {
                raised: Math.round((heroStats?.progress?.raised ?? 0) / 1000),
                goal: Math.round((heroStats?.progress?.goal ?? 0) / 1000),
              })}
            </p>
          </div>

          {/* Corner bracket (decorative, panel-level) */}
          <svg
            className="absolute bottom-0 right-0"
            width="16"
            height="16"
            viewBox="0 0 28 28"
            aria-hidden="true"
            style={{ opacity: 0.15 }}
          >
            <path d="M 28 0 L 28 28 L 0 28" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* ── TICKER TAPE — The signature element ──────────────────────────────── */}
      {(false &&<div
       ref={tickerWrapperRef}
        className="relative z-10 border-t border-border/40 overflow-hidden select-none"
        aria-hidden="true"
      >
        {/* Gradient fade masks at edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, hsl(var(--background)), transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, hsl(var(--background)), transparent)" }} />
  <div
    ref={glintRef}
    className="absolute top-0 bottom-0 w-24 pointer-events-none z-20"
    style={{
      left: "-6rem",
      opacity: 0,
      background:
        "linear-gradient(90deg, transparent, hsl(var(--foreground) / 0.14) 45%, hsl(var(--primary) / 0.22) 50%, hsl(var(--foreground) / 0.14) 55%, transparent)",
      mixBlendMode: "screen",
    }}
  />

        <div
          ref={tickerRef}
          className="flex items-center will-change-transform py-3"
          style={{ width: "max-content" }}
        >
          <div
            ref={tickerInnerRef}
            className="flex items-center gap-0 shrink-0"
          >
            {TICKER_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center shrink-0">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 whitespace-nowrap px-4">
                  {item}
                </span>
                <span className="text-muted-foreground/20 text-xs">◆</span>
              </div>
            ))}
          </div>
        </div>
      </div>)}
      <div
  ref={tickerWrapperRef}
  className="relative z-10 border-t border-border/40 overflow-hidden select-none"
  aria-hidden="true"
>
  {/* Gradient fade masks at edges */}
  <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
    style={{ background: "linear-gradient(to right, hsl(var(--background)), transparent)" }} />
  <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
    style={{ background: "linear-gradient(to left, hsl(var(--background)), transparent)" }} />

  <div
    ref={tickerRef}
    className="flex items-center will-change-transform py-3"
    style={{ width: "max-content" }}
  >
    <div
      ref={tickerInnerRef}
      className="flex items-center gap-0 shrink-0"
    >
      {TICKER_ITEMS.map((item, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) tickerItemRefs.current[i] = el;
          }}
          className="flex items-center shrink-0 overflow-hidden"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 whitespace-nowrap px-4 inline-block will-change-transform">
            {item}
          </span>
          <span className="text-muted-foreground/20 text-xs">◆</span>
        </div>
      ))}
    </div>
  </div>
</div>

    </section>
  );
}
