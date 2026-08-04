import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLenis } from "lenis/react";
import { ArrowRight, ArrowDown, Globe, Clock, Compass, HeartHandshake, ShieldCheck, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnimationCoordinator, type AnimationMode } from "@/components/AnimationCoordinator";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/* ───────────────────────────────────────────────────────────
   HeroSection4 — Futuristic Kinetic Grid / Awwwards Dashboard
   Inherits the preloader's mechanical 3D transitions & shard language.
   ─────────────────────────────────────────────────────────── */

export default function HeroSection4() {
  const { t } = useTranslation();
  const lenis = useLenis();
  const { registerAnimation } = useAnimationCoordinator();

  // Clock state
  const [timeStr, setTimeStr] = useState("12:00:00");
  // Feed/Ticker state
  const [feedIndex, setFeedIndex] = useState(0);

  // References
  const sectionRef = useRef<HTMLElement>(null);
  const imageShardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Magnetic refs
  const buttonPrimaryRef = useRef<HTMLButtonElement>(null);
  const buttonSecondaryRef = useRef<HTMLButtonElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  const feedItems = [
    t("hero.ticker1", "Direct Aid: $150 transferred to Family #291 in Wondo Genet"),
    t("hero.ticker2", "Verified: Clean Water Program received $500 from anonymous donor"),
    t("hero.ticker3", "Direct Aid: $320 transferred to Family #804 in Addis Ababa"),
    t("hero.ticker4", "Impact: Clinic visit voucher issued to Family #1240"),
    t("hero.ticker5", "Direct Aid: $75 transferred to Family #455 in Gondar"),
  ];

  // 1. Clock effect (Africa/Addis_Ababa)
  useEffect(() => {
    const updateClock = () => {
      try {
        const options: Intl.DateTimeFormatOptions = {
          timeZone: "Africa/Addis_Ababa",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        };
        setTimeStr(new Intl.DateTimeFormat("en-US", options).format(new Date()));
      } catch (e) {
        // Fallback to local system time if timezone fails
        const d = new Date();
        setTimeStr(
          d.getHours().toString().padStart(2, "0") + ":" +
          d.getMinutes().toString().padStart(2, "0") + ":" +
          d.getSeconds().toString().padStart(2, "0")
        );
      }
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Activity Ticker feed cycling
  useEffect(() => {
    const interval = setInterval(() => {
      gsap.to(".hero4-ticker-text", {
        opacity: 0,
        y: -10,
        duration: 0.3,
        onComplete: () => {
          setFeedIndex((prev) => (prev + 1) % feedItems.length);
          gsap.fromTo(
            ".hero4-ticker-text",
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.3 }
          );
        },
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [feedItems.length]);

  // 3. Animation Coordinator hooks (GSAP Reveal)
  useGSAP(
    () => {
      const unsub = registerAnimation((mode: AnimationMode) => {
        const tl = gsap.timeline();

        if (mode === "reveal") {
          // Coordinated entry animation matching the preloader's exit trigger
          tl.set(".hero4-divider", { scaleY: 0, opacity: 0 })
            .set(".hero4-reveal-word", { rotateX: 90, yPercent: 100, opacity: 0 })
            .set(".hero4-image-shard", { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)", scale: 1.15, opacity: 0 })
            .set([".hero4-fade-up", ".hero4-cta-wrap", ".hero4-hud-element", ".hero4-ticker"], { opacity: 0, y: 20 });

          // A. Draw vertical hairline divider rules
          tl.to(".hero4-divider", {
            scaleY: 1,
            opacity: 0.15,
            duration: 1.4,
            ease: "expo.out",
            stagger: 0.1,
          });

          // B. 3D Mechanical text flip-up
          tl.to(
            ".hero4-reveal-word",
            {
              rotateX: 0,
              yPercent: 0,
              opacity: 1,
              duration: 1.2,
              stagger: 0.08,
              ease: "expo.out",
            },
            "-=1.0"
          );

          // C. Image Shard diagonal clip reveal
          tl.to(
            ".hero4-image-shard",
            {
              clipPath: "polygon(0% 0%, 100% 8%, 100% 100%, 0% 92%)",
              scale: 1,
              opacity: 1,
              duration: 1.6,
              ease: "power4.inOut",
            },
            "-=1.2"
          );

          // D. Subtitles and UI labels lift
          tl.to(
            [".hero4-fade-up", ".hero4-cta-wrap"],
            {
              opacity: 1,
              y: 0,
              duration: 0.85,
              stagger: 0.1,
              ease: "power3.out",
            },
            "-=0.9"
          );

          // E. HUD telemetry details and real-time ledger ticker fade
          tl.to(
            [".hero4-hud-element", ".hero4-ticker"],
            {
              opacity: 1,
              y: 0,
              duration: 1.0,
              stagger: 0.05,
              ease: "power2.out",
            },
            "-=0.7"
          );
        } else {
          // Direct Page Load - Clean, fast fade-in with minor offset
          tl.set(".hero4-divider", { scaleY: 1, opacity: 0.15 });
          tl.set(".hero4-image-shard", {
            clipPath: "polygon(0% 0%, 100% 8%, 100% 100%, 0% 92%)",
            scale: 1,
            opacity: 1,
          });
          tl.set(".hero4-reveal-word", { rotateX: 0, yPercent: 0, opacity: 1 });

          tl.fromTo(
            [
              ".hero4-fade-up",
              ".hero4-cta-wrap",
              ".hero4-hud-element",
              ".hero4-ticker",
            ],
            { opacity: 0, y: 15 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.08,
              ease: "power3.out",
              delay: 0.2,
            }
          );
        }
      });

      return () => unsub();
    },
    { scope: sectionRef, dependencies: [registerAnimation] }
  );

  // 4. Parallax 3D tilt effect on the image shard
  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageShardRef.current || !imageRef.current) return;
    const card = imageShardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const xNorm = x / (rect.width / 2);
    const yNorm = y / (rect.height / 2);

    // Gently tilt image container in 3D + translate image inside for parallax
    gsap.to(card, {
      rotateY: xNorm * 8,
      rotateX: -yNorm * 8,
      duration: 0.4,
      ease: "power2.out",
    });

    gsap.to(imageRef.current, {
      x: -xNorm * 15,
      y: -yNorm * 15,
      scale: 1.06,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const handleImageMouseLeave = () => {
    if (!imageShardRef.current || !imageRef.current) return;
    gsap.to(imageShardRef.current, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.8,
      ease: "power3.out",
    });

    gsap.to(imageRef.current, {
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: "power3.out",
    });
  };

  // 5. Magnetic Hover helper for buttons and indicators
  const handleMagneticMouseMove = (
    e: React.MouseEvent<any>,
    elementRef: React.RefObject<any>,
    strength = 0.35
  ) => {
    if (!elementRef.current) return;
    const el = elementRef.current;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(el, {
      x: x * strength,
      y: y * strength,
      scale: 1.05,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMagneticMouseLeave = (
    elementRef: React.RefObject<any>
  ) => {
    if (!elementRef.current) return;
    gsap.to(elementRef.current, {
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.6,
      ease: "elastic.out(1, 0.3)",
    });
  };

  // 6. Smooth scroll trigger
  const scrollToAbout = (e: React.MouseEvent) => {
    e.preventDefault();
    lenis?.scrollTo("#about", {
      offset: -50,
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] flex flex-col justify-between overflow-hidden bg-background pt-24 pb-8 sm:pb-12 px-4 sm:px-8 lg:px-12 xl:px-16"
      style={{ perspective: "1200px" }}
    >
      {/* Film grain texture overlay */}
      <svg
        className="pointer-events-none absolute inset-0 z-10 h-full w-full opacity-[0.02] mix-blend-difference"
        aria-hidden
      >
        <filter id="hero4-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero4-grain)" />
      </svg>

      {/* Background ambient radial glowing spots */}
      <div className="absolute top-[20%] left-[10%] w-[35vw] h-[35vw] bg-primary/[0.04] rounded-full blur-[80px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-[40vw] h-[40vw] bg-accent/[0.03] rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Interactive 4-Column Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-grow pt-4 xl:pt-8 pb-10">
        
        {/* COLUMN 1: System Telemetry HUD (Desktop only, left 15%) */}
        <div className="lg:col-span-2 hidden xl:flex flex-col justify-between py-2 relative pr-6">
          <div className="hero4-hud-element space-y-4">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-primary animate-pulse" />
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-foreground/50">
                SYS: ACTIVE
              </span>
            </div>
            <div className="border border-border/40 bg-card/30 backdrop-blur-sm p-3 rounded-lg font-mono text-[9px] text-muted-foreground leading-relaxed space-y-1">
              <div>LOC: 15°N 38°E</div>
              <div>REG: ADDIS ABABA</div>
              <div>CONN: SECURE SSL</div>
              <div className="flex items-center gap-1.5 mt-1 text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                <span>LEDGER: OK</span>
              </div>
            </div>
          </div>

          <div className="hero4-hud-element origin-left rotate-270 translate-y-[-50px] translate-x-[-15px] select-none pointer-events-none">
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-foreground/15 whitespace-nowrap">
              AMANA // KINETIC LEDGER AID
            </span>
          </div>

          <div className="hero4-hud-element space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground/60">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px] uppercase tracking-widest">
                ADDIS TIME
              </span>
            </div>
            <div className="font-mono text-lg font-bold text-foreground tracking-widest tabular-nums bg-secondary/30 border border-border/20 py-1.5 px-3 rounded-md inline-block">
              {timeStr}
            </div>
          </div>
          
          {/* Divider Line */}
          <div className="hero4-divider absolute right-0 top-0 bottom-0 w-[1px] bg-border origin-top" />
        </div>

        {/* COLUMN 2: Central Text Content & CTA Action Box (60% width) */}
        <div className="lg:col-span-7 xl:col-span-6 flex flex-col justify-center lg:pr-8 relative">
          
          {/* Tagline / Kicker */}
          <div className="hero4-fade-up mb-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/[0.05] text-primary text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] font-semibold backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span>{t("hero.badge", "Making a Difference")}</span>
            </div>
          </div>

          {/* Headline - 3D mechanical rotate in */}
          <h1 className="font-display font-black text-[clamp(2.5rem,6.8vw,5.5rem)] leading-[0.88] tracking-tighter text-foreground mb-6 uppercase select-none">
            <div className="overflow-hidden py-1" style={{ perspective: "800px" }}>
              <span className="hero4-reveal-word inline-block origin-bottom-left will-change-transform pr-3">
                {t("hero.titlePre", "Helping Those")}
              </span>
            </div>
            <div className="overflow-hidden py-1" style={{ perspective: "800px" }}>
              <span className="hero4-reveal-word inline-block text-primary italic origin-bottom-left will-change-transform">
                {t("hero.titleEm", "Who Need It Most")}
              </span>
            </div>
          </h1>

          {/* Subheading in a clean left border box */}
          <div className="hero4-fade-up max-w-lg mb-8 pl-5 border-l-2 border-primary/30">
            <p className="text-[clamp(0.95rem,1.3vw,1.1rem)] leading-relaxed text-muted-foreground font-medium">
              {t(
                "hero.subtitle",
                "Amana Charity & Edir connects donors with families in need through transparent and impactful aid distribution. Together, we can make a difference."
              )}
            </p>
          </div>

          {/* CTA Button Wrap */}
          <div className="hero4-cta-wrap flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-12">
            <Link to="/payment" className="w-full sm:w-auto">
              <button
                ref={buttonPrimaryRef}
                onMouseMove={(e) => handleMagneticMouseMove(e, buttonPrimaryRef, 0.3)}
                onMouseLeave={() => handleMagneticMouseLeave(buttonPrimaryRef)}
                className="w-full sm:w-auto h-14 px-9 text-base rounded-xl bg-primary text-primary-foreground font-bold shadow-glow hover:shadow-[0_0_50px_rgba(20,184,166,0.3)] transition-all duration-300 flex items-center justify-center gap-2 will-change-transform"
              >
                {t("hero.ctaPrimary", "Donate Now")}
                <ArrowRight className="w-5 h-5 ml-1" />
              </button>
            </Link>
            <button
              ref={buttonSecondaryRef}
              onClick={scrollToAbout}
              onMouseMove={(e) => handleMagneticMouseMove(e, buttonSecondaryRef, 0.3)}
              onMouseLeave={() => handleMagneticMouseLeave(buttonSecondaryRef)}
              className="w-full sm:w-auto h-14 px-9 text-base rounded-xl border border-border bg-card/45 hover:bg-muted text-foreground font-semibold backdrop-blur-sm transition-colors duration-200 flex items-center justify-center gap-2 will-change-transform"
            >
              {t("hero.ctaSecondary", "See Our Impact")}
            </button>
          </div>

          {/* Real-time Ledger Activity Ticker */}
          <div className="hero4-ticker flex items-center gap-3 bg-secondary/20 border border-border/30 rounded-xl p-4 max-w-lg backdrop-blur-sm">
            <Globe className="w-4 h-4 text-primary shrink-0 animate-spin" style={{ animationDuration: "12s" }} />
            <div className="font-mono text-[10px] sm:text-xs text-muted-foreground tracking-wide leading-snug overflow-hidden">
              <span className="hero4-ticker-text block text-foreground font-medium">
                {feedItems[feedIndex]}
              </span>
            </div>
          </div>

          {/* Divider Line */}
          <div className="hero4-divider absolute right-0 top-0 bottom-0 w-[1px] bg-border origin-top hidden lg:block" />
        </div>

        {/* COLUMN 3 & 4: Visual Kinetic Shard Image & Trust Indicators (40% width) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-center relative lg:pl-6">
          <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] lg:aspect-[3/4.2] flex flex-col justify-between">
            
            {/* The Visual Shard - clip path cut */}
            <div
              ref={imageShardRef}
              onMouseMove={handleImageMouseMove}
              onMouseLeave={handleImageMouseLeave}
              className="hero4-image-shard absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border border-white/[0.05] z-0 cursor-crosshair bg-slate-900 will-change-transform"
              style={{
                clipPath: "polygon(0% 0%, 100% 8%, 100% 100%, 0% 92%)",
                transformStyle: "preserve-3d",
              }}
            >
              <img
                ref={imageRef}
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1800&auto=format&fit=crop&q=80"
                alt={t("hero.imageAlt", "Making an impact in our community")}
                className="w-full h-full object-cover select-none pointer-events-none will-change-transform"
              />
              
              {/* Glassmorphic overlays inside the image */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
              
              {/* Image Frame telemetry details */}
              <div className="absolute top-4 right-6 font-mono text-[9px] uppercase tracking-[0.25em] text-white/30 select-none">
                CAM_004 / ADDIS
              </div>
              <div className="absolute bottom-6 left-6 right-6 z-10 space-y-2 select-none">
                <span className="inline-block px-2 py-0.5 rounded bg-primary/20 backdrop-blur-md border border-primary/30 text-[9px] font-mono text-primary font-semibold uppercase tracking-wider">
                  Live View
                </span>
                <p className="text-white text-xs sm:text-sm font-semibold tracking-wide leading-relaxed">
                  "Every transaction builds a bridge of hope."
                </p>
              </div>
            </div>

            {/* Glowing blur spot directly behind visual shard */}
            <div className="absolute -inset-4 bg-primary/10 rounded-[2rem] -z-10 blur-3xl opacity-60 pointer-events-none" />
          </div>

          {/* Under-shard Glassmorphic Trust indicators */}
          <div className="hero4-fade-up mt-6 grid grid-cols-3 gap-2 text-center bg-card/35 border border-border/30 rounded-xl p-3.5 backdrop-blur-md">
            <div className="space-y-1">
              <div className="flex justify-center"><ShieldCheck className="w-4 h-4 text-primary" /></div>
              <div className="font-mono text-[9px] font-bold text-foreground tracking-wider">100% SECURE</div>
              <div className="text-[8px] text-muted-foreground">Ledger Verified</div>
            </div>
            <div className="border-x border-border/40 space-y-1">
              <div className="flex justify-center"><HeartHandshake className="w-4 h-4 text-primary" /></div>
              <div className="font-mono text-[9px] font-bold text-foreground tracking-wider">DIRECT AID</div>
              <div className="text-[8px] text-muted-foreground">No Intermediaries</div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-center"><Globe className="w-4 h-4 text-primary animate-pulse" /></div>
              <div className="font-mono text-[9px] font-bold text-foreground tracking-wider">TRANSPARENT</div>
              <div className="text-[8px] text-muted-foreground">Live Tracking</div>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER SCROLL INDICATOR */}
      <div className="hero4-hud-element flex items-center justify-between border-t border-border/30 pt-6">
        <div className="flex items-center gap-2 text-muted-foreground/40 font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.25em]">
          <span>AMANA PROTOCOL v2.4.1</span>
          <span className="w-1.5 h-1.5 rounded-full bg-border" />
          <span>STABLE RELEASE</span>
        </div>

        {/* Scroll down trigger */}
        <div
          ref={scrollIndicatorRef}
          onMouseMove={(e) => handleMagneticMouseMove(e, scrollIndicatorRef, 0.4)}
          onMouseLeave={() => handleMagneticMouseLeave(scrollIndicatorRef)}
          onClick={scrollToAbout}
          className="flex items-center gap-3 cursor-pointer group will-change-transform py-1 px-3 bg-secondary/35 border border-border/20 rounded-full select-none"
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground group-hover:text-primary transition-colors duration-200">
            {t("hero.scrollDown", "SCROLL DOWN")}
          </span>
          <div className="w-5 h-8 border border-border/60 rounded-full flex justify-center pt-1.5 bg-background shadow-sm transition-all duration-300 group-hover:border-primary">
            <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
          </div>
          <ArrowDown className="w-3 h-3 text-muted-foreground/60 group-hover:text-primary transition-colors duration-200" />
        </div>

        <div className="flex items-center gap-2 text-muted-foreground/40 font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.25em]">
          <span>GRID VIEW [OS_004]</span>
        </div>
      </div>
    </section>
  );
}
