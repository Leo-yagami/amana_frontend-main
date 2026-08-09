// import { useState, useEffect, useRef } from "react";
// import { Link, NavLink } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import { Button } from "@/components/ui/button";
// import { Heart, ArrowUpRight } from "lucide-react";
// import { LanguageSwitcher } from "@/components/LanguageSwitcher";
// import { ThemeToggle } from "@/components/ThemeToggle";
// import { useLenis } from "lenis/react";
// import gsap from "gsap";
// import React from 'react';
// import { TransitionLink } from '@/components/ViewTransition';

// // --- Left-to-Right Sweep Fill Button ---
// const SweepFillButton = ({ children, onClick, className = "" }: { children: React.ReactNode, onClick?: () => void, className?: string }) => {
//   return (
//     <button
//       onClick={onClick}
//       className={`relative overflow-hidden bg-background text-foreground border border-border group ${className}`}
//     >
//       <span className="absolute inset-0 bg-primary transition-transform duration-500 ease-out origin-left scale-x-0 group-hover:scale-x-100 z-0" />
//       <span className="relative z-10 group-hover:text-primary-foreground transition-colors duration-300 w-full h-full flex items-center justify-center font-semibold">
//         {children}
//       </span>
//     </button>
//   );
// };

// const Bar = ({ innerRef, top }: { innerRef: React.RefObject<HTMLDivElement>; top: number }) => (
//   <div ref={innerRef} className="absolute left-0 w-7 h-[2.5px] rounded-full drop-shadow-md" style={{ top }}>
//     <span className="block w-full h-full bg-foreground rounded-full origin-right group-hover:[animation:bar-wipe_0.5s_ease-in-out]" />
//   </div>
// );

// // --- Animated Hamburger <-> X Icon ---
// const MenuIcon = ({ isOpen }: { isOpen: boolean }) => {
//   const topRef = useRef<HTMLDivElement>(null);
//   const midRef = useRef<HTMLDivElement>(null);
//   const botRef = useRef<HTMLDivElement>(null);
//   const tl = useRef<gsap.core.Timeline | null>(null);

//   useEffect(() => {
//     const ctx = gsap.context(() => {
//       tl.current = gsap.timeline({ paused: true })
//         .to(topRef.current, { y: 7, rotate: 45, duration: 0.55, ease: "back.out(1.7)" }, 0)
//         .to(botRef.current, { y: -7, rotate: -45, duration: 0.55, ease: "back.out(1.7)" }, 0)
//         .to(midRef.current, { opacity: 0, scaleX: 0, duration: 0.25, ease: "power2.in" }, 0);
//     });
//     return () => ctx.revert();
//   }, []);

//   useEffect(() => {
//     if (!tl.current) return;
//     isOpen ? tl.current.play() : tl.current.reverse();
//   }, [isOpen]);

//   return (
//     <div className="relative w-7 h-7">
//       <Bar innerRef={topRef} top={6} />
//       <Bar innerRef={midRef} top={13} />
//       <Bar innerRef={botRef} top={20} />
//     </div>
//   );
// };

// const navLinks = [
//   { id: "01", labelKey: "navbar.home", fallback: "Home", to: "/" },
//   { id: "02", labelKey: "navbar.events", fallback: "Events", to: "/events" },
//   { id: "03", labelKey: "navbar.about", fallback: "About Us", to: "/about" },
//   { id: "04", labelKey: "navbar.contact", fallback: "Contact", to: "/contact" },
// ];

// // --- Main Navbar Component ---
// const Navbar = () => {
//   const { t } = useTranslation();
//   const [isOpen, setIsOpen] = useState(false);
//   const [isSticky, setIsSticky] = useState(false);
//   const lenis = useLenis();

//   const lenisRef = useRef(null)

//   const tl = useRef<gsap.core.Timeline | null>(null);
//   const menuRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const handleScroll = () => {
//       const navbarHeight = window.innerWidth >= 1024 ? 80 : 64;
//       setIsSticky(window.scrollY > navbarHeight);
//     };
//     window.addEventListener("scroll", handleScroll);
//     handleScroll();
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   useEffect(() => {
//     document.body.style.overflow = isOpen ? "hidden" : "unset";
//     return () => { document.body.style.overflow = "unset"; };
//   }, [isOpen]);

//   useEffect(() => {
//     const ctx = gsap.context(() => {
//       tl.current = gsap.timeline({ paused: true })
//         .to(menuRef.current, {
//           clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
//           duration: 1.2,
//           ease: "expo.inOut",
//           force3D: true,
//         })
//         .from(".menu-link-inner", {
//           yPercent: 110,
//           duration: 1.1,
//           stagger: 0.1,
//           ease: "expo.out",
//         }, "-=0.5")
//         .from(".menu-footer > *", {
//           y: 20,
//           opacity: 0,
//           duration: 0.8,
//           stagger: 0.05,
//           ease: "power3.out"
//         }, "-=0.8");
//     }, menuRef);

//     return () => ctx.revert();
//   }, []);

//   useEffect(() => {
//     if (tl.current) {
//       isOpen ? tl.current.play() : tl.current.reverse();
//     }
//   }, [isOpen]);

//   return (
//     <>
//       {/* PC Navbar */}
//       <nav className={`fixed top-0 left-0 right-0 z-50 will-change-transform transition-all duration-300 
//        lg:bg-card/90 lg:backdrop-blur-md lg:border-b lg:border-border lg:shadow-sm
//        ${isOpen 
//           ? "bg-transparent border-transparent" 
//           : isSticky
//           ? "bg-card/90 backdrop-blur-md border-b border-border shadow-sm"
//           : "bg-transparent border-transparent"
//       }`}>
//         <div className="container mx-auto px-4 sm:px-6">
//           <div className="flex items-center justify-between h-16 lg:h-20">
//             <Link to="/" className="flex items-center gap-2 group relative z-50" onClick={() => setIsOpen(false)}>
//               <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl gradient-hero flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow duration-300 drop-shadow-md">
//                 <Heart className="w-[18px] h-[18px] text-primary-foreground fill-current" />
//               </div>
//               <span className="text-lg sm:text-xl font-bold transition-colors duration-300 text-foreground">
//                 {t("brand.amana", "HopeBridge")}
//               </span>
//             </Link>

//             <div className="hidden lg:flex items-center gap-8">
//               {navLinks.map((link) => (
//                 <NavLink
//                   key={link.labelKey}
//                   to={link.to}
//                   className={({ isActive }) =>
//                     `font-medium transition-colors duration-200 ${
//                       isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
//                     }`
//                   }
//                 >
//                   {t(link.labelKey, link.fallback)}
//                 </NavLink>
//               ))}
//             </div>

//             <div className="hidden lg:flex items-center gap-3">
//               <ThemeToggle />
//               <LanguageSwitcher />
//               <Link to="/dashboard">
//                 <Button variant="ghost">{t("navbar.dashboard", "Admin Login")}</Button>
//               </Link>
//               <Link to="/payment">
//                 <Button variant="default">{t("navbar.donateNow", "Donate Now")}</Button>
//               </Link>
//             </div>

//             <button
//               onClick={() => setIsOpen(!isOpen)}
//               className="group lg:hidden p-2 text-foreground rounded-full transition-colors relative z-50 "
//               type="button"
//               aria-label="Toggle Menu"
//             >
//               <MenuIcon isOpen={isOpen} />
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* Mobile Overlay */}
//       <div 
//         ref={menuRef}
//         className={`fixed inset-0 z-40 bg-background flex flex-col lg:hidden will-change-transform ${
//           isOpen ? 'pointer-events-auto' : 'pointer-events-none'
//         }`}
//         style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" }}
//       >
//         <div className="flex-1 flex flex-col justify-center gap-4 px-6 sm:px-10 mt-20">
//           {navLinks.map((link) => (
//             <div key={link.labelKey} className="overflow-hidden pb-2">
//               <Link
//                 to={link.to}
//                 onClick={() => setIsOpen(false)}
//                 className="menu-link-inner flex items-baseline gap-4 text-5xl sm:text-6xl font-black uppercase tracking-tighter text-foreground group w-fit [backface-visibility:hidden] [transform:translateZ(0)]"
//               >
//                 <span className="text-sm sm:text-base font-medium text-muted-foreground tracking-normal transition-colors">
//                   {link.id}
//                 </span>
//                 <span className="relative leading-none pb-1 after:absolute after:bottom-0 after:left-0 after:h-[4px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:duration-500 after:ease-out after:bg-primary">
//                   {t(link.labelKey, link.fallback)}
//                 </span>
//               </Link>
//             </div>
//           ))}
//         </div>

//         <div className="menu-footer w-full px-6 sm:px-10 pb-8 flex flex-col gap-6 mt-auto">
//           <div className="w-full h-px bg-border" />

//           <div className="flex items-center justify-between">
//             <div className="flex gap-4">
//               <ThemeToggle />
//               <LanguageSwitcher />
//             </div>

//             <Link to="/dashboard" onClick={() => setIsOpen(false)} className="group flex items-center gap-2">
//               <span className="text-sm font-semibold uppercase tracking-wider transition-colors duration-300 group-hover:text-primary">
//                 {t("navbar.dashboard", "Admin Login")}
//               </span>
//               <div className="relative w-4 h-4 overflow-hidden">
//                 <ArrowUpRight className="absolute inset-0 w-4 h-4 text-primary transition-transform duration-300 ease-in-out group-hover:translate-x-4 group-hover:-translate-y-4" />
//                 <ArrowUpRight className="absolute inset-0 w-4 h-4 text-primary -translate-x-4 translate-y-4 transition-transform duration-300 ease-in-out group-hover:translate-x-0 group-hover:translate-y-0" />
//               </div>
//             </Link>
//           </div>

//           <Link to="/payment" className="w-full">
//             <SweepFillButton onClick={() => setIsOpen(false)} className="w-full h-14 rounded-xl text-lg shadow-sm">
//               {t("navbar.donateNow", "Donate Now")}
//             </SweepFillButton>
//           </Link>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Navbar;

// import { useState, useEffect, useRef } from "react";
// import { useLocation } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import { Button } from "@/components/ui/button";
// import { Heart, ArrowUpRight } from "lucide-react";
// import { LanguageSwitcher } from "@/components/LanguageSwitcher";
// import { ThemeToggle } from "@/components/ThemeToggle";
// import gsap from "gsap";
// import React from 'react';
// import { TransitionLink } from '@/components/ViewTransition';

// // --- Left-to-Right Sweep Fill Button ---
// const SweepFillButton = ({ children, onClick, className = "" }: { children: React.ReactNode, onClick?: () => void, className?: string }) => {
//   return (
//     <button
//       onClick={onClick}
//       className={`relative overflow-hidden bg-background text-foreground border border-border group ${className}`}
//     >
//       <span className="absolute inset-0 bg-primary transition-transform duration-500 ease-out origin-left scale-x-0 group-hover:scale-x-100 z-0" />
//       <span className="relative z-10 group-hover:text-primary-foreground transition-colors duration-300 w-full h-full flex items-center justify-center font-semibold">
//         {children}
//       </span>
//     </button>
//   );
// };

// const Bar = ({ innerRef, top }: { innerRef: React.RefObject<HTMLDivElement>; top: number }) => (
//   <div ref={innerRef} className="absolute left-0 w-7 h-[2.5px] rounded-full drop-shadow-md" style={{ top }}>
//     <span className="block w-full h-full bg-foreground rounded-full origin-right group-hover:[animation:bar-wipe_0.5s_ease-in-out]" />
//   </div>
// );

// // --- Animated Hamburger <-> X Icon ---
// const MenuIcon = ({ isOpen }: { isOpen: boolean }) => {
//   const topRef = useRef<HTMLDivElement>(null);
//   const midRef = useRef<HTMLDivElement>(null);
//   const botRef = useRef<HTMLDivElement>(null);
//   const tl = useRef<gsap.core.Timeline | null>(null);

//   useEffect(() => {
//     const ctx = gsap.context(() => {
//       tl.current = gsap.timeline({ paused: true })
//         .to(topRef.current, { y: 7, rotate: 45, duration: 0.55, ease: "back.out(1.7)" }, 0)
//         .to(botRef.current, { y: -7, rotate: -45, duration: 0.55, ease: "back.out(1.7)" }, 0)
//         .to(midRef.current, { opacity: 0, scaleX: 0, duration: 0.25, ease: "power2.in" }, 0);
//     });
//     return () => ctx.revert();
//   }, []);

//   useEffect(() => {
//     if (!tl.current) return;
//     isOpen ? tl.current.play() : tl.current.reverse();
//   }, [isOpen]);

//   return (
//     <div className="relative w-7 h-7">
//       <Bar innerRef={topRef} top={6} />
//       <Bar innerRef={midRef} top={13} />
//       <Bar innerRef={botRef} top={20} />
//     </div>
//   );
// };

// const navLinks = [
//   { id: "01", labelKey: "navbar.home", fallback: "Home", to: "/" },
//   { id: "02", labelKey: "navbar.events", fallback: "Events", to: "/events" },
//   { id: "03", labelKey: "navbar.about", fallback: "About Us", to: "/about" },
//   { id: "04", labelKey: "navbar.contact", fallback: "Contact", to: "/contact" },
// ];

// // --- Main Navbar Component ---
// const Navbar = () => {
//   const { t } = useTranslation();
//   const location = useLocation();
//   const [isOpen, setIsOpen] = useState(false);
//   const [isSticky, setIsSticky] = useState(false);

//   const tl = useRef<gsap.core.Timeline | null>(null);
//   const menuRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const handleScroll = () => {
//       const navbarHeight = window.innerWidth >= 1024 ? 80 : 64;
//       setIsSticky(window.scrollY > navbarHeight);
//     };
//     window.addEventListener("scroll", handleScroll);
//     handleScroll();
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   useEffect(() => {
//     document.body.style.overflow = isOpen ? "hidden" : "unset";
//     return () => { document.body.style.overflow = "unset"; };
//   }, [isOpen]);

//   useEffect(() => {
//     const ctx = gsap.context(() => {
//       tl.current = gsap.timeline({ paused: true })
//         .to(menuRef.current, {
//           clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
//           duration: 1.2,
//           ease: "expo.inOut",
//           force3D: true,
//         })
//         .from(".menu-link-inner", {
//           yPercent: 110,
//           duration: 1.1,
//           stagger: 0.1,
//           ease: "expo.out",
//         }, "-=0.5")
//         .from(".menu-footer > *", {
//           y: 20,
//           opacity: 0,
//           duration: 0.8,
//           stagger: 0.05,
//           ease: "power3.out"
//         }, "-=0.8");
//     }, menuRef);

//     return () => ctx.revert();
//   }, []);

//   useEffect(() => {
//     if (tl.current) {
//       isOpen ? tl.current.play() : tl.current.reverse();
//     }
//   }, [isOpen]);

//   return (
//     <>
//       {/* PC Navbar */}
//       <nav className={`fixed top-0 left-0 right-0 z-50 will-change-transform transition-all duration-300 
//        lg:bg-card/90 lg:backdrop-blur-md lg:border-b lg:border-border lg:shadow-sm
//        ${isOpen 
//           ? "bg-transparent border-transparent" 
//           : isSticky
//           ? "bg-card/90 backdrop-blur-md border-b border-border shadow-sm"
//           : "bg-transparent border-transparent"
//       }`}>
//         <div className="container mx-auto px-4 sm:px-6">
//           <div className="flex items-center justify-between h-16 lg:h-20">
//             <TransitionLink to="/" className="flex items-center gap-2 group relative z-50" onTransitionStart={() => setIsOpen(false)}>
//               <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl gradient-hero flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow duration-300 drop-shadow-md">
//                 <Heart className="w-[18px] h-[18px] text-primary-foreground fill-current" />
//               </div>
//               <span className="text-lg sm:text-xl font-bold transition-colors duration-300 text-foreground">
//                 {t("brand.amana", "HopeBridge")}
//               </span>
//             </TransitionLink>

//             <div className="hidden lg:flex items-center gap-8">
//               {navLinks.map((link) => {
//                 const isActive = location.pathname === link.to;
//                 return (
//                   <TransitionLink
//                     key={link.labelKey}
//                     to={link.to}
//                     className={`font-medium transition-colors duration-200 ${
//                       isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
//                     }`}
//                   >
//                     {t(link.labelKey, link.fallback)}
//                   </TransitionLink>
//                 );
//               })}
//             </div>

//             <div className="hidden lg:flex items-center gap-3">
//               <ThemeToggle />
//               <LanguageSwitcher />
//               <TransitionLink to="/dashboard">
//                 <Button variant="ghost">{t("navbar.dashboard", "Admin Login")}</Button>
//               </TransitionLink>
//               <TransitionLink to="/payment">
//                 <Button variant="default">{t("navbar.donateNow", "Donate Now")}</Button>
//               </TransitionLink>
//             </div>

//             <button
//               onClick={() => setIsOpen(!isOpen)}
//               className="group lg:hidden p-2 text-foreground rounded-full transition-colors relative z-50 "
//               type="button"
//               aria-label="Toggle Menu"
//             >
//               <MenuIcon isOpen={isOpen} />
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* Mobile Overlay */}
//       <div 
//         ref={menuRef}
//         className={`fixed inset-0 z-40 bg-background flex flex-col lg:hidden will-change-transform ${
//           isOpen ? 'pointer-events-auto' : 'pointer-events-none'
//         }`}
//         style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" }}
//       >
//         <div className="flex-1 flex flex-col justify-center gap-4 px-6 sm:px-10 mt-20">
//           {navLinks.map((link) => (
//             <div key={link.labelKey} className="overflow-hidden pb-2">
//               <TransitionLink
//                 to={link.to}
//                 onTransitionStart={() => setIsOpen(false)}
//                 className="menu-link-inner flex items-baseline gap-4 text-5xl sm:text-6xl font-black uppercase tracking-tighter text-foreground group w-fit [backface-visibility:hidden] [transform:translateZ(0)]"
//               >
//                 <span className="text-sm sm:text-base font-medium text-muted-foreground tracking-normal transition-colors">
//                   {link.id}
//                 </span>
//                 <span className="relative leading-none pb-1 after:absolute after:bottom-0 after:left-0 after:h-[4px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:duration-500 after:ease-out after:bg-primary">
//                   {t(link.labelKey, link.fallback)}
//                 </span>
//               </TransitionLink>
//             </div>
//           ))}
//         </div>

//         <div className="menu-footer w-full px-6 sm:px-10 pb-8 flex flex-col gap-6 mt-auto">
//           <div className="w-full h-px bg-border" />

//           <div className="flex items-center justify-between">
//             <div className="flex gap-4">
//               <ThemeToggle />
//               <LanguageSwitcher />
//             </div>

//             <TransitionLink to="/dashboard" onTransitionStart={() => setIsOpen(false)} className="group flex items-center gap-2">
//               <span className="text-sm font-semibold uppercase tracking-wider transition-colors duration-300 group-hover:text-primary">
//                 {t("navbar.dashboard", "Admin Login")}
//               </span>
//               <div className="relative w-4 h-4 overflow-hidden">
//                 <ArrowUpRight className="absolute inset-0 w-4 h-4 text-primary transition-transform duration-300 ease-in-out group-hover:translate-x-4 group-hover:-translate-y-4" />
//                 <ArrowUpRight className="absolute inset-0 w-4 h-4 text-primary -translate-x-4 translate-y-4 transition-transform duration-300 ease-in-out group-hover:translate-x-0 group-hover:translate-y-0" />
//               </div>
//             </TransitionLink>
//           </div>

//           <TransitionLink to="/payment" onTransitionStart={() => setIsOpen(false)} className="w-full">
//             <SweepFillButton className="w-full h-14 rounded-xl text-lg shadow-sm">
//               {t("navbar.donateNow", "Donate Now")}
//             </SweepFillButton>
//           </TransitionLink>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Navbar;

import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, ArrowUpRight, X } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TransitionLink } from "@/components/ViewTransition";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Sweep fill button — kept identical, used in both mobile + desktop overlays
// ─────────────────────────────────────────────────────────────────────────────
const SweepFillButton = ({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={`relative overflow-hidden bg-background text-foreground border border-border group ${className}`}
  >
    <span className="absolute inset-0 bg-primary transition-transform duration-500 ease-out origin-left scale-x-0 group-hover:scale-x-100 z-0" />
    <span className="relative z-10 group-hover:text-primary-foreground transition-colors duration-300 w-full h-full flex items-center justify-center font-semibold">
      {children}
    </span>
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// Mobile hamburger icon — kept identical
// ─────────────────────────────────────────────────────────────────────────────
const Bar = ({
  innerRef,
  top,
}: {
  innerRef: React.RefObject<HTMLDivElement>;
  top: number;
}) => (
  <div
    ref={innerRef}
    className="absolute left-0 w-7 h-[2.5px] rounded-full drop-shadow-md"
    style={{ top }}
  >
    <span className="block w-full h-full bg-foreground rounded-full origin-right" />
  </div>
);

const MenuIcon = ({ isOpen }: { isOpen: boolean }) => {
  const topRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      tl.current = gsap
        .timeline({ paused: true })
        .to(topRef.current, { y: 7, rotate: 45, duration: 0.55, ease: "back.out(1.7)" }, 0)
        .to(botRef.current, { y: -7, rotate: -45, duration: 0.55, ease: "back.out(1.7)" }, 0)
        .to(midRef.current, { opacity: 0, scaleX: 0, duration: 0.25, ease: "power2.in" }, 0);
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!tl.current) return;
    isOpen ? tl.current.play() : tl.current.reverse();
  }, [isOpen]);

  return (
    <div className="relative w-7 h-7">
      <Bar innerRef={topRef} top={6} />
      <Bar innerRef={midRef} top={13} />
      <Bar innerRef={botRef} top={20} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Nav data — preview images added for desktop overlay hover effect
// ─────────────────────────────────────────────────────────────────────────────
const navLinks = [
  {
    id: "01",
    labelKey: "navbar.home",
    fallback: "Home",
    to: "/",
    image:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: "02",
    labelKey: "navbar.events",
    fallback: "Events",
    to: "/events",
    image:
      "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: "03",
    labelKey: "navbar.about",
    fallback: "About Us",
    to: "/about",
    image:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: "04",
    labelKey: "navbar.contact",
    fallback: "Contact",
    to: "/contact",
    image:
      "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=900&auto=format&fit=crop&q=80",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Desktop full-screen overlay — AROCK-inspired split layout
// ─────────────────────────────────────────────────────────────────────────────
interface DesktopOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── Animated label component — char-by-char color sweep ──────────────────
// const AnimatedLabel = ({ text, isActive }: { text: string; isActive: boolean }) => {
//   const charsRef = useRef<(HTMLSpanElement | null)[]>([]);
//   const tlRef = useRef<gsap.core.Timeline | null>(null);

//   useEffect(() => {
//     tlRef.current = gsap.timeline({ paused: true })
//       .to(charsRef.current.filter(Boolean), {
//         color: "var(--color-primary, hsl(var(--primary)))",
//         duration: 0.3,
//         stagger: 0.025,
//         ease: "power2.out",
//       });
//     return () => { tlRef.current?.kill(); };
//   }, []);

//   const play = () => tlRef.current?.play();
//   const reverse = () => tlRef.current?.reverse();

//   return (
//     <span
//       className="font-display font-black uppercase leading-[0.88] tracking-tighter select-none"
//       style={{ fontSize: "clamp(2.4rem, 3.8vw, 4.5rem)" }}
//       data-label
//       onMouseEnter={play}
//       onMouseLeave={reverse}
//     >
//       {text.split("").map((char, i) => (
//         <span
//           key={i}
//           ref={(el) => { charsRef.current[i] = el; }}
//           className={`inline-block ${isActive ? "text-primary" : "text-foreground"}`}
//           style={{ whiteSpace: char === " " ? "pre" : undefined }}
//         >
//           {char}
//         </span>
//       ))}
//     </span>
//   );
// };

// const AnimatedLabel = ({ text, isActive }: { text: string; isActive: boolean }) => {
//   const charsRef = useRef<(HTMLSpanElement | null)[]>([]);
//   const tlRef = useRef<gsap.core.Timeline | null>(null);

//   useEffect(() => {
//     tlRef.current = gsap.timeline({ paused: true })
//       .to(charsRef.current.filter(Boolean), {
//         color: "var(--color-primary, hsl(var(--primary)))",
//         duration: 0.3,
//         stagger: 0.025,
//         ease: "power2.out",
//       });
//     return () => { tlRef.current?.kill(); };
//   }, []);

//   // Keep the timeline in sync with route changes: if this label becomes
//   // active, make sure any leftover inline color from a previous hover
//   // doesn't conflict; if it becomes inactive, clear inline color entirely
//   // so the Tailwind class (text-foreground) takes over again.
//   useEffect(() => {
//     if (!isActive) {
//       tlRef.current?.pause(0); // reset timeline progress
//       gsap.set(charsRef.current.filter(Boolean), { clearProps: "color" });
//     }
//   }, [isActive]);

//   const play = () => tlRef.current?.play();
//   const reverse = () => {
//     if (isActive) return; // active label stays primary-colored, no hover-out needed
//     tlRef.current?.reverse();
//   };

//   return (
//     <span
//       className="font-display font-black uppercase leading-[0.88] tracking-tighter select-none"
//       style={{ fontSize: "clamp(2.4rem, 3.8vw, 4.5rem)" }}
//       data-label
//       onMouseEnter={play}
//       onMouseLeave={reverse}
//     >
//       {text.split("").map((char, i) => (
//         <span
//           key={i}
//           ref={(el) => { charsRef.current[i] = el; }}
//           className={`inline-block ${isActive ? "text-primary" : "text-foreground"}`}
//           style={{ whiteSpace: char === " " ? "pre" : undefined }}
//         >
//           {char}
//         </span>
//       ))}
//     </span>
//   );
// };

const AnimatedLabel = ({ text, isActive }: { text: string; isActive: boolean }) => {
  const charsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const isActiveRef = useRef(isActive);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  // When isActive changes, kill any running tween and let CSS take over
  useEffect(() => {
    tweenRef.current?.kill();
    tweenRef.current = null;
    charsRef.current.filter(Boolean).forEach((el) => { el.style.color = ""; });
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { tweenRef.current?.kill(); };
  }, []);

  const play = () => {
    if (isActiveRef.current) return;
    tweenRef.current?.kill();

    // Read the actual computed primary color from the CSS class
    const chars = charsRef.current.filter(Boolean);
    if (chars.length === 0) return;
    const probe = chars[0]!;
    const savedClass = probe.className;
    probe.className = savedClass.replace("text-foreground", "text-primary");
    const saved = probe.style.color;
    probe.style.color = "";
    const primaryColor = getComputedStyle(probe).color;
    probe.style.color = saved;
    probe.className = savedClass;

    tweenRef.current = gsap.to(chars, {
      color: primaryColor,
      duration: 0.3,
      stagger: 0.025,
      ease: "power2.out",
    });
  };

  const reverse = () => {
    if (isActiveRef.current) return;
    tweenRef.current?.kill();

    // Read the actual class-driven foreground color so we always
    // tween back to the correct value regardless of theme.
    const chars = charsRef.current.filter(Boolean);
    if (chars.length === 0) return;
    const probe = chars[0]!;
    const saved = probe.style.color;
    probe.style.color = "";
    const targetColor = getComputedStyle(probe).color;
    probe.style.color = saved;

    tweenRef.current = gsap.to(chars, {
      color: targetColor,
      duration: 0.25,
      stagger: { each: 0.02, from: "end" },
      ease: "power2.inOut",
      onComplete: () => {
        // Clear inline styles so CSS classes take full control again
        chars.forEach((el) => { el.style.color = ""; });
      },
    });
  };

  return (
    <span
      className="font-display font-black uppercase leading-[0.88] tracking-tighter select-none"
      style={{ fontSize: "clamp(2.4rem, 3.8vw, 4.5rem)" }}
      data-label
      onMouseEnter={play}
      onMouseLeave={reverse}
    >
      {text.split("").map((char, i) => (
        <span
          key={i}
          ref={(el) => { charsRef.current[i] = el; }}
          className={`inline-block ${isActive ? "text-primary" : "text-foreground"}`}
          style={{ whiteSpace: char === " " ? "pre" : undefined }}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

const DesktopOverlay = ({ isOpen, onClose }: DesktopOverlayProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const overlayRef = useRef<HTMLDivElement>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const xTo = useRef<gsap.QuickToFunc | null>(null);
  const yTo = useRef<gsap.QuickToFunc | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState(0);

  
// ── Shared floating arrow ─────────────────────────────────────────────────
const arrowRef = useRef<SVGSVGElement>(null);
const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
const navRef = useRef<HTMLElement>(null);
const activeIdx = navLinks.findIndex((l) => l.to === location.pathname);
const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
const snapBackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

// Use a fixed arrow size (24px = w-6 h-6) instead of reading
// getBoundingClientRect on the arrow itself, which shifts due to
// its own GSAP transforms and creates a feedback loop.
const ARROW_SIZE = 24;

const getArrowY = useCallback((idx: number): number | null => {
  const link = linkRefs.current[idx];
  const nav = navRef.current;
  if (!link || !nav) return null;
  const linkRect = link.getBoundingClientRect();
  const navRect = nav.getBoundingClientRect();
  return linkRect.top - navRect.top + linkRect.height / 2 - ARROW_SIZE / 2;
}, []);

const getArrowX = useCallback((idx: number): number | null => {
  const link = linkRefs.current[idx];
  const nav = navRef.current;
  if (!link || !nav) return null;
  const linkRect = link.getBoundingClientRect();
  const navRect = nav.getBoundingClientRect();
  return linkRect.right - navRect.left + 8;
}, []);

const moveArrowTo = useCallback((idx: number, snap = false) => {
  const y = getArrowY(idx);
  const x = getArrowX(idx);
  if (y === null || x === null) return;
  if (snap) {
    gsap.set(arrowRef.current, { x, y, opacity: 1 });
  } else {
    gsap.to(arrowRef.current, { x, y, opacity: 1, duration: 0.4, ease: "power3.out" });
  }
}, [getArrowY, getArrowX]);

// Snap arrow to the active link on open (fresh activeIdx each time).
const snapArrowToActive = useCallback(() => {
  const arrow = arrowRef.current;
  if (!arrow) return;

  const idx = navLinks.findIndex((l) => l.to === location.pathname);
  const target = idx >= 0 ? idx : 0;
  const y = getArrowY(target);
  const x = getArrowX(target);
  if (y === null || x === null) return;
  gsap.set(arrow, { x, y, opacity: 1 });
}, [getArrowY, getArrowX, location.pathname]);

// Ref so the timeline always calls the latest version (stale closure guard)
const snapArrowRef = useRef(snapArrowToActive);
snapArrowRef.current = snapArrowToActive;

  // ── GSAP setup (unchanged) ────────────────────────────────────────────────
  useGSAP(() => {
    if (!overlayRef.current || !imgWrapRef.current) return;

    gsap.set(imgWrapRef.current, { opacity: 0 });
    gsap.set(".dl-inner", { yPercent: 115 });
    gsap.set(".dm-util", { opacity: 0, y: 14 });

    tlRef.current = gsap
      .timeline({ paused: true })
      .to(overlayRef.current, {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
        duration: 1.0,
        ease: "expo.inOut",
      })
      .to(imgWrapRef.current, { opacity: 1, duration: 0.9, ease: "power2.out" }, 0.25)
      .to(".dl-inner", { yPercent: 0, duration: 0.95, stagger: 0.09, ease: "expo.out" }, 0.3)
      .to(".dm-util", { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.05 }, 0.65)
      .call(() => snapArrowRef.current());

    xTo.current = gsap.quickTo(imgWrapRef.current, "x", { duration: 0.9, ease: "power3.out" });
    yTo.current = gsap.quickTo(imgWrapRef.current, "y", { duration: 0.9, ease: "power3.out" });
  }, { scope: overlayRef});

  // Hide arrow immediately when overlay closes — do NOT reposition it
  // during the close animation, because getBoundingClientRect reads are
  // unreliable while clipPath is animating.  The timeline's .call() at
  // the end of the open animation handles correct positioning on re-open.
  useEffect(() => {
    if (!isOpen) {
      gsap.set(arrowRef.current, { opacity: 0 });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!tlRef.current) return;
    if (isOpen) {
      tlRef.current.play();
      document.body.style.overflow = "hidden";
    } else {
      tlRef.current.reverse();
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
  return () => {
    if (snapBackTimer.current) clearTimeout(snapBackTimer.current);
  };
}, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!leftPanelRef.current) return;
    const rect = leftPanelRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.045;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.045;
    xTo.current?.(x);
    yTo.current?.(y);
  }, []);

  const handleMouseLeave = useCallback(() => {
    xTo.current?.(0);
    yTo.current?.(0);
  }, []);

  return (
    <div
      ref={overlayRef}
      aria-modal="true"
      aria-label="Site navigation"
      className={`fixed inset-0 z-50 hidden lg:grid lg:grid-cols-2 bg-background ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      style={{ clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" }}
    >
      {/* LEFT: image panel — unchanged */}
      <div
        ref={leftPanelRef}
        className="relative overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div ref={imgWrapRef} className="absolute inset-0">
          {navLinks.map((link, i) => (
            <img
              key={link.to}
              src={link.image}
              alt=""
              aria-hidden="true"
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover select-none"
              style={{
                opacity: hoveredIdx === i ? 1 : 0,
                transition: "opacity 0.55s ease",
                transform: "scale(1.12)",
                transformOrigin: "center center",
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20" />
          <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-background/55 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background/15 to-transparent" />
        </div>
      </div>

      {/* RIGHT: nav panel */}
      <div className="relative flex flex-col px-12 xl:px-16 pt-0 pb-10 bg-background overflow-hidden">

        {/* Header — unchanged */}
        <div className="dm-util flex items-center justify-between h-16 lg:h-20">
          <Link to="/" onClick={onClose} className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow duration-300 drop-shadow-md">
              <Heart className="w-[18px] h-[18px] text-primary-foreground fill-current" />
            </div>
            <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-200">
              {t("brand.amana", "HopeBridge")}
            </span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="group flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <span>Close</span>
            <X className="w-4 h-4 transition-transform duration-300 ease-[cubic-bezier(0.87,0,0.13,1)] group-hover:rotate-90" />
          </button>
        </div>

        {/* Nav links — shared arrow floats over this container */}
<nav 
  ref={navRef} 
  className="relative flex flex-col justify-center flex-1 gap-1 mt-2"
  onMouseLeave={() => {
    // Mouse left the entire nav — reset all text slides, return arrow to active
    navLinks.forEach((_, j) => {
      const up = overlayRef.current?.querySelector(`[data-slide-up="${j}"]`);
      const down = overlayRef.current?.querySelector(`[data-slide-down="${j}"]`);
      if (up) gsap.to(up, { yPercent: 0, duration: 0.4, ease: "power3.out" });
      if (down) gsap.to(down, { yPercent: 0, duration: 0.4, ease: "power3.out" });
    });
    const fallback = activeIdx >= 0 ? activeIdx : 0;
    moveArrowTo(fallback);
    setHoveredIdx(fallback);
  }}
>

  {/* Single shared floating arrow — GSAP sets x/y per link */}
  <ArrowUpRight
    ref={arrowRef}
    className="pointer-events-none absolute top-0 left-0 w-6 h-6 xl:w-7 xl:h-7 text-primary opacity-0"
    aria-hidden="true"
  />

  {/* {navLinks.map((link, i) => {
    const isActive = location.pathname === link.to;
    return (
      <div
        key={link.labelKey}
        ref={(el) => { rowRefs.current[i] = el; }}
        className="overflow-hidden py-1"
        onMouseEnter={() => {
          if (snapBackTimer.current) {
            clearTimeout(snapBackTimer.current);
            snapBackTimer.current = null;
          }
          setHoveredIdx(i);
          moveArrowTo(i);
          // Slide current text up, reveal the colored copy from below
          const up = overlayRef.current?.querySelector(`[data-slide-up="${i}"]`);
          const down = overlayRef.current?.querySelector(`[data-slide-down="${i}"]`);
          if (up) gsap.to(up, { yPercent: -100, duration: 0.45, ease: "power3.out" });
          if (down) gsap.to(down, { yPercent: -100, duration: 0.45, ease: "power3.out" });
        }}
        onMouseLeave={(e) => {
          const related = e.relatedTarget as Node | null;

          const isEnteringAnyRow =
            rowRefs.current.some((row) => row && (row === related || row.contains(related))) ||
            linkRefs.current.some((link) => link && (link === related || link.contains(related)));

          // Always reset this row's text — even when moving to a sibling
          const upEl = overlayRef.current?.querySelector(`[data-slide-up="${i}"]`);
          const downEl = overlayRef.current?.querySelector(`[data-slide-down="${i}"]`);
          if (upEl) gsap.to(upEl, { yPercent: 0, duration: 0.35, ease: "power3.out" });
          if (downEl) gsap.to(downEl, { yPercent: 0, duration: 0.35, ease: "power3.out" });

          if (isEnteringAnyRow) return; // only skip the arrow snap-back

          snapBackTimer.current = setTimeout(() => {
            const fallback = activeIdx >= 0 ? activeIdx : 0;
            moveArrowTo(fallback);
            snapBackTimer.current = null;
          }, 40);
        }}
      >
        <Link
          ref={(el) => { linkRefs.current[i] = el; }}
          to={link.to}
          onClick={onClose}
          className="dl-inner flex items-center gap-4 xl:gap-6 group w-fit cursor-pointer"
        >
          <span
            className={`text-xs font-mono tracking-widest w-7 flex-shrink-0 transition-colors duration-300 select-none ${
              isActive ? "text-primary" : "text-muted-foreground/40 group-hover:text-primary/60"
            }`}
          >
            {link.id}
          </span>
          <span
            className="relative overflow-hidden font-display font-black uppercase leading-[0.88] tracking-tighter"
            style={{ fontSize: "clamp(2.4rem, 3.8vw, 4.5rem)" }}
          >
            <span data-slide-up={i} className={`block ${isActive ? "text-primary" : "text-foreground"}`}>
              {t(link.labelKey, link.fallback)}
            </span>
            <span data-slide-down={i} className="absolute inset-0 block text-primary" style={{ top: '100%' }}>
              {t(link.labelKey, link.fallback)}
            </span>
          </span>
        </Link>
      </div>
    );
  })} */}
  {navLinks.map((link, i) => {
  const isActive = location.pathname === link.to;
  return (
    <div
      key={link.labelKey}
      ref={(el) => { rowRefs.current[i] = el; }}
      className="py-1"  // ← remove overflow-hidden, it clips the chars
      onMouseEnter={() => {
        if (snapBackTimer.current) {
          clearTimeout(snapBackTimer.current);
          snapBackTimer.current = null;
        }
        setHoveredIdx(i);
        moveArrowTo(i);
      }}
      onMouseLeave={(e) => {
        const related = e.relatedTarget as Node | null;
        const isEnteringAnyRow =
          rowRefs.current.some((row) => row && (row === related || row.contains(related))) ||
          linkRefs.current.some((l) => l && (l === related || l.contains(related)));
        if (isEnteringAnyRow) return;
        snapBackTimer.current = setTimeout(() => {
          const fallback = activeIdx >= 0 ? activeIdx : 0;
          moveArrowTo(fallback);
          setHoveredIdx(fallback);
          snapBackTimer.current = null;
        }, 40);
      }}
    >
      <Link
        ref={(el) => { linkRefs.current[i] = el; }}
        to={link.to}
        onClick={onClose}
        className="dl-inner flex items-center gap-4 xl:gap-6 w-fit cursor-pointer"
      >
        <span
          className={`text-xs font-mono tracking-widest w-7 flex-shrink-0 transition-colors duration-300 select-none ${
            isActive ? "text-primary" : "text-muted-foreground/40"
          }`}
        >
          {link.id}
        </span>
        <AnimatedLabel
          text={t(link.labelKey, link.fallback)}
          isActive={isActive}
        />
      </Link>
    </div>
  );
})}
</nav>

        {/* Footer — unchanged */}
        <div className="mt-auto pt-6 border-t border-border/50">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div className="dm-util flex items-center gap-3">
              <ThemeToggle />
              <LanguageSwitcher />
              <Link
                to="/dashboard"
                onClick={onClose}
                className="group flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors duration-200 ml-1"
              >
                {t("navbar.dashboard", "Admin Login")}
                <ArrowUpRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
            <div className="dm-util">
              <Link to="/payment" onClick={onClose}>
                <SweepFillButton className="h-12 rounded-xl text-sm px-8">
                  {t("navbar.donateNow", "Donate Now")}
                </SweepFillButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Navbar
// ─────────────────────────────────────────────────────────────────────────────
const Navbar = () => {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileTlRef = useRef<gsap.core.Timeline | null>(null);

  const mobileOpenRef = useRef(mobileOpen);
  useEffect(() => { mobileOpenRef.current = mobileOpen; }, [mobileOpen]);

  // ── Scroll: hide-on-scroll-down, show-on-scroll-up + sticky threshold ─────
  // V1 — does NOT guard against mobileOpen (navbar hides when mobile menu is open)
  // useEffect(() => {
  //   const onScroll = () => {
  //     const currentY = window.scrollY;
  //     const delta = currentY - lastScrollY.current;
  //     setIsSticky(currentY > 80);
  //     if (currentY > 80 && delta > 5) {
  //       setIsNavVisible(false);
  //     } else if (delta < -5 || currentY <= 80) {
  //       setIsNavVisible(true);
  //     }
  //     lastScrollY.current = currentY;
  //   };
  //   window.addEventListener("scroll", onScroll, { passive: true });
  //   onScroll();
  //   return () => window.removeEventListener("scroll", onScroll);
  // }, []);

  // V2 — skips the hide/show when mobile menu is open so the top bar stays put
  useEffect(() => {
    const onScroll = () => {
      if (mobileOpenRef.current) return;
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;
      setIsSticky(currentY > 80);
      if (currentY > 80 && delta > 5) {
        setIsNavVisible(false);
      } else if (delta < -5 || currentY <= 80) {
        setIsNavVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Mobile body lock ──────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // ── Mobile overlay GSAP timeline ─────────────────────────────────────────
  useGSAP(() => {
    if (!mobileMenuRef.current) return;
    mobileTlRef.current = gsap
      .timeline({ paused: true })
      .to(mobileMenuRef.current, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1.2,
        ease: "expo.inOut",
        force3D: true,
      })
      .from(
        ".menu-link-inner",
        { yPercent: 110, duration: 1.1, stagger: 0.1, ease: "expo.out" },
        "-=0.5"
      )
      .from(
        ".menu-footer > *",
        { y: 20, opacity: 0, duration: 0.8, stagger: 0.05, ease: "power3.out" },
        "-=0.8"
      );
  }, { scope: mobileMenuRef });

  useEffect(() => {
    if (!mobileTlRef.current) return;
    // Tell the shader to pause/resume so the GPU is free for the menu animation
    window.dispatchEvent(new CustomEvent("navmenu:toggle", { detail: { open: mobileOpen } }));
    mobileOpen ? mobileTlRef.current.play() : mobileTlRef.current.reverse();
  }, [mobileOpen]);

  const closeDesktop = useCallback(() => setDesktopOpen(false), []);

  // Drives the floating glass-pill look on the desktop menu cluster.
  const showStickyChrome = isSticky && !mobileOpen && !desktopOpen;

  // ── Top bar: glass on mobile, slides up/down on scroll ───────────────────
  const topBarClasses = [
    "fixed top-0 left-0 right-0 z-50 will-change-transform transition-all duration-300 ease-out",
    mobileOpen || !isSticky || !isNavVisible ? "bg-transparent border-transparent shadow-none" : "bg-card/90 backdrop-blur-md border-b border-border shadow-sm",
    mobileOpen || isNavVisible ? "translate-y-0" : "-translate-y-full",
    "lg:bg-transparent lg:backdrop-blur-none lg:border-transparent lg:shadow-none lg:translate-y-0 lg:transition-none",
    desktopOpen ? "lg:opacity-0 lg:pointer-events-none" : "lg:opacity-100",
  ].join(" ");

  return (
    <>
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <nav className={topBarClasses}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo — icon + title, gets floating pill on desktop when scrolled */}
            {mobileOpen || desktopOpen ? (
              <Link
                to="/"
                onClick={() => { setMobileOpen(false); setDesktopOpen(false); }}
                className={`flex items-center gap-2 group relative z-50 lg:rounded-full lg:pl-2 lg:pr-4 lg:py-2 lg:border transition-all duration-500 ${
                  showStickyChrome
                    ? "lg:bg-card/90 lg:backdrop-blur-md lg:border-border lg:shadow-sm"
                    : "lg:border-transparent"
                }`}
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl gradient-hero flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow duration-300 drop-shadow-md">
                  <Heart className="w-[18px] h-[18px] text-primary-foreground fill-current" />
                </div>
                <span className="text-lg sm:text-xl font-bold text-foreground">
                  {t("brand.amana", "HopeBridge")}
                </span>
              </Link>
            ) : (
              <TransitionLink
                to="/"
                onTransitionStart={() => { setMobileOpen(false); setDesktopOpen(false); }}
                className={`flex items-center gap-2 group relative z-50 lg:rounded-full lg:pl-2 lg:pr-4 lg:py-2 lg:border transition-all duration-500 ${
                  showStickyChrome
                    ? "lg:bg-card/90 lg:backdrop-blur-md lg:border-border lg:shadow-sm"
                    : "lg:border-transparent"
                }`}
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl gradient-hero flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow duration-300 drop-shadow-md">
                  <Heart className="w-[18px] h-[18px] text-primary-foreground fill-current" />
                </div>
                <span className="text-lg sm:text-xl font-bold text-foreground">
                  {t("brand.amana", "HopeBridge")}
                </span>
              </TransitionLink>
            )}

            {/* ── Desktop: MENU trigger + Donate ── */}
            <div
              className={`hidden lg:flex items-center gap-2 rounded-full p-1.5 border transition-all duration-500 ${
                showStickyChrome
                  ? "bg-card/90 backdrop-blur-md border-border shadow-sm gap-0"
                  : "border-transparent"
              }`}
            >
              <button
                onClick={() => setDesktopOpen((prev) => !prev)}
                aria-expanded={desktopOpen}
                aria-label={desktopOpen ? t("navbar.closeMenu", "Close menu") : t("navbar.openMenu", "Open menu")}
                className={`group relative flex items-center gap-3 px-5 py-2.5 ${mobileOpen? "rounded-xl": "rounded-full"} rounded-full border transition-all duration-300 hover:bg-primary/5 ${
                  showStickyChrome
                    ? "border-transparent"
                    : "border-border/60 hover:border-primary/50"
                }`}
              >
                <span className="flex flex-col justify-center gap-[5px] w-5 h-4 overflow-visible">
                  <span
                    className="block h-[1.5px] w-full bg-foreground rounded-full"
                    style={{
                      transition: "transform 0.6s cubic-bezier(0.87, 0, 0.13, 1)",
                      transform: desktopOpen
                        ? "rotate(45deg) translateY(3.5px)"
                        : "none",
                    }}
                  />
                  <span
                    className="block h-[1.5px] w-full bg-foreground rounded-full"
                    style={{
                      transition: "transform 0.6s cubic-bezier(0.87, 0, 0.13, 1)",
                      transform: desktopOpen
                        ? "rotate(-45deg) translateY(-3.5px)"
                        : "none",
                    }}
                  />
                </span>
                <span className="text-sm font-semibold uppercase tracking-[0.14em] w-[3.5rem] text-left transition-colors duration-200 group-hover:text-primary">
                  {desktopOpen ? t("navbar.close", "Close") : t("navbar.menu", "Menu")}
                </span>
              </button>

              <span
                className={` transition-all duration-500 ease-out ${
                  isSticky ? "max-w-0 opacity-0 scale-90 " : "max-w-[220px] opacity-100 scale-100 "
                }`}
              >
                <Link
              to="/Payment"
              onClick={() => setMobileOpen(false)}
              className="group relative flex items-center gap-2 bg-primary/80 text-primary-foreground rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:bg-primary hover:shadow-lg whitespace-nowrap hover:scale-[1.05]"
            >
                  <span className="text-sm font-semibold uppercase tracking-wider">
                    {t("navbar.donateNow", "Donate Now")}
                  </span>
                  <div className="relative w-4 h-4 overflow-hidden">
                    <ArrowUpRight className="absolute inset-0 w-4 h-4 text-primary-foreground transition-transform duration-300 ease-in-out group-hover:translate-x-4 group-hover:-translate-y-4" />
                    <ArrowUpRight className="absolute inset-0 w-4 h-4 text-primary-foreground -translate-x-4 translate-y-4 transition-transform duration-300 ease-in-out group-hover:translate-x-0 group-hover:translate-y-0" />
                  </div>
                </Link>
              </span>
            </div>

            {/* ── Mobile: hamburger ── */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="group lg:hidden p-2.5 text-foreground relative z-50"
              type="button"
              aria-label={t("navbar.toggleMenu", "Toggle Menu")}
              aria-expanded={mobileOpen}
            >
              <MenuIcon isOpen={mobileOpen} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Desktop full-screen overlay ──────────────────────────────────── */}
      <DesktopOverlay isOpen={desktopOpen} onClose={closeDesktop} />

      {/* ── Mobile overlay ───────────────────────────────────────────────── */}
      <div
        ref={mobileMenuRef}
        className={`fixed inset-0 z-40 bg-background flex flex-col lg:hidden will-change-transform ${
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" }}
      >
        <div className="flex-1 flex flex-col justify-center gap-4 px-6 sm:px-10 mt-20">
          {navLinks.map((link) => (
            <div key={link.labelKey} className="overflow-hidden pb-2">
              <Link
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="menu-link-inner flex items-baseline gap-4 text-5xl sm:text-6xl font-black uppercase tracking-tighter text-foreground group w-fit [backface-visibility:hidden] [transform:translateZ(0)]"
              >
                <span className="text-sm sm:text-base font-medium text-muted-foreground tracking-normal transition-colors">
                  {link.id}
                </span>
                <span className="relative leading-none pb-1 after:absolute after:bottom-0 after:left-0 after:h-[4px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:duration-500 after:ease-out after:bg-primary">
                  {t(link.labelKey, link.fallback)}
                </span>
              </Link>
            </div>
          ))}
        </div>

        <div className="menu-footer w-full px-6 sm:px-10 pb-8 flex flex-col gap-6 mt-auto">
          <div className="w-full h-px bg-border" />
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="group flex items-center gap-2"
            >
              <span className="text-sm font-semibold uppercase tracking-wider transition-colors duration-300 group-hover:text-primary">
                {t("navbar.dashboard", "Admin Login")}
              </span>
              <div className="relative w-4 h-4 overflow-hidden">
                <ArrowUpRight className="absolute inset-0 w-4 h-4 text-primary transition-transform duration-300 ease-in-out group-hover:translate-x-4 group-hover:-translate-y-4" />
                <ArrowUpRight className="absolute inset-0 w-4 h-4 text-primary -translate-x-4 translate-y-4 transition-transform duration-300 ease-in-out group-hover:translate-x-0 group-hover:translate-y-0" />
              </div>
            </Link>
          </div>
          <Link
            to="/payment"
            onClick={() => setMobileOpen(false)}
            className="w-full"
          >
            <SweepFillButton className="w-full h-14 rounded-xl text-lg shadow-sm">
              {t("navbar.donateNow", "Donate Now")}
            </SweepFillButton>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;