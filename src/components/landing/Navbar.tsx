// import { useState } from "react";
// import { Link } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import { Button } from "@/components/ui/button";
// import { Heart, Menu, X } from "lucide-react";
// import { LanguageSwitcher } from "@/components/LanguageSwitcher";
// import { ThemeToggle } from "@/components/ThemeToggle";
// import { useLenis } from "lenis/react";

// const Navbar = () => {
//   const { t } = useTranslation();
//   const [isOpen, setIsOpen] = useState(false);
//   const lenis = useLenis();

//   const handleNavClick = (href: string) => (e: React.MouseEvent) => {
//     e.preventDefault();
//     setIsOpen(false);
//     lenis?.scrollTo(href);
//   };

//   const navLinks = [
//     { labelKey: "navbar.aboutUs", href: "#about" },
//     { labelKey: "navbar.campaigns", href: "#campaigns" },
//     { labelKey: "navbar.impact", href: "#impact" },
//     { labelKey: "navbar.stories", href: "#stories" },
//     { labelKey: "navbar.contact", href: "#contact" },
//   ];

//   return (
//     <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border will-change-transform">
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between h-16 lg:h-20">
//           <Link to="/" className="flex items-center gap-2 group">
//             <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow duration-300">
//               <Heart className="w-5 h-5 text-primary-foreground fill-current" />
//             </div>
//             <span className="text-xl font-bold text-foreground">
//               {t("brand.hope")}
//               <span className="text-primary">{t("brand.bridge")}</span>
//             </span>
//           </Link>

//           <div className="hidden lg:flex items-center gap-8">
//             {navLinks.map((link) => (
//               <a
//                 key={link.labelKey}
//                 href={link.href}
//                 onClick={handleNavClick(link.href)}
//                 className="text-muted-foreground hover:text-primary font-medium transition-colors duration-200"
//               >
//                 {t(link.labelKey)}
//               </a>
//             ))}
//           </div>

//           <div className="hidden lg:flex items-center gap-3">
//             <ThemeToggle />
//             <LanguageSwitcher />
//             <Link to="/dashboard">
//               <Button variant="ghost">{t("navbar.dashboard")}</Button>
//             </Link>
//             <Link to="/payment">
//               <Button variant="default">{t("navbar.donateNow")}</Button>
//             </Link>
//           </div>

//           <button
//             onClick={() => setIsOpen(!isOpen)}
//             className="lg:hidden p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
//             type="button"
//           >
//             {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//           </button>
//         </div>

//         {isOpen && (
//           <div className="lg:hidden py-4 border-t border-border animate-fade-in">
//             <div className="flex flex-col gap-2">
//               {navLinks.map((link) => (
//                 <a
//                   key={link.labelKey}
//                   href={link.href}
//                   onClick={handleNavClick(link.href)}
//                   className="px-4 py-3 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg font-medium transition-all duration-200"
//                 >
//                   {t(link.labelKey)}
//                 </a>
//               ))}
//               <div className="flex gap-2 mt-4 px-4">
//                 <ThemeToggle />
//                 <LanguageSwitcher />
//               </div>
//               <div className="flex flex-col gap-2 mt-4 px-4">
//                 <Link to="/dashboard" onClick={() => setIsOpen(false)}>
//                   <Button variant="outline" className="w-full">
//                     {t("navbar.dashboard")}
//                   </Button>
//                 </Link>
//                 <Link to="/payment" onClick={() => setIsOpen(false)}>
//                   <Button variant="default" className="w-full">
//                     {t("navbar.donateNow")}
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X, ArrowUpRight } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLenis } from "lenis/react";
import gsap from "gsap";

// --- New Left-to-Right Sweep Fill Button ---
const SweepFillButton = ({ children, onClick, className = "" }: { children: React.ReactNode, onClick?: () => void, className?: string }) => {
  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden bg-background text-foreground border border-border group ${className}`}
    >
      {/* The sweeping background layer. 
        origin-left anchors it to the left side, scale-x-0 keeps it hidden, 
        and group-hover:scale-x-100 expands it to full width smoothly.
      */}
      <span 
        className="absolute inset-0 bg-primary transition-transform duration-500 ease-out origin-left scale-x-0 group-hover:scale-x-100 z-0"
      />
      
      {/* Button Content */}
      <span className="relative z-10 group-hover:text-primary-foreground transition-colors duration-300 w-full h-full flex items-center justify-center font-semibold">
        {children}
      </span>
    </button>
  );
};

// Each bar = a clipped track holding two copies of the line.
  // On hover both copies translate the same direction along the bar's
  // OWN axis -> one exits off one end, the other enters from the other end.
  // const Bar = ({ innerRef, top }: { innerRef: React.RefObject<HTMLDivElement>; top: number }) => (
  //   <div
  //     ref={innerRef}
  //     className="absolute left-0 w-7 h-[2.5px] rounded-full"
  //     style={{ top }}
  //   >
  //     <div className="relative w-full h-full overflow-hidden rounded-full">
  //       <span className="absolute inset-0 bg-foreground rounded-full transition-transform duration-300 ease-out group-hover:translate-x-full" />
  //       <span className="absolute inset-0 bg-foreground rounded-full -translate-x-full transition-transform duration-300 ease-out group-hover:translate-x-0" />
  //     </div>
  //   </div>
  // );
//   const Bar = ({ innerRef, top }: { innerRef: React.RefObject<HTMLDivElement>; top: number }) => (
//   <div ref={innerRef} className="absolute left-0 w-7 h-[2.5px] rounded-full" style={{ top }}>
//     <div className="relative w-full h-full overflow-hidden rounded-full">
//       {/* Exiting copy: leaves immediately */}
//       <span className="absolute inset-0 bg-foreground rounded-full transition-transform duration-300 ease-in group-hover:translate-x-full" />
//       {/* Entering copy: starts 80ms later so it doesn't perfectly cancel the exit */}
//       <span className="absolute inset-0 bg-foreground rounded-full -translate-x-full transition-transform duration-300 ease-out delay-[80ms] group-hover:translate-x-0 group-hover:delay-[80ms]" />
//     </div>
//   </div>
// );

// const Bar = ({ innerRef, top }: { innerRef: React.RefObject<HTMLDivElement>; top: number }) => (
//   <div ref={innerRef} className="absolute left-0 w-7 h-[2.5px] rounded-full" style={{ top }}>
//     <span className="block w-full h-full bg-foreground rounded-full origin-right group-hover:[animation:bar-wipe_0.5s_ease-in-out]" />
//   </div>
// );

const Bar = ({ innerRef, top }: { innerRef: React.RefObject<HTMLDivElement>; top: number }) => (
  <div ref={innerRef} className="absolute left-0 w-7 h-[2.5px] rounded-full drop-shadow-md" style={{ top }}>
    <span className="block w-full h-full bg-foreground rounded-full origin-right group-hover:[animation:bar-wipe_0.5s_ease-in-out]" />
  </div>
);

  // --- Animated Hamburger <-> X Icon ---
const MenuIcon = ({ isOpen }: { isOpen: boolean }) => {
  const topRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      tl.current = gsap.timeline({ paused: true })
        // top bar drops to center and rotates into the first X diagonal
        .to(topRef.current, { y: 7, rotate: 45, duration: 0.55, ease: "back.out(1.7)" }, 0)
        // bottom bar rises to center and rotates into the second X diagonal
        .to(botRef.current, { y: -7, rotate: -45, duration: 0.55, ease: "back.out(1.7)" }, 0)
        // middle bar fades/collapses out of the way
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

// --- Main Navbar Component ---
const Navbar = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const lenis = useLenis();
  
  const tl = useRef<gsap.core.Timeline | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleScroll = () => {
      const navbarHeight = window.innerWidth >= 1024 ? 80 : 64;
      setIsSticky(window.scrollY > navbarHeight);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); 
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // useEffect(() => {
  //   const ctx = gsap.context(() => {
  //     tl.current = gsap.timeline({ paused: true })
  //       .to(menuRef.current, {
  //         clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
  //         duration: 1.2,
  //         ease: "expo.inOut"
  //       })
  //       .from(".menu-link-inner", {
  //         y: "110%", 
  //         rotate: 2, 
  //         duration: 1.2,
  //         stagger: 0.1,
  //         ease: "expo.out",
  //         force3D: true, 
  //       }, "-=0.6")
  //       .from(".menu-footer > *", {
  //         y: 20,
  //         opacity: 0,
  //         duration: 0.8,
  //         stagger: 0.05,
  //         ease: "power3.out"
  //       }, "-=0.8");
  //   }, menuRef);

  //   return () => ctx.revert();
  // }, []);

  useEffect(() => {
  const ctx = gsap.context(() => {
    tl.current = gsap.timeline({ paused: true })
      .to(menuRef.current, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1.2,
        ease: "expo.inOut",
        force3D: true,
      })
      .from(".menu-link-inner", {
        yPercent: 110,        // cleaner than y: "110%" on the transform itself
        duration: 1.1,
        stagger: 0.1,
        ease: "expo.out",
      }, "-=0.5")              // slightly less overlap with clip-path finishing
      .from(".menu-footer > *", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: "power3.out"
      }, "-=0.8");
  }, menuRef);

  return () => ctx.revert();
}, []);

  useEffect(() => {
    if (tl.current) {
      isOpen ? tl.current.play() : tl.current.reverse();
    }
  }, [isOpen]);

  const handleNavClick = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);
    
    setTimeout(() => {
      lenis?.scrollTo(href);
    }, 600); 
  };

  const navLinks = [
    { id: "01", labelKey: "navbar.aboutUs", href: "#about" },
    { id: "02", labelKey: "navbar.campaigns", href: "#campaigns" },
    { id: "03", labelKey: "navbar.impact", href: "#impact" },
    { id: "04", labelKey: "navbar.stories", href: "#stories" },
    { id: "05", labelKey: "navbar.contact", href: "#contact" },
  ];

  return (
    <>

      {/* PC Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 will-change-transform transition-all duration-300 
       lg:bg-card/90 lg:backdrop-blur-md lg:border-b lg:border-border lg:shadow-sm
       ${isOpen 
          ? "bg-transparent border-transparent" 
          : isSticky
          ? "bg-card/90 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent border-transparent"
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link to="/" className="flex items-center gap-2 group relative z-50" onClick={() => setIsOpen(false)}>
              {/* <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow duration-300">
                <Heart className="w-5 h-5 text-primary-foreground fill-current" />
              </div> */}
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow duration-300 drop-shadow-md">
                <Heart className="w-5 h-5 text-primary-foreground fill-current" />
              </div>
              <span className={`text-xl font-bold transition-colors duration-300 ${isOpen ? "text-foreground" : "text-foreground"}`}>
                {t("brand.hope")}
                <span className={`transition-colors duration-300 ${isSticky || isOpen ? "text-primary" : "text-foreground" }`}>
                  {t("brand.bridge")}
                </span>
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.labelKey}
                  href={link.href}
                  onClick={handleNavClick(link.href)}
                  className="text-muted-foreground hover:text-primary font-medium transition-colors duration-200"
                >
                  {t(link.labelKey)}
                </a>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <ThemeToggle />
              <LanguageSwitcher />
              <Link to="/dashboard">
                <Button variant="ghost">{t("navbar.dashboard")}</Button>
              </Link>
              <Link to="/payment">
                <Button variant="default">{t("navbar.donateNow")}</Button>
              </Link>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className=" group lg:hidden p-2 text-foreground  rounded-full transition-colors relative z-50 mix-blend-difference"
              type="button"
              aria-label="Toggle Menu"
            >
              {/* {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />} */}
              <MenuIcon isOpen={isOpen} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      <div 
        ref={menuRef}
        className={`fixed inset-0 z-40 bg-background flex flex-col lg:hidden will-change-transform ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" }}
      >
        <div className="flex-1 flex flex-col justify-center gap-4 px-6 sm:px-10 mt-20">
          {navLinks.map((link) => (
            <div key={link.labelKey} className="overflow-hidden pb-2">
              <a
                href={link.href}
                onClick={handleNavClick(link.href)}
                className="menu-link-inner flex items-baseline gap-4 text-5xl sm:text-6xl font-black uppercase tracking-tighter text-foreground group w-fit [backface-visibility:hidden] [transform:translateZ(0)]"
              >
                <span className="text-sm sm:text-base font-medium text-muted-foreground tracking-normal transition-colors">
                  {link.id}
                </span>
                <span className="relative leading-none pb-1 after:absolute after:bottom-0 after:left-0 after:h-[4px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:duration-500 after:ease-out after:bg-primary">
                  {t(link.labelKey)}
                </span>
              </a>
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
  onClick={() => setIsOpen(false)} 
  className="group flex items-center gap-2"
>
  <span className="text-sm font-semibold uppercase tracking-wider transition-colors duration-300 group-hover:text-primary">
    {t("navbar.dashboard")}
  </span>

  <div className="relative w-4 h-4 overflow-hidden">
    {/* Arrow 1: sits in place, exits up-right on hover */}
    <ArrowUpRight 
      className="absolute inset-0 w-4 h-4 text-primary transition-transform duration-300 ease-in-out 
                 group-hover:translate-x-4 group-hover:-translate-y-4" 
    />
    {/* Arrow 2: starts off-screen bottom-left, slides into place on hover */}
    <ArrowUpRight 
      className="absolute inset-0 w-4 h-4 text-primary -translate-x-4 translate-y-4 transition-transform duration-300 ease-in-out 
                 group-hover:translate-x-0 group-hover:translate-y-0" 
    />
  </div>
</Link>
          </div>

          <Link to="/payment" className="w-full">
            <SweepFillButton 
              onClick={() => setIsOpen(false)} 
              className="w-full h-14 rounded-xl text-lg shadow-sm"
            >
              {t("navbar.donateNow")}
            </SweepFillButton>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;