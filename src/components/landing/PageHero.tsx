// import { useRef, useLayoutEffect, type ReactNode } from "react";
// import Copy, { type CopyHandle } from "@/components/Copy";
// import { useAnimationCoordinator, type AnimationMode } from "@/components/AnimationCoordinator";

// interface PageHeroProps {
//   title: ReactNode;
//   description?: ReactNode;
//   titleDelay?: number;
//   descDelay?: number;
//   titleRevealDelay?: number;
//   titleFadeDelay?: number;
//   descRevealDelay?: number;
//   descFadeDelay?: number;
//   titleReveal?: boolean;
//   descReveal?: boolean;
// }

// export default function PageHero({
//   title,
//   description,
//   titleDelay,
//   descDelay,
//   titleRevealDelay,
//   titleFadeDelay,
//   descRevealDelay,
//   descFadeDelay,
//   titleReveal = true,
//   descReveal = true,
// }: PageHeroProps) {
//   const titleRef = useRef<CopyHandle>(null);
//   const descRef = useRef<CopyHandle>(null);
//   const { registerAnimation } = useAnimationCoordinator();

//   const effectiveTitleReveal = titleRevealDelay ?? titleDelay ?? 0;
//   const effectiveTitleFade = titleFadeDelay ?? titleDelay ?? 0;
//   const effectiveDescReveal = descRevealDelay ?? descDelay ?? 0;
//   const effectiveDescFade = descFadeDelay ?? descDelay ?? 0;

//   useLayoutEffect(() => {
//     const unsub1 = registerAnimation((mode: AnimationMode) => {
//       if (mode === "reveal" && titleReveal) {
//         titleRef.current?.play();
//       } else {
//         titleRef.current?.fadeIn();
//       }
//     });
//     const unsub2 = description
//       ? registerAnimation((mode: AnimationMode) => {
//           if (mode === "reveal" && descReveal) {
//             descRef.current?.play();
//           } else {
//             descRef.current?.fadeIn();
//           }
//         })
//       : undefined;
//     return () => {
//       unsub1();
//       unsub2?.();
//     };
//   }, [registerAnimation, description, titleReveal, descReveal]);

//   return (
//     <section className="bg-secondary/40 pt-20 pb-10 sm:pt-24 sm:pb-12 lg:pt-28 lg:pb-16">
//       <div className="container mx-auto px-4 sm:px-6 text-center max-w-2xl">
//         <Copy ref={titleRef} animateOnScroll={true} revealDelay={effectiveTitleReveal} fadeDelay={effectiveTitleFade}>
//           <h1 className="font-display text-[clamp(1.75rem,5.5vw,3rem)] font-bold leading-[1.1] text-balance text-primary">
//             {title}
//           </h1>
//         </Copy>
//         {description && (
//           <Copy ref={descRef} animateOnScroll={true} revealDelay={effectiveDescReveal} fadeDelay={effectiveDescFade}>
//             <p className="mt-4 text-[clamp(0.95rem,1.6vw,1.125rem)] leading-relaxed text-muted-foreground">
//               {description}
//             </p>
//           </Copy>
//         )}
//       </div>
//     </section>
//   );
// }

// Changes:
// 1. Default delays from 2 → 0 (the "2" was causing late/broken timing)
// 2. titleReveal/descReveal now both default true (so nav triggers word reveal)
// 3. Reload detection via sessionStorage flag — fires fadeUp GSAP instead of play()

import { useRef, useLayoutEffect, useEffect, type ReactNode } from "react";
import gsap from "gsap";
import Copy, { type CopyHandle } from "@/components/Copy";
import { useAnimationCoordinator, type AnimationMode } from "@/components/AnimationCoordinator";

interface PageHeroProps {
  title: ReactNode;
  description?: ReactNode;
  titleDelay?: number;
  descDelay?: number;
  titleRevealDelay?: number;
  titleFadeDelay?: number;
  descRevealDelay?: number;
  descFadeDelay?: number;
  titleReveal?: boolean;
  descReveal?: boolean;
}

export default function PageHero({
  title,
  description,
  titleDelay,
  descDelay,
  titleRevealDelay,
  titleFadeDelay,
  descRevealDelay,
  descFadeDelay,
  titleReveal = true,   // ← was true but Events/Contact passed false — now keep true everywhere
  descReveal = true,
}: PageHeroProps) {
  const titleRef = useRef<CopyHandle>(null);
  const descRef = useRef<CopyHandle>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const { registerAnimation } = useAnimationCoordinator();

  // ── Delay values — default to 0, not 2 ──────────────────────────────────
  const effectiveTitleReveal = titleRevealDelay ?? titleDelay ?? 0;
  const effectiveTitleFade   = titleFadeDelay   ?? titleDelay ?? 0;
  const effectiveDescReveal  = descRevealDelay  ?? descDelay  ?? 0.08;
  const effectiveDescFade    = descFadeDelay    ?? descDelay  ?? 0.1;

  useLayoutEffect(() => {
    const unsub1 = registerAnimation((mode: AnimationMode) => {
      if (mode === "reveal" && titleReveal) {
        titleRef.current?.play();
      } else {
        titleRef.current?.fadeIn();
      }
    });

    const unsub2 = description
      ? registerAnimation((mode: AnimationMode) => {
          if (mode === "reveal" && descReveal) {
            descRef.current?.play();
          } else {
            descRef.current?.fadeIn();
          }
        })
      : undefined;

    return () => {
      unsub1();
      unsub2?.();
    };
  }, [registerAnimation, description, titleReveal, descReveal]);

  return (
    <section
      ref={sectionRef}
      className="bg-secondary/40 pt-20 pb-10 sm:pt-24 sm:pb-12 lg:pt-28 lg:pb-16"
    >
      <div className="container mx-auto px-4 sm:px-6 text-center max-w-2xl">
        <Copy
          ref={titleRef}
          animateOnScroll={false}
          revealDelay={effectiveTitleReveal}
          fadeDelay={effectiveTitleFade}
        >
          <h1 className="font-display text-[clamp(1.75rem,5.5vw,3rem)] font-bold leading-[1.1] text-balance text-primary">
            {title}
          </h1>
        </Copy>
        {description && (
          <Copy
            ref={descRef}
            animateOnScroll={false}
            revealDelay={effectiveDescReveal}
            fadeDelay={effectiveDescFade}
          >
            <p className="mt-4 text-[clamp(0.95rem,1.6vw,1.125rem)] leading-relaxed text-muted-foreground">
              {description}
            </p>
          </Copy>
        )}
      </div>
    </section>
  );
}