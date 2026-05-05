import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Calendar, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

const CampaignsSection = () => {
  const { t } = useTranslation();

  const campaigns = useMemo(
    () => [
      {
        id: 1,
        titleKey: "campaignsSection.c1Title",
        categoryKey: "campaignsSection.c1Category",
        descKey: "campaignsSection.c1Desc",
        raised: 45000,
        goal: 60000,
        donors: 328,
        daysLeft: 12,
        image:
          "https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: 2,
        titleKey: "campaignsSection.c2Title",
        categoryKey: "campaignsSection.c2Category",
        descKey: "campaignsSection.c2Desc",
        raised: 32000,
        goal: 50000,
        donors: 245,
        daysLeft: 24,
        image:
          "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: 3,
        titleKey: "campaignsSection.c3Title",
        categoryKey: "campaignsSection.c3Category",
        descKey: "campaignsSection.c3Desc",
        raised: 78000,
        goal: 100000,
        donors: 512,
        daysLeft: 8,
        image:
          "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80",
      },
    ],
    []
  );

  return (
    <section id="campaigns" className="py-12 sm:py-16 md:py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16">
          <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
            {t("campaignsSection.badge")}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            {t("campaignsSection.title")}
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground px-2">
            {t("campaignsSection.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-6 md:gap-8 mb-10 sm:mb-12">
          {campaigns.map((campaign, index) => (
            <article
              key={campaign.id}
              className="group bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border animate-fade-up opacity-0"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-40 sm:h-48 md:h-52 overflow-hidden">
                <img
                  src={campaign.image}
                  alt={t(campaign.titleKey)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-card/90 backdrop-blur-sm text-xs font-semibold text-primary">
                    {t(campaign.categoryKey)}
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5 md:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-card-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {t(campaign.titleKey)}
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm mb-4 line-clamp-2">
                  {t(campaign.descKey)}
                </p>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-primary">
                      ${campaign.raised.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">
                      of ${campaign.goal.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={(campaign.raised / campaign.goal) * 100} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>{t("campaignsSection.donors", { count: campaign.donors })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>{t("campaignsSection.daysLeft", { count: campaign.daysLeft })}</span>
                  </div>
                </div>

                <Button variant="default" className="w-full min-h-10 text-sm">
                  {t("campaignsSection.donateNow")}
                </Button>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg" className="group">
            {t("campaignsSection.viewAll")}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CampaignsSection;
