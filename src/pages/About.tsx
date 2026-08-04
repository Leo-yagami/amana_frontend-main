import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Lock, Smile, Users } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer1";
import PageHero from "@/components/landing/PageHero";
import SectionHeading from "@/components/landing/SectionHeading1";
import { Button } from "@/components/ui/button";
import Copy from "@/components/Copy";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const VALUES = [
  {
    icon: Lock,
    titleKey: "about.values.transparency.title",
    titleFallback: "Transparency",
    descKey: "about.values.transparency.desc",
    descFallback: "We maintain complete openness in our operations, finances, and decision-making processes.",
  },
  {
    icon: Smile,
    titleKey: "about.values.compassion.title",
    titleFallback: "Compassion",
    descKey: "about.values.compassion.desc",
    descFallback: "We approach our work with empathy and respect for the dignity of those we serve.",
  },
  {
    icon: Users,
    titleKey: "about.values.community.title",
    titleFallback: "Community",
    descKey: "about.values.community.desc",
    descFallback: "We believe in the power of communities working together to solve shared challenges.",
  },
];

export default function About() {
  const { t } = useTranslation();
  const mainRef = useRef<HTMLElement>(null);
  useScrollReveal(mainRef);

  return (
    <>
      {/* <Navbar /> */}
      <main ref={mainRef}>
        <PageHero
          title={t("about.title", "About Amana Charity & Edir")}
          description={t("about.description", "Working together to create lasting change and improve lives in our community.")}
          // descReveal={false}
        />

        <section className="py-12 sm:py-16 lg:py-20 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 space-y-16 sm:space-y-20">
            {/* Mission */}
            <div className="grid sm:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div>
                <Copy>
                  <h2 className="font-display text-[clamp(1.5rem,4vw,2.25rem)] font-bold text-primary mb-4">
                    {t("about.mission.title", "Our Mission")}
                  </h2>
                </Copy>
                <Copy delay={0.1}>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                    {t("about.mission.p1", "Amana Charity & Edir works to alleviate suffering and provide support to the most vulnerable members of our community through transparent, accountable, and impactful aid programs.")}
                  </p>
                </Copy>
                <Copy delay={0.2}>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {t("about.mission.p2", "We believe that everyone deserves access to basic necessities, healthcare, and opportunities to improve their lives, regardless of their circumstances.")}
                  </p>
                </Copy>
              </div>
              <div data-reveal="right" className="rounded-2xl overflow-hidden aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&auto=format&fit=crop&q=80"
                  alt={t("about.mission.imageAlt", "Volunteers distributing aid")}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Vision */}
            <div className="grid sm:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div data-reveal="left" className="order-2 sm:order-1 rounded-2xl overflow-hidden aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=900&auto=format&fit=crop&q=80"
                  alt={t("about.vision.imageAlt", "Community members supporting one another")}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="order-1 sm:order-2">
                <Copy>
                  <h2 className="font-display text-[clamp(1.5rem,4vw,2.25rem)] font-bold text-primary mb-4">
                    {t("about.vision.title", "Our Vision")}
                  </h2>
                </Copy>
                <Copy delay={0.1}>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                    {t("about.vision.p1", "We envision a society where all community members have their basic needs met, with equal access to healthcare, education, and economic opportunities.")}
                  </p>
                </Copy>
                <Copy delay={0.2}>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {t("about.vision.p2", "Through our community-centered approach, we aim to build resilient neighborhoods where people support each other and grow together.")}
                  </p>
                </Copy>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-12 sm:py-16 lg:py-20 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6">
            <SectionHeading align="center" title={t("about.values.title", "Our Core Values")} className="mb-10 sm:mb-12" />
            <div className="grid sm:grid-cols-3 gap-5 sm:gap-6">
              {VALUES.map((v, i) => {
                const Icon = v.icon;
                return (
                  <div
                    key={v.titleKey}
                    className="rounded-2xl border border-border bg-card shadow-sm p-7 text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <Copy delay={i * 0.08}>
                      <h3 className="font-semibold text-base mb-2">{t(v.titleKey, v.titleFallback)}</h3>
                    </Copy>
                    <Copy delay={i * 0.08 + 0.05}>
                      <p className="text-sm text-muted-foreground leading-relaxed">{t(v.descKey, v.descFallback)}</p>
                    </Copy>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA — Our Team section intentionally omitted per your instruction */}
        <section className="py-12 sm:py-16 gradient-hero">
          <div className="container mx-auto px-4 sm:px-6 max-w-xl text-center text-primary-foreground">
            <Copy>
              <h2 className="font-display text-[clamp(1.5rem,4.5vw,2.25rem)] font-bold leading-[1.15] text-balance">
                {t("about.cta.title", "Join Our Mission")}
              </h2>
            </Copy>
            <Copy delay={0.1}>
              <p className="mt-3 text-sm sm:text-base text-primary-foreground/85 leading-relaxed">
                {t("about.cta.subtitle", "Whether through donations, volunteering, or spreading awareness, your support makes a meaningful difference in the lives of those we serve.")}
              </p>
            </Copy>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
              <Link to="/contact" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto h-12 px-7 text-sm rounded-xl border-[1.5px] border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  {t("about.cta.secondary", "Contact Us")}
                </Button>
              </Link>
              <Link to="/payment" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-12 px-7 text-sm rounded-xl shadow-md bg-background text-foreground hover:bg-background/90">
                  {t("about.cta.primary", "Donate Now")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      {/* <Footer /> */}
    </>
  );
}