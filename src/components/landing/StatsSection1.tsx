// import { useRef, useState, useEffect } from "react";
// import { useTranslation } from "react-i18next";
// import { useGSAP } from "@gsap/react";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { dashboardApi } from "@/services/api.service";
// import type { DashboardOverview } from "@/types/api";

// gsap.registerPlugin(ScrollTrigger);

// const CACHE_KEY = "amana_overview_cache_v1";
// const STALE_MS = 5 * 60 * 1000;

// // Realistic defaults while the fetch is in flight — coherent with the ~78
// // verified families the hero/impact sections report.
// const FALLBACK = {
//   orphan: 34,
//   single_mother: 18,
//   disabled_disease: 12,
//   old_age: 14,
// };

// const compact = new Intl.NumberFormat("en", {
//   notation: "compact",
//   maximumFractionDigits: 1,
// });

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

// export default function StatsSection() {
//   const { t } = useTranslation();
//   const wrapperRef = useRef<HTMLDivElement>(null);
//   const trackRef = useRef<HTMLDivElement>(null);
//   // const [activeIndex, setActiveIndex] = useState(0);
//   const labelRef = useRef<HTMLSpanElement>(null);
//   const barRef = useRef<HTMLSpanElement>(null);

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
//         } catch {
//           /* ignore — private mode etc. */
//         }
//         setStats(mapStats(res.data));
//       })
//       .catch((err) => console.warn("Stats section fetch failed:", err));
//   }, []);

//   const STATS = [
//     { value: compact.format(stats.orphan), labelKey: "stats.card1", fallback: "Families raising children who have lost one or both parents" },
//     { value: compact.format(stats.single_mother), labelKey: "stats.card2", fallback: "Single mothers raising their children on their own, with our steady support" },
//     { value: compact.format(stats.disabled_disease), labelKey: "stats.card3", fallback: "Families living with disability or long-term illness, never left behind" },
//     { value: compact.format(stats.old_age), labelKey: "stats.card4", fallback: "Elderly families without a steady income, cared for with dignity" },
//   ];

//   useGSAP(() => {
//     if (!wrapperRef.current || !trackRef.current) return;
//     const wrapper = wrapperRef.current;
//     const track = trackRef.current;

//     const getDistance = () => track.scrollWidth - track.offsetWidth;

//     const tween = gsap.to(track, {
//       x: () => -getDistance(),
//       ease: "none",
//       force3D: true,
//       scrollTrigger: {
//         trigger: wrapper,
//         start: "top top",
//         end: () => `+=${getDistance()}`,
//         pin: true,
//         pinSpacing: true,
//         scrub: 0.1,
//         fastScrollEnd: true,
//         preventOverlaps: true,
//         invalidateOnRefresh: true,
//         // onUpdate: (self) => {
//         //   const idx = Math.min(
//         //     Math.floor(self.progress * STATS.length),
//         //     STATS.length - 1
//         //   );
//         //   setActiveIndex((prev) => (prev !== idx ? idx : prev));
//         // },
//         onUpdate: (self) => {
//           const idx = Math.min(
//             Math.floor(self.progress * STATS.length),
//             STATS.length - 1
//           );
//           if (labelRef.current) {
//             labelRef.current.textContent = `0${idx + 1} / 0${STATS.length}`;
//           }
//           if (barRef.current) {
//             barRef.current.style.width = `${self.progress * 100}%`;
//           }
//         },
//       },
//     });

//     return () => {
//       tween.scrollTrigger?.kill();
//       tween.kill();
//     };
//   }, { scope: wrapperRef });

//   return (
//     <div
//       ref={wrapperRef}
//       className="relative bg-secondary/40 border-y border-border overflow-hidden [transform:translateZ(0)]"
//     >
//       <div
//         ref={trackRef}
//         className="flex will-change-transform [transform:translateZ(0)] [backface-visibility:hidden]"
//       >
//         {STATS.map((stat, i) => (
//           <div
//             key={stat.labelKey}
//             className="flex-shrink-0 w-screen min-h-lvh flex flex-col items-center justify-center text-center px-8 relative [backface-visibility:hidden]"
//           >
//             {i !== STATS.length - 1 && (
//               <span className="absolute right-0 top-1/4 h-1/2 w-px bg-border" />
//             )}
//             <div className="font-display font-extrabold tracking-tight text-[clamp(3.5rem,10vw,8.5rem)] leading-none mb-4">
//               {stat.value}
//             </div>
//             <p className="text-base sm:text-lg text-muted-foreground max-w-xs">
//               {t(stat.labelKey, stat.fallback)}
//             </p>
//           </div>
//         ))}
//       </div>

//       <div className="flex absolute bottom-8 left-1/2 -translate-x-1/2 items-center gap-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
//         {/* <span>0{activeIndex + 1} / 0{STATS.length}</span>
//         <span className="w-28 h-0.5 bg-border rounded-full overflow-hidden">
//           <span
//             className="block h-full bg-primary rounded-full transition-[width] duration-300"
//             style={{ width: `${((activeIndex + 1) / STATS.length) * 100}%` }}
//           />
//         </span> */}
//         <span ref={labelRef}>01 / 0{STATS.length}</span>
//         <span className="w-28 h-0.5 bg-border rounded-full overflow-hidden">
//           <span
//             ref={barRef}
//             className="block h-full bg-primary rounded-full"
//             style={{ width: `${100 / STATS.length}%` }}
//           />
//         </span>
//       </div>
//     </div>
//   );
// }


import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { dashboardApi } from "@/services/api.service";
import type { DashboardOverview } from "@/types/api";

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.config({ ignoreMobileResize: true });

const CACHE_KEY = "amana_overview_cache_v1";
const STALE_MS = 5 * 60 * 1000;

const FALLBACK = {
  orphan: 34,
  single_mother: 18,
  disabled_disease: 12,
  old_age: 14,
};

const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

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

export default function StatsSection() {
  const { t } = useTranslation();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

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

  const STATS = [
    { value: compact.format(stats.orphan), labelKey: "stats.card1", fallback: "Families raising children who have lost one or both parents" },
    { value: compact.format(stats.single_mother), labelKey: "stats.card2", fallback: "Single mothers raising their children on their own, with our steady support" },
    { value: compact.format(stats.disabled_disease), labelKey: "stats.card3", fallback: "Families living with disability or long-term illness, never left behind" },
    { value: compact.format(stats.old_age), labelKey: "stats.card4", fallback: "Elderly families without a steady income, cared for with dignity" },
  ];

  useGSAP(() => {
    if (!wrapperRef.current || !trackRef.current) return;
    const wrapper = wrapperRef.current;
    const track = trackRef.current;

    const getDistance = () => track.scrollWidth - track.offsetWidth;

    gsap.to(track, {
      x: () => -getDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: wrapper,
        start: "top top",
        end: () => `+=${getDistance()}`,
        pin: true,
        pinSpacing: true,
        scrub: true, // Direct 1:1 mapping is better for 120Hz native scroll than 0.1 interpolation
        fastScrollEnd: true,
        preventOverlaps: true,
        invalidateOnRefresh: true,
        anticipatePin: 1, 
        onEnter: () => window.dispatchEvent(new CustomEvent("force-hide-nav", { detail: { hidden: true } })),
        onLeave: () => window.dispatchEvent(new CustomEvent("force-hide-nav", { detail: { hidden: false } })),
        onEnterBack: () => window.dispatchEvent(new CustomEvent("force-hide-nav", { detail: { hidden: true } })),
        onLeaveBack: () => window.dispatchEvent(new CustomEvent("force-hide-nav", { detail: { hidden: false } })),
        onUpdate: (self) => {
          const idx = Math.min(
            Math.floor(self.progress * STATS.length),
            STATS.length - 1
          );
          if (labelRef.current) {
            labelRef.current.textContent = `0${idx + 1} / 0${STATS.length}`;
          }
          if (barRef.current) {
            barRef.current.style.width = `${self.progress * 100}%`;
          }
        },
      },
    });

  }, { 
    scope: wrapperRef, 
    dependencies: [stats, t] 
  });

  useEffect(() => {
    // Awwwards optimization: Disable pointer events while scrolling
    // This stops the browser from doing heavy hit-testing (checking for hovers) 
    // on all the elements inside the track while you are swiping.
    let scrollTimeout: ReturnType<typeof setTimeout>;
    const trackElement = trackRef.current;
    
    const disablePointersOnScroll = () => {
      if (!trackElement) return;
      if (trackElement.style.pointerEvents !== "none") {
        trackElement.style.pointerEvents = "none";
      }
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (trackElement) trackElement.style.pointerEvents = "auto";
      }, 150);
    };

    window.addEventListener("scroll", disablePointersOnScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", disablePointersOnScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative bg-secondary/40 border-y border-border overflow-hidden"
    >
      <div
        ref={trackRef}
        className="flex will-change-transform"
      >
        {STATS.map((stat, i) => (
          <div
            key={stat.labelKey}
            className="flex-shrink-0 w-screen min-h-lvh flex flex-col items-center justify-center text-center px-8 relative"
          >
            {i !== STATS.length - 1 && (
              <span className="absolute right-0 top-1/4 h-1/2 w-px bg-border" />
            )}
            <div className="font-display font-extrabold tracking-tight text-[clamp(3.5rem,10vw,8.5rem)] leading-none mb-4">
              {stat.value}
            </div>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xs">
              {t(stat.labelKey, stat.fallback)}
            </p>
          </div>
        ))}
      </div>

      <div className="flex absolute bottom-[calc(2rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 items-center gap-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
        <span ref={labelRef}>01 / 0{STATS.length}</span>
        <span className="w-28 h-0.5 bg-border rounded-full overflow-hidden">
          <span
            ref={barRef}
            className="block h-full bg-primary rounded-full"
            style={{ width: `${100 / STATS.length}%` }}
          />
        </span>
      </div>
    </div>
  );
}
