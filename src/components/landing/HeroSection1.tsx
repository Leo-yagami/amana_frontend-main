import { useRef, useLayoutEffect, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLenis } from "lenis/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Copy, { type CopyHandle } from "../Copy";
import { useAnimationCoordinator, type AnimationMode } from "@/components/AnimationCoordinator";

export default function HeroSection() {
  const { t } = useTranslation();
  const lenis = useLenis();
  const copy1Ref = useRef<CopyHandle>(null);
  const copy2Ref = useRef<CopyHandle>(null);
  const copy3Ref = useRef<CopyHandle>(null);
  const { registerAnimation } = useAnimationCoordinator();

  useLayoutEffect(() => {
    const unsub1 = registerAnimation((mode: AnimationMode) => {
      if (mode === "reveal") {
        copy1Ref.current?.play();
      } else {
        copy1Ref.current?.fadeIn();
      }
    });
    const unsub2 = registerAnimation((mode: AnimationMode) => {
      if (mode === "reveal") {
        copy2Ref.current?.play();
      } else {
        copy2Ref.current?.fadeIn();
      }
    });
    const unsub3 = registerAnimation((mode: AnimationMode) => {
      if (mode === "reveal") {
        copy3Ref.current?.play();
      } else {
        copy3Ref.current?.fadeIn();
      }
    });
    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [registerAnimation]);

  const scrollToImpact = (e: MouseEvent) => {
    e.preventDefault();
    lenis?.scrollTo("#impact");
  };

  return (
    <section className="relative overflow-hidden flex items-center min-h-[88vh] sm:min-h-[80vh] pt-24 pb-16 sm:pt-28 sm:pb-20">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1800&auto=format&fit=crop&q=80"
          alt={t("hero.imageAlt", "Making an impact in our community")}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <h1 className="font-display font-bold tracking-tight text-[clamp(1.875rem,6.5vw,3.75rem)] leading-[1.08] sm:leading-[1.04] max-w-xl text-balance mb-5 text-primary">
          <Copy ref={copy1Ref} animateOnScroll={false} revealDelay={0} fadeDelay={0.7}>
            <span>{t("hero.titlePre", "Helping Those Who Need It")}</span>
          </Copy>
          {" "}
          <span className="text-accent">
            <Copy ref={copy2Ref} animateOnScroll={false} revealDelay={0.06} fadeDelay={0.76}>
              <span>{t("hero.titleEm", "Most")}</span>
            </Copy>
          </span>
        </h1>

        <Copy ref={copy3Ref} animateOnScroll={false} revealDelay={0.1} fadeDelay={1.1}>
          <p className="text-[clamp(0.95rem,1.6vw,1.125rem)] leading-relaxed text-muted-foreground max-w-md mb-8">
            {t(
              "hero.subtitle",
              "Amana Charity & Edir connects donors with families in need through transparent and impactful aid distribution. Together, we can make a difference."
            )}
          </p>
        </Copy>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Link to="/payment" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-12 px-7 text-sm sm:text-base rounded-xl shadow-md hover:shadow-glow transition-shadow">
              {t("hero.ctaPrimary", "Donate Now")}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={scrollToImpact}
            className="w-full sm:w-auto h-12 px-7 text-sm sm:text-base rounded-xl border-[1.5px]"
          >
            {t("hero.ctaSecondary", "See Our Impact")}
          </Button>
        </div>
      </div>
    </section>
  );
}