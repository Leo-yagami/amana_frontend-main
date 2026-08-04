import { useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function CTABand() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef);

  return (
    <section ref={sectionRef} className="relative overflow-hidden gradient-hero py-14 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-xl text-center text-primary-foreground">
        <h2 data-reveal="up" className="font-display text-[clamp(1.5rem,4.5vw,2.5rem)] font-bold leading-[1.15] text-balance">
          {t("cta.title", "Make a Difference Today")}
        </h2>
        <p data-reveal="up" data-reveal-delay="0.1" className="mt-3 text-[clamp(0.9rem,1.4vw,1.05rem)] text-primary-foreground/85 leading-relaxed">
          {t("cta.subtitle", "Your support can transform lives. Join our mission to help those in need and create lasting change in our community.")}
        </p>
        <div data-reveal="up" data-reveal-delay="0.2" className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-7">
          <Link to="/payment" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              className="w-full sm:w-auto h-12 px-7 text-sm sm:text-base rounded-xl shadow-md bg-background text-foreground hover:bg-background/90"
            >
              {t("cta.primary", "Donate Now")}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link to="/contact" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto h-12 px-7 text-sm sm:text-base rounded-xl border-[1.5px] border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              {t("cta.secondary", "Contact Us")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}