import { useEffect, RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type RevealType = "up" | "left" | "right" | "scale";

const FROM: Record<RevealType, gsap.TweenVars> = {
  up: { y: 40, opacity: 0 },
  left: { x: -56, opacity: 0 },
  right: { x: 56, opacity: 0 },
  scale: { scale: 0.92, opacity: 0 },
};

const TO: Record<RevealType, gsap.TweenVars> = {
  up: { y: 0, opacity: 1 },
  left: { x: 0, opacity: 1 },
  right: { x: 0, opacity: 1 },
  scale: { scale: 1, opacity: 1 },
};

/**
 * Attach to a section's container ref. Any descendant with a
 * `data-reveal="up|left|right|scale"` attribute will animate in once it
 * crosses 88% of the viewport. Optional `data-reveal-delay="0.2"` (seconds)
 * staggers related elements.
 *
 * Usage:
 *   const sectionRef = useRef<HTMLElement>(null);
 *   useScrollReveal(sectionRef);
 *   <section ref={sectionRef}>
 *     <h2 data-reveal="up">...</h2>
 *     <p data-reveal="up" data-reveal-delay="0.15">...</p>
 *   </section>
 */
export function useScrollReveal<T extends HTMLElement>(
  containerRef: RefObject<T>,
  deps: unknown[] = []
) {
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const els = gsap.utils.toArray<HTMLElement>(
        "[data-reveal]",
        containerRef.current as HTMLElement
      );

      els.forEach((el) => {
        const type = (el.dataset.reveal as RevealType) || "up";
        const delay = Number(el.dataset.revealDelay || 0);

        gsap.set(el, FROM[type]);
        gsap.to(el, {
          ...TO[type],
          duration: 0.9,
          ease: "power3.out",
          delay,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
            invalidateOnRefresh: true, // ← add this
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
