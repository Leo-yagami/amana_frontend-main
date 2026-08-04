import { useRef, useLayoutEffect, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLenis } from "lenis/react";
import { ArrowRight, ArrowDown, HeartHandshake, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Copy, { type CopyHandle } from "../Copy";
import { useAnimationCoordinator, type AnimationMode } from "@/components/AnimationCoordinator";
import gsap from "gsap";

export default function HeroSection2() {
  const { t } = useTranslation();
  const lenis = useLenis();
  
  // Refs for Copy components
  const copyPreRef = useRef<CopyHandle>(null);
  const copyTitle1Ref = useRef<CopyHandle>(null);
  const copyTitle2Ref = useRef<CopyHandle>(null);
  const copySubtitleRef = useRef<CopyHandle>(null);
  
  // Refs for custom GSAP animations
  const imageRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  const { registerAnimation } = useAnimationCoordinator();

  useLayoutEffect(() => {
    const unsub = registerAnimation((mode: AnimationMode) => {
      if (mode === "reveal") {
        // Sequenced typography reveal
        copyPreRef.current?.play();
        copyTitle1Ref.current?.play();
        copyTitle2Ref.current?.play();
        copySubtitleRef.current?.play();

        // Reveal the image with a clip-path unmask
        gsap.fromTo(
          imageRef.current,
          { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)", scale: 1.1 },
          { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", scale: 1, duration: 1.6, ease: "power4.out", delay: 0.2 }
        );

        // Fade in CTA and Badges
        gsap.fromTo(
          [ctaRef.current, badgesRef.current],
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.8 }
        );
        
        // Fade in Scroll Indicator
        gsap.fromTo(
          scrollIndicatorRef.current,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 1.2 }
        );

      } else {
        // Fallback fade mode
        copyPreRef.current?.fadeIn();
        copyTitle1Ref.current?.fadeIn();
        copyTitle2Ref.current?.fadeIn();
        copySubtitleRef.current?.fadeIn();

        gsap.fromTo(
          [imageRef.current, ctaRef.current, badgesRef.current, scrollIndicatorRef.current],
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.7 }
        );
      }
    });

    return () => unsub();
  }, [registerAnimation]);

  // Gentle float animation for the scroll indicator
  useLayoutEffect(() => {
    const tl = gsap.to(".scroll-arrow", {
      y: 6,
      duration: 1.5,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });
    return () => { tl.kill(); };
  }, []);

  const scrollToImpact = (e: MouseEvent) => {
    e.preventDefault();
    lenis?.scrollTo("#impact", { offset: -50, duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  };

  return (
    <section className="relative min-h-[100svh] flex flex-col justify-center pt-24 pb-12 overflow-hidden bg-background">
      {/* Background Noise/Grid for premium feel */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-difference z-0">
         <svg className="w-full h-full">
           <filter id="hero-noise">
             <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
           </filter>
           <rect width="100%" height="100%" filter="url(#hero-noise)" />
         </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 flex-grow flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-7 xl:col-span-6 flex flex-col items-start pt-8 lg:pt-0">
            <div className="overflow-hidden mb-6">
              <Copy ref={copyPreRef} animateOnScroll={false} revealDelay={0.0} fadeDelay={0.6}>
                <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono uppercase tracking-widest font-semibold">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>{t("hero.badge", "Making a Difference")}</span>
                </div>
              </Copy>
            </div>

            <h1 className="font-display font-black text-[clamp(3.2rem,8vw,6.5rem)] leading-[0.88] tracking-tighter text-foreground mb-6">
              <Copy ref={copyTitle1Ref} animateOnScroll={false} revealDelay={0.1} fadeDelay={0.65}>
                <span className="block mb-2">{t("hero.titlePre", "Helping Those")}</span>
              </Copy>
              <Copy ref={copyTitle2Ref} animateOnScroll={false} revealDelay={0.2} fadeDelay={0.7}>
                <span className="block text-primary italic pr-4">{t("hero.titleEm", "Who Need It Most")}</span>
              </Copy>
            </h1>

            <div className="max-w-md xl:max-w-lg mb-10 pl-1 border-l-2 border-primary/30">
              <Copy ref={copySubtitleRef} animateOnScroll={false} revealDelay={0.3} fadeDelay={0.75}>
                <p className="text-[clamp(1rem,1.2vw,1.125rem)] leading-relaxed text-muted-foreground ml-4 font-medium">
                  {t(
                    "hero.subtitle",
                    "Amana Charity & Edir connects donors with families in need through transparent and impactful aid distribution. Together, we can make a difference."
                  )}
                </p>
              </Copy>
            </div>

            <div ref={ctaRef} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto opacity-0">
              <Link to="/payment" className="w-full sm:w-auto group">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base rounded-full shadow-[0_0_40px_-10px_hsl(var(--primary))] hover:shadow-[0_0_60px_-15px_hsl(var(--primary))] transition-all duration-300">
                  {t("hero.ctaPrimary", "Donate Now")}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="lg"
                onClick={scrollToImpact}
                className="w-full sm:w-auto h-14 px-8 text-base rounded-full border border-border/50 hover:bg-muted transition-colors"
              >
                {t("hero.ctaSecondary", "See Our Impact")}
              </Button>
            </div>

            <div ref={badgesRef} className="mt-12 flex items-center gap-6 opacity-0">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span>100% Secure</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <HeartHandshake className="w-5 h-5 text-primary" />
                <span>Direct Impact</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Image */}
          <div className="lg:col-span-5 xl:col-span-6 relative h-[50vh] lg:h-[75vh] w-full mt-8 lg:mt-0">
             <div ref={imageRef} className="w-full h-full relative rounded-3xl overflow-hidden opacity-0 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1800&auto=format&fit=crop&q=80"
                  alt={t("hero.imageAlt", "Making an impact in our community")}
                  className="w-full h-full object-cover scale-105"
                />
                {/* Overlay gradient for depth */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-black/10" />
                
                {/* Floating elements inside image container */}
                <div className="absolute bottom-6 left-6 right-6 backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 p-5 rounded-2xl">
                   <p className="text-white text-sm font-medium leading-snug">
                     "Every contribution builds a bridge of hope for a family in need."
                   </p>
                </div>
             </div>
             
             {/* Decorative element behind image */}
             <div className="absolute -inset-4 bg-primary/5 rounded-[2.5rem] -z-10 blur-2xl" />
          </div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <div 
        ref={scrollIndicatorRef}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 cursor-pointer"
        onClick={scrollToImpact}
      >
         <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-muted-foreground font-semibold">
           {t("hero.scrollDown", "Scroll")}
         </span>
         <div className="w-8 h-12 border border-border rounded-full flex justify-center p-1 bg-background">
            <div className="scroll-arrow w-1.5 h-1.5 bg-primary rounded-full" />
         </div>
      </div>
    </section>
  );
}
