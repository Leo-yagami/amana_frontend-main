import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: "1.2M+", labelKey: "stats.card1", fallback: "Liters of clean water delivered to families without reliable access" },
  { value: "84K", labelKey: "stats.card2", fallback: "Children currently attending school because of a sponsored place" },
  { value: "320", labelKey: "stats.card3", fallback: "Health clinics funded, staffed, and kept stocked this year" },
  { value: "92%", labelKey: "stats.card4", fallback: "Of every donation reaches a program directly, not overhead" },
];

export default function StatsSection() {
  const { t } = useTranslation();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useGSAP(() => {
    if (!wrapperRef.current || !trackRef.current) return;
    const wrapper = wrapperRef.current;
    const track = trackRef.current;

    const getDistance = () => track.scrollWidth - track.offsetWidth;

    const tween = gsap.to(track, {
      x: () => -getDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: wrapper,
        start: "top top",
        end: () => `+=${getDistance()}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const idx = Math.min(
            Math.floor(self.progress * STATS.length),
            STATS.length - 1
          );
          setActiveIndex(idx);
        },
      },
    });
    // Give the DOM time to settle after pin spacer is inserted
      // const timer = setTimeout(() => ScrollTrigger.refresh(), 300);

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, { scope: wrapperRef });


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
          className="flex-shrink-0 w-screen min-h-screen flex flex-col items-center justify-center text-center px-8 relative"
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

    <div className="flex absolute bottom-8 left-1/2 -translate-x-1/2 items-center gap-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
      <span>0{activeIndex + 1} / 0{STATS.length}</span>
      <span className="w-28 h-0.5 bg-border rounded-full overflow-hidden">
        <span
          className="block h-full bg-primary rounded-full transition-[width] duration-300"
          style={{ width: `${((activeIndex + 1) / STATS.length) * 100}%` }}
        />
      </span>
    </div>
  </div>
);
}