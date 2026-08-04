// import { useEffect, useMemo, useRef, useState } from "react";
// import { useTranslation } from "react-i18next";
// import { useQuery } from "@tanstack/react-query";
// // import { Calendar, Clock, MapPin, Users, ImageOff } from "lucide-react";
// import Navbar from "@/components/landing/Navbar";
// import Footer from "@/components/landing/Footer1";
// import PageHero from "@/components/landing/PageHero";
// import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useScrollReveal } from "@/hooks/useScrollReveal";
// import { eventApi } from "@/services/api.service";
// import gsap from "gsap";
// import type { Event } from "@/types/api";
// // import { Calendar, Clock, MapPin, Users, ImageOff, Check, UtensilsCrossed, Stethoscope, Briefcase, LayoutGrid } from "lucide-react";

// import {
//   Calendar, Clock, MapPin, Users, ImageOff, Check,
//   UtensilsCrossed, Stethoscope, Briefcase, LayoutGrid,
//   Package, HandCoins, Megaphone, Sparkles,
// } from "lucide-react";

// type FilterCategory =
//   | "All Events"
//   | "Food Aid"
//   | "Medical"
//   | "Job Support"
//   | "Distribution"
//   | "Fundraising"
//   | "Awareness"
//   | "Other";

// const FILTERS: FilterCategory[] = [
//   "All Events",
//   "Food Aid",
//   "Medical",
//   "Job Support",
//   "Distribution",
//   "Fundraising",
//   "Awareness",
//   "Other",
// ];

// const FILTER_META: Record
//   FilterCategory,
//   { icon: typeof LayoutGrid; activeClass: string; idleClass: string }
// > = {
//   "All Events": {
//     icon: LayoutGrid,
//     activeClass: "bg-foreground text-background border-foreground",
//     idleClass: "bg-card text-foreground/70 border-border hover:border-foreground/40 hover:text-foreground",
//   },
//   "Food Aid": {
//     icon: UtensilsCrossed,
//     activeClass: "bg-emerald-600 text-white border-emerald-600",
//     idleClass: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
//   },
//   Medical: {
//     icon: Stethoscope,
//     activeClass: "bg-red-600 text-white border-red-600",
//     idleClass: "bg-red-50 text-red-700 border-red-200 hover:border-red-400 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
//   },
//   "Job Support": {
//     icon: Briefcase,
//     activeClass: "bg-blue-600 text-white border-blue-600",
//     idleClass: "bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
//   },
//   Distribution: {
//     icon: Package,
//     activeClass: "bg-teal-600 text-white border-teal-600",
//     idleClass: "bg-teal-50 text-teal-700 border-teal-200 hover:border-teal-400 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-800",
//   },
//   Fundraising: {
//     icon: HandCoins,
//     activeClass: "bg-amber-600 text-white border-amber-600",
//     idleClass: "bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-400 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
//   },
//   Awareness: {
//     icon: Megaphone,
//     activeClass: "bg-violet-600 text-white border-violet-600",
//     idleClass: "bg-violet-50 text-violet-700 border-violet-200 hover:border-violet-400 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800",
//   },
//   Other: {
//     icon: Sparkles,
//     activeClass: "bg-gray-600 text-white border-gray-600",
//     idleClass: "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700",
//   },
// };

// // const EVENT_TYPE_LABELS: Record<string, string> = {
// //   food_package: "Food Aid",
// //   medical_aid: "Medical",
// //   job_opportunity: "Job Support",
// //   distribution: "Distribution",
// //   fundraising: "Fundraising",
// //   awareness: "Awareness",
// //   other: "Other",
// // };

// // type FilterCategory = "All Events" | "Food Aid" | "Medical" | "Job Support";

// // const FILTERS: FilterCategory[] = ["All Events", "Food Aid", "Medical", "Job Support"];

// // const DEMO_EVENTS: Event[] = [
// //   {
// //     _id: "demo-food-1",
// //     title: "Monthly Food Package Distribution",
// //     description: "Monthly distribution of nutritious food packages to registered families in need across the community.",
// //     eventType: "food_package",
// //     status: "upcoming",
// //     isActive: true,
// //     eventDate: new Date(Date.now() + 7 * 86400000).toISOString(),
// //     startDate: new Date(Date.now() + 7 * 86400000).toISOString(),
// //     endDate: new Date(Date.now() + 7 * 86400000 + 4 * 3600000).toISOString(),
// //     location: "Addis Ababa Community Center",
// //     participantCount: 120,
// //     collectedAmount: 0,
// //     createdAt: new Date().toISOString(),
// //     imageUrls: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=700&auto=format&fit=crop&q=80",
// //   },
// //   {
// //     _id: "demo-food-2",
// //     title: "Emergency Food Aid Distribution",
// //     description: "Emergency food packages for families affected by recent economic hardships in the Merkato area.",
// //     eventType: "food_package",
// //     status: "upcoming",
// //     isActive: true,
// //     eventDate: new Date(Date.now() + 14 * 86400000).toISOString(),
// //     startDate: new Date(Date.now() + 14 * 86400000).toISOString(),
// //     endDate: new Date(Date.now() + 14 * 86400000 + 4 * 3600000).toISOString(),
// //     location: "Merkato Market Area",
// //     participantCount: 200,
// //     collectedAmount: 0,
// //     createdAt: new Date().toISOString(),
// //     imageUrls: "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=700&auto=format&fit=crop&q=80",
// //   },
// //   {
// //     _id: "demo-medical-1",
// //     title: "Free Medical Checkup Camp",
// //     description: "Free medical checkups including basic tests, consultations, and medicine distribution for all ages.",
// //     eventType: "medical_aid",
// //     status: "upcoming",
// //     isActive: true,
// //     eventDate: new Date(Date.now() + 10 * 86400000).toISOString(),
// //     startDate: new Date(Date.now() + 10 * 86400000).toISOString(),
// //     endDate: new Date(Date.now() + 10 * 86400000 + 7 * 3600000).toISOString(),
// //     location: "St. Paul's Hospital",
// //     participantCount: 85,
// //     collectedAmount: 0,
// //     createdAt: new Date().toISOString(),
// //     imageUrls: "https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?w=700&auto=format&fit=crop&q=80",
// //   },
// //   {
// //     _id: "demo-medical-2",
// //     title: "Children's Health Day",
// //     description: "Pediatric health check-ups, vaccinations, and nutrition counseling for children under 10.",
// //     eventType: "medical_aid",
// //     status: "upcoming",
// //     isActive: true,
// //     eventDate: new Date(Date.now() + 21 * 86400000).toISOString(),
// //     startDate: new Date(Date.now() + 21 * 86400000).toISOString(),
// //     endDate: new Date(Date.now() + 21 * 86400000 + 5 * 3600000).toISOString(),
// //     location: "Yekatit 12 Hospital",
// //     participantCount: 150,
// //     collectedAmount: 0,
// //     createdAt: new Date().toISOString(),
// //     imageUrls: "https://images.unsplash.com/photo-1576765608866-5b51046452be?w=700&auto=format&fit=crop&q=80",
// //   },
// //   {
// //     _id: "demo-job-1",
// //     title: "Job Skills Workshop",
// //     description: "Workshop teaching essential job skills including resume writing, interview techniques, and vocational training.",
// //     eventType: "job_opportunity",
// //     status: "upcoming",
// //     isActive: true,
// //     eventDate: new Date(Date.now() + 17 * 86400000).toISOString(),
// //     startDate: new Date(Date.now() + 17 * 86400000).toISOString(),
// //     endDate: new Date(Date.now() + 17 * 86400000 + 4 * 3600000).toISOString(),
// //     location: "Amana Education Center",
// //     participantCount: 45,
// //     collectedAmount: 0,
// //     createdAt: new Date().toISOString(),
// //     imageUrls: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=700&auto=format&fit=crop&q=80",
// //   },
// //   {
// //     _id: "demo-job-2",
// //     title: "Career Counseling & Mentorship",
// //     description: "One-on-one career counseling and mentorship sessions with industry professionals to guide job seekers.",
// //     eventType: "job_opportunity",
// //     status: "upcoming",
// //     isActive: true,
// //     eventDate: new Date(Date.now() + 24 * 86400000).toISOString(),
// //     startDate: new Date(Date.now() + 24 * 86400000).toISOString(),
// //     endDate: new Date(Date.now() + 24 * 86400000 + 3 * 3600000).toISOString(),
// //     location: "Amana Career Center",
// //     participantCount: 60,
// //     collectedAmount: 0,
// //     createdAt: new Date().toISOString(),
// //     imageUrls: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=700&auto=format&fit=crop&q=80",
// //   },
// // ];

// const API_CATEGORY_MAP: Record<string, FilterCategory> = {
//   food_package: "Food Aid",
//   medical_aid: "Medical",
//   job_opportunity: "Job Support",
// };

// function getCategory(eventType: string): FilterCategory {
//   return API_CATEGORY_MAP[eventType] ?? "All Events";
// }

// function getCategoryColor(eventType: string) {
//   const colors: Record<string, string> = {
//     food_package: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
//     medical_aid: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
//     job_opportunity: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
//     distribution: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-800",
//     fundraising: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
//     awareness: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800",
//     other: "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700",
//   };
//   return colors[eventType] || colors.other;
// }

// function formatDate(dateStr?: string) {
//   if (!dateStr) return { day: "--", month: "", full: "Date TBD", time: "" };
//   const d = new Date(dateStr);
//   if (isNaN(d.getTime())) return { day: "--", month: "", full: "Date TBD", time: "" };
//   return {
//     day: d.getDate().toString().padStart(2, "0"),
//     month: d.toLocaleString("en-US", { month: "short" }),
//     full: d.toLocaleDateString("en-US", {
//       weekday: "long",
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     }),
//     time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
//   };
// }

// function formatTimeRange(startDate?: string, endDate?: string): string {
//   const start = formatDate(startDate);
//   const end = formatDate(endDate);
//   if (!start.time) return "";
//   if (end.time && endDate !== startDate) {
//     return `${start.time} - ${end.time}`;
//   }
//   return start.time;
// }

// function formatAttendees(count?: number): string {
//   if (count === undefined || count === null) return "";
//   return `${count} Expected Attendees`;
// }

// function getImageUrl(event: Event): string | null {
//   if (event.imageUrls) {
//     const urls = event.imageUrls.split(",").map((u) => u.trim()).filter(Boolean);
//     if (urls.length > 0) return urls[0];
//   }
//   return null;
// }

// export default function Events() {
//   const { t } = useTranslation();
//   const [filter, setFilter] = useState<FilterCategory>("All Events");
//   const sectionRef = useRef<HTMLElement>(null);
//   // const tabRefs = useRef<Partial<Record<FilterCategory, HTMLButtonElement>>>({});
//   // const tabsRowRef = useRef<HTMLDivElement>(null);
//   // const indicatorRef = useRef<HTMLDivElement>(null);
//   // const isFirstRun = useRef(true);

//   useScrollReveal(sectionRef, [filter]);

//   // const { data, isLoading, error } = useQuery({
//   //   queryKey: ["public-events"],
//   //   queryFn: async () => {
//   //     const response = await eventApi.getAll({ limit: 50 });
//   //     console.log(response.data)
//   //     return response.data;
//   //   },
//   //   staleTime: 5 * 60 * 1000,
//   //   gcTime: 30 * 60 * 1000,
//   // });
//   const { data, isLoading, error } = useQuery({
//       queryKey: ['events'],
//       queryFn: async () => {
//         const params: any = { page: 1, limit: 10 };
//          params.status = 'ongoing';
        
//         const response = await eventApi.getAll(params);
//         console.log(response.data)
//         return response?.data[0];
//       },
//       staleTime: 5 * 60 * 1000,
//       gcTime: 30 * 60 * 1000,
//       refetchOnWindowFocus: false,
//   });

//   const raw = data;
//   const paginated = Array.isArray(raw) ? raw[0] : raw;

//   const allEvents: Event[] = useMemo(
//     () => {
//       const apiEvents = (paginated?.data ?? []).filter(
//         (e: Event) => e.isActive !== false && ["upcoming", "ongoing"].includes(e.status)
//       );
//       return apiEvents.length > 0 ? apiEvents : DEMO_EVENTS;
//     },
//     [paginated]
//   );

//   const sortedEvents = useMemo(
//     () =>
//       [...allEvents].sort((a, b) => {
//         const dateA = new Date(a.eventDate || a.startDate || a.createdAt).getTime();
//         const dateB = new Date(b.eventDate || b.startDate || b.createdAt).getTime();
//         return dateA - dateB;
//       }),
//     [allEvents]
//   );

//   const filtered = useMemo(
//     () =>
//       filter === "All Events"
//         ? sortedEvents
//         : sortedEvents.filter((e) => getCategory(e.eventType) === filter),
//     [sortedEvents, filter]
//   );

//   useEffect(() => {
//     const btn = tabRefs.current[filter];
//     const row = tabsRowRef.current;
//     const indicator = indicatorRef.current;
//     if (!btn || !row || !indicator) return;

//     const rowRect = row.getBoundingClientRect();
//     const btnRect = btn.getBoundingClientRect();
//     const x = btnRect.left - rowRect.left;
//     const width = btnRect.width;

//     if (isFirstRun.current) {
//       gsap.set(indicator, { x, width });
//       isFirstRun.current = false;
//     } else {
//       gsap.to(indicator, { x, width, duration: 0.45, ease: "power3.out" });
//     }
//   }, [filter]);

//   if (isLoading) {
//     return (
//       <>
//         <main>
//           <PageHero
//             title={t("events.title", "Our Events")}
//             description={t("events.description", "Browse our upcoming charity events and join us in making a difference in our community.")}
//             // titleReveal={false}
//             // descReveal={false}
//           />
//           <section className="py-10 sm:py-14 lg:py-16">
//             <div className="container mx-auto px-4 sm:px-6">
//               <div className="flex justify-center mb-8 sm:mb-10">
//                 <div className="flex gap-2 bg-secondary/40 rounded-full p-1">
//                   {[1, 2, 3, 4].map((i) => (
//                     <Skeleton key={i} className="h-10 w-24 rounded-full" />
//                   ))}
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
//                 {[1, 2, 3, 4].map((i) => (
//                   <div key={i} className="rounded-2xl border border-border shadow-sm overflow-hidden">
//                     <Skeleton className="aspect-[16/9] w-full rounded-none" />
//                     <div className="p-5 sm:p-6 space-y-3">
//                       <Skeleton className="h-6 w-3/4" />
//                       <Skeleton className="h-4 w-1/3" />
//                       <Skeleton className="h-4 w-full" />
//                       <Skeleton className="h-4 w-5/6" />
//                       <div className="space-y-2 pt-2">
//                         <Skeleton className="h-4 w-1/2" />
//                         <Skeleton className="h-4 w-2/3" />
//                         <Skeleton className="h-4 w-1/2" />
//                       </div>
//                       <Skeleton className="h-11 w-full rounded-xl mt-4" />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </section>
//         </main>
//       </>
//     );
//   }

//   if (error) {
//     return (
//       <>
//         <main>
//           <PageHero
//             title={t("events.title", "Our Events")}
//             description={t("events.description", "Browse our upcoming charity events and join us in making a difference in our community.")}
//             titleReveal={false}
//             descReveal={false}
//           />
//           <section className="py-10 sm:py-14 lg:py-16">
//             <div className="container mx-auto px-4 sm:px-6 text-center">
//               <p className="text-lg text-muted-foreground mb-4">
//                 {t("events.error", "Unable to load events. Please try again later.")}
//               </p>
//               <Button onClick={() => window.location.reload()}>
//                 {t("events.retry", "Retry")}
//               </Button>
//             </div>
//           </section>
//         </main>
//       </>
//     );
//   }

//   return (
//     <>
//       {/* <Navbar /> */}
//       <main>
//           <PageHero
//             title={t("events.title", "Our Events")}
//             description={t("events.description", "Browse our upcoming charity events and join us in making a difference in our community.")}
//             titleReveal={false}
//             descReveal={false}
//           />

//         <section ref={sectionRef} className="py-10 sm:py-14 lg:py-16">
//           <div className="container mx-auto px-4 sm:px-6">
//             {/* <div className="mb-8 sm:mb-10 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 sm:mx-0 px-4 sm:px-0">
//               <div
//                 ref={tabsRowRef}
//                 className="relative flex flex-nowrap sm:flex-wrap justify-start sm:justify-center gap-1 sm:gap-2 bg-secondary/20 rounded-full p-1 w-max sm:mx-auto"
//               >
//                 <div
//                   ref={indicatorRef}
//                   className="absolute top-1 bottom-1 left-0 rounded-full bg-card shadow-sm"
//                   style={{ width: 0 }}
//                 />
//                 {FILTERS.map((f) => (
//                   <button
//                     key={f}
//                     ref={(el) => {
//                       if (el) tabRefs.current[f] = el;
//                     }}
//                     onClick={() => setFilter(f)}
//                     className={`relative z-10 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
//                       filter === f ? "text-primary" : "text-muted-foreground hover:text-primary"
//                     }`}
//                   >
//                     {t(`events.filter.${f}`, f)}
//                   </button>
//                 ))}
//               </div>
//             </div> */}

//             <div className="mb-10 sm:mb-12">
//   <p className="text-center text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/60 mb-3">
//     {t("events.filterLabel", "Browse by category")}
//   </p>
//   <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 sm:mx-0 px-4 sm:px-0">
//     <div className="flex flex-nowrap sm:flex-wrap justify-start sm:justify-center gap-2 sm:gap-2.5 w-max sm:mx-auto sm:w-auto">
//       {FILTERS.map((f) => {
//         const meta = FILTER_META[f];
//         const Icon = meta.icon;
//         const isActive = filter === f;
//         return (
//           <button
//             key={f}
//             onClick={() => setFilter(f)}
//             aria-pressed={isActive}
//             className={`group inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-300 ease-out ${
//               isActive ? `${meta.activeClass} shadow-sm scale-[1.03]` : `${meta.idleClass} scale-100`
//             }`}
//           >
//             <Icon
//               className={`w-3.5 h-3.5 transition-opacity ${isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`}
//             />
//             <span>{t(`events.filter.${f}`, f)}</span>
//             <span
//               className={`ml-0.5 flex items-center justify-center transition-all duration-300 ${
//                 isActive ? "w-3.5 opacity-100" : "w-0 opacity-0"
//               } overflow-hidden`}
//             >
//               <Check className="w-3 h-3" strokeWidth={3} />
//             </span>
//           </button>
//         );
//       })}
//     </div>
//   </div>
// </div>

//             {filtered.length === 0 ? (
//               <p className="text-center text-muted-foreground py-20">
//                 {t("events.empty", "No events match this category.")}
//               </p>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
//                 {filtered.map((event, i) => {
//                   const imgUrl = getImageUrl(event);
//                   return (
//                     <article
//                       key={event._id}
//                       data-reveal="up"
//                       data-reveal-delay={String((i % 2) * 0.1)}
//                       className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden flex flex-col"
//                     >
//                       <div className="aspect-[16/9] bg-muted relative">
//                         <div className="absolute inset-0 flex items-center justify-center">
//                           <ImageOff className="w-10 h-10 text-muted-foreground/40" />
//                         </div>
//                         {imgUrl && (
//                           <img
//                             src={imgUrl}
//                             alt={event.title}
//                             className="relative w-full h-full object-cover"
//                             onError={(e) => {
//                               (e.target as HTMLImageElement).style.opacity = "0";
//                             }}
//                           />
//                         )}
//                       </div>
//                       <div className="p-5 sm:p-6 flex flex-col flex-1">
//                         <div className="flex items-start justify-between gap-3 mb-2">
//                           <h3 className="font-display text-lg sm:text-xl font-bold leading-snug">{event.title}</h3>
//                           <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border ${getCategoryColor(event.eventType)}`}>
//                             {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
//                           </span>
//                         </div>
//                         {event.description && (
//                           <p className="text-sm text-muted-foreground leading-relaxed mb-4">{event.description}</p>
//                         )}
//                         <div className="space-y-1.5 mb-5 text-sm text-foreground/80">
//                           <div className="flex items-center gap-2">
//                             <Calendar className="w-4 h-4 text-primary shrink-0" />
//                             <span>{formatDate(event.eventDate || event.startDate).full}</span>
//                           </div>
//                           {(event.startDate || event.eventDate) && (
//                             <div className="flex items-center gap-2">
//                               <Clock className="w-4 h-4 text-primary shrink-0" />
//                               <span>{formatTimeRange(event.startDate, event.endDate) || formatDate(event.eventDate).time}</span>
//                             </div>
//                           )}
//                           {event.location && (
//                             <div className="flex items-center gap-2">
//                               <MapPin className="w-4 h-4 text-primary shrink-0" />
//                               <span>{event.location}</span>
//                             </div>
//                           )}
//                           {event.participantCount > 0 && (
//                             <div className="flex items-center gap-2">
//                               <Users className="w-4 h-4 text-primary shrink-0" />
//                               <span>{formatAttendees(event.participantCount)}</span>
//                             </div>
//                           )}
//                         </div>
//                         <Button className="w-full mt-auto h-11 rounded-xl text-sm">
//                           {t("events.learnMore", "Learn More")}
//                         </Button>
//                       </div>
//                     </article>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </section>
//       </main>
//       {/* <Footer /> */}
//     </>
//   );
// }

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer1";
import PageHero from "@/components/landing/PageHero";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { eventApi } from "@/services/api.service";
import type { Event } from "@/types/api";

import {
  Calendar, Clock, MapPin, Users, ImageOff, Check,
  UtensilsCrossed, Stethoscope, Briefcase, LayoutGrid,
  Package, HandCoins, Megaphone, Sparkles,
} from "lucide-react";

const EVENT_TYPE_LABELS: Record<string, string> = {
  food_package: "events.type.food_package",
  medical_aid: "events.type.medical_aid",
  job_opportunity: "events.type.job_opportunity",
  distribution: "events.type.distribution",
  fundraising: "events.type.fundraising",
  awareness: "events.type.awareness",
  other: "events.type.other",
};

type FilterCategory =
  | "All Events"
  | "Food Aid"
  | "Medical"
  | "Job Support"
  | "Distribution"
  | "Fundraising"
  | "Awareness"
  | "Other";

const FILTERS: FilterCategory[] = [
  "All Events",
  "Food Aid",
  "Medical",
  "Job Support",
  "Distribution",
  "Fundraising",
  "Awareness",
  "Other",
];

const FILTER_META: Record<
  FilterCategory,
  { icon: typeof LayoutGrid; activeClass: string; idleClass: string }
> = {
  "All Events": {
    icon: LayoutGrid,
    activeClass: "bg-foreground text-background border-foreground",
    idleClass: "bg-card text-foreground/70 border-border hover:border-foreground/40 hover:text-foreground",
  },
  "Food Aid": {
    icon: UtensilsCrossed,
    activeClass: "bg-emerald-600 text-white border-emerald-600",
    idleClass: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
  },
  Medical: {
    icon: Stethoscope,
    activeClass: "bg-red-600 text-white border-red-600",
    idleClass: "bg-red-50 text-red-700 border-red-200 hover:border-red-400 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
  },
  "Job Support": {
    icon: Briefcase,
    activeClass: "bg-blue-600 text-white border-blue-600",
    idleClass: "bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
  },
  Distribution: {
    icon: Package,
    activeClass: "bg-teal-600 text-white border-teal-600",
    idleClass: "bg-teal-50 text-teal-700 border-teal-200 hover:border-teal-400 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-800",
  },
  Fundraising: {
    icon: HandCoins,
    activeClass: "bg-amber-600 text-white border-amber-600",
    idleClass: "bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-400 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
  },
  Awareness: {
    icon: Megaphone,
    activeClass: "bg-violet-600 text-white border-violet-600",
    idleClass: "bg-violet-50 text-violet-700 border-violet-200 hover:border-violet-400 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800",
  },
  Other: {
    icon: Sparkles,
    activeClass: "bg-gray-600 text-white border-gray-600",
    idleClass: "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700",
  },
};

const DEMO_EVENTS: Event[] = [
  {
    _id: "demo-food-1",
    title: "Monthly Food Package Distribution",
    description: "Monthly distribution of nutritious food packages to registered families in need across the community.",
    eventType: "food_package",
    status: "upcoming",
    isActive: true,
    eventDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    startDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 7 * 86400000 + 4 * 3600000).toISOString(),
    location: "Addis Ababa Community Center",
    participantCount: 120,
    collectedAmount: 0,
    createdAt: new Date().toISOString(),
    imageUrls: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=700&auto=format&fit=crop&q=80",
  },
  {
    _id: "demo-food-2",
    title: "Emergency Food Aid Distribution",
    description: "Emergency food packages for families affected by recent economic hardships in the Merkato area.",
    eventType: "food_package",
    status: "upcoming",
    isActive: true,
    eventDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    startDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 14 * 86400000 + 4 * 3600000).toISOString(),
    location: "Merkato Market Area",
    participantCount: 200,
    collectedAmount: 0,
    createdAt: new Date().toISOString(),
    imageUrls: "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=700&auto=format&fit=crop&q=80",
  },
  {
    _id: "demo-medical-1",
    title: "Free Medical Checkup Camp",
    description: "Free medical checkups including basic tests, consultations, and medicine distribution for all ages.",
    eventType: "medical_aid",
    status: "upcoming",
    isActive: true,
    eventDate: new Date(Date.now() + 10 * 86400000).toISOString(),
    startDate: new Date(Date.now() + 10 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 10 * 86400000 + 7 * 3600000).toISOString(),
    location: "St. Paul's Hospital",
    participantCount: 85,
    collectedAmount: 0,
    createdAt: new Date().toISOString(),
    imageUrls: "https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?w=700&auto=format&fit=crop&q=80",
  },
  {
    _id: "demo-medical-2",
    title: "Children's Health Day",
    description: "Pediatric health check-ups, vaccinations, and nutrition counseling for children under 10.",
    eventType: "medical_aid",
    status: "upcoming",
    isActive: true,
    eventDate: new Date(Date.now() + 21 * 86400000).toISOString(),
    startDate: new Date(Date.now() + 21 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 21 * 86400000 + 5 * 3600000).toISOString(),
    location: "Yekatit 12 Hospital",
    participantCount: 150,
    collectedAmount: 0,
    createdAt: new Date().toISOString(),
    imageUrls: "https://images.unsplash.com/photo-1576765608866-5b51046452be?w=700&auto=format&fit=crop&q=80",
  },
  {
    _id: "demo-job-1",
    title: "Job Skills Workshop",
    description: "Workshop teaching essential job skills including resume writing, interview techniques, and vocational training.",
    eventType: "job_opportunity",
    status: "upcoming",
    isActive: true,
    eventDate: new Date(Date.now() + 17 * 86400000).toISOString(),
    startDate: new Date(Date.now() + 17 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 17 * 86400000 + 4 * 3600000).toISOString(),
    location: "Amana Education Center",
    participantCount: 45,
    collectedAmount: 0,
    createdAt: new Date().toISOString(),
    imageUrls: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=700&auto=format&fit=crop&q=80",
  },
  {
    _id: "demo-job-2",
    title: "Career Counseling & Mentorship",
    description: "One-on-one career counseling and mentorship sessions with industry professionals to guide job seekers.",
    eventType: "job_opportunity",
    status: "upcoming",
    isActive: true,
    eventDate: new Date(Date.now() + 24 * 86400000).toISOString(),
    startDate: new Date(Date.now() + 24 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 24 * 86400000 + 3 * 3600000).toISOString(),
    location: "Amana Career Center",
    participantCount: 60,
    collectedAmount: 0,
    createdAt: new Date().toISOString(),
    imageUrls: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=700&auto=format&fit=crop&q=80",
  },
];

const API_CATEGORY_MAP: Record<string, FilterCategory> = {
  food_package: "Food Aid",
  medical_aid: "Medical",
  job_opportunity: "Job Support",
  distribution: "Distribution",
  fundraising: "Fundraising",
  awareness: "Awareness",
  other: "Other",
};

function getCategory(eventType: string): FilterCategory {
  return API_CATEGORY_MAP[eventType] ?? "Other";
}

function getCategoryColor(eventType: string) {
  const colors: Record<string, string> = {
    food_package: "text-emerald-800 border-emerald-200 dark:text-emerald-400 dark:border-emerald-400",
    medical_aid: "text-red-800 border-red-200 dark:text-red-400 dark:border-red-400",
    job_opportunity: "text-blue-800 border-blue-200 dark:text-blue-400 dark:border-blue-400",
    distribution: "text-teal-800 border-teal-200 dark:text-teal-400 dark:border-teal-400",
    fundraising: "text-amber-800 border-amber-200 dark:text-amber-400 dark:border-amber-400",
    awareness: "text-violet-800 border-violet-200 dark:text-violet-400 dark:border-violet-400",
    other: "text-gray-700 border-gray-200 dark:text-gray-400 dark:border-gray-400",
  };
  return colors[eventType] || colors.other;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return { day: "--", month: "", full: "Date TBD", time: "" };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { day: "--", month: "", full: "Date TBD", time: "" };
  return {
    day: d.getDate().toString().padStart(2, "0"),
    month: d.toLocaleString("en-US", { month: "short" }),
    full: d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  };
}

function formatTimeRange(startDate?: string, endDate?: string): string {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  if (!start.time) return "";
  if (end.time && endDate !== startDate) {
    return `${start.time} - ${end.time}`;
  }
  return start.time;
}

function formatAttendees(count?: number): string {
  if (count === undefined || count === null) return "";
  return count.toString();
}

function getImageUrl(event: Event): string | null {
  if (event.imageUrls) {
    const urls = event.imageUrls.split(",").map((u) => u.trim()).filter(Boolean);
    if (urls.length > 0) return urls[0];
  }
  return null;
}

export default function Events() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterCategory>("All Events");
  const sectionRef = useRef<HTMLElement>(null);

  useScrollReveal(sectionRef, [filter]);

  const { data, isLoading, error } = useQuery({
      queryKey: ['events'],
      queryFn: async () => {
        const params: any = { page: 1, limit: 10 };
        params.status = 'ongoing';

        const response = await eventApi.getAll(params);
        console.log(response.data)
        return response?.data[0];
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
  });

  const raw = data;
  const paginated = Array.isArray(raw) ? raw[0] : raw;

  const allEvents: Event[] = useMemo(
    () => {
      const apiEvents = (paginated?.data ?? []).filter(
        (e: Event) => e.isActive !== false && ["upcoming", "ongoing"].includes(e.status)
      );
      return apiEvents.length > 0 ? apiEvents : DEMO_EVENTS;
    },
    [paginated]
  );

  const sortedEvents = useMemo(
    () =>
      [...allEvents].sort((a, b) => {
        const dateA = new Date(a.eventDate || a.startDate || a.createdAt).getTime();
        const dateB = new Date(b.eventDate || b.startDate || b.createdAt).getTime();
        return dateA - dateB;
      }),
    [allEvents]
  );

  const filtered = useMemo(
    () =>
      filter === "All Events"
        ? sortedEvents
        : sortedEvents.filter((e) => getCategory(e.eventType) === filter),
    [sortedEvents, filter]
  );

  return (
    <>
      <main>
        <PageHero
          title={t("events.title", "Our Events")}
          description={t("events.description", "Browse our upcoming charity events and join us in making a difference in our community.")}
        />

        {isLoading ? (
          <section className="py-10 sm:py-14 lg:py-16">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="flex justify-center mb-8 sm:mb-10">
                <div className="bg-muted/40 dark:bg-transparent rounded-2xl p-2 sm:p-2.5 max-w-xl w-full">
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
                    <Skeleton className="h-8 sm:h-10 w-20 sm:w-24 rounded-full" />
                    <Skeleton className="h-8 sm:h-10 w-24 sm:w-28 rounded-full" />
                    <Skeleton className="h-8 sm:h-10 w-20 sm:w-24 rounded-full" />
                    <Skeleton className="h-8 sm:h-10 w-28 sm:w-32 rounded-full" />
                    <Skeleton className="h-8 sm:h-10 w-24 sm:w-28 rounded-full" />
                    <Skeleton className="h-8 sm:h-10 w-20 sm:w-24 rounded-full" />
                    <Skeleton className="h-8 sm:h-10 w-24 sm:w-28 rounded-full" />
                    <Skeleton className="h-8 sm:h-10 w-28 sm:w-32 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-2xl border border-border shadow-sm overflow-hidden">
                    <Skeleton className="aspect-[16/9] w-full rounded-none" />
                    <div className="p-5 sm:p-6 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <div className="space-y-2 pt-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <Skeleton className="h-11 w-full rounded-xl mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : error ? (
          <section className="py-10 sm:py-14 lg:py-16">
            <div className="container mx-auto px-4 sm:px-6 text-center">
              <p className="text-lg text-muted-foreground mb-4">
                {t("events.error", "Unable to load events. Please try again later.")}
              </p>
              <Button onClick={() => window.location.reload()}>
                {t("events.retry", "Retry")}
              </Button>
            </div>
          </section>
        ) : (
          <section ref={sectionRef} className="py-10 sm:py-14 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            {/* OLD: horizontally scrollable pills — kept for easy revert */}
            {/* <div className="mb-10 sm:mb-12">
              <p className="text-center text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/60 mb-3">
                {t("events.filterLabel", "Browse by category")}
              </p>
              <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 sm:mx-0 px-4 sm:px-0">
                <div className="flex flex-nowrap sm:flex-wrap justify-start sm:justify-center gap-2 sm:gap-2.5 w-max sm:mx-auto sm:w-auto">
                  {FILTERS.map((f) => {
                    const meta = FILTER_META[f];
                    const Icon = meta.icon;
                    const isActive = filter === f;
                    return (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        aria-pressed={isActive}
                        className={`group inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-300 ease-out ${
                          isActive ? `${meta.activeClass} shadow-sm scale-[1.03]` : `${meta.idleClass} scale-100`
                        }`}
                      >
                        <Icon
                          className={`w-3.5 h-3.5 transition-opacity ${isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`}
                        />
                        <span>{t(`events.filter.${f}`, f)}</span>
                        <span
                          className={`ml-0.5 flex items-center justify-center transition-all duration-300 ${
                            isActive ? "w-3.5 opacity-100" : "w-0 opacity-0"
                          } overflow-hidden`}
                        >
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div> */}

            {/* V1: horizontally scrollable pills — kept for easy revert */}
            {/* <div className="mb-10 sm:mb-12">
              <p className="text-center text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/60 mb-3">
                {t("events.filterLabel", "Browse by category")}
              </p>
              <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 sm:mx-0 px-4 sm:px-0">
                <div className="flex flex-nowrap sm:flex-wrap justify-start sm:justify-center gap-2 sm:gap-2.5 w-max sm:mx-auto sm:w-auto">
                  {FILTERS.map((f) => {
                    const meta = FILTER_META[f];
                    const Icon = meta.icon;
                    const isActive = filter === f;
                    return (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        aria-pressed={isActive}
                        className={`group inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-300 ease-out ${
                          isActive ? `${meta.activeClass} shadow-sm scale-[1.03]` : `${meta.idleClass} scale-100`
                        }`}
                      >
                        <Icon
                          className={`w-3.5 h-3.5 transition-opacity ${isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`}
                        />
                        <span>{t(`events.filter.${f}`, f)}</span>
                        <span
                          className={`ml-0.5 flex items-center justify-center transition-all duration-300 ${
                            isActive ? "w-3.5 opacity-100" : "w-0 opacity-0"
                          } overflow-hidden`}
                        >
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div> */}

            {/* V2: stacked pills that wrap naturally on smaller viewports */}
            {/* <div className="mb-10 sm:mb-12">
              <p className="text-center text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/60 mb-4 sm:mb-3">
                {t("events.filterLabel", "Browse by category")}
              </p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 max-w-3xl mx-auto px-2 sm:px-0">
                {FILTERS.map((f) => {
                  const meta = FILTER_META[f];
                  const Icon = meta.icon;
                  const isActive = filter === f;
                  return (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      aria-pressed={isActive}
                      className={`group inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-300 ease-out ${
                        isActive ? `${meta.activeClass} shadow-sm scale-[1.03]` : `${meta.idleClass} scale-100`
                      }`}
                    >
                      <Icon
                        className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-opacity ${isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`}
                      />
                      <span>{t(`events.filter.${f}`, f)}</span>
                      <span
                        className={`ml-0.5 flex items-center justify-center transition-all duration-300 ${
                          isActive ? "w-3.5 opacity-100" : "w-0 opacity-0"
                        } overflow-hidden`}
                      >
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" strokeWidth={3} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div> */}

            {/* V3: stacked pills — light mode optimised */}
            <div className="mb-10 sm:mb-12">
              <p className="text-center text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/60 mb-4 sm:mb-3">
                {t("events.filterLabel", "Browse by category")}
              </p>
              <div className="bg-muted/40 dark:bg-transparent rounded-2xl p-2 sm:p-2.5">
                <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 max-w-3xl mx-auto">
                  {FILTERS.map((f) => {
                    const meta = FILTER_META[f];
                    const Icon = meta.icon;
                    const isActive = filter === f;
                    return (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        aria-pressed={isActive}
                        className={`group inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-300 ease-out ${
                          isActive ? `${meta.activeClass} shadow-md scale-[1.03]` : `${meta.idleClass} bg-white dark:bg-transparent shadow-sm scale-100`
                        }`}
                      >
                        <Icon
                          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-opacity ${isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}
                        />
                        <span>{t(`events.filter.${f}`, f)}</span>
                        <span
                          className={`ml-0.5 flex items-center justify-center transition-all duration-300 ${
                            isActive ? "w-3.5 opacity-100" : "w-0 opacity-0"
                          } overflow-hidden`}
                        >
                          <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" strokeWidth={3} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-20">
                {t("events.empty", "No events match this category.")}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {filtered.map((event, i) => {
                  const imgUrl = getImageUrl(event);
                  return (
                    <article
                      key={event._id}
                      data-reveal="up"
                      data-reveal-delay={String((i % 2) * 0.1)}
                      className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden flex flex-col"
                    >
                      <div className="aspect-[16/9] bg-muted relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageOff className="w-10 h-10 text-muted-foreground/40" />
                        </div>
                        {imgUrl && (
                          <img
                            src={imgUrl}
                            alt={event.title}
                            loading="lazy"
                            decoding="async"
                            className="relative w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.opacity = "0";
                            }}
                          />
                        )}
                      </div>
                      <div className="p-5 sm:p-6 flex flex-col flex-1">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-display text-lg sm:text-xl font-bold leading-snug">{event.title}</h3>
                          <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border bg-white dark:bg-transparent shadow-sm ${getCategoryColor(event.eventType)}`}>
                            {t(EVENT_TYPE_LABELS[event.eventType] || `events.type.${event.eventType}`)}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{event.description}</p>
                        )}
                        <div className="space-y-1.5 mb-5 text-sm text-foreground/80">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary shrink-0" />
                            <span>{formatDate(event.eventDate || event.startDate).full}</span>
                          </div>
                          {(event.startDate || event.eventDate) && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary shrink-0" />
                              <span>{formatTimeRange(event.startDate, event.endDate) || formatDate(event.eventDate).time}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary shrink-0" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          {event.participantCount > 0 && (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-primary shrink-0" />
                              <span>
                                {formatAttendees(event.participantCount)
                                  ? t("events.expectedAttendees", "{{count}} Expected Attendees", { count: event.participantCount })
                                  : ""}
                              </span>
                            </div>
                          )}
                        </div>
                        <Button className="w-full mt-auto h-11 rounded-xl text-sm">
                          {t("events.learnMore", "Learn More")}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
          
        </section>
        )}
        </main>
    </>
             
  );
}