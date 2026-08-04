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

// // Scroll distance per card transition (px)
// const SCROLL_PER_CARD = 500;

// export default function StoriesSection() {
//   const { t } = useTranslation();
//   const sectionRef = useRef<HTMLElement>(null);
//   const stickyRef = useRef<HTMLDivElement>(null);
//   const cardRefs = useRef<(HTMLElement | null)[]>([]);
//   const dotRefs = useRef<(HTMLDivElement | null)[]>([]);

//   // useGSAP(
//   //   () => {
//   //     const cardElements = cardRefs.current.filter(Boolean) as HTMLElement[];
//   //     const totalCards = cardElements.length;
//   //     if (totalCards === 0 || !sectionRef.current || !stickyRef.current) return;

//   //     // Initial state — first card visible, rest hidden below
//   //     gsap.set(cardElements, {
//   //       yPercent: 100,
//   //       scale: 1,
//   //       rotation: 0,
//   //       opacity: 1,
//   //     });
//   //     gsap.set(cardElements[0], { yPercent: 0 });

//   //     // Build the timeline — NO pin (pin breaks inside overflow-x-hidden ancestors
//   //     // and with Lenis). Instead the section itself is tall and we use CSS sticky.
//   //     const scrollTimeline = gsap.timeline({
//   //       scrollTrigger: {
//   //         trigger: sectionRef.current,
//   //         start: "top top",
//   //         end: "bottom bottom",
//   //         scrub: 0.8,
//   //         invalidateOnRefresh: true,
//   //       },
//   //     });

//   //     for (let i = 0; i < totalCards - 1; i++) {
//   //       scrollTimeline.to(
//   //         cardElements[i],
//   //         {
//   //           scale: 0.88,
//   //           rotation: i % 2 === 0 ? -3 : 3,
//   //           opacity: 0,
//   //           duration: 1,
//   //           ease: "none",
//   //         },
//   //         i
//   //       );

//   //       scrollTimeline.to(
//   //         cardElements[i + 1],
//   //         {
//   //           yPercent: 0,
//   //           duration: 1,
//   //           ease: "none",
//   //         },
//   //         i
//   //       );
//   //     }
//   //   },
//   //   { scope: sectionRef }
//   // );
//   useGSAP(() => {
//   const cardElements = cardRefs.current.filter(Boolean) as HTMLElement[];
//   const totalCards = cardElements.length;
//   if (totalCards === 0 || !sectionRef.current) return;

//   // Set initial state for ALL cards — off-screen below, slightly oversized
//   gsap.set(cardElements, {
//     yPercent: 100,
//     scale: 1.04,
//     opacity: 0,
//     rotation: 0,
//     zIndex: 1,
//   });

//   // First card starts visible and correctly sized
//   gsap.set(cardElements[0], {
//     yPercent: 0,
//     scale: 1,
//     opacity: 1,
//     zIndex: totalCards,
//   });

//   const tl = gsap.timeline({
//     scrollTrigger: {
//       trigger: sectionRef.current,
//       start: "top top",
//       end: () => `+=${STORIES.length * SCROLL_PER_CARD - window.innerHeight}`,
//       scrub: 1.2,
//       invalidateOnRefresh: true,
//       onUpdate: (self) => {
//         const idx = Math.min(
//           Math.floor(self.progress * (totalCards - 1) + 0.5),
//           totalCards - 1
//         );
//         dotRefs.current.forEach((dot, i) => {
//           if (!dot) return;
//           dot.style.width = i === idx ? "2rem" : "0.375rem";
//           dot.style.backgroundColor =
//             i === idx ? "hsl(var(--primary))" : "hsl(var(--primary)/0.2)";
//         });
//       },
//     },
//   });

//   for (let i = 0; i < totalCards - 1; i++) {
//     // Outgoing: recedes up and back, tilts, fades
//     tl.to(
//       cardElements[i],
//       {
//         scale: 0.82,
//         yPercent: -8,
//         rotation: i % 2 === 0 ? -4 : 4,
//         opacity: 0,
//         zIndex: 1,
//         duration: 1,
//       },
//       i // position in timeline
//     );

//     // Incoming: slides up from below, settles to natural size
//     tl.to(
//       cardElements[i + 1],
//       {
//         yPercent: 0,
//         scale: 1,
//         opacity: 1,
//         zIndex: totalCards - i,
//         duration: 1,
//       },
//       i // same position = runs simultaneously
//     );
//   }
// }, { scope: sectionRef });

//   // Section height provides the scroll distance for all card transitions.
//   // The sticky inner wrapper keeps the cards visible while the tall section scrolls.
//   const totalScrollHeight = STORIES.length * SCROLL_PER_CARD;

//   return (
//     <section
//       id="stories"
//       ref={sectionRef}
//       className="relative"
//       style={{ height: `${totalScrollHeight}px` }}
//     >
//       {/* Sticky wrapper — stays pinned in viewport while the tall section scrolls */}
//       <div
//         ref={stickyRef}
//         className="sticky top-0 flex flex-col items-center justify-center py-15 lg:py-20 "
//         style={{ height: "100vh" }}
//       >
//         <div className="container mx-auto px-4">
//           <SectionHeading
//             align="center"
//             kicker={t("stories.kicker", "In Their Words")}
//             title={t(
//               "stories.title",
//               "Stories from the other end of a donation"
//             )}
//             className="mx-auto mb-6 lg:mb-16 mt-6"
//           />

//           {/* overflow-hidden keeps yPercent:100 cards invisible until they animate in */}
//           <div className="relative w-full max-w-2xl rounded-3xl h-[550px] mx-auto overflow-hidden">
//             {STORIES.map((story, i) => (
//               // <figure
//               //   key={story.name}
//               //   ref={(el) => {
//               //     cardRefs.current[i] = el;
//               //   }}
//               //   className="absolute inset-0 flex flex-col justify-between rounded-3xl border border-border bg-background p-10 shadow-2xl mb-1"
//               // >
// //               <figure
// //   key={story.name}
// //   ref={(el) => { cardRefs.current[i] = el; }}
// //   className="absolute inset-0 flex flex-col justify-between rounded-3xl border border-border/60 bg-background p-10 will-change-transform"
// //   style={{
// //     boxShadow: "0 30px 80px -20px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.04)",
// //     transformOrigin: "center top", // recedes from the top anchor, not center
// //   }}
// // >
// <figure
//   key={story.name}
//   ref={(el) => { cardRefs.current[i] = el; }}
//   className="absolute inset-0 flex flex-col justify-between rounded-3xl bg-card p-10 will-change-transform"
//   style={{
//     border: "1px solid hsl(var(--border))",
//     boxShadow: `
//       0 0 0 1px hsl(var(--border) / 0.5),
//       0 4px 6px hsl(var(--foreground) / 0.04),
//       0 12px 24px hsl(var(--foreground) / 0.08),
//       0 40px 80px hsl(var(--foreground) / 0.12)
//     `,
//     transformOrigin: "center top",
//   }}
// >
//                 <div>
//                   <span className="font-display text-6xl text-primary/20 mb-2 block">
//                     &ldquo;
//                   </span>
//                   <blockquote className="text-2xl leading-relaxed font-medium pb-4">
//                     {t(story.quoteKey, story.quoteFallback)}
//                   </blockquote>
//                 </div>

//                 <figcaption className="flex items-center gap-4  mb-2 pt-6 border-t border-border">
//                   <img
//                     src={story.avatar}
//                     alt={story.name}
//                     className="w-14 h-14 rounded-full object-cover"
//                   />
//                   <div>
//                     <div className="font-bold">{story.name}</div>
//                     <div className="text-sm text-primary">
//                       {t(story.roleKey, story.roleFallback)}
//                     </div>
//                   </div>
//                 </figcaption>
                
//               </figure>
//             ))}
//           </div>
//         </div>
//         {/* Scroll progress dots */}
// <div className="flex items-center justify-center gap-2 mt-8">
//   {STORIES.map((_, i) => (
//     <div
//       key={i}
//       ref={(el) => { dotRefs.current[i] = el; }}
//       className="h-1.5 rounded-full bg-primary/20 transition-all duration-500"
//       style={{ width: i === 0 ? "2rem" : "0.375rem" }}
//     />
//   ))}
// </div>
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

// Scroll distance per card transition (px). Fixed rather than viewport-relative
// on purpose — see note in the effect below.
const SCROLL_PER_CARD = 500;

export default function StoriesSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
      const total = cards.length;
      if (total === 0 || !sectionRef.current) return;

      // Initial state — every card staged off-screen below, first card visible.
      gsap.set(cards, {
        yPercent: 100,
        scale: 1.04,
        opacity: 0,
        rotation: 0,
        zIndex: 1,
      });
      gsap.set(cards[0], { yPercent: 0, scale: 1, opacity: 1, zIndex: total });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          // Function form, not a baked-in number — re-evaluates window.innerHeight
          // on every ScrollTrigger.refresh() instead of freezing it at mount time.
          end: () => `+=${total * SCROLL_PER_CARD - window.innerHeight}`,
          scrub: 1.2,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(
              Math.floor(self.progress * (total - 1) + 0.5),
              total - 1
            );
            dotRefs.current.forEach((dot, i) => {
              if (!dot) return;
              dot.style.width = i === idx ? "2rem" : "0.375rem";
              dot.style.backgroundColor =
                i === idx ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.2)";
            });
          },
        },
      });

      for (let i = 0; i < total - 1; i++) {
        // Outgoing: recedes up and back, tilts, fades.
        tl.to(
          cards[i],
          {
            scale: 0.82,
            yPercent: -8,
            rotation: i % 2 === 0 ? -4 : 4,
            opacity: 0,
            zIndex: 1,
            duration: 1,
          },
          i
        );
        // Incoming: slides up from below, settles to natural size. Same
        // timeline position as the outgoing tween above, so they run together.
        tl.to(
          cards[i + 1],
          {
            yPercent: 0,
            scale: 1,
            opacity: 1,
            zIndex: total - i,
            duration: 1,
          },
          i
        );
      }

      // Catches layout shifts a window-resize listener wouldn't — e.g. a
      // late-loading webfont changing the heading's line count and nudging
      // this section's start position, the same class of issue the ticker
      // in the hero works around with document.fonts.ready.
      const resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh());
      resizeObserver.observe(sectionRef.current);

      return () => {
        resizeObserver.disconnect();
        // Deliberately not calling ScrollTrigger.getAll().forEach(kill) here —
        // this section shares the page with Hero/Stats/Campaigns/Impact, each
        // with their own triggers. A global kill on this component's unmount
        // would take theirs down too. useGSAP's scope already reverts and
        // kills only what this effect created.
      };
    },
    { scope: sectionRef }
  );

  const totalScrollHeight = STORIES.length * SCROLL_PER_CARD;

  return (
    <section
      id="stories"
      ref={sectionRef}
      className="relative"
      style={{ height: `${totalScrollHeight}px` }}
    >
      {/* Sticky wrapper — CSS sticky, not GSAP pin: true. Pin breaks inside
          overflow-x-hidden ancestors and with Lenis in this app, so this stays
          the load-bearing fix rather than reverting to the reference's pin. */}
      <div
        className="sticky top-0 flex flex-col items-center justify-center py-16 lg:py-20"
        style={{ height: "100vh" }}
      >
        <div className="container mx-auto px-4">
          <SectionHeading
            align="center"
            kicker={t("stories.kicker", "In Their Words")}
            title={t(
              "stories.title",
              "Stories from the other end of a donation"
            )}
            className="mx-auto mb-6 lg:mb-16 mt-6"
          />

          {/* overflow-hidden keeps yPercent:100 cards invisible until they animate in */}
          <div className="relative w-full max-w-2xl h-[550px] mx-auto overflow-hidden rounded-3xl">
            {STORIES.map((story, i) => (
              <figure
                key={story.name}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="absolute inset-0 flex flex-col justify-between rounded-3xl bg-card p-10 will-change-transform"
                style={{
                  border: "1px solid hsl(var(--border))",
                  boxShadow: `
                    0 0 0 1px hsl(var(--border) / 0.5),
                    0 4px 6px hsl(var(--foreground) / 0.04),
                    0 12px 24px hsl(var(--foreground) / 0.08),
                    0 40px 80px hsl(var(--foreground) / 0.12)
                  `,
                  transformOrigin: "center top",
                }}
              >
                <div>
                  <span className="font-display text-6xl text-primary/20 mb-2 block">
                    &ldquo;
                  </span>
                  <blockquote className="text-2xl leading-relaxed font-medium pb-4">
                    {t(story.quoteKey, story.quoteFallback)}
                  </blockquote>
                </div>

                <figcaption className="flex items-center gap-4 mb-2 pt-6 border-t border-border">
                  <img
                    src={story.avatar}
                    alt={story.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-bold">{story.name}</div>
                    <div className="text-sm text-primary">
                      {t(story.roleKey, story.roleFallback)}
                    </div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        {/* Scroll progress dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {STORIES.map((_, i) => (
            <div
              key={i}
              ref={(el) => {
                dotRefs.current[i] = el;
              }}
              className="h-1.5 rounded-full bg-primary/20 transition-all duration-500"
              style={{ width: i === 0 ? "2rem" : "0.375rem" }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// import { useRef } from "react";
// import { useTranslation } from "react-i18next";
// import { useGSAP } from "@gsap/react";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { useScrollReveal } from "@/hooks/useScrollReveal";
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
//     quoteFallback: "The school fund meant I could keep studying instead of working the fields with my brothers. I want to be a doctor for my village.",
//     name: "Amara K.",
//     roleKey: "story.amara.role",
//     roleFallback: "Kenya — Education Programme",
//     avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&auto=format&fit=crop&q=80",
//   },
//   {
//     quoteKey: "story.rahman.quote",
//     quoteFallback: "After the flood took our home, HopeBridge helped us rebuild on higher ground. Our children finally have a safe place to grow up.",
//     name: "The Rahman Family",
//     roleKey: "story.rahman.role",
//     roleFallback: "Bangladesh — Emergency Relief",
//     avatar: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=200&auto=format&fit=crop&q=80",
//   },
//   {
//     quoteKey: "story.maya.quote",
//     quoteFallback: "The medical fund covered the heart surgery we could never have paid for ourselves. Today she's running around like any seven-year-old should.",
//     name: "Maya's Mother",
//     roleKey: "story.maya.role",
//     roleFallback: "Nepal — Healthcare Programme",
//     avatar: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=200&auto=format&fit=crop&q=80",
//   },
// ];

// // export default function StoriesSection() {
// //   const { t } = useTranslation();
// //   const sectionRef = useRef<HTMLElement>(null);
// //   const cardRefs = useRef<(HTMLElement | null)[]>([]);
  
// //   useScrollReveal(sectionRef);

// // useGSAP(() => {
// //     const cardElements = cardRefs.current.filter(Boolean);
// //     const totalCards = cardElements.length;
// //     if (totalCards === 0) return;

// //     // Detect if we are on mobile (less than 768px)
// //     const isMobile = window.innerWidth < 768;
    
// //     // On mobile, start later ("top 20%") so it doesn't trigger too early.
// //     // On desktop, "top top" is usually fine.
// //     const scrollStart = isMobile ? "top 20%" : "top top";

// //     gsap.set(cardElements, { y: "100%", scale: 1, rotation: 0, opacity: 1 });
// //     gsap.set(cardElements[0], { y: "0%" });

// //     const scrollTimeline = gsap.timeline({
// //       scrollTrigger: {
// //         trigger: sectionRef.current,
// //         start: scrollStart, 
// //         end: `+=${window.innerHeight * totalCards}`,
// //         pin: true,
// //         scrub: 0.5,
// //         invalidateOnRefresh: true,
// //       },
// //     });

// //     for (let i = 0; i < totalCards - 1; i++) {
// //       scrollTimeline.to(cardElements[i], {
// //         scale: 0.85,
// //         rotation: i % 2 === 0 ? -3 : 3,
// //         opacity: 0,
// //         duration: 1,
// //         ease: "none",
// //       }, i);

// //       scrollTimeline.to(cardElements[i + 1], {
// //         y: "0%",
// //         duration: 1,
// //         ease: "none",
// //       }, i);
// //     }
// //     // ScrollTrigger.refresh(); // 👈 add this last
// //   }, { scope: sectionRef });

// //   return (
// //     // Added min-h-screen to ensure this section occupies space
// //     <section id="stories" ref={sectionRef} className="relative py-20 min-h-screen flex flex-col justify-center">
// //       <div className="container mx-auto px-4">
// //         <SectionHeading
// //           align="center"
// //           kicker={t("stories.kicker", "In Their Words")}
// //           title={t("stories.title", "Stories from the other end of a donation")}
// //           className="mx-auto mb-16"
// //         />

// //         {/* The container MUST have a defined height */}
// //         <div className="sticky-cards-wrapper relative w-full max-w-2xl h-[500px] mx-auto">
// //           {STORIES.map((story, i) => (
// //             <figure
// //               key={story.name}
// //               ref={(el) => { cardRefs.current[i] = el; }}
// //               className="absolute inset-0 flex flex-col justify-between rounded-3xl border border-border bg-background p-10 shadow-2xl"
// //             >
// //               <div>
// //                 <span className="font-display text-6xl text-primary/20 mb-2 block">“</span>
// //                 <blockquote className="text-2xl leading-relaxed font-medium">
// //                   {t(story.quoteKey, story.quoteFallback)}
// //                 </blockquote>
// //               </div>
              
// //               <figcaption className="flex items-center gap-4 mt-8 pt-6 border-t border-border">
// //                 <img src={story.avatar} alt={story.name} className="w-14 h-14 rounded-full object-cover" />
// //                 <div>
// //                   <div className="font-bold">{story.name}</div>
// //                   <div className="text-sm text-primary">{t(story.roleKey, story.roleFallback)}</div>
// //                 </div>
// //               </figcaption>
// //             </figure>
// //           ))}
// //         </div>
// //       </div>
// //     </section>
// //   );
// // }

// const SCROLL_PER_CARD = 600;

// export default function StoriesSection() {
//   const { t } = useTranslation();
//   const sectionRef = useRef<HTMLElement>(null);
//   const stickyRef = useRef<HTMLDivElement>(null);
//   const cardRefs = useRef<(HTMLElement | null)[]>([]);

//   useScrollReveal(sectionRef);

//   // useGSAP(() => {
//   //   const cardElements = cardRefs.current.filter(Boolean) as HTMLElement[];
//   //   const totalCards = cardElements.length;
//   //   if (totalCards === 0 || !sectionRef.current) return;

//   //   gsap.set(cardElements, { yPercent: 100, scale: 1, rotation: 0, opacity: 1 });
//   //   gsap.set(cardElements[0], { yPercent: 0 });

//   //   const tl = gsap.timeline({
//   //     scrollTrigger: {
//   //       trigger: sectionRef.current,
//   //       start: "top top",
//   //       end: "bottom bottom", // section height drives the scrub
//   //       scrub: 0.8,
//   //       invalidateOnRefresh: true,
//   //     },
//   //   });

//   //   for (let i = 0; i < totalCards - 1; i++) {
//   //     tl.to(cardElements[i], {
//   //       scale: 0.85,
//   //       rotation: i % 2 === 0 ? -3 : 3,
//   //       opacity: 0,
//   //       duration: 1,
//   //       ease: "none",
//   //     }, i);

//   //     tl.to(cardElements[i + 1], {
//   //       yPercent: 0,
//   //       duration: 1,
//   //       ease: "none",
//   //     }, i);
//   //   }
//   // }, { scope: sectionRef });

//   useGSAP(() => {
//     const cardElements = cardRefs.current.filter(Boolean) as HTMLElement[];
//     const totalCards = cardElements.length;
//     if (totalCards === 0 || !sectionRef.current) return;

//     // 1. Reset initial states safely
//     gsap.set(cardElements, { yPercent: 100, scale: 1, rotation: 0, opacity: 1 });
//     gsap.set(cardElements[0], { yPercent: 0 });

//     // 2. Timeline synchronized with the CSS sticky travel distance
//     const tl = gsap.timeline({
//       scrollTrigger: {
//         trigger: sectionRef.current, // Targets the tall 1800px wrapper
//         start: "top top",
//         end: "bottom bottom", // This is the magic bullet for CSS sticky wrappers
//         scrub: 0.5, 
//         // No pin: true! CSS sticky is handling the pinning.
//       },
//     });

//     // 3. Animation Sequence mapping
//     for (let i = 0; i < totalCards - 1; i++) {
//       // Current card pushes back and fades out
//       tl.to(cardElements[i], {
//         scale: 0.85,
//         rotation: i % 2 === 0 ? -3 : 3,
//         opacity: 0,
//         duration: 1,
//         ease: "none",
//       }, i);

//       // Next card slides up seamlessly
//       tl.to(cardElements[i + 1], {
//         yPercent: 0,
//         duration: 1,
//         ease: "none",
//       }, i);
//     }
//   }, { scope: sectionRef });
//   return (
//     // Tall section — its height is the scroll budget for all transitions
//     <section
//       id="stories"
//       ref={sectionRef}
//       className="relative"
//       style={{ height: `${STORIES.length * SCROLL_PER_CARD}px` }}
//     >
//       {/* CSS sticky — no GSAP spacer, no position fights */}
//       <div
//         ref={stickyRef}
//         className="sticky top-0 flex flex-col items-center justify-center py-20"
//         style={{ height: "100vh" }}
//       >
//         <div className="container mx-auto px-4">
//           <SectionHeading
//             align="center"
//             kicker={t("stories.kicker", "In Their Words")}
//             title={t("stories.title", "Stories from the other end of a donation")}
//             className="mx-auto mb-16"
//           />

//           <div className="relative w-full max-w-2xl h-[500px] mx-auto overflow-hidden">
//             {STORIES.map((story, i) => (
//               <figure
//                 key={story.name}
//                 ref={(el) => { cardRefs.current[i] = el; }}
//                 className="absolute inset-0 flex flex-col justify-between rounded-3xl border border-border bg-background p-10 shadow-2xl"
//               >
//                 <div>
//                   <span className="font-display text-6xl text-primary/20 mb-2 block">&ldquo;</span>
//                   <blockquote className="text-2xl leading-relaxed font-medium">
//                     {t(story.quoteKey, story.quoteFallback)}
//                   </blockquote>
//                 </div>
//                 <figcaption className="flex items-center gap-4 mt-8 pt-6 border-t border-border">
//                   <img src={story.avatar} alt={story.name} className="w-14 h-14 rounded-full object-cover" />
//                   <div>
//                     <div className="font-bold">{story.name}</div>
//                     <div className="text-sm text-primary">{t(story.roleKey, story.roleFallback)}</div>
//                   </div>
//                 </figcaption>
//               </figure>
//             ))}
//           </div>
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
// import { useScrollReveal } from "@/hooks/useScrollReveal";
// import SectionHeading from "./SectionHeading1";
// import { useEffect } from "react";



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
//     quoteFallback: "The school fund meant I could keep studying instead of working the fields with my brothers. I want to be a doctor for my village.",
//     name: "Amara K.",
//     roleKey: "story.amara.role",
//     roleFallback: "Kenya — Education Programme",
//     avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&auto=format&fit=crop&q=80",
//   },
//   {
//     quoteKey: "story.rahman.quote",
//     quoteFallback: "After the flood took our home, HopeBridge helped us rebuild on higher ground. Our children finally have a safe place to grow up.",
//     name: "The Rahman Family",
//     roleKey: "story.rahman.role",
//     roleFallback: "Bangladesh — Emergency Relief",
//     avatar: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=200&auto=format&fit=crop&q=80",
//   },
//   {
//     quoteKey: "story.maya.quote",
//     quoteFallback: "The medical fund covered the heart surgery we could never have paid for ourselves. Today she's running around like any seven-year-old should.",
//     name: "Maya's Mother",
//     roleKey: "story.maya.role",
//     roleFallback: "Nepal — Healthcare Programme",
//     avatar: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=200&auto=format&fit=crop&q=80",
//   },
// ];

// const SCROLL_PER_CARD = 600;

// export default function StoriesSection() {
//   const { t } = useTranslation();
//   const sectionRef = useRef<HTMLElement>(null);
//   const stickyRef = useRef<HTMLDivElement>(null);
//   const cardRefs = useRef<(HTMLElement | null)[]>([]);

//   useScrollReveal(sectionRef);

//   useGSAP(() => {
//     const cardElements = cardRefs.current.filter(Boolean) as HTMLElement[];
//     const totalCards = cardElements.length;
//     if (totalCards === 0 || !sectionRef.current) return;

//     gsap.set(cardElements, { yPercent: 100, scale: 1, rotation: 0, opacity: 1 });
//     gsap.set(cardElements[0], { yPercent: 0 });

//     const tl = gsap.timeline({
//       scrollTrigger: {
//         trigger: sectionRef.current,
//         start: "top top",
//         end: "bottom bottom", // section height drives the scrub
//         scrub: 0.8,
//         invalidateOnRefresh: true,
//       },
//     });

//     for (let i = 0; i < totalCards - 1; i++) {
//       tl.to(cardElements[i], {
//         scale: 0.85,
//         rotation: i % 2 === 0 ? -3 : 3,
//         opacity: 0,
//         duration: 1,
//         ease: "none",
//       }, i);

//       tl.to(cardElements[i + 1], {
//         yPercent: 0,
//         duration: 1,
//         ease: "none",
//       }, i);
//     }
//   }, { scope: sectionRef });

//   return (
//     // Tall section — its height is the scroll budget for all transitions
//     <section
//       id="stories"
//       ref={sectionRef}
//       className="relative"
//       style={{ height: `${STORIES.length * SCROLL_PER_CARD}px` }}
//     >
//       {/* CSS sticky — no GSAP spacer, no position fights */}
//       <div
//         ref={stickyRef}
//         className="sticky top-0 flex flex-col items-center justify-center py-20"
//         style={{ height: "100vh" }}
//       >
//         <div className="container mx-auto px-4">
//           <SectionHeading
//             align="center"
//             kicker={t("stories.kicker", "In Their Words")}
//             title={t("stories.title", "Stories from the other end of a donation")}
//             className="mx-auto mb-16"
//           />

//           <div className="relative w-full max-w-2xl h-[500px] mx-auto overflow-hidden">
//             {STORIES.map((story, i) => (
//               <figure
//                 key={story.name}
//                 ref={(el) => { cardRefs.current[i] = el; }}
//                 className="absolute inset-0 flex flex-col justify-between rounded-3xl border border-border bg-background p-10 shadow-2xl"
//               >
//                 <div>
//                   <span className="font-display text-6xl text-primary/20 mb-2 block">&ldquo;</span>
//                   <blockquote className="text-2xl leading-relaxed font-medium">
//                     {t(story.quoteKey, story.quoteFallback)}
//                   </blockquote>
//                 </div>
//                 <figcaption className="flex items-center gap-4 mt-8 pt-6 border-t border-border">
//                   <img src={story.avatar} alt={story.name} className="w-14 h-14 rounded-full object-cover" />
//                   <div>
//                     <div className="font-bold">{story.name}</div>
//                     <div className="text-sm text-primary">{t(story.roleKey, story.roleFallback)}</div>
//                   </div>
//                 </figcaption>
//               </figure>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }