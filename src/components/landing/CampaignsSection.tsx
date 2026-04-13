import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Calendar, Users } from "lucide-react";

const campaigns = [
  {
    id: 1,
    title: "Clean Water for Villages",
    category: "Healthcare",
    description:
      "Providing clean drinking water access to 15 rural villages in East Africa.",
    raised: 45000,
    goal: 60000,
    donors: 328,
    daysLeft: 12,
    image:
      "https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    title: "Education for Orphans",
    category: "Education",
    description:
      "Supporting 200 orphaned children with school supplies, uniforms, and tuition.",
    raised: 32000,
    goal: 50000,
    donors: 245,
    daysLeft: 24,
    image:
      "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    title: "Emergency Medical Fund",
    category: "Medical",
    description:
      "Providing life-saving surgeries and treatments for children in critical need.",
    raised: 78000,
    goal: 100000,
    donors: 512,
    daysLeft: 8,
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80",
  },
];

const CampaignsSection = () => {
  return (
    <section id="campaigns" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            Active Campaigns
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
            Support a Cause Today
          </h2>
          <p className="text-lg text-muted-foreground">
            Every campaign represents real people with real needs. Your
            contribution directly impacts lives.
          </p>
        </div>

        {/* Campaign Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {campaigns.map((campaign, index) => (
            <article
              key={campaign.id}
              className="group bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border animate-fade-up opacity-0"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={campaign.image}
                  alt={campaign.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm text-xs font-semibold text-primary">
                    {campaign.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-card-foreground mb-2 group-hover:text-primary transition-colors">
                  {campaign.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {campaign.description}
                </p>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-primary">
                      ${campaign.raised.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">
                      of ${campaign.goal.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={(campaign.raised / campaign.goal) * 100}
                    className="h-2"
                  />
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{campaign.donors} donors</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{campaign.daysLeft} days left</span>
                  </div>
                </div>

                <Button variant="default" className="w-full">
                  Donate Now
                </Button>
              </div>
            </article>
          ))}
        </div>

        {/* View All */}
        <div className="text-center">
          <Button variant="outline" size="lg" className="group">
            View All Campaigns
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CampaignsSection;
