// import { useRef } from "react";
// import { useTranslation } from "react-i18next";
// import { useGSAP } from "@gsap/react";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import SectionHeading from "./SectionHeading1";

// gsap.registerPlugin(ScrollTrigger);

// interface Story {
//   quoteKey: string;
//   quoteFallback: string;
//   name: string;
//   roleKey: string;
//   roleFallback: string;
//   avatar: string;
// }

// const STORIES: Story[] = [
//   {
//     quoteKey: "story.amara.quote",
//     quoteFallback:
//       "The school fund meant I could keep studying instead of working the fields with my brothers. I want to be a doctor for my village.",
//     name: "Amara K.",
//     roleKey: "story.amara.role",
//     roleFallback: "Kenya — Education Programme",
//     avatar:
//       "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&auto=format&fit=crop&q=80",
//   },
//   {
//     quoteKey: "story.rahman.quote",
//     quoteFallback:
//       "After the flood took our home, HopeBridge helped us rebuild on higher ground. Our children finally have a safe place to grow up.",
//     name: "The Rahman Family",
//     roleKey: "story.rahman.role",
//     roleFallback: "Bangladesh — Emergency Relief",
//     avatar:
//       "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=200&auto=format&fit=crop&q=80",
//   },
//   {
//     quoteKey: "story.maya.quote",
//     quoteFallback:
//       "The medical fund covered the heart surgery we could never have paid for ourselves. Today she's running around like any seven-year-old should.",
//     name: "Maya's Mother",
//     roleKey: "story.maya.role",
//     roleFallback: "Nepal — Healthcare Programme",
//     avatar:
//       "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=200&auto=format&fit=crop&q=80",
//   },
// ];

// // Stacking recipe: each card's pin engages a little later than the one
// // before it (offset + i * step), and every card releases together once
// // the stack's bottom clears the same viewport line (endTrigger + end).
// // Tuned originally for fixed 400px cards — retune if your breakpoints
// // push card height much past that.
// const PIN_START_OFFSET = 60;
// const PIN_START_STEP = 10;
// const PIN_END = "bottom 550";

// export default function StoriesSection() {
//   const { t } = useTranslation();
//   const sectionRef = useRef<HTMLElement>(null);
//   const wrapperRef = useRef<HTMLDivElement>(null);
//   const cardWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
//   const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

//   useGSAP(
//     () => {
//       const wrapperEl = wrapperRef.current;
//       const cardWrappers = cardWrapperRefs.current.filter(Boolean) as HTMLDivElement[];
//       const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
//       if (!wrapperEl || cardWrappers.length === 0) return;

//       // Uncapped ticker, no lag smoothing — the scrub tracks native scroll
//       // position 1:1 every animation frame, so it scales cleanly across
//       // 60/120/144Hz instead of chasing a time-smoothed target.
//       gsap.ticker.lagSmoothing(0);

//       cardWrappers.forEach((cardWrapper, i) => {
//         const card = cards[i];
//         if (!card) return;

//         // Last card is the top of the stack — it pins but never scales/tilts.
//         const isLast = i === cardWrappers.length - 1;
//         const scale = isLast ? 1 : 0.9 + 0.025 * i;
//         const rotation = isLast ? 0 : -10;

//         gsap.to(card, {
//           scale,
//           rotationX: rotation,
//           transformOrigin: "top center",
//           ease: "none",
//           force3D: true,
//           scrollTrigger: {
//             trigger: cardWrapper,
//             start: `top ${PIN_START_OFFSET + PIN_START_STEP * i}`,
//             end: PIN_END,
//             endTrigger: wrapperEl,
//             scrub: true,
//             anticipatePin: 1,
//             fastScrollEnd: true,
//             invalidateOnRefresh: true,
//             pin: cardWrapper,
//             pinSpacing: false,
//             // markers: { indent: 100 * i, startColor: "#0ae448", endColor: "#fec5fb", fontSize: "14px" },
//             id: `story-card-${i + 1}`,
//           },
//         });
//       });

//       const resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh());
//       resizeObserver.observe(wrapperEl);

//       return () => resizeObserver.disconnect();
//     },
//     { scope: sectionRef }
//   );

//   return (
//     <section id="stories" ref={sectionRef} className="py-16 sm:py-24 lg:py-32">
//       <div className="container mx-auto px-4">
//         <SectionHeading
//           align="center"
//           kicker={t("stories.kicker", "In Their Words")}
//           title={t(
//             "stories.title",
//             "Stories from the other end of a donation"
//           )}
//           className="mx-auto mb-10 sm:mb-14 lg:mb-16"
//         />

//         <div ref={wrapperRef} className="mx-auto w-full max-w-2xl">
//           {STORIES.map((story, i) => (
//             <div
//               key={story.name}
//               ref={(el) => {
//                 cardWrapperRefs.current[i] = el;
//               }}
//               className="mb-[50px] last:mb-0 w-full"
//               style={{ perspective: "500px" }}
//             >
//               <article
//                 ref={(el) => {
//                   cardRefs.current[i] = el;
//                 }}
//                 className="flex h-[360px] xs:h-[380px] sm:h-[420px] md:h-[450px] lg:h-[460px] w-full flex-col justify-between rounded-2xl sm:rounded-3xl bg-card p-5 xs:p-6 sm:p-8 lg:p-10 will-change-transform [transform:translateZ(0)]"
//                 style={{
//                   border: "1px solid hsl(var(--border))",
//                   boxShadow: `
//                     0 0 0 1px hsl(var(--border) / 0.5),
//                     0 12px 24px hsl(var(--foreground) / 0.08)
//                   `,
//                   backfaceVisibility: "hidden",
//                 }}
//               >
//                 <div>
//                   <span className="font-display text-3xl sm:text-4xl lg:text-5xl text-primary/20 mb-1 sm:mb-2 block leading-none">
//                     &ldquo;
//                   </span>
//                   <blockquote className="text-base xs:text-lg sm:text-xl lg:text-2xl leading-snug sm:leading-relaxed font-medium pb-2 sm:pb-4">
//                     {t(story.quoteKey, story.quoteFallback)}
//                   </blockquote>
//                 </div>

//                 <figcaption className="flex items-center gap-3 sm:gap-4 mb-1 sm:mb-2 pt-3 sm:pt-6 border-t border-border">
//                   <img
//                     src={story.avatar}
//                     alt={story.name}
//                     className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover shrink-0"
//                   />
//                   <div className="min-w-0">
//                     <div className="font-bold text-sm sm:text-base truncate">{story.name}</div>
//                     <div className="text-xs sm:text-sm text-primary truncate">
//                       {t(story.roleKey, story.roleFallback)}
//                     </div>
//                   </div>
//                 </figcaption>
//               </article>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// import { useRef } from "react";
// import { useTranslation } from "react-i18next";
// import { useGSAP } from "@gsap/react";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import SectionHeading from "./SectionHeading1";

// gsap.registerPlugin(ScrollTrigger);

// interface Story {
//   quoteKey: string;
//   quoteFallback: string;
//   name: string;
//   roleKey: string;
//   roleFallback: string;
//   avatar: string;
// }

// const STORIES: Story[] = [
//   {
//     quoteKey: "story.amara.quote",
//     quoteFallback:
//       "The school fund meant I could keep studying instead of working the fields with my brothers. I want to be a doctor for my village.",
//     name: "Amara K.",
//     roleKey: "story.amara.role",
//     roleFallback: "Kenya — Education Programme",
//     avatar:
//       "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&auto=format&fit=crop&q=80",
//   },
//   {
//     quoteKey: "story.rahman.quote",
//     quoteFallback:
//       "After the flood took our home, HopeBridge helped us rebuild on higher ground. Our children finally have a safe place to grow up.",
//     name: "The Rahman Family",
//     roleKey: "story.rahman.role",
//     roleFallback: "Bangladesh — Emergency Relief",
//     avatar:
//       "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=200&auto=format&fit=crop&q=80",
//   },
//   {
//     quoteKey: "story.maya.quote",
//     quoteFallback:
//       "The medical fund covered the heart surgery we could never have paid for ourselves. Today she's running around like any seven-year-old should.",
//     name: "Maya's Mother",
//     roleKey: "story.maya.role",
//     roleFallback: "Nepal — Healthcare Programme",
//     avatar:
//       "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=200&auto=format&fit=crop&q=80",
//   },
// ];

// // Percentage-based trigger points (not fixed px) so timing scales the same
// // way on a short mobile viewport as on a tall desktop one.
// //
// // PEEK_START_PERCENT: how far down the viewport a card's top edge has to be
// // before it locks into the stack and starts receding. 50 ≈ "about half the
// // card is visible" at that moment, instead of it having already scrolled
// // fully into view before its own animation even starts.
// // const PEEK_START_PERCENT = 50;

// // Extra offset per card index, so consecutive cards don't all lock in at the
// // exact same spot — this small stagger is what produces the sliver of each
// // earlier, receded card peeking out above the current one.
// // const PIN_STEP_PERCENT = 1.5;

// const GAP_BELOW_HEADER_PX = 32;
// const PIN_STEP_PX = 14;
// // const CARD_END_MULTIPLIER = 0.9;

// // Scroll budget for a card's recede animation, as a multiple of *that
// // card's own* rendered height, measured live via offsetHeight. Anchoring
// // this to each card's own start ("+=") instead of one shared end point
// // guarantees every card — including the last two — gets a full, equal
// // runway to finish scaling/rotating, regardless of screen height. That's
// // what was cutting the ending short on mobile before.
// const CARD_END_MULTIPLIER = 0.9;

// export default function StoriesSection() {
//   const { t } = useTranslation();
//   // const sectionRef = useRef<HTMLElement>(null);
//   const sectionRef = useRef<HTMLDivElement>(null);

//   const headerRef = useRef<HTMLDivElement>(null); // add this

//   const wrapperRef = useRef<HTMLDivElement>(null);
//   const cardWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
//   // const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
//   const cardRefs = useRef<(HTMLElement | null)[]>([]);
//   const indicatorRef = useRef<HTMLDivElement>(null);
//   const indicatorDotRefs = useRef<(HTMLDivElement | null)[]>([]);

//   // useGSAP(
//   //   () => {
//   //     const wrapperEl = wrapperRef.current;
//   //     const cardWrappers = cardWrapperRefs.current.filter(Boolean) as HTMLDivElement[];
//   //     const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
//   //     if (!wrapperEl || cardWrappers.length === 0) return;

//   //     // Uncapped ticker, no lag smoothing — the scrub tracks native scroll
//   //     // position 1:1 every animation frame, so it scales cleanly across
//   //     // 60/120/144Hz instead of chasing a time-smoothed target.
//   //     gsap.ticker.lagSmoothing(0);

//   //     const cardTriggers: ScrollTrigger[] = [];
//   //     let activeDotIndex = -1;

//   //     // Active dot = the highest-index card whose own trigger has started.
//   //     // Ties the indicator to real trigger state rather than a naive
//   //     // linear split of scroll progress.
//   //     const updateActiveDot = () => {
//   //       let idx = 0;
//   //       cardTriggers.forEach((st, i) => {
//   //         if (st.progress > 0) idx = i;
//   //       });
//   //       if (idx === activeDotIndex) return;
//   //       activeDotIndex = idx;
//   //       indicatorDotRefs.current.forEach((dot, i) => {
//   //         if (!dot) return;
//   //         dot.style.transform = i === idx ? "scaleY(1.7)" : "scaleY(1)";
//   //         dot.style.backgroundColor =
//   //           i === idx ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.25)";
//   //       });
//   //     };

//   //     const showIndicator = () => {
//   //       if (indicatorRef.current) {
//   //         gsap.to(indicatorRef.current, { opacity: 1, duration: 0.3, overwrite: true });
//   //       }
//   //     };
//   //     const hideIndicator = () => {
//   //       if (indicatorRef.current) {
//   //         gsap.to(indicatorRef.current, { opacity: 0, duration: 0.3, overwrite: true });
//   //       }
//   //     };

//   //     cardWrappers.forEach((cardWrapper, i) => {
//   //       const card = cards[i];
//   //       if (!card) return;

//   //       const isFirst = i === 0;
//   //       const isLast = i === cardWrappers.length - 1;
//   //       const scale = isLast ? 1 : 0.9 + 0.025 * i;
//   //       const rotation = isLast ? 0 : -10;

//   //       const tween = gsap.to(card, {
//   //         scale,
//   //         rotationX: rotation,
//   //         transformOrigin: "top center",
//   //         ease: "none",
//   //         force3D: true,
//   //         scrollTrigger: {
//   //           trigger: cardWrapper,
//   //           start: `top ${PEEK_START_PERCENT + PIN_STEP_PERCENT * i}%`,
//   //           end: () => `+=${cardWrapper.offsetHeight * CARD_END_MULTIPLIER}`,
//   //           scrub: true,
//   //           anticipatePin: 1,
//   //           fastScrollEnd: true,
//   //           invalidateOnRefresh: true,
//   //           pin: cardWrapper,
//   //           pinSpacing: false,
//   //           onUpdate: updateActiveDot,
//   //           onEnter: isFirst ? showIndicator : undefined,
//   //           onLeaveBack: isFirst ? hideIndicator : undefined,
//   //           onLeave: isLast ? hideIndicator : undefined,
//   //           onEnterBack: isLast ? showIndicator : undefined,
//   //           // markers: { indent: 100 * i, startColor: "#0ae448", endColor: "#fec5fb", fontSize: "14px" },
//   //           id: `story-card-${i + 1}`,
//   //         },
//   //       });

//   //       if (tween.scrollTrigger) cardTriggers.push(tween.scrollTrigger);
//   //     });

//   //     const resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh());
//   //     resizeObserver.observe(wrapperEl);

//   //     return () => resizeObserver.disconnect();
//   //   },
//   //   { scope: sectionRef }
//   // );

// //   useGSAP(
// //   () => {
// //     const wrapperEl = wrapperRef.current;
// //     const cardWrappers = cardWrapperRefs.current.filter(Boolean) as HTMLDivElement[];
// //     const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
// //     if (!wrapperEl || cardWrappers.length === 0) return;

// //     gsap.ticker.lagSmoothing(0);

// //     const cardTriggers: ScrollTrigger[] = [];
// //     let activeDotIndex = -1;

// //     const updateActiveDot = () => {
// //       let idx = 0;
// //       cardTriggers.forEach((st, i) => {
// //         if (st.progress > 0) idx = i;
// //       });
// //       if (idx === activeDotIndex) return;
// //       activeDotIndex = idx;
// //       indicatorDotRefs.current.forEach((dot, i) => {
// //         if (!dot) return;
// //         dot.style.transform = i === idx ? "scaleY(1.7)" : "scaleY(1)";
// //         dot.style.backgroundColor =
// //           i === idx ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.25)";
// //       });
// //     };

// //     const showIndicator = () => {
// //       if (indicatorRef.current) {
// //         gsap.to(indicatorRef.current, { opacity: 1, duration: 0.3, overwrite: true });
// //       }
// //     };
// //     const hideIndicator = () => {
// //       if (indicatorRef.current) {
// //         gsap.to(indicatorRef.current, { opacity: 0, duration: 0.3, overwrite: true });
// //       }
// //     };

// //     // Where a card's pin engages: just below the sticky header's *actual*
// //     // rendered height (read live at refresh time, not assumed), plus a
// //     // flat breathing-room gap, plus this card's stagger offset.
// //     const pinStart = (i: number) => () =>
// //       `top ${(headerRef.current?.offsetHeight ?? 0) + GAP_BELOW_HEADER_PX + PIN_STEP_PX * i}px`;

// //     cardWrappers.forEach((cardWrapper, i) => {
// //       const card = cards[i];
// //       if (!card) return;

// //       const isFirst = i === 0;
// //       const isLast = i === cardWrappers.length - 1;
// //       const scale = isLast ? 1 : 0.9 + 0.025 * i;
// //       const rotation = isLast ? 0 : -10;

// //       const tween = gsap.to(card, {
// //         scale,
// //         rotationX: rotation,
// //         transformOrigin: "top center",
// //         ease: "none",
// //         force3D: true,
// //         scrollTrigger: {
// //           trigger: cardWrapper,
// //           start: pinStart(i),
// //           // Every card gets its own relative runway EXCEPT the last one:
// //           // that pin's release is anchored to the wrapper's own bottom
// //           // instead, so it can never outlive the section's actual content
// //           // and bleed into whatever comes next. Its old "+=" runway had
// //           // no ceiling tied to the DOM, so on some screens it kept the
// //           // card fixed on screen after the wrapper had already ended.
// //           ...(isLast
// //             ? { endTrigger: wrapperEl, end: "bottom top" }
// //             : { end: () => `+=${cardWrapper.offsetHeight * CARD_END_MULTIPLIER}` }),
// //           scrub: true,
// //           anticipatePin: 1,
// //           fastScrollEnd: true,
// //           invalidateOnRefresh: true,
// //           pin: cardWrapper,
// //           pinSpacing: false,
// //           onUpdate: updateActiveDot,
// //           onEnter: isFirst ? showIndicator : undefined,
// //           onLeaveBack: isFirst ? hideIndicator : undefined,
// //           onLeave: isLast ? hideIndicator : undefined,
// //           onEnterBack: isLast ? showIndicator : undefined,
// //           id: `story-card-${i + 1}`,
// //         },
// //       });

// //       if (tween.scrollTrigger) cardTriggers.push(tween.scrollTrigger);
// //     });

// //     const resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh());
// //     resizeObserver.observe(wrapperEl);
// //     if (headerRef.current) resizeObserver.observe(headerRef.current); // new — header height can change independently of the wrapper

// //     return () => resizeObserver.disconnect();
// //   },
// //   { scope: sectionRef }
// // );

// useGSAP(
//     () => {
//       const wrapperEl = wrapperRef.current;
//       const cardWrappers = cardWrapperRefs.current.filter(Boolean) as HTMLDivElement[];
//       const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
//       if (!wrapperEl || cardWrappers.length === 0) return;

//       gsap.ticker.lagSmoothing(0);

//       const cardTriggers: ScrollTrigger[] = [];
//       let activeDotIndex = -1;

//       const updateActiveDot = () => {
//         let idx = 0;
//         cardTriggers.forEach((st, i) => {
//           if (st.progress > 0) idx = i;
//         });
//         if (idx === activeDotIndex) return;
//         activeDotIndex = idx;
//         indicatorDotRefs.current.forEach((dot, i) => {
//           if (!dot) return;
//           dot.style.transform = i === idx ? "scaleY(1.7)" : "scaleY(1)";
//           dot.style.backgroundColor =
//             i === idx ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.25)";
//         });
//       };

//       const showIndicator = () => {
//         if (indicatorRef.current) {
//           gsap.to(indicatorRef.current, { opacity: 1, duration: 0.3, overwrite: true });
//         }
//       };
//       const hideIndicator = () => {
//         if (indicatorRef.current) {
//           gsap.to(indicatorRef.current, { opacity: 0, duration: 0.3, overwrite: true });
//         }
//       };

//       const pinStart = (i: number) => () =>
//         `top ${(headerRef.current?.offsetHeight ?? 0) + GAP_BELOW_HEADER_PX + PIN_STEP_PX * i}px`;

//       cardWrappers.forEach((cardWrapper, i) => {
//         const card = cards[i];
//         if (!card) return;

//         const isFirst = i === 0;
//         const isLast = i === cardWrappers.length - 1;
//         const scale = isLast ? 1 : 0.9 + 0.025 * i;
//         const rotation = isLast ? 0 : -10;

//         // 1. PINNING TRIGGER
//         // Separated from the animation. This ensures EVERY card stays pinned 
//         // to the viewport (building the stack) until the very end of the wrapper section.
//         ScrollTrigger.create({
//           trigger: cardWrapper,
//           start: pinStart(i),
//           endTrigger: wrapperEl,
//           end: "bottom top", 
//           pin: cardWrapper,
//           pinSpacing: false,
//           anticipatePin: 1,
//           invalidateOnRefresh: true,
//           id: `pin-card-${i + 1}`,
//         });

//         // 2. ANIMATION TRIGGER
//         // Retains your exact scaling math. The visual scale happens over 
//         // the card's local runway, but it won't prematurely slide up anymore.
//         const tween = gsap.to(card, {
//           scale,
//           rotationX: rotation,
//           transformOrigin: "top center",
//           ease: "none",
//           force3D: true,
//           scrollTrigger: {
//             trigger: cardWrapper,
//             start: pinStart(i),
//             ...(isLast
//               ? { endTrigger: wrapperEl, end: "bottom top" }
//               : { end: () => `+=${cardWrapper.offsetHeight * CARD_END_MULTIPLIER}` }),
//             scrub: true,
//             fastScrollEnd: true,
//             invalidateOnRefresh: true,
//             onUpdate: updateActiveDot,
//             onEnter: isFirst ? showIndicator : undefined,
//             onLeaveBack: isFirst ? hideIndicator : undefined,
//             onLeave: isLast ? hideIndicator : undefined,
//             onEnterBack: isLast ? showIndicator : undefined,
//             id: `anim-card-${i + 1}`,
//           },
//         });

//         if (tween.scrollTrigger) cardTriggers.push(tween.scrollTrigger);
//       });

//       const resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh());
//       resizeObserver.observe(wrapperEl);
//       if (headerRef.current) resizeObserver.observe(headerRef.current);

//       return () => resizeObserver.disconnect();
//     },
//     { scope: sectionRef }
//   );

//   return (
//     // <section id="stories" ref={sectionRef} className="relative">
//     <section id="stories" ref={sectionRef} className="relative">
//       <div className="container mx-auto px-4">
//         {/* Sticky heading — pinned to the top of the viewport for the whole
//             scroll distance of the card stack below it. */}
//         <div 
//           ref={headerRef}
//         className="sticky top-0 z-20 bg-background/90 backdrop-blur-sm pt-16 sm:pt-24 lg:pt-28 pb-6 sm:pb-8">
//           <SectionHeading
//             align="center"
//             kicker={t("stories.kicker", "In Their Words")}
//             title={t(
//               "stories.title",
//               "Stories from the other end of a donation"
//             )}
//             className="mx-auto"
//           />
//         </div>

//         <div
//           ref={wrapperRef}
//           className="relative z-10 mx-auto w-full max-w-2xl pb-16 sm:pb-24 lg:pb-32"
//         >
//           {STORIES.map((story, i) => (
//             <div
//               key={story.name}
//               ref={(el) => {
//                 cardWrapperRefs.current[i] = el;
//               }}
//               className="mb-[50px] last:mb-0 w-full"
//               style={{ perspective: "500px" }}
//             >
//               <article
//                 ref={(el) => {
//                   cardRefs.current[i] = el;
//                 }}
//                 className="flex h-[360px] xs:h-[380px] sm:h-[420px] md:h-[450px] lg:h-[460px] w-full flex-col justify-between rounded-2xl sm:rounded-3xl bg-card p-5 xs:p-6 sm:p-8 lg:p-10 will-change-transform [transform:translateZ(0)]"
//                 style={{
//                   border: "1px solid hsl(var(--border))",
//                   boxShadow: `
//                     0 0 0 1px hsl(var(--border) / 0.5),
//                     0 12px 24px hsl(var(--foreground) / 0.08)
//                   `,
//                   backfaceVisibility: "hidden",
//                 }}
//               >
//                 <div>
//                   <span className="font-display text-3xl sm:text-4xl lg:text-5xl text-primary/20 mb-1 sm:mb-2 block leading-none">
//                     &ldquo;
//                   </span>
//                   <blockquote className="text-base xs:text-lg sm:text-xl lg:text-2xl leading-snug sm:leading-relaxed font-medium pb-2 sm:pb-4">
//                     {t(story.quoteKey, story.quoteFallback)}
//                   </blockquote>
//                 </div>

//                 <figcaption className="flex items-center gap-3 sm:gap-4 mb-1 sm:mb-2 pt-3 sm:pt-6 border-t border-border">
//                   <img
//                     src={story.avatar}
//                     alt={story.name}
//                     className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover shrink-0"
//                   />
//                   <div className="min-w-0">
//                     <div className="font-bold text-sm sm:text-base truncate">{story.name}</div>
//                     <div className="text-xs sm:text-sm text-primary truncate">
//                       {t(story.roleKey, story.roleFallback)}
//                     </div>
//                   </div>
//                 </figcaption>
//               </article>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Side progress indicator — replaces the old bottom dots. Fixed to
//           the viewport edge, fades in/out as the stack enters/leaves view. */}
//       <div
//         ref={indicatorRef}
//         className="fixed right-3 sm:right-6 lg:right-10 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2.5 sm:gap-3 opacity-0 pointer-events-none"
//         aria-hidden="true"
//       >
//         {STORIES.map((_, i) => (
//           <div
//             key={i}
//             ref={(el) => {
//               indicatorDotRefs.current[i] = el;
//             }}
//             className="h-4 sm:h-5 w-1 sm:w-1.5 rounded-full bg-primary/25 origin-center transition-[transform,background-color] duration-300 ease-out"
//           />
//         ))}
//       </div>
//     </section>
//   );
// }

// import { useRef } from "react";
// import { useTranslation } from "react-i18next";
// import { useGSAP } from "@gsap/react";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import SectionHeading from "./SectionHeading1";

// gsap.registerPlugin(ScrollTrigger);

// interface Story {
//   quoteKey: string;
//   quoteFallback: string;
//   name: string;
//   roleKey: string;
//   roleFallback: string;
//   avatar: string;
// }

// const STORIES: Story[] = [
//   {
//     quoteKey: "story.amara.quote",
//     quoteFallback:
//       "The school fund meant I could keep studying instead of working the fields with my brothers. I want to be a doctor for my village.",
//     name: "Amara K.",
//     roleKey: "story.amara.role",
//     roleFallback: "Kenya — Education Programme",
//     avatar:
//       "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&auto=format&fit=crop&q=80",
//   },
//   {
//     quoteKey: "story.rahman.quote",
//     quoteFallback:
//       "After the flood took our home, HopeBridge helped us rebuild on higher ground. Our children finally have a safe place to grow up.",
//     name: "The Rahman Family",
//     roleKey: "story.rahman.role",
//     roleFallback: "Bangladesh — Emergency Relief",
//     avatar:
//       "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=200&auto=format&fit=crop&q=80",
//   },
//   {
//     quoteKey: "story.maya.quote",
//     quoteFallback:
//       "The medical fund covered the heart surgery we could never have paid for ourselves. Today she's running around like any seven-year-old should.",
//     name: "Maya's Mother",
//     roleKey: "story.maya.role",
//     roleFallback: "Nepal — Healthcare Programme",
//     avatar:
//       "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=200&auto=format&fit=crop&q=80",
//   },
// ];

// const GAP_BELOW_HEADER_PX = 24;
// const PIN_STEP_PX = 14;
// const CARD_END_MULTIPLIER = 0.9;

// export default function StoriesSection() {
//   const { t } = useTranslation();
//   const sectionRef = useRef<HTMLDivElement>(null);
//   const headerRef = useRef<HTMLDivElement>(null);
//   const wrapperRef = useRef<HTMLDivElement>(null);
//   const cardWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
//   const cardRefs = useRef<(HTMLElement | null)[]>([]);
//   const indicatorRef = useRef<HTMLDivElement>(null);
//   const indicatorDotRefs = useRef<(HTMLDivElement | null)[]>([]);

//   useGSAP(
//     () => {
//       const wrapperEl = wrapperRef.current;
//       const cardWrappers = cardWrapperRefs.current.filter(Boolean) as HTMLDivElement[];
//       const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
//       if (!wrapperEl || cardWrappers.length === 0) return;

//       gsap.ticker.lagSmoothing(0);

//       // Dynamically calculate sticky offset relative to the sticky header height
//       const updateStickyTops = () => {
//         const headerHeight = headerRef.current?.offsetHeight ?? 0;
//         cardWrappers.forEach((cardWrapper, i) => {
//           const topOffset = headerHeight + GAP_BELOW_HEADER_PX + PIN_STEP_PX * i;
//           cardWrapper.style.position = "sticky";
//           cardWrapper.style.top = `${topOffset}px`;
//         });
//       };

//       updateStickyTops();

//       const cardTriggers: ScrollTrigger[] = [];
//       let activeDotIndex = -1;

//       const updateActiveDot = () => {
//         let idx = 0;
//         cardTriggers.forEach((st, i) => {
//           if (st.progress > 0) idx = i;
//         });
//         if (idx === activeDotIndex) return;
//         activeDotIndex = idx;
//         indicatorDotRefs.current.forEach((dot, i) => {
//           if (!dot) return;
//           dot.style.transform = i === idx ? "scaleY(1.7)" : "scaleY(1)";
//           dot.style.backgroundColor =
//             i === idx ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.25)";
//         });
//       };

//       const showIndicator = () => {
//         if (indicatorRef.current) {
//           gsap.to(indicatorRef.current, { opacity: 1, duration: 0.3, overwrite: true });
//         }
//       };
//       const hideIndicator = () => {
//         if (indicatorRef.current) {
//           gsap.to(indicatorRef.current, { opacity: 0, duration: 0.3, overwrite: true });
//         }
//       };

//       const pinStart = (i: number) => () =>
//         `top ${(headerRef.current?.offsetHeight ?? 0) + GAP_BELOW_HEADER_PX + PIN_STEP_PX * i}px`;

//       cardWrappers.forEach((cardWrapper, i) => {
//         const card = cards[i];
//         if (!card) return;

//         const isFirst = i === 0;
//         const isLast = i === cardWrappers.length - 1;
//         const scale = isLast ? 1 : 0.9 + 0.025 * i;
//         const rotation = isLast ? 0 : -10;

//         const tween = gsap.to(card, {
//           scale,
//           rotationX: rotation,
//           transformOrigin: "top center",
//           ease: "none",
//           force3D: true,
//           scrollTrigger: {
//             trigger: cardWrapper,
//             start: pinStart(i),
//             ...(isLast
//               ? { endTrigger: wrapperEl, end: "bottom top" }
//               : { end: () => `+=${cardWrapper.offsetHeight * CARD_END_MULTIPLIER}` }),
//             scrub: true,
//             invalidateOnRefresh: true,
//             onUpdate: updateActiveDot,
//             onEnter: isFirst ? showIndicator : undefined,
//             onLeaveBack: isFirst ? hideIndicator : undefined,
//             onLeave: isLast ? hideIndicator : undefined,
//             onEnterBack: isLast ? showIndicator : undefined,
//             id: `anim-card-${i + 1}`,
//           },
//         });

//         if (tween.scrollTrigger) cardTriggers.push(tween.scrollTrigger);
//       });

//       const resizeObserver = new ResizeObserver(() => {
//         updateStickyTops();
//         ScrollTrigger.refresh();
//       });
//       resizeObserver.observe(wrapperEl);
//       if (headerRef.current) resizeObserver.observe(headerRef.current);

//       return () => resizeObserver.disconnect();
//     },
//     { scope: sectionRef }
//   );

//   return (
//     <section id="stories" ref={sectionRef} className="relative">
//       {/* 
//         Unified Sticky Container: Header AND Cards are siblings inside wrapperRef.
//         Because they share the exact same sticky parent boundary, when wrapperRef 
//         reaches its end, the header and the stacked cards slide UP together as one unit.
//       */}
//       <div
//         ref={wrapperRef}
//         className="container mx-auto px-4 max-w-2xl pb-16 sm:pb-24 lg:pb-32"
//       >
//         {/* Sticky Header */}
//         <div
//           ref={headerRef}
//           className="sticky top-0 z-30 bg-background/90 backdrop-blur-sm pt-16 sm:pt-24 lg:pt-28 pb-6 sm:pb-8"
//         >
//           <SectionHeading
//             align="center"
//             kicker={t("stories.kicker", "In Their Words")}
//             title={t(
//               "stories.title",
//               "Stories from the other end of a donation"
//             )}
//             className="mx-auto"
//           />
//         </div>

//         {/* Stacked Cards */}
//         {STORIES.map((story, i) => (
//           <div
//             key={story.name}
//             ref={(el) => {
//               cardWrapperRefs.current[i] = el;
//             }}
//             className="mb-[50px] last:mb-0 w-full"
//             style={{
//               perspective: "500px",
//               zIndex: 10 + i, // Layer cards sequentially over each other
//             }}
//           >
//             <article
//               ref={(el) => {
//                 cardRefs.current[i] = el;
//               }}
//               className="flex h-[360px] xs:h-[380px] sm:h-[420px] md:h-[450px] lg:h-[460px] w-full flex-col justify-between rounded-2xl sm:rounded-3xl bg-card p-5 xs:p-6 sm:p-8 lg:p-10 will-change-transform [transform:translateZ(0)]"
//               style={{
//                 border: "1px solid hsl(var(--border))",
//                 boxShadow: `
//                   0 0 0 1px hsl(var(--border) / 0.5),
//                   0 12px 24px hsl(var(--foreground) / 0.08)
//                 `,
//                 backfaceVisibility: "hidden",
//               }}
//             >
//               <div>
//                 <span className="font-display text-3xl sm:text-4xl lg:text-5xl text-primary/20 mb-1 sm:mb-2 block leading-none">
//                   &ldquo;
//                 </span>
//                 <blockquote className="text-base xs:text-lg sm:text-xl lg:text-2xl leading-snug sm:leading-relaxed font-medium pb-2 sm:pb-4">
//                   {t(story.quoteKey, story.quoteFallback)}
//                 </blockquote>
//               </div>

//               <figcaption className="flex items-center gap-3 sm:gap-4 mb-1 sm:mb-2 pt-3 sm:pt-6 border-t border-border">
//                 <img
//                   src={story.avatar}
//                   alt={story.name}
//                   className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover shrink-0"
//                 />
//                 <div className="min-w-0">
//                   <div className="font-bold text-sm sm:text-base truncate">{story.name}</div>
//                   <div className="text-xs sm:text-sm text-primary truncate">
//                     {t(story.roleKey, story.roleFallback)}
//                   </div>
//                 </div>
//               </figcaption>
//             </article>
//           </div>
//         ))}
//       </div>

//       {/* Progress Dots Indicator */}
//       <div
//         ref={indicatorRef}
//         className="fixed right-3 sm:right-6 lg:right-10 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2.5 sm:gap-3 opacity-0 pointer-events-none"
//         aria-hidden="true"
//       >
//         {STORIES.map((_, i) => (
//           <div
//             key={i}
//             ref={(el) => {
//               indicatorDotRefs.current[i] = el;
//             }}
//             className="h-4 sm:h-5 w-1 sm:w-1.5 rounded-full bg-primary/25 origin-center transition-[transform,background-color] duration-300 ease-out"
//           />
//         ))}
//       </div>
//     </section>
//   );
// }

import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionHeading from "./SectionHeading1";

gsap.registerPlugin(ScrollTrigger);

interface Story {
  quoteKey: string;
  quoteFallback: string;
  name: string;
  roleKey: string;
  roleFallback: string;
  avatar: string;
}

const STORIES: Story[] = [
  {
    quoteKey: "story.amara.quote",
    quoteFallback:
      "The school fund meant I could keep studying instead of working the fields with my brothers. I want to be a doctor for my village.",
    name: "Amara K.",
    roleKey: "story.amara.role",
    roleFallback: "Kenya — Education Programme",
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&auto=format&fit=crop&q=80",
  },
  {
    quoteKey: "story.rahman.quote",
    quoteFallback:
      "After the flood took our home, HopeBridge helped us rebuild on higher ground. Our children finally have a safe place to grow up.",
    name: "The Rahman Family",
    roleKey: "story.rahman.role",
    roleFallback: "Bangladesh — Emergency Relief",
    avatar:
      "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=200&auto=format&fit=crop&q=80",
  },
  {
    quoteKey: "story.maya.quote",
    quoteFallback:
      "The medical fund covered the heart surgery we could never have paid for ourselves. Today she's running around like any seven-year-old should.",
    name: "Maya's Mother",
    roleKey: "story.maya.role",
    roleFallback: "Nepal — Healthcare Programme",
    avatar:
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=200&auto=format&fit=crop&q=80",
  },
];

const PIN_STEP_PX = 14;

export default function StoriesSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const indicatorDotRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const wrapperEl = wrapperRef.current;
      const cardWrappers = cardWrapperRefs.current.filter(Boolean) as HTMLDivElement[];
      const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
      if (!wrapperEl || cardWrappers.length === 0) return;

      gsap.ticker.lagSmoothing(0);

      // Position cards 2+ off-screen at the start
      cardWrappers.forEach((wrapper, i) => {
        if (i > 0) {
          gsap.set(wrapper, { y: window.innerHeight });
        }
      });

      // Master Timeline: Pin wrapperRef while cards scrub into position
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperEl,
          start: "top top",
          end: () => `+=${window.innerHeight * 1.5}`, // Total scroll distance for stacking
          pin: true,
          pinSpacing: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const total = cardWrappers.length;
            const activeIdx = Math.min(Math.floor(self.progress * total), total - 1);

            indicatorDotRefs.current.forEach((dot, i) => {
              if (!dot) return;
              dot.style.transform = i === activeIdx ? "scaleY(1.7)" : "scaleY(1)";
              dot.style.backgroundColor =
                i === activeIdx ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.25)";
            });
          },
          onEnter: () => {
            if (indicatorRef.current) {
              gsap.to(indicatorRef.current, { opacity: 1, duration: 0.3, overwrite: true });
            }
          },
          onLeave: () => {
            if (indicatorRef.current) {
              gsap.to(indicatorRef.current, { opacity: 0, duration: 0.3, overwrite: true });
            }
          },
          onEnterBack: () => {
            if (indicatorRef.current) {
              gsap.to(indicatorRef.current, { opacity: 1, duration: 0.3, overwrite: true });
            }
          },
          onLeaveBack: () => {
            if (indicatorRef.current) {
              gsap.to(indicatorRef.current, { opacity: 0, duration: 0.3, overwrite: true });
            }
          },
        },
      });

      // Build step sequence: slide each card up while scaling down previous cards
      cardWrappers.forEach((cardWrapper, i) => {
        if (i === 0) return;

        const prevCards = cards.slice(0, i);

        // 1. Slide current card up into its stacked position
        tl.to(
          cardWrapper,
          {
            y: PIN_STEP_PX * i,
            ease: "power1.inOut",
            duration: 1,
          },
          `step-${i}`
        );

        // 2. Scale & rotate previous cards to create depth
        prevCards.forEach((prevCard, prevIdx) => {
          const depth = i - prevIdx;
          tl.to(
            prevCard,
            {
              scale: 1 - depth * 0.035,
              rotationX: -6 * depth,
              transformOrigin: "top center",
              ease: "power1.inOut",
              duration: 1,
            },
            `step-${i}`
          );
        });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section id="stories" ref={sectionRef} className="relative">
      {/* 
        Parent Container: Pinned by GSAP during scroll.
        When pinned, header and cards remain fixed together in the viewport.
        When unpinned, the entire block scrolls away seamlessly.
      */}
      <div
        ref={wrapperRef}
        className="container mx-auto px-4 max-w-2xl min-h-screen flex flex-col justify-start pb-16 sm:pb-24 lg:pb-32"
      >
        {/* Header */}
        <div className="pt-16 sm:pt-24 lg:pt-28 pb-6 sm:pb-8">
          <SectionHeading
            align="center"
            kicker={t("stories.kicker", "In Their Words")}
            title={t(
              "stories.title",
              "Stories from the other end of a donation"
            )}
            className="mx-auto"
          />
        </div>

        {/* Stacked Cards Area */}
        <div className="relative w-full">
          {STORIES.map((story, i) => (
            <div
              key={story.name}
              ref={(el) => {
                cardWrapperRefs.current[i] = el;
              }}
              className="w-full"
              style={{
                perspective: "500px",
                position: i === 0 ? "relative" : "absolute",
                top: 0,
                left: 0,
                zIndex: 10 + i,
              }}
            >
              <article
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="flex h-[360px] xs:h-[380px] sm:h-[420px] md:h-[450px] lg:h-[460px] w-full flex-col justify-between rounded-2xl sm:rounded-3xl bg-card p-5 xs:p-6 sm:p-8 lg:p-10 will-change-transform [transform:translateZ(0)]"
                style={{
                  border: "1px solid hsl(var(--border))",
                  boxShadow: `
                    0 0 0 1px hsl(var(--border) / 0.5),
                    0 12px 24px hsl(var(--foreground) / 0.08)
                  `,
                  backfaceVisibility: "hidden",
                }}
              >
                <div>
                  <span className="font-display text-3xl sm:text-4xl lg:text-5xl text-primary/20 mb-1 sm:mb-2 block leading-none">
                    &ldquo;
                  </span>
                  <blockquote className="text-base xs:text-lg sm:text-xl lg:text-2xl leading-snug sm:leading-relaxed font-medium pb-2 sm:pb-4">
                    {t(story.quoteKey, story.quoteFallback)}
                  </blockquote>
                </div>

                <figcaption className="flex items-center gap-3 sm:gap-4 mb-1 sm:mb-2 pt-3 sm:pt-6 border-t border-border">
                  <img
                    src={story.avatar}
                    alt={story.name}
                    className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-sm sm:text-base truncate">{story.name}</div>
                    <div className="text-xs sm:text-sm text-primary truncate">
                      {t(story.roleKey, story.roleFallback)}
                    </div>
                  </div>
                </figcaption>
              </article>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Dots Indicator */}
      <div
        ref={indicatorRef}
        className="fixed right-3 sm:right-6 lg:right-10 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2.5 sm:gap-3 opacity-0 pointer-events-none"
        aria-hidden="true"
      >
        {STORIES.map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              indicatorDotRefs.current[i] = el;
            }}
            className="h-4 sm:h-5 w-1 sm:w-1.5 rounded-full bg-primary/25 origin-center transition-[transform,background-color] duration-300 ease-out"
          />
        ))}
      </div>
    </section>
  );
}