import { useRef, useLayoutEffect, useEffect, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLenis } from "lenis/react";
import { ArrowRight, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Copy, { type CopyHandle } from "../Copy";
import {
  useAnimationCoordinator,
  type AnimationMode,
} from "@/components/AnimationCoordinator";
import gsap from "gsap";

/* ───────────────────────────────────────────────────────────
   HeroSection3 — Awwwards-level hero that continues the
   preloader's kinetic shard energy into the page reveal.
   ─────────────────────────────────────────────────────────── */

export default function HeroSection3() {
  const { t } = useTranslation();
  const lenis = useLenis();

  /* ── Copy refs for masked word reveals ── */
  const copyKickerRef = useRef<CopyHandle>(null);
  const copyTitle1Ref = useRef<CopyHandle>(null);
  const copyTitle2Ref = useRef<CopyHandle>(null);
  const copySubRef = useRef<CopyHandle>(null);

  /* ── Element refs for GSAP orchestration ── */
  const sectionRef = useRef<HTMLElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const decorRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);

  const { registerAnimation } = useAnimationCoordinator();

  /* ── Register the coordinated reveal ── */
  useLayoutEffect(() => {
    const unsub = registerAnimation((mode: AnimationMode) => {
      if (mode === "reveal") {
        /* ── Full cinematic reveal when coming from the preloader ── */

        // 1. Typography cascade
        copyKickerRef.current?.play();
        copyTitle1Ref.current?.play();
        copyTitle2Ref.current?.play();
        copySubRef.current?.play();

        // 2. Image — dramatic diagonal clip-path unmask (mirrors the preloader's shard angles)
        gsap.fromTo(
          imageWrapRef.current,
          {
            clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
            opacity: 1,
          },
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 1.6,
            ease: "power4.inOut",
            delay: 0.15,
          }
        );

        // Image internal Ken Burns
        gsap.fromTo(
          imageRef.current,
          { scale: 1.2 },
          { scale: 1.0, duration: 2.4, ease: "power2.out", delay: 0.15 }
        );

        // 3. CTA group — fade & lift
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", delay: 0.7 }
        );

        // 4. Quote card — glassmorphic slide-in
        gsap.fromTo(
          quoteRef.current,
          { opacity: 0, y: 40, rotateX: 8 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 1,
            ease: "power3.out",
            delay: 1.0,
          }
        );

        // 5. Decorative layer — soft fade-in
        gsap.fromTo(
          decorRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 1.2, ease: "power2.out", delay: 0.3 }
        );

        // 6. HUD elements
        gsap.fromTo(
          hudRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 1.4, ease: "power2.out", delay: 0.6 }
        );

        // 7. Vertical divider draws in
        gsap.fromTo(
          dividerRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            duration: 1.2,
            ease: "power3.inOut",
            delay: 0.4,
          }
        );

        // 8. Scroll indicator
        gsap.fromTo(
          scrollRef.current,
          { opacity: 0, y: -12 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", delay: 1.4 }
        );

        // 9. Trust signals
        gsap.fromTo(
          trustRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 1, ease: "power2.out", delay: 1.6 }
        );
      } else {
        /* ── Soft fade mode (direct page load, no preloader) ── */
        copyKickerRef.current?.fadeIn();
        copyTitle1Ref.current?.fadeIn();
        copyTitle2Ref.current?.fadeIn();
        copySubRef.current?.fadeIn();

        gsap.fromTo(
          [
            imageWrapRef.current,
            ctaRef.current,
            quoteRef.current,
            decorRef.current,
            hudRef.current,
            dividerRef.current,
            scrollRef.current,
            trustRef.current,
          ],
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.08,
            ease: "power3.out",
            delay: 0.5,
          }
        );
      }
    });

    return () => unsub();
  }, [registerAnimation]);

  /* ── Gentle scroll-indicator float ── */
  useEffect(() => {
    const tl = gsap.to(".hero3-scroll-dot", {
      y: 8,
      duration: 1.6,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });
    return () => {
      tl.kill();
    };
  }, []);

  const scrollToAbout = (e: MouseEvent) => {
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
      className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden bg-background"
    >
      {/* ── Film-grain texture overlay (matches preloader) ── */}
      <svg
        className="pointer-events-none absolute inset-0 z-[2] h-full w-full opacity-[0.025] mix-blend-difference"
        aria-hidden
      >
        <filter id="hero3-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero3-noise)" />
      </svg>

      {/* ── Decorative angular lines (echo preloader shards) ── */}
      <div
        ref={decorRef}
        className="absolute inset-0 pointer-events-none z-[1] opacity-0"
        aria-hidden
      >
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          {/* Diagonal shard guidelines — same 20% angles as the preloader */}
          <line
            x1="20%"
            y1="0%"
            x2="40%"
            y2="100%"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeOpacity="0.06"
          />
          <line
            x1="60%"
            y1="0%"
            x2="80%"
            y2="100%"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeOpacity="0.06"
          />
        </svg>

        {/* Horizontal scan rules */}
        <div
          className="absolute left-0 right-0 h-px bg-foreground/[0.04]"
          style={{ top: "25%" }}
        />
        <div
          className="absolute left-0 right-0 h-px bg-foreground/[0.04]"
          style={{ top: "75%" }}
        />
      </div>

      {/* ── HUD corner brackets + labels (preloader DNA) ── */}
      <div
        ref={hudRef}
        className="absolute inset-0 pointer-events-none z-[3] opacity-0"
        aria-hidden
      >
        {/* Corner brackets */}
        <svg
          className="absolute top-5 left-5 md:top-8 md:left-8"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          style={{ opacity: 0.25 }}
        >
          <path
            d="M 0 24 L 0 0 L 24 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
        <svg
          className="absolute top-5 right-5 md:top-8 md:right-8"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          style={{ opacity: 0.25 }}
        >
          <path
            d="M 24 24 L 24 0 L 0 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
        <svg
          className="absolute bottom-5 left-5 md:bottom-8 md:left-8"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          style={{ opacity: 0.25 }}
        >
          <path
            d="M 0 0 L 0 24 L 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
        <svg
          className="absolute bottom-5 right-5 md:bottom-8 md:right-8"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          style={{ opacity: 0.25 }}
        >
          <path
            d="M 24 0 L 24 24 L 0 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>

        {/* Mono micro-labels */}
        <div className="absolute top-[14px] left-[52px] md:top-[22px] md:left-[60px] font-mono text-[8px] md:text-[9px] uppercase tracking-[0.25em] text-foreground/20 leading-tight hidden sm:block">
          <div>HERO:MAIN</div>
          <div>FRAME 001</div>
        </div>
        <div className="absolute top-[14px] right-[52px] md:top-[22px] md:right-[60px] font-mono text-[8px] md:text-[9px] uppercase tracking-[0.25em] text-foreground/20 leading-tight text-right hidden sm:block">
          <div>AMANA/OS</div>
          <div>2024.12</div>
        </div>
      </div>

      {/* ── Main content grid ── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex-grow flex flex-col justify-center py-24 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-center min-h-[80vh]">
          {/* ─── LEFT: Typography + CTAs ─── */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col items-start lg:pr-12 pt-8 lg:pt-0">
            {/* Kicker badge */}
            <div className="overflow-hidden mb-6">
              <Copy
                ref={copyKickerRef}
                animateOnScroll={false}
                revealDelay={0.0}
                fadeDelay={0.5}
              >
                <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full border border-primary/20 bg-primary/[0.06] text-primary text-[11px] font-mono uppercase tracking-[0.3em] font-semibold backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  <span>
                    {t("hero.badge", "Making a Difference")}
                  </span>
                </div>
              </Copy>
            </div>

            {/* Display heading */}
            <h1 className="font-display font-black text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.9] tracking-tighter text-foreground mb-8">
              <Copy
                ref={copyTitle1Ref}
                animateOnScroll={false}
                revealDelay={0.1}
                fadeDelay={0.6}
              >
                <span className="block">
                  {t("hero.titlePre", "Helping Those")}
                </span>
              </Copy>
              <Copy
                ref={copyTitle2Ref}
                animateOnScroll={false}
                revealDelay={0.18}
                fadeDelay={0.68}
              >
                <span className="block text-primary italic">
                  {t("hero.titleEm", "Who Need It Most")}
                </span>
              </Copy>
            </h1>

            {/* Subtitle with editorial left border */}
            <div className="max-w-md mb-10 pl-5 border-l-[2px] border-primary/30">
              <Copy
                ref={copySubRef}
                animateOnScroll={false}
                revealDelay={0.28}
                fadeDelay={0.75}
              >
                <p className="text-[clamp(0.95rem,1.3vw,1.1rem)] leading-[1.7] text-muted-foreground font-medium">
                  {t(
                    "hero.subtitle",
                    "Amana Charity & Edir connects donors with families in need through transparent and impactful aid distribution. Together, we can make a difference."
                  )}
                </p>
              </Copy>
            </div>

            {/* CTA buttons */}
            <div
              ref={ctaRef}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto opacity-0"
            >
              <Link to="/payment" className="w-full sm:w-auto group">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-14 px-9 text-base rounded-full shadow-[0_0_50px_-12px_hsl(var(--primary))] hover:shadow-[0_0_70px_-15px_hsl(var(--primary))] transition-all duration-300 font-semibold"
                >
                  {t("hero.ctaPrimary", "Donate Now")}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="lg"
                onClick={scrollToAbout}
                className="w-full sm:w-auto h-14 px-9 text-base rounded-full border border-border/60 hover:bg-muted/60 transition-colors duration-200 font-medium"
              >
                {t("hero.ctaSecondary", "See Our Impact")}
              </Button>
            </div>

            {/* Trust signals */}
            <div
              ref={trustRef}
              className="mt-10 flex items-center gap-5 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground/60 opacity-0"
            >
              <span className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-primary" />
                100% Secure
              </span>
              <span className="w-px h-3 bg-border" />
              <span className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-primary" />
                Direct Impact
              </span>
              <span className="w-px h-3 bg-border" />
              <span className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-primary" />
                Transparent
              </span>
            </div>
          </div>

          {/* ─── CENTER DIVIDER (desktop only) ─── */}
          <div className="hidden lg:flex lg:col-span-1 justify-center items-center">
            <div
              ref={dividerRef}
              className="w-px h-[60vh] bg-gradient-to-b from-transparent via-border to-transparent origin-top"
              style={{ transform: "scaleY(0)" }}
            />
          </div>

          {/* ─── RIGHT: Editorial image ─── */}
          <div className="lg:col-span-5 xl:col-span-6 relative lg:pl-8">
            <div
              ref={imageWrapRef}
              className="relative w-full aspect-[3/4] lg:aspect-[4/5] rounded-2xl overflow-hidden opacity-0 shadow-2xl"
              style={{
                clipPath:
                  "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
              }}
            >
              <img
                ref={imageRef}
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1800&auto=format&fit=crop&q=80"
                alt={t(
                  "hero.imageAlt",
                  "Making an impact in our community"
                )}
                className="w-full h-full object-cover will-change-transform"
              />

              {/* Image overlay gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />

              {/* Floating quote card */}
              <div
                ref={quoteRef}
                className="absolute bottom-5 left-5 right-5 sm:bottom-7 sm:left-7 sm:right-7 backdrop-blur-xl bg-white/[0.08] dark:bg-white/[0.06] border border-white/[0.15] p-5 sm:p-6 rounded-2xl opacity-0"
                style={{ perspective: "600px" }}
              >
                <p className="text-white/90 text-sm sm:text-[0.9375rem] leading-relaxed font-medium italic">
                  "Every contribution builds a bridge of hope for a family
                  in need."
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="w-8 h-px bg-white/30" />
                  <span className="text-white/50 text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em]">
                    HopeBridge Mission
                  </span>
                </div>
              </div>

              {/* Image frame index (editorial touch) */}
              <div className="absolute top-5 right-5 font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">
                001 / 001
              </div>
            </div>

            {/* Decorative blur glow behind image */}
            <div
              className="absolute -inset-6 bg-primary/[0.04] rounded-[2rem] -z-10 blur-3xl"
              aria-hidden
            />
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div
        ref={scrollRef}
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 cursor-pointer z-10"
        onClick={scrollToAbout}
      >
        <span className="text-[9px] uppercase tracking-[0.3em] font-mono text-muted-foreground/60 font-semibold">
          {t("hero.scrollDown", "Scroll")}
        </span>
        <div className="w-7 h-11 border border-border/60 rounded-full flex justify-center pt-2 bg-background/50 backdrop-blur-sm">
          <div className="hero3-scroll-dot w-1 h-1 bg-primary rounded-full" />
        </div>
        <ArrowDown className="w-3 h-3 text-muted-foreground/40 -mt-0.5" />
      </div>
    </section>
  );
}
