// import { useRef } from "react";
// import { Link } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import { ArrowUpRight } from "lucide-react";
// import { useQuery } from "@tanstack/react-query";
// import { useScrollReveal } from "@/hooks/useScrollReveal";
// import SectionHeading from "./SectionHeading1";
// import { donorApi } from "@/services/api.service";
// import type { Donor } from "@/types/api";

// // ─── Placeholder registry ──────────────────────────────────────────────────
// // Every name below is invented. None reproduce a real organization's brand,
// // wordmark, or protected emblem (e.g. no "Red Cross/Crescent", "UNICEF",
// // "WFP" — those are real, some legally protected, and using them here would
// // falsely imply an actual partnership). Swap this array for verified partner
// // data before shipping; the footer note below says so explicitly so nobody
// // mistakes the placeholders for real claims.
// interface Partner {
//   id: string;
//   glyph: string; // 2–3 letter mark, sits in the small badge
//   logo?: string; // logo image URL (org / embassy donors)
//   name: string;
//   sinceYear: string;
//   category: string;
//   isPlaceholder: boolean;
// }

// const PLACEHOLDERS: Partner[] = [
//   {
//     id: "horizon-crescent",
//     glyph: "HC",
//     name: "Horizon Crescent",
//     sinceYear: "1935",
//     category: "Emergency relief",
//     isPlaceholder: true,
//   },
//   {
//     id: "children-first-trust",
//     glyph: "CF",
//     name: "Children First Trust",
//     sinceYear: "1952",
//     category: "Child welfare",
//     isPlaceholder: true,
//   },
//   {
//     id: "mercy-field",
//     glyph: "MF",
//     name: "Mercy Field",
//     sinceYear: "1998",
//     category: "Medical aid",
//     isPlaceholder: true,
//   },
//   {
//     id: "wellspring-foodline",
//     glyph: "WF",
//     name: "Wellspring Foodline",
//     sinceYear: "1961",
//     category: "Food distribution",
//     isPlaceholder: true,
//   },
//   {
//     id: "givehope-intl",
//     glyph: "GH",
//     name: "GiveHope Intl.",
//     sinceYear: "2004",
//     category: "Education fund",
//     isPlaceholder: true,
//   },
//   {
//     id: "clean-water-corps",
//     glyph: "CW",
//     name: "Clean Water Corps",
//     sinceYear: "2011",
//     category: "WASH programs",
//     isPlaceholder: true,
//   },
// ];

// const MAX_PARTNERS = 6;

// function glyphFromName(name: string): string {
//   const words = name.trim().split(/\s+/).filter(Boolean);
//   if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
//   return (words[0][0] + words[1][0]).toUpperCase();
// }

// function donorToPartner(donor: Donor): Partner {
//   const API_URL = import.meta.env.VITE_API_URL ?? "";
//   const logo = donor.avatar
//     ? donor.avatar.startsWith("http")
//       ? donor.avatar
//       : `${API_URL}${donor.avatar}`
//     : undefined;
//   const year = donor.establishmentDate
//     ? new Date(donor.establishmentDate).getFullYear().toString()
//     : new Date(donor.registeredAt || donor.createdAt).getFullYear().toString();
//   return {
//     id: donor.id,
//     glyph: glyphFromName(donor.name),
//     logo,
//     name: donor.name,
//     sinceYear: year,
//     category: donor.primaryAid
//       ? donor.primaryAid.replace(/_/g, " ")
//       : "Partner",
//     isPlaceholder: false,
//   };
// }

// // Interleave real donors with placeholders so real partners lead but total
// // always reaches MAX_PARTNERS (filling the gap with placeholders).
// function buildPartnerList(donors: Donor[] | undefined): Partner[] {
//   const real = (donors ?? []).map(donorToPartner);
//   const realCount = Math.min(real.length, MAX_PARTNERS);
//   const realSlice = real.slice(0, realCount);
//   const needed = MAX_PARTNERS - realSlice.length;

//   const result: Partner[] = [];
//   const placeholderPool = [...PLACEHOLDERS];
//   let remaining = needed;
//   for (let i = 0; i < MAX_PARTNERS; i++) {
//     if (i < realSlice.length) {
//       result.push(realSlice[i]);
//     } else if (remaining > 0 && placeholderPool.length > 0) {
//       result.push(placeholderPool.shift()!);
//       remaining--;
//     }
//   }
//   return result;
// }

// function PartnerRow({ partner, index }: { partner: Partner; index: number }) {
//   const { t } = useTranslation();
//   const order = String(index + 1).padStart(2, "0");

//   const categoryLabel = partner.isPlaceholder
//     ? partner.category
//     : t(`partners.aid.${partner.category.replace(/\s+/g, "_")}`, partner.category);

//   return (
//     <div
//       data-reveal="up"
//       data-reveal-delay={String(Math.min(index * 0.06, 0.36))}
//       className="group relative grid grid-cols-[32px_1fr_auto] sm:grid-cols-[48px_1fr_auto_140px_20px] items-center gap-4 sm:gap-6 py-5 sm:py-6 border-b border-border first:border-t border-t-border cursor-default"
//     >
//       {/* Sweep-in underline on hover */}
//       <span
//         aria-hidden="true"
//         className="absolute left-0 -bottom-px h-px w-0 bg-primary transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"
//       />

//       {/* Index */}
//       <span className="font-mono text-[11px] tabular-nums text-muted-foreground/50">
//         {order}
//       </span>

//       {/* Wordmark */}
//       <div className="flex items-center gap-3 min-w-0">
//         {partner.logo ? (
//           <img
//             src={partner.logo}
//             alt={partner.name}
//             className="w-7 h-7 sm:w-[30px] sm:h-[30px] rounded-[7px] object-cover shrink-0 bg-muted"
//           />
//         ) : (
//           <div className="w-7 h-7 sm:w-[30px] sm:h-[30px] rounded-[7px] flex items-center justify-center shrink-0 bg-foreground text-background text-[11px] sm:text-[13px] font-bold transition-[background-color,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-primary group-hover:-rotate-6 group-hover:scale-105">
//             {partner.glyph}
//           </div>
//         )}
//         <span className="font-display font-extrabold tracking-[-0.02em] text-[clamp(1.05rem,2.2vw,1.5rem)] leading-none truncate transition-colors duration-300 group-hover:text-primary">
//           {partner.name}
//         </span>
//       </div>

//       {/* Since year — visible on mobile too, sits right-aligned before the hidden columns kick in */}
//       <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 whitespace-nowrap justify-self-end sm:hidden">
//         {partner.sinceYear}
//       </span>

//       {/* Since year — desktop column position */}
//       <span className="hidden sm:block font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/55 whitespace-nowrap justify-self-end">
//         {t("partners.since", "Est. {{year}}", { year: partner.sinceYear })}
//       </span>

//       {/* Category — reveals on hover, desktop only */}
//       <span className="hidden sm:block text-xs text-muted-foreground text-right opacity-0 translate-x-2 transition-[opacity,transform] duration-300 group-hover:opacity-100 group-hover:translate-x-0">
//         {categoryLabel}
//       </span>

//       {/* Arrow — reveals on hover, desktop only */}
//       <ArrowUpRight
//         aria-hidden="true"
//         className="hidden sm:block w-4 h-4 text-primary opacity-0 -translate-x-1.5 translate-y-1.5 transition-[opacity,transform] duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0"
//       />
//     </div>
//   );
// }

// export default function PartnersSection() {
//   const { t } = useTranslation();
//   const sectionRef = useRef<HTMLElement>(null);
//   useScrollReveal(sectionRef);

//   const { data, isLoading, isError } = useQuery({
//     queryKey: ["landing-partners"],
//     queryFn: async () => {
//       const response = await donorApi.getAll({
//         donorType: "Organization,Embassy",
//         limit: MAX_PARTNERS,
//       });
//       // Backend returns an array whose first element holds { data, pagination }.
//       const payload = Array.isArray(response?.data)
//         ? response.data[0]
//         : response?.data;
//       return (payload?.data ?? []) as Donor[];
//     },
//     staleTime: 5 * 60 * 1000,
//     refetchOnWindowFocus: false,
//   });

//   const partners =
//     isLoading || isError ? PLACEHOLDERS.slice(0, MAX_PARTNERS) : buildPartnerList(data);

//   return (
//     <section
//       id="partners"
//       ref={sectionRef}
//       className="py-14 sm:py-20 lg:py-24"
//     >
//       <div className="container mx-auto px-4 sm:px-6">
//         <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 sm:mb-12 pb-8 border-b border-border">
//           <SectionHeading
//             kicker={t("partners.kicker", "Verified partners")}
//             title={t(
//               "partners.title",
//               "Organizations working alongside us on the ground"
//             )}
//             className="!max-w-xl"
//           />
//           <div
//             data-reveal="up"
//             className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 sm:text-right shrink-0"
//           >
//             <span className="block text-xs font-semibold tracking-[0.05em] text-foreground mb-1">
//               {t("partners.countLabel", "{{count}} active", { count: partners.length })}
//             </span>
//             {t("partners.registryLabel", "Registry / Addis Ababa")}
//           </div>
//         </div>

//         <div className="flex flex-col">
//           {partners.map((partner, i) => (
//             <PartnerRow key={partner.id} partner={partner} index={i} />
//           ))}
//         </div>

//         <div
//           data-reveal="up"
//           className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8 sm:mt-10"
//         >
//           <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-[46ch]">
//             {t(
//               "partners.disclaimer",
//               "Working with organizations trusted across Addis Ababa's aid network."
//             )}
//           </p>
//           <Link
//             to="/contact"
//             className="inline-flex items-center gap-1.5 font-semibold text-sm text-foreground hover:text-primary transition-colors shrink-0"
//           >
//             {t("partners.cta", "Partnership inquiries")}
//             <ArrowUpRight className="w-4 h-4" />
//           </Link>
//         </div>
//       </div>
//     </section>
//   );
// }

// import { useEffect, useRef, useState } from "react";
// import { Link } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import gsap from "gsap";
// import { ArrowUpRight } from "lucide-react";
// import { useScrollReveal } from "@/hooks/useScrollReveal";
// import SectionHeading from "./SectionHeading1";

// // Real pointer + hover capability, not a viewport-width guess — a wide
// // touchscreen (tablet, touch laptop) would pass a `sm:` breakpoint but still
// // has no true hover to key an interaction off of.
// const canHover =
//   typeof window !== "undefined" &&
//   window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// // Restricted to uppercase only — a full alnum jumble reads as noisy against
// // font-extrabold display type; this reads closer to a redacted/decoding mark.
// const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// // ─── Placeholder registry ──────────────────────────────────────────────────
// // Every name below is invented; none reproduce a real organization's brand,
// // wordmark, or protected emblem. imageUrl is populated on a few entries to
// // demonstrate the API-image path — leave it out (or let it fail to load) and
// // the row falls back to the glyph badge automatically.
// interface Partner {
//   id: string;
//   glyph: string; // fallback mark, always present
//   imageUrl?: string; // from the partner API; absent → glyph badge shows instead
//   nameKey: string;
//   nameFallback: string;
//   sinceYear: string;
//   categoryKey: string;
//   categoryFallback: string;
// }

// const PARTNERS: Partner[] = [
//   {
//     id: "horizon-crescent",
//     glyph: "HC",
//     imageUrl:
//       "https://images.unsplash.com/photo-1518281420975-50db6e5d0a97?w=200&auto=format&fit=crop&q=80",
//     nameKey: "partners.org1.name",
//     nameFallback: "Horizon Crescent",
//     sinceYear: "1935",
//     categoryKey: "partners.org1.category",
//     categoryFallback: "Emergency relief",
//   },
//   {
//     id: "children-first-trust",
//     glyph: "CF",
//     nameKey: "partners.org2.name",
//     nameFallback: "Children First Trust",
//     sinceYear: "1952",
//     categoryKey: "partners.org2.category",
//     categoryFallback: "Child welfare",
//   },
//   {
//     id: "mercy-field",
//     glyph: "MF",
//     imageUrl:
//       "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&auto=format&fit=crop&q=80",
//     nameKey: "partners.org3.name",
//     nameFallback: "Mercy Field",
//     sinceYear: "1998",
//     categoryKey: "partners.org3.category",
//     categoryFallback: "Medical aid",
//   },
//   {
//     id: "wellspring-foodline",
//     glyph: "WF",
//     nameKey: "partners.org4.name",
//     nameFallback: "Wellspring Foodline",
//     sinceYear: "1961",
//     categoryKey: "partners.org4.category",
//     categoryFallback: "Food distribution",
//   },
//   {
//     id: "givehope-intl",
//     glyph: "GH",
//     imageUrl:
//       "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=200&auto=format&fit=crop&q=80",
//     nameKey: "partners.org5.name",
//     nameFallback: "GiveHope Intl.",
//     sinceYear: "2004",
//     categoryKey: "partners.org5.category",
//     categoryFallback: "Education fund",
//   },
//   {
//     id: "clean-water-corps",
//     glyph: "CW",
//     nameKey: "partners.org6.name",
//     nameFallback: "Clean Water Corps",
//     sinceYear: "2011",
//     categoryKey: "partners.org6.category",
//     categoryFallback: "WASH programs",
//   },
// ];

// function PartnerRow({ partner, index }: { partner: Partner; index: number }) {
//   const { t } = useTranslation();
//   const order = String(index + 1).padStart(2, "0");
//   const finalName = t(partner.nameKey, partner.nameFallback);
//   const [imgError, setImgError] = useState(false);
//   // Treat a broken URL the same as a missing one — the API contract only
//   // promises "an image may be present," not "it will always resolve."
//   const hasImage = Boolean(partner.imageUrl) && !imgError;

//   const rowRef = useRef<HTMLDivElement>(null);
//   const badgeRef = useRef<HTMLDivElement>(null);
//   const glyphRef = useRef<HTMLSpanElement>(null);
//   const imageRef = useRef<HTMLImageElement>(null);
//   const nameRef = useRef<HTMLSpanElement>(null);
//   const scrambleTween = useRef<gsap.core.Tween | null>(null);

//   useEffect(() => {
//     // No pointer, no interaction to wire up — see the static-image branch in
//     // the JSX below for what non-hover devices see instead.
//     if (!canHover) return;

//     const row = rowRef.current;
//     const badge = badgeRef.current;
//     const glyph = glyphRef.current;
//     const image = imageRef.current;
//     const nameEl = nameRef.current;
//     if (!row || !badge || !glyph || !nameEl) return;

//     // Measured, not hardcoded — respects whatever the current breakpoint's
//     // CSS already set (28px mobile / 30px desktop) instead of a JS constant
//     // that could drift out of sync with the Tailwind classes over time.
//     const restWidth = badge.getBoundingClientRect().width;
//     const hoverWidth = restWidth + 28;

//     if (hasImage && image) gsap.set(image, { opacity: 0, scale: 1.12 });

//     const handleEnter = () => {
//       if (hasImage && image) {
//         gsap.to(badge, {
//           width: hoverWidth,
//           borderRadius: 6,
//           duration: 0.6,
//           ease: "expo.out",
//           overwrite: "auto",
//         });
//         gsap.to(glyph, { opacity: 0, duration: 0.25, ease: "power1.out", overwrite: "auto" });
//         gsap.to(image, {
//           opacity: 1,
//           scale: 1,
//           duration: 0.55,
//           delay: 0.1, // box opens, then the picture settles in — not simultaneous
//           ease: "power2.out",
//           overwrite: "auto",
//         });
//       } else {
//         gsap.to(badge, {
//           backgroundColor: "hsl(var(--primary))",
//           rotate: -6,
//           scale: 1.05,
//           duration: 0.5,
//           ease: "expo.out",
//           overwrite: "auto",
//         });
//       }

//       // Left-to-right decode rather than the reference's shuffle-then-snap —
//       // reads as a record resolving character by character, which happens to
//       // land on-theme for a "verified partners" registry. Spaces are excluded
//       // from the character pool so multi-word names don't visually merge.
//       scrambleTween.current?.kill();
//       const state = { progress: 0 };
//       scrambleTween.current = gsap.to(state, {
//         progress: 1,
//         duration: 0.5,
//         ease: "none",
//         onUpdate: () => {
//           const resolved = Math.floor(state.progress * finalName.length);
//           let out = "";
//           for (let i = 0; i < finalName.length; i++) {
//             out +=
//               i < resolved || finalName[i] === " "
//                 ? finalName[i]
//                 : SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0];
//           }
//           nameEl.textContent = out;
//         },
//         onComplete: () => {
//           nameEl.textContent = finalName; // guarantees exact final text, no rounding drift
//         },
//       });
//     };

//     const handleLeave = () => {
//       if (hasImage && image) {
//         gsap.to(badge, {
//           width: restWidth,
//           borderRadius: 7,
//           duration: 0.5,
//           ease: "power3.inOut",
//           overwrite: "auto",
//         });
//         gsap.to(glyph, { opacity: 1, duration: 0.4, delay: 0.15, ease: "power1.out", overwrite: "auto" });
//         gsap.to(image, { opacity: 0, scale: 1.12, duration: 0.35, ease: "power2.in", overwrite: "auto" });
//       } else {
//         gsap.to(badge, {
//           backgroundColor: "hsl(var(--foreground))",
//           rotate: 0,
//           scale: 1,
//           duration: 0.5,
//           ease: "power3.out",
//           overwrite: "auto",
//         });
//       }
//     };

//     row.addEventListener("mouseenter", handleEnter);
//     row.addEventListener("mouseleave", handleLeave);
//     return () => {
//       row.removeEventListener("mouseenter", handleEnter);
//       row.removeEventListener("mouseleave", handleLeave);
//       scrambleTween.current?.kill();
//     };
//   }, [hasImage, finalName]);

//   return (
//     <div
//       ref={rowRef}
//       data-reveal="up"
//       data-reveal-delay={String(Math.min(index * 0.06, 0.36))}
//       className="group relative grid grid-cols-[32px_1fr_auto] sm:grid-cols-[48px_1fr_auto_140px_20px] items-center gap-4 sm:gap-6 py-5 sm:py-6 border-b border-border first:border-t border-t-border cursor-default"
//     >
//       {/* Sweep-in underline on hover — unchanged, still pure CSS */}
//       <span
//         aria-hidden="true"
//         className="absolute left-0 -bottom-px h-px w-0 bg-primary transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"
//       />

//       {/* Index */}
//       <span className="font-mono text-[11px] tabular-nums text-muted-foreground/50">{order}</span>

//       {/* Wordmark — badge morphs glyph↔image on hover (mouse), or shows the
//           real image statically with no animation on touch (no hover to key off) */}
//       <div className="flex items-center gap-3 min-w-0">
//         <div
//           ref={badgeRef}
//           className="relative w-7 h-7 sm:w-[30px] sm:h-[30px] rounded-[7px] shrink-0 bg-foreground overflow-hidden"
//         >
//           <span
//             ref={glyphRef}
//             aria-hidden="true"
//             className="absolute inset-0 flex items-center justify-center text-background text-[11px] sm:text-[13px] font-bold"
//           >
//             {partner.glyph}
//           </span>
//           {hasImage && (
//             <img
//               ref={imageRef}
//               src={partner.imageUrl}
//               alt=""
//               onError={() => setImgError(true)}
//               className={`absolute inset-0 w-full h-full object-cover ${canHover ? "opacity-0" : ""}`}
//             />
//           )}
//         </div>
//         <span
//           ref={nameRef}
//           className="font-display font-extrabold tracking-[-0.02em] text-[clamp(1.05rem,2.2vw,1.5rem)] leading-tight truncate transition-colors duration-300 group-hover:text-primary"
//         >
//           {finalName}
//         </span>
//       </div>

//       {/* Since year */}
//       <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 whitespace-nowrap justify-self-end sm:hidden">
//         {partner.sinceYear}
//       </span>
//       <span className="hidden sm:block font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/55 whitespace-nowrap justify-self-end">
//         {t("partners.since", "Est. {{year}}", { year: partner.sinceYear })}
//       </span>

//       {/* Category — reveals on hover, desktop only */}
//       <span className="hidden sm:block text-xs text-muted-foreground text-right opacity-0 translate-x-2 transition-[opacity,transform] duration-300 group-hover:opacity-100 group-hover:translate-x-0">
//         {t(partner.categoryKey, partner.categoryFallback)}
//       </span>

//       {/* Arrow — reveals on hover, desktop only */}
//       <ArrowUpRight
//         aria-hidden="true"
//         className="hidden sm:block w-4 h-4 text-primary opacity-0 -translate-x-1.5 translate-y-1.5 transition-[opacity,transform] duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0"
//       />
//     </div>
//   );
// }

// export default function PartnersSection() {
//   const { t } = useTranslation();
//   const sectionRef = useRef<HTMLElement>(null);
//   useScrollReveal(sectionRef);

//   return (
//     <section id="partners" ref={sectionRef} className="py-14 sm:py-20 lg:py-24">
//       <div className="container mx-auto px-4 sm:px-6">
//         <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 sm:mb-12 pb-8 border-b border-border">
//           <SectionHeading
//             kicker={t("partners.kicker", "Verified partners")}
//             title={t("partners.title", "Organizations working alongside us on the ground")}
//             className="!max-w-xl"
//           />
//           <div
//             data-reveal="up"
//             className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 sm:text-right shrink-0"
//           >
//             <span className="block text-xs font-semibold tracking-[0.05em] text-foreground mb-1">
//               {t("partners.countLabel", "{{count}} active", { count: PARTNERS.length })}
//             </span>
//             {t("partners.registryLabel", "Registry / Addis Ababa")}
//           </div>
//         </div>

//         <div className="flex flex-col">
//           {PARTNERS.map((partner, i) => (
//             <PartnerRow key={partner.id} partner={partner} index={i} />
//           ))}
//         </div>

//         <div
//           data-reveal="up"
//           className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8 sm:mt-10"
//         >
//           <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-[46ch]">
//             {t(
//               "partners.disclaimer",
//               "Working with organizations trusted across Addis Ababa's aid network."
//             )}
//           </p>
//           <Link
//             to="/contact"
//             className="inline-flex items-center gap-1.5 font-semibold text-sm text-foreground hover:text-primary transition-colors shrink-0"
//           >
//             {t("partners.cta", "Partnership inquiries")}
//             <ArrowUpRight className="w-4 h-4" />
//           </Link>
//         </div>
//       </div>
//     </section>
//   );
// }

// import { useEffect, useRef, useState } from "react";
// import { Link } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import { ArrowUpRight } from "lucide-react";
// import { useScrollReveal } from "@/hooks/useScrollReveal";
// import SectionHeading from "./SectionHeading1";

// const canHover =
//   typeof window !== "undefined" &&
//   window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// interface Partner {
//   id: string;
//   glyph: string;
//   imageUrl?: string;
//   nameKey: string;
//   nameFallback: string;
//   sinceYear: string;
//   categoryKey: string;
//   categoryFallback: string;
// }

// const PARTNERS: Partner[] = [
//   {
//     id: "horizon-crescent",
//     glyph: "HC",
//     imageUrl:
//       "https://images.unsplash.com/photo-1518281420975-50db6e5d0a97?w=800&auto=format&fit=crop&q=80",
//     nameKey: "partners.org1.name",
//     nameFallback: "Horizon Crescent",
//     sinceYear: "1935",
//     categoryKey: "partners.org1.category",
//     categoryFallback: "Emergency relief",
//   },
//   {
//     id: "children-first-trust",
//     glyph: "CF",
//     nameKey: "partners.org2.name",
//     nameFallback: "Children First Trust",
//     sinceYear: "1952",
//     categoryKey: "partners.org2.category",
//     categoryFallback: "Child welfare",
//   },
//   {
//     id: "mercy-field",
//     glyph: "MF",
//     imageUrl:
//       "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop&q=80",
//     nameKey: "partners.org3.name",
//     nameFallback: "Mercy Field",
//     sinceYear: "1998",
//     categoryKey: "partners.org3.category",
//     categoryFallback: "Medical aid",
//   },
//   {
//     id: "wellspring-foodline",
//     glyph: "WF",
//     nameKey: "partners.org4.name",
//     nameFallback: "Wellspring Foodline",
//     sinceYear: "1961",
//     categoryKey: "partners.org4.category",
//     categoryFallback: "Food distribution",
//   },
//   {
//     id: "givehope-intl",
//     glyph: "GH",
//     imageUrl:
//       "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=800&auto=format&fit=crop&q=80",
//     nameKey: "partners.org5.name",
//     nameFallback: "GiveHope Intl.",
//     sinceYear: "2004",
//     categoryKey: "partners.org5.category",
//     categoryFallback: "Education fund",
//   },
//   {
//     id: "clean-water-corps",
//     glyph: "CW",
//     nameKey: "partners.org6.name",
//     nameFallback: "Clean Water Corps",
//     sinceYear: "2011",
//     categoryKey: "partners.org6.category",
//     categoryFallback: "WASH programs",
//   },
// ];

// // function PartnerRow({ partner, index }: { partner: Partner; index: number }) {
// //   const { t } = useTranslation();
// //   const finalName = t(partner.nameKey, partner.nameFallback);
// //   const order = String(index + 1).padStart(2, "0");
// //   const [imgError, setImgError] = useState(false);
// //   const hasImage = Boolean(partner.imageUrl) && !imgError;
// //   const rowRef = useRef<HTMLDivElement>(null);
// //   const intervalRef = useRef<NodeJS.Timeout | null>(null);

// //   // Split the name to sandwich the image exactly like the video. 
// //   // If it's one word (e.g. "Pangram"), we cut it in half.
// //   const words = finalName.split(" ");
// //   let word1 = "";
// //   let word2 = "";
  
// //   if (words.length === 1) {
// //     const half = Math.ceil(finalName.length / 2);
// //     word1 = finalName.slice(0, half);
// //     word2 = finalName.slice(half);
// //   } else {
// //     word1 = words[0];
// //     word2 = words.slice(1).join(" ");
// //   }

// //   useEffect(() => {
// //     if (!canHover) return;
// //     const row = rowRef.current;
// //     if (!row) return;

// //     const handleEnter = () => {
// //       // Prevent re-triggering if already animating
// //       if (row.dataset.animating === "true") return;
// //       row.dataset.animating = "true";

// //       const wordNodes = row.querySelectorAll(".scramble-word");
// //       const originalTexts = [word1, word2];
      
// //       let shuffles = 0;
// //       const maxShuffles = 10;
// //       const intervalDuration = 500 / maxShuffles; // ~50ms per frame

// //       if (intervalRef.current) clearInterval(intervalRef.current);

// //       intervalRef.current = setInterval(() => {
// //         if (shuffles >= maxShuffles) {
// //           clearInterval(intervalRef.current!);
// //           // Restore original words when done
// //           wordNodes.forEach((node, i) => {
// //             node.textContent = originalTexts[i];
// //           });
// //           row.dataset.animating = "false";
// //         } else {
// //           // Generate random string of the exact same length
// //           wordNodes.forEach((node, i) => {
// //             const length = originalTexts[i].length;
// //             let shuffledText = "";
// //             for (let j = 0; j < length; j++) {
// //               // Preserve spaces so multi-word halves don't visually merge
// //               if (originalTexts[i][j] === " ") {
// //                 shuffledText += " ";
// //               } else {
// //                 shuffledText += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
// //               }
// //             }
// //             node.textContent = shuffledText;
// //           });
// //           shuffles++;
// //         }
// //       }, intervalDuration);
// //     };

// //     row.addEventListener("mouseenter", handleEnter);
// //     return () => {
// //       row.removeEventListener("mouseenter", handleEnter);
// //       if (intervalRef.current) clearInterval(intervalRef.current);
// //     };
// //   }, [word1, word2]);

// //   return (
// //     <div
// //       ref={rowRef}
// //       data-reveal="up"
// //       data-reveal-delay={String(Math.min(index * 0.06, 0.36))}
// //       // Maintained your grid structure but increased row padding for the larger typography
// //       className="group relative grid grid-cols-[32px_1fr_auto] sm:grid-cols-[48px_1fr_auto_140px_20px] items-center gap-4 sm:gap-6 py-6 sm:py-8 border-b border-border first:border-t border-t-border cursor-pointer"
// //     >
// //       {/* Sweep-in underline */}
// //       <span
// //         aria-hidden="true"
// //         className="absolute left-0 -bottom-px h-px w-0 bg-primary transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"
// //       />

// //       {/* Index */}
// //       <span className="font-mono text-[11px] tabular-nums text-muted-foreground/50">{order}</span>

// //       {/* Center Action: The Video Trick */}
// //       <div className="flex items-center justify-center gap-2 sm:gap-4 transition-all duration-300 group-hover:gap-5 min-w-0">
        
// //         {/* Left Half */}
// //         <span className="scramble-word flex-1 text-right font-display font-medium uppercase tracking-tight text-3xl sm:text-5xl lg:text-6xl transition-colors duration-300 group-hover:text-primary truncate">
// //           {word1}
// //         </span>

// //         {/* Image Reveal via CSS Flex transition */}
// //         <div 
// //           className="relative h-[36px] sm:h-[60px] lg:h-[70px] w-[60px] sm:w-[100px] lg:w-[125px] overflow-hidden bg-foreground transition-all duration-1000 ease-[cubic-bezier(0.075,0.82,0.165,1)] flex-[0] sm:group-hover:flex-[0.5]"
// //         >
// //           {hasImage ? (
// //             <img
// //               src={partner.imageUrl}
// //               alt=""
// //               onError={() => setImgError(true)}
// //               className={`absolute inset-0 w-full h-full object-cover ${canHover ? "opacity-0 sm:group-hover:opacity-100 transition-opacity duration-700" : ""}`}
// //             />
// //           ) : (
// //             <span className="absolute inset-0 flex items-center justify-center text-background text-sm font-bold">
// //               {partner.glyph}
// //             </span>
// //           )}
// //         </div>

// //         {/* Right Half */}
// //         <span className="scramble-word flex-1 text-left font-display font-medium uppercase tracking-tight text-3xl sm:text-5xl lg:text-6xl transition-colors duration-300 group-hover:text-primary truncate">
// //           {word2}
// //         </span>

// //       </div>

// //       {/* Since year */}
// //       <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 whitespace-nowrap justify-self-end sm:hidden">
// //         {partner.sinceYear}
// //       </span>
// //       <span className="hidden sm:block font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/55 whitespace-nowrap justify-self-end">
// //         {t("partners.since", "Est. {{year}}", { year: partner.sinceYear })}
// //       </span>

// //       {/* Category */}
// //       <span className="hidden sm:block text-xs text-muted-foreground text-right opacity-0 translate-x-2 transition-[opacity,transform] duration-300 group-hover:opacity-100 group-hover:translate-x-0">
// //         {t(partner.categoryKey, partner.categoryFallback)}
// //       </span>

// //       {/* Arrow */}
// //       <ArrowUpRight
// //         aria-hidden="true"
// //         className="hidden sm:block w-5 h-5 text-primary opacity-0 -translate-x-1.5 translate-y-1.5 transition-[opacity,transform] duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0"
// //       />
// //     </div>
// //   );
// // }

// function PartnerRow({ partner, index }: { partner: Partner; index: number }) {
//   const { t } = useTranslation();
//   const finalName = t(partner.nameKey, partner.nameFallback);
//   const order = String(index + 1).padStart(2, "0");
//   const [imgError, setImgError] = useState(false);
//   const hasImage = Boolean(partner.imageUrl) && !imgError;
//   const rowRef = useRef<HTMLDivElement>(null);
//   // const intervalRef = useRef<NodeJS.Timeout | null>(null);
//   const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   // Split the name to sandwich the image exactly like the video
//   const words = finalName.split(" ");
//   let word1 = "";
//   let word2 = "";
  
//   if (words.length === 1) {
//     const half = Math.ceil(finalName.length / 2);
//     word1 = finalName.slice(0, half);
//     word2 = finalName.slice(half);
//   } else {
//     word1 = words[0];
//     word2 = words.slice(1).join(" ");
//   }

//   useEffect(() => {
//     if (!canHover) return;
//     const row = rowRef.current;
//     if (!row) return;

//     const handleEnter = () => {
//       if (row.dataset.animating === "true") return;
//       row.dataset.animating = "true";

//       const wordNodes = row.querySelectorAll(".scramble-word");
//       const originalTexts = [word1, word2];
      
//       let shuffles = 0;
//       const maxShuffles = 10;
//       const intervalDuration = 500 / maxShuffles; 

//       if (intervalRef.current) clearInterval(intervalRef.current);

//       intervalRef.current = setInterval(() => {
//         if (shuffles >= maxShuffles) {
//           clearInterval(intervalRef.current!);
//           wordNodes.forEach((node, i) => {
//             node.textContent = originalTexts[i];
//           });
//           row.dataset.animating = "false";
//         } else {
//           wordNodes.forEach((node, i) => {
//             const length = originalTexts[i].length;
//             let shuffledText = "";
//             for (let j = 0; j < length; j++) {
//               if (originalTexts[i][j] === " ") {
//                 shuffledText += " ";
//               } else {
//                 shuffledText += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
//               }
//             }
//             node.textContent = shuffledText;
//           });
//           shuffles++;
//         }
//       }, intervalDuration);
//     };

//     row.addEventListener("mouseenter", handleEnter);
//     return () => {
//       row.removeEventListener("mouseenter", handleEnter);
//       if (intervalRef.current) clearInterval(intervalRef.current);
//     };
//   }, [word1, word2]);

//   return (
//     <div
//       ref={rowRef}
//       data-reveal="up"
//       data-reveal-delay={String(Math.min(index * 0.06, 0.36))}
//       className="group relative grid grid-cols-[32px_1fr_auto] sm:grid-cols-[48px_1fr_auto_140px_20px] items-center gap-3 sm:gap-6 py-6 sm:py-8 border-b border-border first:border-t border-t-border cursor-pointer"
//     >
//       <span
//         aria-hidden="true"
//         className="absolute left-0 -bottom-px h-px w-0 bg-primary transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"
//       />

//       <span className="font-mono text-[11px] tabular-nums text-muted-foreground/50">{order}</span>

//       <div className="flex items-center justify-center gap-1.5 sm:gap-4 transition-all duration-300 group-hover:gap-5 min-w-0">
        
//         {/* Left Half: Adapted with text-[clamp()] for safe mobile scaling */}
//         <span className="scramble-word flex-1 text-right font-display font-medium uppercase tracking-tight text-[clamp(1rem,4vw,2rem)] sm:text-4xl md:text-5xl lg:text-6xl transition-colors duration-300 group-hover:text-primary truncate">
//           {word1}
//         </span>

//         {/* <div 
//           className="relative h-[30px] sm:h-[60px] lg:h-[70px] w-[50px] sm:w-[100px] lg:w-[125px] overflow-hidden bg-foreground transition-all duration-1000 ease-[cubic-bezier(0.075,0.82,0.165,1)] flex-[0] sm:group-hover:flex-[0.5]"
//         > */}
//         <div className="relative h-[30px] sm:h-[60px] lg:h-[70px] w-[50px] sm:w-[100px] lg:w-[125px] overflow-hidden bg-foreground transition-all duration-1000 ease-[cubic-bezier(0.075,0.82,0.165,1)] flex-[0] group-hover:flex-[0.5]">
//           {hasImage ? (
//             <img
//               src={partner.imageUrl}
//               alt=""
//               onError={() => setImgError(true)}
//               // className={`absolute inset-0 w-full h-full object-cover ${canHover ? "opacity-0 sm:group-hover:opacity-100 transition-opacity duration-700" : ""}`}
//               // className={`absolute inset-0 w-full h-full object-cover ${canHover ? "opacity-0 group-hover:opacity-100 transition-opacity duration-700" : ""}`}
//               className={`absolute top-0 left-1/2 -translate-x-1/2 h-full w-[50px] sm:w-[100px] lg:w-[125px] max-w-none object-cover ${
//                 canHover ? "opacity-0 group-hover:opacity-100 transition-opacity duration-700" : ""
//               }`}
//             />
//           ) : (
//             <span className="absolute inset-0 flex items-center justify-center text-background text-[10px] sm:text-sm font-bold">
//               {partner.glyph}
//             </span>
//           )}
//         </div>

//         {/* Right Half: Adapted with text-[clamp()] for safe mobile scaling */}
//         <span className="scramble-word flex-1 text-left font-display font-medium uppercase tracking-tight text-[clamp(1rem,4vw,2rem)] sm:text-4xl md:text-5xl lg:text-6xl transition-colors duration-300 group-hover:text-primary truncate">
//           {word2}
//         </span>

//       </div>

//       <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 whitespace-nowrap justify-self-end sm:hidden">
//         {partner.sinceYear}
//       </span>
//       <span className="hidden sm:block font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/55 whitespace-nowrap justify-self-end">
//         {t("partners.since", "Est. {{year}}", { year: partner.sinceYear })}
//       </span>

//       <span className="hidden sm:block text-xs text-muted-foreground text-right opacity-0 translate-x-2 transition-[opacity,transform] duration-300 group-hover:opacity-100 group-hover:translate-x-0">
//         {t(partner.categoryKey, partner.categoryFallback)}
//       </span>

//       <ArrowUpRight
//         aria-hidden="true"
//         className="hidden sm:block w-5 h-5 text-primary opacity-0 -translate-x-1.5 translate-y-1.5 transition-[opacity,transform] duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0"
//       />
//     </div>
//   );
// }


// export default function PartnersSection() {
//   const { t } = useTranslation();
//   const sectionRef = useRef<HTMLElement>(null);
//   useScrollReveal(sectionRef);

//   return (
//     <section id="partners" ref={sectionRef} className="py-14 sm:py-20 lg:py-24">
//       <div className="container mx-auto px-4 sm:px-6">
//         <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 sm:mb-12 pb-8 border-b border-border">
//           <SectionHeading
//             kicker={t("partners.kicker", "Verified partners")}
//             title={t("partners.title", "Organizations working alongside us on the ground")}
//             className="!max-w-xl"
//           />
//           <div
//             data-reveal="up"
//             className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 sm:text-right shrink-0"
//           >
//             <span className="block text-xs font-semibold tracking-[0.05em] text-foreground mb-1">
//               {t("partners.countLabel", "{{count}} active", { count: PARTNERS.length })}
//             </span>
//             {t("partners.registryLabel", "Registry / Addis Ababa")}
//           </div>
//         </div>

//         <div className="flex flex-col">
//           {PARTNERS.map((partner, i) => (
//             <PartnerRow key={partner.id} partner={partner} index={i} />
//           ))}
//         </div>

//         <div
//           data-reveal="up"
//           className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8 sm:mt-10"
//         >
//           <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-[46ch]">
//             {t(
//               "partners.disclaimer",
//               "Working with organizations trusted across Addis Ababa's aid network."
//             )}
//           </p>
//           <Link
//             to="/contact"
//             className="inline-flex items-center gap-1.5 font-semibold text-sm text-foreground hover:text-primary transition-colors shrink-0"
//           >
//             {t("partners.cta", "Partnership inquiries")}
//             <ArrowUpRight className="w-4 h-4" />
//           </Link>
//         </div>
//       </div>
//     </section>
//   );
// }

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useQuery } from "@tanstack/react-query";
import { donorApi } from "@/services/api.service";
import type { Donor } from "@/types/api";
import SectionHeading from "./SectionHeading1";

const canHover =
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

interface Partner {
  id: string;
  glyph: string;
  imageUrl?: string;
  nameKey: string;
  nameFallback: string;
  sinceYear: string;
  categoryKey: string;
  categoryFallback: string;
  isPlaceholder?: true;
}

const MAX_PARTNERS = 6;

const PLACEHOLDERS: Partner[] = [
  {
    id: "horizon-crescent",
    glyph: "HC",
    imageUrl:
      "https://images.unsplash.com/photo-1518281420975-50db6e5d0a97?w=800&auto=format&fit=crop&q=80",
    nameKey: "partners.org1.name",
    nameFallback: "Horizon Crescent",
    sinceYear: "1935",
    categoryKey: "partners.org1.category",
    categoryFallback: "Emergency relief",
  },
  {
    id: "children-first-trust",
    glyph: "CF",
    nameKey: "partners.org2.name",
    nameFallback: "Children First Trust",
    sinceYear: "1952",
    categoryKey: "partners.org2.category",
    categoryFallback: "Child welfare",
  },
  {
    id: "mercy-field",
    glyph: "MF",
    imageUrl:
      "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop&q=80",
    nameKey: "partners.org3.name",
    nameFallback: "Mercy Field",
    sinceYear: "1998",
    categoryKey: "partners.org3.category",
    categoryFallback: "Medical aid",
  },
  {
    id: "wellspring-foodline",
    glyph: "WF",
    nameKey: "partners.org4.name",
    nameFallback: "Wellspring Foodline",
    sinceYear: "1961",
    categoryKey: "partners.org4.category",
    categoryFallback: "Food distribution",
  },
  {
    id: "givehope-intl",
    glyph: "GH",
    imageUrl:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=800&auto=format&fit=crop&q=80",
    nameKey: "partners.org5.name",
    nameFallback: "GiveHope Intl.",
    sinceYear: "2004",
    categoryKey: "partners.org5.category",
    categoryFallback: "Education fund",
  },
  {
    id: "clean-water-corps",
    glyph: "CW",
    nameKey: "partners.org6.name",
    nameFallback: "Clean Water Corps",
    sinceYear: "2011",
    categoryKey: "partners.org6.category",
    categoryFallback: "WASH programs",
  },
];

function glyphFromName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "PT";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function donorToPartner(donor: Donor): Partner {
  const API_URL = import.meta.env.VITE_API_URL ?? "";
  const rawAvatar = donor.avatar ?? donor.logo ?? "";
  const imageUrl = rawAvatar
    ? rawAvatar.startsWith("http")
      ? rawAvatar
      : `${API_URL}${rawAvatar}`
    : undefined;
  const year = donor.establishmentDate
    ? new Date(donor.establishmentDate).getFullYear().toString()
    : new Date(donor.registeredAt ?? donor.createdAt ?? Date.now())
        .getFullYear()
        .toString();
  const category = donor.primaryAid
    ? donor.primaryAid.replace(/_/g, " ")
    : "Partner";
  return {
    id: donor.id,
    glyph: glyphFromName(donor.name),
    imageUrl,
    nameKey: `partners.donor.${donor.id}.name`,
    nameFallback: donor.name,
    sinceYear: year,
    categoryKey: `partners.aid.${category.replace(/\s+/g, "_")}`,
    categoryFallback: category,
  };
}

function buildPartnerList(donors: Donor[] | undefined): Partner[] {
  const real = (donors ?? []).map(donorToPartner);
  const realCount = Math.min(real.length, MAX_PARTNERS);
  const placeholders = PLACEHOLDERS.slice(0, MAX_PARTNERS - realCount).map(
    (p) => ({ ...p, isPlaceholder: true as const }),
  );
  return [...real.slice(0, realCount), ...placeholders];
}

function PartnerRow({ partner, index }: { partner: Partner; index: number }) {
  const { t } = useTranslation();
  const finalName = t(partner.nameKey, partner.nameFallback);
  const order = String(index + 1).padStart(2, "0");
  const [imgError, setImgError] = useState(false);
  const hasImage = Boolean(partner.imageUrl) && !imgError;
  const rowRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Split name to sandwich the image
  const words = finalName.split(" ");
  let word1 = "";
  let word2 = "";

  if (words.length === 1) {
    const half = Math.ceil(finalName.length / 2);
    word1 = finalName.slice(0, half);
    word2 = finalName.slice(half);
  } else {
    word1 = words[0];
    word2 = words.slice(1).join(" ");
  }

  useEffect(() => {
    if (!canHover) return;
    const row = rowRef.current;
    if (!row) return;

    const handleEnter = () => {
      if (row.dataset.animating === "true") return;
      row.dataset.animating = "true";

      const wordNodes = row.querySelectorAll(".scramble-word");
      const originalTexts = [word1, word2];

      let shuffles = 0;
      const maxShuffles = 10;
      const intervalDuration = 500 / maxShuffles;

      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        if (shuffles >= maxShuffles) {
          clearInterval(intervalRef.current!);
          wordNodes.forEach((node, i) => {
            node.textContent = originalTexts[i];
          });
          row.dataset.animating = "false";
        } else {
          wordNodes.forEach((node, i) => {
            const length = originalTexts[i].length;
            let shuffledText = "";
            for (let j = 0; j < length; j++) {
              if (originalTexts[i][j] === " ") {
                shuffledText += " ";
              } else {
                shuffledText += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
              }
            }
            node.textContent = shuffledText;
          });
          shuffles++;
        }
      }, intervalDuration);
    };

    row.addEventListener("mouseenter", handleEnter);
    return () => {
      row.removeEventListener("mouseenter", handleEnter);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [word1, word2]);

  return (
    // <div
    //   ref={rowRef}
    //   data-reveal="up"
    //   data-reveal-delay={String(Math.min(index * 0.06, 0.36))}
    //   className="group relative grid grid-cols-[32px_1fr_auto] sm:grid-cols-[48px_1fr_auto_140px_20px] items-center gap-3 sm:gap-6 py-6 sm:py-8 border-b border-border first:border-t border-t-border cursor-pointer"
    // >
    //   <span
    //     aria-hidden="true"
    //     className="absolute left-0 -bottom-px h-px w-0 bg-primary transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"
    //   />

    //   <span className="font-mono text-[11px] tabular-nums text-muted-foreground/50">{order}</span>

    //   <div className="flex items-center justify-center gap-1.5 sm:gap-4 transition-all duration-300 group-hover:gap-5 min-w-0">
        
    //     {/* Left Half */}
    //     <span className="scramble-word flex-1 text-right font-display font-medium uppercase tracking-tight text-[clamp(1rem,4vw,2rem)] sm:text-4xl md:text-5xl lg:text-6xl transition-colors duration-300 group-hover:text-primary truncate">
    //       {word1}
    //     </span>

    //     {/* Agreed-upon frame dimensions: w-0 on rest -> w-[50px]/100px/125px on hover */}
    //     <div className="relative h-[30px] sm:h-[60px] lg:h-[70px] w-0 group-hover:w-[50px] sm:group-hover:w-[100px] lg:group-hover:w-[125px] overflow-hidden  + transition-all duration-300 ease-in group-hover:duration-1000 group-hover:ease-in-out shrink-0">
    //       {hasImage ? (
    //         <img
    //           src={partner.imageUrl}
    //           alt=""
    //           onError={() => setImgError(true)}
    //           /* Fixed target size + object-cover ensures no stretching & zero background bars */
    //           className={`absolute top-0 left-1/2 -translate-x-1/2 h-full w-[50px] sm:w-[100px] lg:w-[125px] max-w-none object-cover ${
    //             // canHover ? "opacity-0 group-hover:opacity-100 transition-opacity duration-500" : ""
    //             // + canHover ? "opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms] ease-[cubic-bezier(0.075,0.82,0.165,1)]" : ""
    //             + canHover ? "opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in group-hover:duration-1000 group-hover:ease-in-out" : ""
    //           }`}
    //         />
    //       ) : (
    //         <span className="absolute inset-0 flex items-center justify-center bg-foreground text-background text-[10px] sm:text-sm font-bold whitespace-nowrap">
    //           {partner.glyph}
    //         </span>
    //       )}
    //     </div>

    //     {/* Right Half */}
    //     <span className="scramble-word flex-1 text-left font-display font-medium uppercase tracking-tight text-[clamp(1rem,4vw,2rem)] sm:text-4xl md:text-5xl lg:text-6xl transition-colors duration-300 group-hover:text-primary truncate">
    //       {word2}
    //     </span>

    //   </div>

    //   {/* <span className=" hidden font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 whitespace-nowrap justify-self-end sm:block md:hidden">
    //     {partner.sinceYear}
    //   </span> */}
    //   <span className="hidden md:block font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/55 whitespace-nowrap justify-self-end">
    //     {t("partners.since", "Est. {{year}}", { year: partner.sinceYear })}
    //   </span>

    //   <span className="hidden md:block text-xs text-muted-foreground text-right opacity-0 translate-x-2 transition-[opacity,transform] duration-300 group-hover:opacity-100 group-hover:translate-x-0">
    //     {t(partner.categoryKey, partner.categoryFallback)}
    //   </span>

    //   <ArrowUpRight
    //     aria-hidden="true"
    //     className="hidden md:block w-5 h-5 text-primary opacity-0 -translate-x-1.5 translate-y-1.5 transition-[opacity,transform] duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0"
    //   />
    // </div>
    <div
  ref={rowRef}
  data-reveal="up"
  data-reveal-delay={String(Math.min(index * 0.06, 0.36))}
  className="group relative grid grid-cols-[32px_1fr_auto] sm:grid-cols-[48px_1fr_auto_140px_20px] items-center gap-3 sm:gap-6 py-6 sm:py-8 border-b border-border first:border-t border-t-border cursor-pointer"
>
  <span
    aria-hidden="true"
    className="absolute left-0 -bottom-px h-px w-0 bg-primary transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"
  />

  <span className="font-mono text-[11px] tabular-nums text-muted-foreground/50">{order}</span>

  {/* min-w-0 is critical here — this is the grid item that must be allowed to shrink below content size */}
  <div className="flex items-center justify-center gap-1.5 sm:gap-4 transition-all duration-300 group-hover:gap-5 min-w-0 overflow-hidden">
    
    {/* min-w-0 added directly to each flex child — truncate alone won't shrink a flex item past its content size without this */}
    {/* <span className="scramble-word flex-1 min-w-0 text-right font-display font-medium uppercase tracking-tight text-[clamp(0.85rem,4vw,2rem)] sm:text-4xl md:text-5xl lg:text-6xl transition-colors duration-300 group-hover:text-primary truncate">
      {word1}
    </span> */}

    <span className="scramble-word flex-1 min-w-0 text-right font-display font-medium uppercase tracking-tight text-[clamp(0.85rem,3.2vw+0.5rem,3.75rem)] transition-colors duration-300 group-hover:text-primary truncate">
  {word1}
</span>

    {/* Frame: on mobile, shrink the hover-expand width so it doesn't force overflow. shrink-0 keeps it from being crushed to 0 by flex-1 siblings */}
    <div className="relative h-[30px] sm:h-[60px] lg:h-[70px] w-0 group-hover:w-[36px] sm:group-hover:w-[100px] lg:group-hover:w-[125px] overflow-hidden transition-all duration-300 ease-in group-hover:duration-1000 group-hover:ease-in-out shrink-0">
      {hasImage ? (
        <img
          src={partner.imageUrl}
          alt=""
          onError={() => setImgError(true)}
          className={`absolute top-0 left-1/2 -translate-x-1/2 h-full w-[36px] sm:w-[100px] lg:w-[125px] max-w-none object-cover ${
            canHover ? "opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in group-hover:duration-1000 group-hover:ease-in-out" : ""
          }`}
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center bg-foreground text-background text-[9px] sm:text-sm font-bold whitespace-nowrap">
          {partner.glyph}
        </span>
      )}
    </div>

    {/* <span className="scramble-word flex-1 min-w-0 text-left font-display font-medium uppercase tracking-tight text-[clamp(0.85rem,4vw,2rem)] sm:text-4xl md:text-5xl lg:text-6xl transition-colors duration-300 group-hover:text-primary truncate">
      {word2}
    </span> */}
<span className="scramble-word flex-1 min-w-0 text-left font-display font-medium uppercase tracking-tight text-[clamp(0.85rem,3.2vw+0.5rem,3.75rem)] transition-colors duration-300 group-hover:text-primary truncate">
  {word2}
</span>

  </div>

  <span className="hidden md:block font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/55 whitespace-nowrap justify-self-end">
    {t("partners.since", "Est. {{year}}", { year: partner.sinceYear })}
  </span>

  <span className="hidden md:block text-xs text-muted-foreground text-right opacity-0 translate-x-2 transition-[opacity,transform] duration-300 group-hover:opacity-100 group-hover:translate-x-0">
    {t(partner.categoryKey, partner.categoryFallback)}
  </span>

  <ArrowUpRight
    aria-hidden="true"
    className="hidden md:block w-5 h-5 text-primary opacity-0 -translate-x-1.5 translate-y-1.5 transition-[opacity,transform] duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0"
  />
</div>
  );
}

export default function PartnersSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["landing-partners"],
    queryFn: async () => {
      const response = await donorApi.getAll({
        donorType: "Organization,Embassy",
        limit: MAX_PARTNERS,
      });
      const payload = Array.isArray(response?.data)
        ? response.data[0]
        : response?.data;
      return (payload?.data ?? []) as Donor[];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const partners =
    isLoading || isError ? PLACEHOLDERS.slice(0, MAX_PARTNERS) : buildPartnerList(data);

  return (
    <section id="partners" ref={sectionRef} className="py-14 sm:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 sm:mb-12 pb-8 border-b border-border">
          <SectionHeading
            kicker={t("partners.kicker", "Verified partners")}
            title={t("partners.title", "Organizations working alongside us on the ground")}
            className="!max-w-xl"
          />
          <div
            data-reveal="up"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 sm:text-right shrink-0"
          >
            <span className="block text-xs font-semibold tracking-[0.05em] text-foreground mb-1">
              {t("partners.countLabel", "{{count}} active", { count: partners.length })}
            </span>
            {t("partners.registryLabel", "Registry / Addis Ababa")}
          </div>
        </div>

        <div className="flex flex-col">
          {partners.map((partner, i) => (
            <PartnerRow key={partner.id} partner={partner} index={i} />
          ))}
        </div>

        <div
          data-reveal="up"
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8 sm:mt-10"
        >
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-[46ch]">
            {t(
              "partners.disclaimer",
              "Working with organizations trusted across Addis Ababa's aid network."
            )}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-1.5 font-semibold text-sm text-foreground hover:text-primary transition-colors shrink-0"
          >
            {t("partners.cta", "Partnership inquiries")}
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}