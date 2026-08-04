// /**
//  * ExpandingViewAll
//  * -----------------
//  * A "View all" trigger that morphs directly into a modal: the label's
//  * characters lift away letter by letter, the button expands into place,
//  * the backdrop blurs in, and the content settles — then reverses on close.
//  *
//  * Install once:
//  *   npm install gsap
//  *
//  * Usage:
//  *   <ExpandingViewAll title="All Activities" description="Everything that happened recently">
//  *     <div className="space-y-3">
//  *       {activities.map((a) => <ActivityRow key={a.id} activity={a} />)}
//  *     </div>
//  *   </ExpandingViewAll>
//  *
//  * Accessibility:
//  *   - role="dialog" + aria-modal, focus moves to the close button on open
//  *     and returns to the trigger on close.
//  *   - Escape closes; Tab is trapped inside the dialog while open.
//  *   - Respects prefers-reduced-motion with a fast crossfade fallback.
//  */

// import {
//   useEffect,
//   useLayoutEffect,
//   useMemo,
//   useRef,
//   useState,
//   type ReactNode,
// } from "react";
// import { createPortal } from "react-dom";
// import gsap from "gsap";
// import { X, ArrowUpRight, type LucideIcon } from "lucide-react";

// gsap.config({ force3D: true }); // not required, but doesn't hurt

// // --- body scroll lock, safe across multiple simultaneous instances ---
// let scrollLockCount = 0;
// function lockBodyScroll() {
//   if (scrollLockCount === 0) document.body.style.overflow = "hidden";
//   scrollLockCount++;
// }
// function unlockBodyScroll() {
//   scrollLockCount = Math.max(0, scrollLockCount - 1);
//   if (scrollLockCount === 0) document.body.style.overflow = "";
// }

// let idCounter = 0;

// type Phase = "closed" | "opening" | "open" | "closing";

// interface ExpandingViewAllProps {
//   /** Trigger label. Defaults to "View all". */
//   label?: string;
//   /** Modal heading. */
//   title: string;
//   /** Optional subheading under the title. */
//   description?: string;
//   /** Modal body content. */
//   children: ReactNode;
//   /** Icon shown next to the label (defaults to ArrowUpRight). */
//   icon?: LucideIcon;
//   /** Extra classes for the trigger button. */
//   className?: string;
//   /** Modal's max width/height in px (it stays responsive below these). */
//   maxWidth?: number;
//   maxHeight?: number;
// }

// export default function ExpandingViewAll({
//   label = "View all",
//   title,
//   description,
//   children,
//   icon: Icon = ArrowUpRight,
//   className = "",
//   maxWidth = 680,
//   maxHeight = 620,
// }: ExpandingViewAllProps) {
//   const [phase, setPhase] = useState<Phase>("closed");
//   const isAnimating = useRef(false);
//   const reducedMotion = useRef(false);
//   const dialogTitleId = useRef(`expanding-view-all-title-${++idCounter}`);

//   const triggerRef = useRef<HTMLButtonElement>(null);
//   const arrowRef = useRef<HTMLSpanElement>(null);
//   const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const contentRef = useRef<HTMLDivElement>(null);
//   const backdropRef = useRef<HTMLDivElement>(null);
//   const closeBtnRef = useRef<HTMLButtonElement>(null);

//   useEffect(() => {
//     reducedMotion.current = window.matchMedia(
//       "(prefers-reduced-motion: reduce)"
//     ).matches;
//   }, []);

//   // const chars = useMemo(() => label.split(""), [label]);
//   // charRefs.current = [];
//   const chars = useMemo(() => label.split(""), [label]);
//   // ✅ Safely resize the array to match the current characters without destroying existing refs
//   if (charRefs.current.length !== chars.length) {
//     charRefs.current.length = chars.length; 
//   }

//   function getTargetRect() {
//     const vw = window.innerWidth;
//     const vh = window.innerHeight;
//     const width = Math.min(maxWidth, vw * 0.92);
//     const height = Math.min(maxHeight, vh * 0.86);
//     return { width, height, left: (vw - width) / 2, top: (vh - height) / 2 };
//   }

//   function open() {
//     if (phase !== "closed" || isAnimating.current) return;
//     isAnimating.current = true;
//     setPhase("opening");
//   }

//   function close() {
//     if (phase !== "open" || isAnimating.current) return;
//     isAnimating.current = true;
//     setPhase("closing");
//   }

//   // ---- opening choreography ----
//   useLayoutEffect(() => {
//     if (phase !== "opening") return;

//   // Create a context
//   const ctx = gsap.context(() => {
//     // const tl = gsap.timeline({ onComplete: finish });
//     const trigger = triggerRef.current;
//     const container = containerRef.current;
//     const backdrop = backdropRef.current;
//     const content = contentRef.current;
//     const arrow = arrowRef.current;
//     if (!trigger || !container || !backdrop || !content) return;

//     const startRect = trigger.getBoundingClientRect();
//     const target = getTargetRect();
//     const validChars = charRefs.current.filter(Boolean) as HTMLSpanElement[];


//     gsap.set(container, {
//       top: startRect.top,
//       left: startRect.left,
//       width: startRect.width,
//       height: startRect.height,
//       borderRadius: 14,
//       visibility: "visible",
//       opacity: 1,
//       autoAlpha: 0, // <-- Start hidden so we can see the button underneath!
//     });
//     gsap.set(content, { opacity: 0, y: 24, filter: "blur(6px)" });
//     gsap.set(backdrop, { autoAlpha: 0 });

//     const finish = () => {
//       isAnimating.current = false;
//       setPhase("open");
//       lockBodyScroll();
//       requestAnimationFrame(() => closeBtnRef.current?.focus());
//     };

//     if (reducedMotion.current) {
//       const tl = gsap.timeline({ onComplete: finish });
//       tl.set(trigger, { autoAlpha: 0 }, 0);
//       tl.to(
//         container,
//         { ...target, borderRadius: 24, duration: 0.18, ease: "power2.out" },
//         0
//       );
//       tl.to(backdrop, { autoAlpha: 1, duration: 0.15 }, 0);
//       tl.to(
//         content,
//         { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.18 },
//         0.05
//       );
//       return () => {
//         tl.kill();
//       };
//     }

//     const tl = gsap.timeline({ onComplete: finish });

//     // // anticipatory press, like the button is winding up
//     // tl.to(trigger, { scale: 0.96, duration: 0.1, ease: "power2.in" }, 0).to(
//     //   trigger,
//     //   { scale: 1, duration: 0.18, ease: "power2.out" },
//     //   0.1
//     // );

//     // // characters lift away one by one
//     // if (validChars.length) {
//     //   tl.set(validChars, { clearProps: "translate,rotate,scale" }, 0);
//     //   tl.to(
//     //     validChars,
//     //     {
//     //       y: -22,
//     //       opacity: 0,
//     //       duration: 0.4,
//     //       ease: "power3.in",
//     //       stagger: { each: 0.028, from: "start" },
//     //     },
//     //     0.05
//     //   );
//     // }

//     // // arrow tucks itself away
//     // tl.set([trigger, ...validChars, arrow, content], { clearProps: "translate,rotate,scale" }, 0);
//     // if (arrow) {
//     //   tl.to(
//     //     arrow,
//     //     { opacity: 0, scale: 0.5, rotation: 45, duration: 0.35, ease: "power2.in" },
//     //     0.12
//     //   );
//     // }

//     // 1. Anticipatory press (use fromTo for the first tween!)
//     tl.fromTo(trigger, { scale: 1 }, { scale: 0.96, duration: 0.1, ease: "power2.in" }, 0)
//       .to(trigger, { scale: 1, duration: 0.18, ease: "power2.out" }, 0.1);

//     // 2. Characters lift away
//     if (validChars.length) {
//       // (You can delete the old tl.set(validChars, { clearProps... }) hack)
//       tl.fromTo(
//         validChars,
//         { y: 0, opacity: 1, scale: 1, rotation: 0 },
//         {
//           y: -22,
//           opacity: 0,
//           duration: 0.4,
//           ease: "power3.in",
//           stagger: { each: 0.028, from: "start" },
//         },
//         0.05
//       );
//     }

//     // 3. Arrow tucks itself away
//     if (arrow) {
//       // (You can delete the old tl.set(arrow, { clearProps... }) hack)
//       tl.fromTo(
//         arrow,
//         { opacity: 1, scale: 1, rotation: 0 },
//         { opacity: 0, scale: 0.5, rotation: 45, duration: 0.35, ease: "power2.in" },
//         0.12
//       );
//     }
     

//     tl.set(trigger, { autoAlpha: 0 }, 0.42);
//     tl.set(container, { autoAlpha: 1 }, 0.42);
//     // the button becomes the modal
//     tl.to(
//       container,
//       { ...target, borderRadius: 24, duration: 0.85, ease: "expo.inOut" },
//       0.42
//     );

//     // backdrop breathes in
//     tl.to(backdrop, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, 0.48);

//     // content materializes into place
//     tl.to(content, { opacity: 1, duration: 0.4, ease: "power2.out" }, 0.82).to(
//       content,
//       { y: 0, filter: "blur(0px)", duration: 0.6, ease: "expo.out" },
//       0.82
//     );


    
//   }, containerRef); // Scope to container if possible
    
//     return () => ctx.revert();
//       // tl.kill();;
//   }, [phase]);

//   // ---- closing choreography ----
//   useLayoutEffect(() => {
//     if (phase !== "closing") return;
//     const trigger = triggerRef.current;
//     const container = containerRef.current;
//     const backdrop = backdropRef.current;
//     const content = contentRef.current;
//     const arrow = arrowRef.current;
//     if (!trigger || !container || !backdrop || !content) return;

//     const target = trigger.getBoundingClientRect();
//     const validChars = charRefs.current.filter(Boolean) as HTMLSpanElement[];
//     console.log("[open] validChars count:", validChars.length, validChars);
//     console.log("[open] effect ran, building timeline");


//     const finish = () => {
//        console.log("[open] timeline COMPLETED")
//       isAnimating.current = false;
//       setPhase("closed");
//       unlockBodyScroll();
//       trigger.focus();
//     };

//     if (reducedMotion.current) {
//       const tl = gsap.timeline({ onComplete: finish });
//       tl.to(content, { opacity: 0, duration: 0.12 }, 0);
//       tl.to(backdrop, { autoAlpha: 0, duration: 0.15 }, 0);
//       tl.to(
//         container,
//         {
//           top: target.top,
//           left: target.left,
//           width: target.width,
//           height: target.height,
//           borderRadius: 14,
//           duration: 0.18,
//           ease: "power2.in",
//         },
//         0
//       );
//       tl.set(trigger, { autoAlpha: 1 }, 0.16);
//       return () => {
//         tl.kill();
//       };
//     }

//     const tl = gsap.timeline({ onComplete: finish });

//     tl.to(
//       content,
//       { opacity: 0, y: 16, filter: "blur(4px)", duration: 0.25, ease: "power2.in" },
//       0
//     );
//     tl.to(backdrop, { autoAlpha: 0, duration: 0.35, ease: "power2.in" }, 0.05);
//     tl.to(
//       container,
//       {
//         top: target.top,
//         left: target.left,
//         width: target.width,
//         height: target.height,
//         borderRadius: 14,
//         duration: 0.7,
//         ease: "expo.inOut",
//       },
//       0.15
//     );
//     // tl.set(trigger, { autoAlpha: 1 }, 0.55);
//    tl.set(container, { autoAlpha: 0 }, 0.85);
//    tl.set(trigger, { autoAlpha: 1 }, 0.85); 

//     if (validChars.length) {
//       tl.fromTo(
//         validChars,
//         { y: -22, opacity: 0 },
//         {
//           y: 0,
//           opacity: 1,
//           duration: 0.4,
//           ease: "back.out(1.5)",
//           stagger: { each: 0.025, from: "end" },
//         },
//         0.85
//       );
//     }
//     if (arrow) {
//       tl.fromTo(
//         arrow,
//         { opacity: 0, scale: 0.5, rotation: 45 },
//         { opacity: 1, scale: 1, rotation: 0, duration: 0.4, ease: "back.out(1.6)" },
//         0.95
//       );
//     }

    

//     return () => {
//       console.log("[open] cleanup fired, killing timeline");
//       tl.kill();
//     };
//   }, [phase]);

//   // keep centered if the viewport resizes while open
//   useEffect(() => {
//     if (phase !== "open") return;
//     function onResize() {
//       const target = getTargetRect();
//       gsap.to(containerRef.current, { ...target, duration: 0.3, ease: "power2.out" });
//     }
//     window.addEventListener("resize", onResize);
//     return () => window.removeEventListener("resize", onResize);
//   }, [phase]);

//   // escape to close + focus trap while open
//   useEffect(() => {
//     if (phase !== "open") return;
//     function onKeyDown(e: KeyboardEvent) {
//       if (e.key === "Escape") {
//         e.stopPropagation();
//         close();
//         return;
//       }
//       if (e.key === "Tab" && containerRef.current) {
//         const focusable = containerRef.current.querySelectorAll<HTMLElement>(
//           'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
//         );
//         if (!focusable.length) return;
//         const list = Array.from(focusable);
//         const first = list[0];
//         const last = list[list.length - 1];
//         if (e.shiftKey && document.activeElement === first) {
//           e.preventDefault();
//           last.focus();
//         } else if (!e.shiftKey && document.activeElement === last) {
//           e.preventDefault();
//           first.focus();
//         }
//       }
//     }
//     document.addEventListener("keydown", onKeyDown);
//     return () => document.removeEventListener("keydown", onKeyDown);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [phase]);

//   // release the scroll lock if the component unmounts mid-open
//   useEffect(() => {
//     return () => {
//       if (phase === "open" || phase === "opening") unlockBodyScroll();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const showPortal = phase !== "closed";

//   return (
//     <>
//       <button
//         ref={triggerRef}
//         type="button"
//         onClick={open}
//         aria-haspopup="dialog"
//         aria-expanded={phase !== "closed"}
//         className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
//       >
//         <span className="relative inline-flex h-5 overflow-hidden">
//           <span className="inline-flex">
//             {chars.map((ch, i) => (
//               <span
//                 key={i}
//                 ref={(el) => {
//                   charRefs.current[i] = el;
//                 }}
//                 className="inline-block "
//               >
//                 {ch === " " ? "\u00A0" : ch}
//               </span>
//             ))}
//           </span>
//         </span>
//         <span ref={arrowRef} className="inline-flex ">
//           <Icon className="h-4 w-4" />
//         </span>
//       </button>

//       {showPortal &&
//         createPortal(
//           <>
//             <div
//               ref={backdropRef}
//               onClick={close}
//               className="fixed inset-0 z-[998] bg-background/70 backdrop-blur-md"
//               style={{ visibility: "hidden", opacity: 0 }}
//               aria-hidden="true"
//             />
//             <div
//               ref={containerRef}
//               role="dialog"
//               aria-modal="true"
//               aria-labelledby={dialogTitleId.current}
//               className="fixed z-[999] flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
//               style={{
//                 visibility: "hidden",
//                 willChange: "top, left, width, height, border-radius",
//               }}
//             >
//               <div
//                 ref={contentRef}
//                 data-lenis-prevent
//                 className="flex-1 overflow-y-auto p-6 sm:p-8"
//               >
//                 <div className="mb-6 flex items-start justify-between gap-4">
//                   <div className="min-w-0">
//                     <h3
//                       id={dialogTitleId.current}
//                       className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
//                     >
//                       {title}
//                     </h3>
//                     {description && (
//                       <p className="mt-1 text-sm text-muted-foreground">
//                         {description}
//                       </p>
//                     )}
//                   </div>
//                   <button
//                     ref={closeBtnRef}
//                     type="button"
//                     onClick={close}
//                     aria-label="Close"
//                     className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-200 hover:rotate-90 hover:bg-muted/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
//                   >
//                     <X className="h-4 w-4" />
//                   </button>
//                 </div>
//                 {children}
//               </div>
//             </div>
//           </>,
//           document.body
//         )}
//     </>
//   );
// }

/**
 * ExpandingViewAll1
 * -----------------
 * A "View all" trigger that morphs directly into a modal: the label's
 * characters lift away letter by letter, the button expands into place,
 * the backdrop blurs in, and the content settles — then reverses on close.
 *
 * FIX (vs original): the container was rendered fully opaque/visible from
 * frame 0 at the trigger's exact rect, so it occluded the trigger instantly
 * — the char-lift and arrow-tuck animations were technically running, just
 * hidden behind an opaque card. The container is now kept invisible until
 * the char/arrow choreography finishes, then fades in as it starts
 * expanding (mirrored on close: container fades out before the trigger's
 * chars/arrow reappear).
 *
 * Install once:
 *   npm install gsap
 *
 * Usage:
 *   <ExpandingViewAll1 title="All Activities" description="Everything that happened recently">
 *     <div className="space-y-3">
 *       {activities.map((a) => <ActivityRow key={a.id} activity={a} />)}
 *     </div>
 *   </ExpandingViewAll1>
 *
 * Accessibility:
 *   - role="dialog" + aria-modal, focus moves to the close button on open
 *     and returns to the trigger on close.
 *   - Escape closes; Tab is trapped inside the dialog while open.
 *   - Respects prefers-reduced-motion with a fast crossfade fallback.
 */

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { X, ArrowUpRight, type LucideIcon } from "lucide-react";

// --- body scroll lock, safe across multiple simultaneous instances ---
let scrollLockCount = 0;
function lockBodyScroll() {
  if (scrollLockCount === 0) document.body.style.overflow = "hidden";
  scrollLockCount++;
}
function unlockBodyScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) document.body.style.overflow = "";
}

let idCounter = 0;

type Phase = "closed" | "opening" | "open" | "closing";

interface ExpandingViewAllProps {
  /** Trigger label. Defaults to "View all". */
  label?: string;
  /** Modal heading. */
  title: string;
  /** Optional subheading under the title. */
  description?: string;
  /** Modal body content. */
  children: ReactNode;
  /** Icon shown next to the label (defaults to ArrowUpRight). */
  icon?: LucideIcon;
  /** Extra classes for the trigger button. */
  className?: string;
  /** Modal's max width/height in px (it stays responsive below these). */
  maxWidth?: number;
  maxHeight?: number;
}

export default function ExpandingViewAll1({
  label = "View all",
  title,
  description,
  children,
  icon: Icon = ArrowUpRight,
  className = "",
  maxWidth = 680,
  maxHeight = 620,
}: ExpandingViewAllProps) {
  const [phase, setPhase] = useState<Phase>("closed");
  const isAnimating = useRef(false);
  const reducedMotion = useRef(false);
  const dialogTitleId = useRef(`expanding-view-all-title-${++idCounter}`);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  const chars = useMemo(() => label.split(""), [label]);
  if (charRefs.current.length !== chars.length) {
    charRefs.current.length = chars.length;
  }

  function getTargetRect() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(maxWidth, vw * 0.92);
    const height = Math.min(maxHeight, vh * 0.86);
    return { width, height, left: (vw - width) / 2, top: (vh - height) / 2 };
  }

  function open() {
    if (phase !== "closed" || isAnimating.current) return;
    isAnimating.current = true;
    setPhase("opening");
  }

  function close() {
    if (phase !== "open" || isAnimating.current) return;
    isAnimating.current = true;
    setPhase("closing");
  }

  // ---- opening choreography ----
  useLayoutEffect(() => {
    if (phase !== "opening") return;
    const trigger = triggerRef.current;
    const container = containerRef.current;
    const backdrop = backdropRef.current;
    const content = contentRef.current;
    const arrow = arrowRef.current;
    if (!trigger || !container || !backdrop || !content) return;

    const startRect = trigger.getBoundingClientRect();
    const target = getTargetRect();
    const validChars = charRefs.current.filter(Boolean) as HTMLSpanElement[];

    gsap.set(container, {
      top: startRect.top,
      left: startRect.left,
      width: startRect.width,
      height: startRect.height,
      borderRadius: 14,
      visibility: "visible",
      // FIX: was `opacity: 1` — that made the container an opaque card
      // sitting exactly on top of the trigger from frame 0, hiding the
      // char/arrow animation before it could ever be seen.
      opacity: 0,
    });
    gsap.set(content, { opacity: 0, y: 24, filter: "blur(6px)" });
    gsap.set(backdrop, { autoAlpha: 0 });

    const finish = () => {
      isAnimating.current = false;
      setPhase("open");
      lockBodyScroll();
      requestAnimationFrame(() => closeBtnRef.current?.focus());
    };

    if (reducedMotion.current) {
      const tl = gsap.timeline({ onComplete: finish });
      tl.set(trigger, { autoAlpha: 0 }, 0);
      tl.to(
        container,
        { ...target, opacity: 1, borderRadius: 24, duration: 0.18, ease: "power2.out" },
        0
      );
      tl.to(backdrop, { autoAlpha: 1, duration: 0.15 }, 0);
      tl.to(
        content,
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.18 },
        0.05
      );
      return () => {
        tl.kill();
      };
    }

    const tl = gsap.timeline({ onComplete: finish });

    // anticipatory press, like the button is winding up
    tl.to(trigger, { scale: 0.96, duration: 0.1, ease: "power2.in" }, 0).to(
      trigger,
      { scale: 1, duration: 0.18, ease: "power2.out" },
      0.1
    );

    // characters lift away one by one — trigger is still the only thing
    // visible here, since container is opacity:0 until 0.4 below
    if (validChars.length) {
      tl.to(
        validChars,
        {
          y: -22,
          opacity: 0,
          duration: 0.4,
          ease: "power3.in",
          stagger: { each: 0.025, from: "start" },
        },
        0.05
      );
    }

    // arrow tucks itself away
    if (arrow) {
      tl.to(
        arrow,
        { opacity: 0, scale: 0.5, rotation: 45, duration: 0.35, ease: "power2.in" },
        0.12
      );
    }

    // container fades in just as it starts expanding, and trigger fades
    // out in the same window — a brief crossfade instead of an instant
    // opaque swap, so nothing pops
    tl.to(container, { opacity: 1, duration: 0.18, ease: "power1.out" }, 0.4);
    tl.to(trigger, { autoAlpha: 0, duration: 0.18, ease: "power1.out" }, 0.4);

    // the button becomes the modal
    tl.to(
      container,
      { ...target, borderRadius: 24, duration: 0.85, ease: "expo.inOut" },
      0.42
    );

    // backdrop breathes in
    tl.to(backdrop, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, 0.48);

    // content materializes into place
    tl.to(content, { opacity: 1, duration: 0.4, ease: "power2.out" }, 0.82).to(
      content,
      { y: 0, filter: "blur(0px)", duration: 0.6, ease: "expo.out" },
      0.82
    );

    return () => {
      tl.kill();
    };
  }, [phase]);

  // ---- closing choreography ----
  useLayoutEffect(() => {
    if (phase !== "closing") return;
    const trigger = triggerRef.current;
    const container = containerRef.current;
    const backdrop = backdropRef.current;
    const content = contentRef.current;
    const arrow = arrowRef.current;
    if (!trigger || !container || !backdrop || !content) return;

    const target = trigger.getBoundingClientRect();
    const validChars = charRefs.current.filter(Boolean) as HTMLSpanElement[];

    // chars/arrow start pre-hidden so they don't flash into view the
    // instant trigger's autoAlpha flips back to 1
    gsap.set(validChars, { y: -22, opacity: 0 });
    if (arrow) gsap.set(arrow, { opacity: 0, scale: 0.5, rotation: 45 });

    const finish = () => {
      isAnimating.current = false;
      setPhase("closed");
      unlockBodyScroll();
      trigger.focus();
    };

    if (reducedMotion.current) {
      const tl = gsap.timeline({ onComplete: finish });
      tl.to(content, { opacity: 0, duration: 0.12 }, 0);
      tl.to(backdrop, { autoAlpha: 0, duration: 0.15 }, 0);
      tl.to(
        container,
        {
          top: target.top,
          left: target.left,
          width: target.width,
          height: target.height,
          borderRadius: 14,
          opacity: 0,
          duration: 0.18,
          ease: "power2.in",
        },
        0
      );
      tl.set(trigger, { autoAlpha: 1 }, 0.16);
      tl.to(validChars, { y: 0, opacity: 1, duration: 0.12 }, 0.16);
      if (arrow) tl.to(arrow, { opacity: 1, scale: 1, rotation: 0, duration: 0.12 }, 0.16);
      return () => {
        tl.kill();
      };
    }

    const tl = gsap.timeline({ onComplete: finish });

    tl.to(
      content,
      { opacity: 0, y: 16, filter: "blur(4px)", duration: 0.25, ease: "power2.in" },
      0
    );
    tl.to(backdrop, { autoAlpha: 0, duration: 0.35, ease: "power2.in" }, 0.05);
    tl.to(
      container,
      {
        top: target.top,
        left: target.left,
        width: target.width,
        height: target.height,
        borderRadius: 14,
        duration: 0.7,
        ease: "expo.inOut",
      },
      0.15
    );

    // FIX: container fades OUT before trigger fades back in, crossfading
    // over a short shared window instead of snapping — this is the mirror
    // of the opening fix above
    tl.to(container, { opacity: 0, duration: 0.15, ease: "power1.in" }, 0.55);
    tl.to(trigger, { autoAlpha: 1, duration: 0.15, ease: "power1.out" }, 0.6);

    if (validChars.length) {
      tl.to(
        validChars,
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "back.out(1.5)",
          stagger: { each: 0.025, from: "end" },
        },
        0.68
      );
    }
    if (arrow) {
      tl.to(
        arrow,
        { opacity: 1, scale: 1, rotation: 0, duration: 0.4, ease: "back.out(1.6)" },
        0.82
      );
    }

    return () => {
      tl.kill();
    };
  }, [phase]);

  // keep centered if the viewport resizes while open
  useEffect(() => {
    if (phase !== "open") return;
    function onResize() {
      const target = getTargetRect();
      gsap.to(containerRef.current, { ...target, duration: 0.3, ease: "power2.out" });
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [phase]);

  // escape to close + focus trap while open
  useEffect(() => {
    if (phase !== "open") return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
        return;
      }
      if (e.key === "Tab" && containerRef.current) {
        const focusable = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const list = Array.from(focusable);
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // release the scroll lock if the component unmounts mid-open
  useEffect(() => {
    return () => {
      if (phase === "open" || phase === "opening") unlockBodyScroll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showPortal = phase !== "closed";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-expanded={phase !== "closed"}
        className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
      >
        <span className="relative inline-flex h-5 overflow-hidden">
          {chars.map((ch, i) => (
            <span
              key={i}
              ref={(el) => {
                charRefs.current[i] = el;
              }}
              className="inline-block"
            >
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
        </span>
        <span ref={arrowRef} className="inline-flex">
          <Icon className="h-4 w-4" />
        </span>
      </button>

      {showPortal &&
        createPortal(
          <>
            <div
              ref={backdropRef}
              onClick={close}
              className="fixed inset-0 z-[998] bg-background/70 backdrop-blur-md"
              style={{ visibility: "hidden", opacity: 0 }}
              aria-hidden="true"
            />
            <div
              ref={containerRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={dialogTitleId.current}
              className="fixed z-[999] flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
              style={{
                visibility: "hidden",
                willChange: "top, left, width, height, border-radius, opacity",
              }}
            >
              <div
                ref={contentRef}
                data-lenis-prevent
                className="flex-1 overflow-y-auto p-6 sm:p-8"
              >
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3
                      id={dialogTitleId.current}
                      className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
                    >
                      {title}
                    </h3>
                    {description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {description}
                      </p>
                    )}
                  </div>
                  <button
                    ref={closeBtnRef}
                    type="button"
                    onClick={close}
                    aria-label="Close"
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-200 hover:rotate-90 hover:bg-muted/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {children}
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}