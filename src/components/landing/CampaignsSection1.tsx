// import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { Link } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import { useQuery } from "@tanstack/react-query";
// import { ArrowUpRight, ImageOff } from "lucide-react";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { useScrollReveal } from "@/hooks/useScrollReveal";
// import { eventApi } from "@/services/api.service";
// import SectionHeading from "./SectionHeading1";
// import type { Event } from "@/types/api";
// import { t } from "i18next";

// gsap.registerPlugin(ScrollTrigger);

// const EVENT_TYPE_LABELS: Record<string, string> = {
//   food_package: "Food Aid",
//   medical_aid: "Medical",
//   job_opportunity: "Job Support",
//   distribution: "Distribution",
//   fundraising: "Fundraising",
//   awareness: "Awareness",
//   other: "Other",
// };

// const translateEventType = (t: (k: string, f: string) => string, type: string): string =>
//   t(`events.type.${type}`, EVENT_TYPE_LABELS[type] || type);

// const STOCK_IMAGES = [
//   "https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=700&auto=format&fit=crop&q=80",
//   "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=700&auto=format&fit=crop&q=80",
//   "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=700&auto=format&fit=crop&q=80",
// ];

// interface Campaign {
//   id: string;
//   image: string;
//   tag: string;
//   title: string;
//   desc: string;
//   raised: number;
//   goal: number;
// }

// const HARDCODED_CAMPAIGNS: Campaign[] = [
//   {
//     id: "water",
//     image: STOCK_IMAGES[0],
//     tag: "Water & Sanitation",
//     title: "Clean water for Eastern Province",
//     desc: "Drilling and maintaining boreholes for 14 villages currently walking 5+ km a day for water.",
//     raised: 84200,
//     goal: 125000,
//   },
//   {
//     id: "education",
//     image: STOCK_IMAGES[1],
//     tag: "Education",
//     title: "Desks and books for 12 rural schools",
//     desc: "Replacing dirt-floor classrooms with proper furniture and a full year of textbooks.",
//     raised: 19400,
//     goal: 42000,
//   },
//   {
//     id: "relief",
//     image: STOCK_IMAGES[2],
//     tag: "Emergency Relief",
//     title: "Flood response — Bangladesh",
//     desc: "Shelter, clean water, and medical care for families displaced by seasonal flooding.",
//     raised: 56900,
//     goal: 70000,
//   },
// ];

// function mapEventToCampaign(
//   t: (k: string, f: string) => string,
//   event: Event,
//   index: number
// ): Campaign {
//   const typeLabel = translateEventType(t, event.eventType);
//   const urls = event.imageUrls?.split(",").map((u) => u.trim()).filter(Boolean);
//   return {
//     id: event._id,
//     image: urls?.[0] || STOCK_IMAGES[index % STOCK_IMAGES.length],
//     tag: typeLabel,
//     title: event.title,
//     desc: event.description || t("campaigns.eventDesc", "Join us for this {{type}} event.", { type: typeLabel.toLowerCase() }),
//     raised: event.collectedAmount || 0,
//     goal: event.targetAmount || event.collectedAmount * 2 || 50000,
//   };
// }

// const pctOf = (c: Campaign) => Math.min(100, Math.round((c.raised / c.goal) * 100));

// interface CardEls {
//   root: HTMLDivElement;
//   imgWrap: HTMLDivElement;
//   bar: HTMLDivElement;
//   amount: HTMLSpanElement;
// }

// // const canHover =
// //   typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
// // const canHover =
// //   typeof window !== "undefined" 
// const canHover =
//   typeof window !== "undefined" &&
//   window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// function DonateLink({ to }: { to: string }) {
//   const { t } = useTranslation();
//   return (
//     <Link
//       to={to}
//       className="group/donate relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-primary/30 pl-4 pr-3 py-1.5 text-sm font-semibold text-primary"
//     >
//       <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-primary transition-transform duration-[400ms] ease-out group-hover/donate:scale-x-100" />
//       <span className="relative z-10 transition-colors duration-300 group-hover/donate:text-primary-foreground">
//         {t("campaign.donate", "Donate")}
//       </span>
//       <ArrowUpRight className="relative z-10 w-4 h-4 transition-all duration-300 group-hover/donate:translate-x-0.5 group-hover/donate:-translate-y-0.5 group-hover/donate:text-primary-foreground" />
//     </Link>
//   );
// }

// function CampaignCard({
//   campaign,
//   onRegister,
// }: {
//   campaign: Campaign;
//   onRegister: (id: string, els: CardEls) => void;
// }) {
//   const [imgError, setImgError] = useState(false);
//   const rootRef = useRef<HTMLDivElement>(null);
//   const tiltRef = useRef<HTMLDivElement>(null); // new
//   const imgWrapRef = useRef<HTMLDivElement>(null);
//   const barRef = useRef<HTMLDivElement>(null);
//   const amountRef = useRef<HTMLSpanElement>(null);

//   useEffect(() => {
//     if (!rootRef.current || !imgWrapRef.current || !barRef.current || !amountRef.current) return;
//     onRegister(campaign.id, {
//       root: rootRef.current,
//       imgWrap: imgWrapRef.current,
//       bar: barRef.current,
//       amount: amountRef.current,
//     });
//   }, [campaign.id, onRegister]);

//   useEffect(() => {
//     const root = rootRef.current;
//     if (!root || !canHover) return;

//     // gsap.set(root, { transformPerspective: 800, force3D: true });
//     gsap.set(root, {
//   transformPerspective: 800,
//   transformStyle: "preserve-3d",
//   force3D: true,
// });

//     const handleMove = (e: PointerEvent) => {
//       const rect = root.getBoundingClientRect();
//       const px = (e.clientX - rect.left) / rect.width;
//       const py = (e.clientY - rect.top) / rect.height;
//       gsap.to(root, {
//         rotateY: (px - 0.5) * 10,
//         rotateX: (0.5 - py) * 10,
//         duration: 0.5,
//         ease: "power3.out",
//         overwrite: "auto",
//       });
//       gsap.to(root, {
//         "--mx": `${px * 100}%`,
//         "--my": `${py * 100}%`,
//         duration: 0.3,
//         ease: "none",
//         overwrite: "auto",
//       });
//     };
//     const handleEnter = () => {
//       gsap.to(root, { scale: 1.02, duration: 0.45, ease: "power3.out", overwrite: "auto" });
//     };
//     const handleLeave = () => {
//       gsap.to(root, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.6, ease: "power3.out", overwrite: "auto" });
//     };

//     root.addEventListener("pointermove", handleMove);
//     root.addEventListener("pointerenter", handleEnter);
//     root.addEventListener("pointerleave", handleLeave);
//     return () => {
//       root.removeEventListener("pointermove", handleMove);
//       root.removeEventListener("pointerenter", handleEnter);
//       root.removeEventListener("pointerleave", handleLeave);
//     };
//   }, []);

//   // return (
//   //   <div
//   //     ref={rootRef}
//   //     style={{ "--mx": "50%", "--my": "50%" } as React.CSSProperties}
//   //     className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-xl will-change-transform"
//   //   >
//   return (
//     <div
//       ref={rootRef}
//       style={{ "--mx": "50%", "--my": "50%" } as React.CSSProperties}
//       className="group relative flex flex-col rounded-2xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-xl will-change-transform"
//     >
//       {canHover && (
//         <div
//           aria-hidden
//           className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
//           style={{
//             // background: "radial-gradient(circle at var(--mx) var(--my), hsl(var(--primary-foreground)/0.15), transparent 55%)",
//           }}
//         />
//       )}

//       {/* <div
//         ref={imgWrapRef}
//         className="relative overflow-hidden aspect-[16/10] bg-muted"
//       > */}
//       <div
//   ref={imgWrapRef}
//   className="relative overflow-hidden rounded-t-2xl aspect-[16/10] bg-muted"
// >
//         <div className="absolute inset-0 flex items-center justify-center">
//           <ImageOff className="w-10 h-10 text-muted-foreground/40" />
//         </div>
//         <img
//           src={campaign.image}
//           alt={campaign.title}
//           className={`relative w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${imgError ? "opacity-0" : ""}`}
//           onError={() => setImgError(true)}
//         />
//       </div>

//       {/* <div className="p-6 lg:p-7 flex flex-col flex-1"> */}
//       <div className="p-6 lg:p-7 flex flex-col flex-1" style={{ backfaceVisibility: "hidden" }}>
//         <span className="inline-block w-fit px-3 py-1 rounded-full text-[0.65rem] font-semibold uppercase tracking-wider bg-primary/10 text-primary mb-3">
//           {campaign.tag}
//         </span>

//         <h3 className="font-display text-xl lg:text-2xl font-bold leading-snug mb-2">
//           {campaign.title}
//         </h3>

//         <p className="text-sm text-muted-foreground leading-relaxed mb-5">
//           {campaign.desc}
//         </p>

//         <div className="mt-auto">
//           <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mb-2">
//             <div ref={barRef} className="h-full rounded-full bg-primary" style={{ width: "0%" }} />
//           </div>
//           <div className="flex items-center justify-between gap-3 text-sm">
//             <span className="font-semibold flex items-baseline gap-1 min-w-0">
//               <span
//                 ref={amountRef}
//                 className="tabular-nums shrink-0"
//                 style={{ minWidth: "4.5ch" }}
//               >
//                 $0
//               </span>
//               <span className="text-muted-foreground font-normal truncate">
//                 {t("campaign.raisedOf", "raised of")} ${campaign.goal.toLocaleString()}
//               </span>
//             </span>
//             <DonateLink to="/payment" />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function CampaignsSection() {
//   const { t } = useTranslation();
//   const sectionRef = useRef<HTMLElement>(null);
//   const gridRef = useRef<HTMLDivElement>(null);
//   const cardElsRef = useRef<Record<string, CardEls>>({});
//   const [registeredCount, setRegisteredCount] = useState(0);

//   useScrollReveal(sectionRef);

//   const { data } = useQuery({
//     queryKey: ["campaigns-events"],
//     queryFn: async () => {
//       const response = await eventApi.getAll({ limit: 10 });
//       return response.data;
//     },
//     staleTime: 5 * 60 * 1000,
//     gcTime: 30 * 60 * 1000,
//   });

//   const raw = data;
//   const paginated = Array.isArray(raw) ? raw[0] : raw;
//   const apiEvents: Event[] = (paginated?.data ?? []).filter(
//     (e: Event) => e.isActive !== false && ["upcoming", "ongoing"].includes(e.status)
//   );

//   const campaigns: Campaign[] = useMemo(
//     () =>
//       apiEvents.length > 0
//         ? apiEvents.slice(0, 3).map((e, i) => mapEventToCampaign(t, e, i))
//         : HARDCODED_CAMPAIGNS.map((c) => ({
//             ...c,
//             tag: t(`campaigns.demo.${c.id}.tag`, c.tag),
//             title: t(`campaigns.demo.${c.id}.title`, c.title),
//             desc: t(`campaigns.demo.${c.id}.desc`, c.desc),
//           })),
//     [apiEvents, t]
//   );

//   const handleRegister = useCallback((id: string, els: CardEls) => {
//     if (!cardElsRef.current[id]) {
//       setRegisteredCount((n) => n + 1);
//     }
//     cardElsRef.current[id] = els;
//   }, []);

//   useEffect(() => {
//     if (registeredCount < campaigns.length || !gridRef.current || !sectionRef.current) return;

//     const ctx = gsap.context(() => {
//       const isMobileLayout = window.matchMedia("(max-width: 1023px)").matches;

//       // const entryConfigs = [
//       //   {
//       //     from: { x: -520, y: -70, rotation: -15, rotationY: 80, scale: 0.8, opacity: 0 },
//       //     start: "top 92%", mid: "top 72%", end: "top 50%", barEnd: "top 8%",
//       //   },
//       //   {
//       //     from: { x: 440, y: 60, rotation: 12, rotationY: -65, scale: 0.84, opacity: 0 },
//       //     start: "top 80%", mid: "top 60%", end: "top 40%", barEnd: "top 6%",
//       //   },
//       //   {
//       //     from: { x: -320, y: 100, rotation: 8, rotationY: 45, scale: 0.84, opacity: 0 },
//       //     start: "top 68%", mid: "top 48%", end: "top 30%", barEnd: "top 4%",
//       //   },
//       // ];

//       // const entryConfigs = [
//       //   {
//       //     from: { x: 0, y: 90, rotation: 0, rotationY: 18, scale: 0.92, opacity: 0 },
//       //     start: "top 92%", mid: "top 72%", end: "top 50%", barEnd: "top 8%",
//       //   },
//       //   {
//       //     from: { x: 0, y: 90, rotation: 0, rotationY: 18, scale: 0.92, opacity: 0 },
//       //     start: "top 80%", mid: "top 60%", end: "top 40%", barEnd: "top 6%",
//       //   },
//       //   {
//       //     from: { x: 0, y: 90, rotation: 0, rotationY: 18, scale: 0.92, opacity: 0 },
//       //     start: "top 68%", mid: "top 48%", end: "top 30%", barEnd: "top 4%",
//       //   },
//       // ];
//       const entryConfigs = [
//         {
//           from: { x: 0, y: 90, rotation: 0, rotationY: 18, scale: 0.92, opacity: 0 },
//           start: "top 92%", mid: "top 72%", end: "top 50%", barEnd: "top 35%",
//         },
//         {
//           from: { x: 0, y: 90, rotation: 0, rotationY: 18, scale: 0.92, opacity: 0 },
//           start: "top 80%", mid: "top 60%", end: "top 40%", barEnd: "top 28%",
//         },
//         {
//           from: { x: 0, y: 90, rotation: 0, rotationY: 18, scale: 0.92, opacity: 0 },
//           start: "top 68%", mid: "top 48%", end: "top 30%", barEnd: "top 20%",
//         },
//       ];

//       campaigns.forEach((campaign, i) => {
//         const els = cardElsRef.current[campaign.id];
//         if (!els) return;
//         gsap.set(els.bar, { width: "0%" });
//         els.amount.textContent = "$0";

//         if (isMobileLayout && false) {
//           gsap.set(els.root, { y: 60, opacity: 0 });
//           gsap.set(els.imgWrap, { yPercent: 0 });
//         } else {
//           const cfg = entryConfigs[i];
//           if (!cfg) return;
//           gsap.set(els.root, { ...cfg.from });
//           gsap.set(els.imgWrap, { yPercent: -12 });
//         }
//       });

//       if (isMobileLayout && false) {
//         campaigns.forEach((campaign) => {
//           const els = cardElsRef.current[campaign.id];
//           if (!els) return;
//           const pct = pctOf(campaign);

//           ScrollTrigger.create({
//             trigger: els.root,
//             start: "top 95%",
//             end: "top 65%",
//             scrub: 0.5,
//             onUpdate: (self) => {
//               const p = self.progress;
//               gsap.set(els.root, {
//                 x: gsap.utils.interpolate(-48, 0, p),
//                 opacity: p,
//               });
//               gsap.set(els.bar, {
//                 width: `${gsap.utils.interpolate(0, pct, p)}%`,
//               });
//               els.amount.textContent = `$${Math.round(
//                 gsap.utils.interpolate(0, campaign.raised, p)
//               ).toLocaleString()}`;
//             },
//           });
//         });
//       } else {
//         campaigns.forEach((campaign, i) => {
//           const els = cardElsRef.current[campaign.id];
//           if (!els) return;
//           const pct = pctOf(campaign);
//           const cfg = entryConfigs[i];
//           if (!cfg) return;
//           const counter = { val: 0 };

//           gsap.fromTo(
//             els.root,
//             { ...cfg.from },
//             {
//               x: 0, y: 0, rotation: 0, rotationY: 0, scale: 1, opacity: 1,
//               scrollTrigger: { trigger: els.root, start: cfg.start, end: cfg.end, scrub: 1.5 },
//               ease: "power2.out",
//             }
//           );

//           gsap.fromTo(
//             els.imgWrap,
//             { yPercent: -12 },
//             {
//               yPercent: 0,
//               scrollTrigger: { trigger: els.root, start: cfg.start, end: cfg.end, scrub: 1.5 },
//               ease: "sine.out",
//             }
//           );

//           gsap.fromTo(
//             els.bar,
//             { width: "0%" },
//             {
//               width: `${pct}%`,
//               scrollTrigger: { trigger: els.root, start: cfg.mid, end: cfg.barEnd, scrub: 1.5 },
//               ease: "sine.out",
//             }
//           );

//           gsap.fromTo(
//             counter,
//             { val: 0 },
//             {
//               val: campaign.raised,
//               scrollTrigger: { trigger: els.root, start: cfg.mid, end: cfg.barEnd, scrub: 1.5 },
//               ease: "sine.out",
//               onUpdate: () => {
//                 els.amount.textContent = `$${Math.round(counter.val).toLocaleString()}`;
//               },
//             }
//           );
//         });

//         ScrollTrigger.refresh();
//       }
//     });

//     return () => ctx.revert();
//   }, [registeredCount, campaigns]);

//   return (
//     <section id="campaigns" ref={sectionRef} className="py-14 sm:py-20 lg:py-24 overflow-hidden">
//       <div className="container mx-auto px-4 sm:px-6">
//         <div className="flex flex-wrap items-end justify-between gap-6 mb-10 sm:mb-14">
//           <SectionHeading
//             title={t("campaigns.title", "Where your giving goes to work right now")}
//             className="!max-w-xl"
//           />
//           <Link
//             to="/events"
//             className="hidden sm:inline-flex items-center gap-1 font-semibold text-sm text-foreground hover:text-primary transition-colors"
//             data-reveal="up"
//           >
//             {t("campaigns.viewAll", "View all campaigns")}
//             <ArrowUpRight className="w-4 h-4" />
//           </Link>
//         </div>

//         <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
//           {campaigns.map((campaign) => (
//             <CampaignCard key={campaign.id} campaign={campaign} onRegister={handleRegister} />
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, ImageOff } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { eventApi } from "@/services/api.service";
import SectionHeading from "./SectionHeading1";
import type { Event } from "@/types/api";

gsap.registerPlugin(ScrollTrigger);

const EVENT_TYPE_LABELS: Record<string, string> = {
  food_package: "Food Aid",
  medical_aid: "Medical",
  job_opportunity: "Job Support",
  distribution: "Distribution",
  fundraising: "Fundraising",
  awareness: "Awareness",
  other: "Other",
};

const translateEventType = (t: (k: string, f: string) => string, type: string): string =>
  t(`events.type.${type}`, EVENT_TYPE_LABELS[type] || type);

const STOCK_IMAGES = [
  "https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=700&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=700&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=700&auto=format&fit=crop&q=80",
];

interface Campaign {
  id: string;
  image: string;
  tag: string;
  title: string;
  desc: string;
  raised: number;
  goal: number;
}

const HARDCODED_CAMPAIGNS: Campaign[] = [
  {
    id: "water",
    image: STOCK_IMAGES[0],
    tag: "Water & Sanitation",
    title: "Clean water for Eastern Province",
    desc: "Drilling and maintaining boreholes for 14 villages currently walking 5+ km a day for water.",
    raised: 84200,
    goal: 125000,
  },
  {
    id: "education",
    image: STOCK_IMAGES[1],
    tag: "Education",
    title: "Desks and books for 12 rural schools",
    desc: "Replacing dirt-floor classrooms with proper furniture and a full year of textbooks.",
    raised: 19400,
    goal: 42000,
  },
  {
    id: "relief",
    image: STOCK_IMAGES[2],
    tag: "Emergency Relief",
    title: "Flood response — Bangladesh",
    desc: "Shelter, clean water, and medical care for families displaced by seasonal flooding.",
    raised: 56900,
    goal: 70000,
  },
];

function mapEventToCampaign(
  t: (k: string, f: string, opts?: Record<string, unknown>) => string,
  event: Event,
  index: number
): Campaign {
  const typeLabel = translateEventType(t, event.eventType);
  const urls = event.imageUrls?.split(",").map((u) => u.trim()).filter(Boolean);
  return {
    id: event._id,
    image: urls?.[0] || STOCK_IMAGES[index % STOCK_IMAGES.length],
    tag: typeLabel,
    title: event.title,
    desc: event.description || t("campaigns.eventDesc", "Join us for this {{type}} event.", { type: typeLabel.toLowerCase() }),
    raised: event.collectedAmount || 0,
    goal: event.targetAmount || event.collectedAmount * 2 || 50000,
  };
}

const pctOf = (c: Campaign) => Math.min(100, Math.round((c.raised / c.goal) * 100));

interface CardEls {
  root: HTMLDivElement;
  imgWrap: HTMLDivElement;
  bar: HTMLDivElement;
  amount: HTMLSpanElement;
}

const canHover =
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// function DonateLink({ to }: { to: string }) {
//   const { t } = useTranslation();
//   return (
//     <Link
//       to={to}
//       className="group/donate relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-primary/30 pl-4 pr-3 py-1.5 text-sm font-semibold text-primary"
//     >
//       {/* <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-primary transition-transform duration-[400ms] ease-out group-hover/donate:scale-x-100" />
//       <span className="relative z-10 transition-colors duration-300 group-hover/donate:text-primary-foreground">
//         {t("campaign.donate", "Donate")}
//       </span>
//       <ArrowUpRight className="relative z-10 w-4 h-4 transition-all duration-300 group-hover/donate:translate-x-0.5 group-hover/donate:-translate-y-0.5 group-hover/donate:text-primary-foreground" /> */}
//       <span className="relative z-10 transition-colors duration-300 group-hover/donate:text-[hsl(200_25%_14%)]">
//   {t("campaign.donate", "Donate")}
// </span>
// <ArrowUpRight className="relative z-10 w-4 h-4 transition-all duration-300 group-hover/donate:translate-x-0.5 group-hover/donate:-translate-y-0.5 group-hover/donate:text-[hsl(200_25%_14%)]" />
//     </Link>
//   );
// }
// function DonateLink({ to }: { to: string }) {
//   const { t } = useTranslation();
//   return (
//     <Link
//       to={to}
//       className="group/donate relative isolate inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-primary/30 pl-4 pr-3 py-1.5 text-sm font-semibold text-primary"
//     >
//       <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-primary transition-transform duration-[400ms] ease-out group-hover/donate:scale-x-100" />
//       <span className="relative z-10 transition-colors duration-300 group-hover/donate:text-primary-foreground">
//         {t("campaign.donate", "Donate")}
//       </span>
//       <ArrowUpRight className="relative z-10 w-4 h-4 transition-all duration-300 group-hover/donate:translate-x-0.5 group-hover/donate:-translate-y-0.5 group-hover/donate:text-primary-foreground" />
//     </Link>
//   );
// }

function DonateLink({ to }: { to: string }) {
  const { t } = useTranslation();
  return (
    <Link
      to={to}
      className="group/donate relative isolate inline-flex items-center gap-1.5 overflow-hidden rounded-full border-2 border-primary/30 pl-4 pr-3 py-1.5 text-sm font-semibold text-primary"
      style={{ transformStyle: "flat" }}
    >
      <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-primary transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover/donate:scale-x-100" />
      <span className="relative z-10 transition-colors duration-300 group-hover/donate:text-primary-foreground">
        {t("campaign.donate", "Donate")}
      </span>
      <ArrowUpRight className="relative z-10 w-4 h-4 transition-all duration-300 group-hover/donate:translate-x-0.5 group-hover/donate:-translate-y-0.5 group-hover/donate:text-primary-foreground" />
    </Link>
  );
}

function CampaignCard({
  campaign,
  onRegister,
}: {
  campaign: Campaign;
  onRegister: (id: string, els: CardEls) => void;
}) {
  const { t } = useTranslation();
  const [imgError, setImgError] = useState(false);

  // rootRef: target of the parent's scroll-scrubbed entry animation ONLY
  // (x, y, rotation, rotationY, scale, opacity). Registered with the parent
  // via onRegister exactly as before.
  const rootRef = useRef<HTMLDivElement>(null);

  // tiltRef: target of the pointer-driven 3D tilt ONLY (rotateX, rotateY, scale).
  // Nested one level inside rootRef. Keeping these on separate elements means
  // the scroll-scrubbed tween and the pointer-tilt tween never write the same
  // transform properties on the same node in the same frame — that collision
  // was the source of the hover+scroll text-flash glitch.
  const tiltRef = useRef<HTMLDivElement>(null);

  const imgWrapRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const amountRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!rootRef.current || !imgWrapRef.current || !barRef.current || !amountRef.current) return;
    onRegister(campaign.id, {
      root: rootRef.current,
      imgWrap: imgWrapRef.current,
      bar: barRef.current,
      amount: amountRef.current,
    });
  }, [campaign.id, onRegister]);

  useEffect(() => {
    const tiltEl = tiltRef.current;
    if (!tiltEl || !canHover) return;

    gsap.set(tiltEl, {
      transformPerspective: 800,
      transformStyle: "preserve-3d",
      force3D: true,
    });

    const handleMove = (e: PointerEvent) => {
      const rect = tiltEl.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      gsap.to(tiltEl, {
        rotateY: (px - 0.5) * 10,
        rotateX: (0.5 - py) * 10,
        duration: 0.5,
        ease: "power3.out",
        overwrite: "auto",
      });
      gsap.to(tiltEl, {
        "--mx": `${px * 100}%`,
        "--my": `${py * 100}%`,
        duration: 0.3,
        ease: "none",
        overwrite: "auto",
      });
    };
    const handleEnter = () => {
      gsap.to(tiltEl, { scale: 1.02, duration: 0.45, ease: "power3.out", overwrite: "auto" });
    };
    const handleLeave = () => {
      gsap.to(tiltEl, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.6, ease: "power3.out", overwrite: "auto" });
    };

    tiltEl.addEventListener("pointermove", handleMove);
    tiltEl.addEventListener("pointerenter", handleEnter);
    tiltEl.addEventListener("pointerleave", handleLeave);
    return () => {
      tiltEl.removeEventListener("pointermove", handleMove);
      tiltEl.removeEventListener("pointerenter", handleEnter);
      tiltEl.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  return (
    // Scroll-entry target only. No pointer listeners, no 3D transform of its own.
    <div ref={rootRef} className="will-change-transform">
      {/* Pointer-tilt target only. The scroll animation above never touches this
          node's transform, so a mid-scrub tick and a mid-tilt tween can't collide. */}
      <div
        ref={tiltRef}
        style={{ "--mx": "50%", "--my": "50%" } as React.CSSProperties}
        className="group relative flex flex-col rounded-2xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-xl"
      >
        {canHover && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(circle at var(--mx) var(--my), hsl(var(--primary-foreground)/0.15), transparent 55%)",
            }}
          />
        )}

        {/* overflow-hidden lives here (the clipping element), never on the same
            node that receives rotateX/rotateY — combining clip + 3D rotation on
            one element is what caused content to vanish at certain angles. */}
        <div
          ref={imgWrapRef}
          className="relative overflow-hidden rounded-t-2xl aspect-[16/10] bg-muted"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageOff className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <img
            src={campaign.image}
            alt={campaign.title}
            loading="lazy"
            decoding="async"
            className={`relative w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${imgError ? "opacity-0" : ""}`}
            onError={() => setImgError(true)}
          />
        </div>

        <div
          className="p-6 lg:p-7 flex flex-col flex-1 rounded-b-2xl bg-card"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="inline-block w-fit px-3 py-1 rounded-full text-[0.65rem] font-semibold uppercase tracking-wider bg-primary/10 text-primary mb-3">
            {campaign.tag}
          </span>

          <h3 className="font-display text-xl lg:text-2xl font-bold leading-snug mb-2">
            {campaign.title}
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            {campaign.desc}
          </p>

          <div className="mt-auto">
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mb-2">
              <div ref={barRef} className="h-full rounded-full bg-primary" style={{ width: "0%" }} />
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold flex items-baseline gap-1 min-w-0">
                <span
                  ref={amountRef}
                  className="tabular-nums shrink-0"
                  style={{ minWidth: "4.5ch" }}
                >
                  $0
                </span>
                <span className="text-muted-foreground font-normal truncate">
                  {t("campaign.raisedOf", "raised of")} ${campaign.goal.toLocaleString()}
                </span>
              </span>
              {/* <DonateLink to="/payment" /> */}
              <DonateLink to="/payment" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CampaignsSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cardElsRef = useRef<Record<string, CardEls>>({});
  // Bumped only when a card (re)mounts, so the animation effect re-runs once
  // the DOM refs exist — no fragile counting that gets out of sync on data swaps.
  const [registerTick, setRegisterTick] = useState(0);

  useScrollReveal(sectionRef);

  const { data } = useQuery({
    queryKey: ["campaigns-events"],
    queryFn: async () => {
      const response = await eventApi.getAll({ limit: 10 });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Memoized so `campaigns` keeps a stable reference — the animation effect
  // below depends on it, and a new array every render used to tear down and
  // rebuild every ScrollTrigger on each re-render.
  const apiEvents: Event[] = useMemo(() => {
    const paginated = Array.isArray(data) ? data[0] : data;
    return (paginated?.data ?? []).filter(
      (e: Event) => e.isActive !== false && ["upcoming", "ongoing"].includes(e.status)
    );
  }, [data]);

  const campaigns: Campaign[] = useMemo(
    () =>
      apiEvents.length > 0
        ? apiEvents.slice(0, 3).map((e, i) => mapEventToCampaign(t, e, i))
        : HARDCODED_CAMPAIGNS.map((c) => ({
            ...c,
            tag: t(`campaigns.demo.${c.id}.tag`, c.tag),
            title: t(`campaigns.demo.${c.id}.title`, c.title),
            desc: t(`campaigns.demo.${c.id}.desc`, c.desc),
          })),
    [apiEvents, t]
  );

  const handleRegister = useCallback((id: string, els: CardEls) => {
    cardElsRef.current[id] = els;
    setRegisterTick((n) => n + 1);
  }, []);

  useEffect(() => {
    // Wait until every current card has mounted & registered its DOM nodes.
    // Stale entries from a previous campaign set are ignored by the id lookups.
    const missing = campaigns.some((c) => !cardElsRef.current[c.id]);
    if (missing || campaigns.length === 0 || !gridRef.current) return;

    const ctx = gsap.context(() => {
      const entryConfigs = [
        {
          from: { x: 0, y: 90, rotation: 0, rotationY: 18, scale: 0.92, opacity: 0 },
          start: "top 92%", end: "top 50%",
        },
        {
          from: { x: 0, y: 90, rotation: 0, rotationY: 18, scale: 0.92, opacity: 0 },
          start: "top 80%", end: "top 40%",
        },
        {
          from: { x: 0, y: 90, rotation: 0, rotationY: 18, scale: 0.92, opacity: 0 },
          start: "top 68%", end: "top 30%",
        },
      ];

      campaigns.forEach((campaign, i) => {
        const els = cardElsRef.current[campaign.id];
        if (!els || !els.root.isConnected) return;
        const pct = pctOf(campaign);
        const cfg = entryConfigs[i];
        if (!cfg) return;
        const counter = { val: 0 };

        // Scroll-scrubbed entrance — the card flies in as it crosses the
        // viewport. transformPerspective is required or rotationY squashes flat.
        gsap.fromTo(
          els.root,
          { ...cfg.from, transformPerspective: 800 },
          {
            x: 0, y: 0, rotation: 0, rotationY: 0, scale: 1, opacity: 1,
            scrollTrigger: {
              trigger: els.root, start: cfg.start, end: cfg.end, scrub: 1.5,
              invalidateOnRefresh: true,
            },
            ease: "power2.out",
          }
        );

        gsap.fromTo(
          els.imgWrap,
          { yPercent: -12 },
          {
            yPercent: 0,
            scrollTrigger: {
              trigger: els.root, start: cfg.start, end: cfg.end, scrub: 1.5,
              invalidateOnRefresh: true,
            },
            ease: "sine.out",
          }
        );

        // Bar & amount use one-shot triggers that ALWAYS complete — a scrubbed
        // tween ending at "top 20%" could leave the card on $0 / 0% forever if
        // the scroll never reached it.
        gsap.fromTo(
          els.bar,
          { width: "0%" },
          {
            width: `${pct}%`,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: els.root, start: "top 90%", once: true, invalidateOnRefresh: true,
            },
          }
        );

        gsap.fromTo(
          counter,
          { val: 0 },
          {
            val: campaign.raised,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: els.root, start: "top 90%", once: true, invalidateOnRefresh: true,
            },
            onUpdate: () => {
              els.amount.textContent = `$${Math.round(counter.val).toLocaleString()}`;
            },
          }
        );
      });

      // Re-measure once layout settles instead of synchronously inside the
      // effect, where freshly-created triggers would be measured against a
      // half-rendered grid.
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });

    return () => ctx.revert();
  }, [campaigns, registerTick]);

  return (
    <section id="campaigns" ref={sectionRef} className="py-14 sm:py-20 lg:py-24 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10 sm:mb-14">
          <SectionHeading
            title={t("campaigns.title", "Where your giving goes to work right now")}
            className="!max-w-xl"
          />
          <Link
            to="/events"
            className="hidden sm:inline-flex items-center gap-1 font-semibold text-sm text-foreground hover:text-primary transition-colors"
            data-reveal="up"
          >
            {t("campaigns.viewAll", "View all campaigns")}
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} onRegister={handleRegister} />
          ))}
        </div>
      </div>
    </section>
  );
}