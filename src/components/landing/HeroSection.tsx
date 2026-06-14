import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Heart, Users, HandHeart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

const HeroSection = () => {
  const { t } = useTranslation();

  const stats = useMemo(
    () => [
      { value: "$12M+", labelKey: "hero.fundsRaised" },
      { value: "50K+", labelKey: "hero.livesImpacted" },
      { value: "120+", labelKey: "hero.activeCampaigns" },
      { value: "98%", labelKey: "hero.transparencyScore" },
    ],
    []
  );

  return (
    <section id="about" className="relative min-h-screen flex items-center overflow-hidden will-change-transform">
      <div className="absolute inset-0 gradient-hero opacity-95" />

      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-foreground/5 rounded-full blur-2xl will-change-transform" />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-2xl will-change-transform"
        style={{ animationDelay: "2s" }}
      />

      <div
        className="absolute top-1/4 right-[15%] hidden lg:block animate-float opacity-20 will-change-transform"
        style={{ animationDelay: "1s" }}
      >
        <Heart className="w-16 h-16 text-primary-foreground" />
      </div>
      <div
        className="absolute bottom-1/3 left-[10%] hidden lg:block animate-float opacity-20 will-change-transform"
        style={{ animationDelay: "3s" }}
      >
        <Users className="w-20 h-20 text-primary-foreground" />
      </div>
      <div
        className="absolute top-1/3 left-[20%] hidden lg:block animate-float opacity-15 will-change-transform"
        style={{ animationDelay: "2s" }}
      >
        <HandHeart className="w-12 h-12 text-primary-foreground" />
      </div>

      <div className="container mx-auto px-4 pt-20 pb-12 md:pt-24 lg:pt-28 md:pb-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground text-xs sm:text-sm font-medium mb-6 sm:mb-8 animate-fade-up opacity-0 will-change-transform"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="hidden sm:inline">{t("hero.badgeDesktop")}</span>
            <span className="sm:hidden">{t("hero.badgeMobile")}</span>
          </div>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold text-primary-foreground leading-tight mb-4 sm:mb-6 animate-fade-up opacity-0 text-balance will-change-transform"
            style={{ animationDelay: "0.2s" }}
          >
            {t("hero.titleLine1")}
            <span className="block text-accent">{t("hero.titleLine2")}</span>
          </h1>

          <p
            className="text-sm sm:text-base md:text-lg lg:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8 sm:mb-10 animate-fade-up opacity-0 text-balance px-2 will-change-transform"
            style={{ animationDelay: "0.3s" }}
          >
            {t("hero.subtitle")}
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 animate-fade-up opacity-0 px-2 will-change-transform"
            style={{ animationDelay: "0.4s" }}
          >
            <Button variant="hero" size="xl" className="group w-full sm:w-auto min-h-12">
              {t("hero.startDonating")}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="hero-outline" size="xl" className="group w-full sm:w-auto min-h-12">
              <Play className="w-5 h-5" />
              <span className="hidden sm:inline">{t("hero.watchStory")}</span>
              <span className="sm:hidden">{t("hero.watchStoryShort")}</span>
            </Button>
          </div>

          <div
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 lg:gap-8 animate-fade-up opacity-0 px-2 will-change-transform"
            style={{ animationDelay: "0.5s" }}
          >
            {stats.map((stat, index) => (
              <div
                key={stat.labelKey}
                className="text-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10"
              >
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-primary-foreground/70">{t(stat.labelKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
