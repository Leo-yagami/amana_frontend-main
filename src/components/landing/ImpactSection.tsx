import {
  Heart,
  GraduationCap,
  Stethoscope,
  Home,
  Utensils,
  Droplets,
} from "lucide-react";

const impactAreas = [
  {
    icon: Heart,
    value: "50,000+",
    label: "Lives Changed",
    description: "Individuals directly impacted by our programs",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  {
    icon: GraduationCap,
    value: "8,500",
    label: "Students Educated",
    description: "Children receiving quality education support",
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    icon: Stethoscope,
    value: "12,000",
    label: "Medical Treatments",
    description: "Life-saving procedures and healthcare access",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Home,
    value: "2,400",
    label: "Homes Built",
    description: "Families provided with safe shelter",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: Utensils,
    value: "1.2M",
    label: "Meals Served",
    description: "Nutritious meals distributed annually",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Droplets,
    value: "45",
    label: "Water Wells",
    description: "Clean water sources serving communities",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

const trustBadges = ["GuideStar", "Charity Navigator", "BBB Accredited", "GlobalGiving"];

const ImpactSection = () => {
  return (
    <section id="impact" className="py-20 lg:py-32 bg-secondary">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            Our Impact
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
            Making Real Difference
          </h2>
          <p className="text-lg text-muted-foreground">
            Transparent reporting of how your donations create lasting change in
            communities worldwide.
          </p>
        </div>

        {/* Impact Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {impactAreas.map((area, index) => (
            <div
              key={area.label}
              className="group bg-card p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-border animate-fade-up opacity-0"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`w-14 h-14 rounded-xl ${area.bgColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <area.icon className={`w-7 h-7 ${area.color}`} />
              </div>
              <div className="text-4xl font-bold text-foreground mb-2">
                {area.value}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {area.label}
              </h3>
              <p className="text-muted-foreground text-sm">{area.description}</p>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 pt-16 border-t border-border">
          <div className="text-center mb-8">
            <p className="text-muted-foreground font-medium">
              Recognized & Verified By
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16 opacity-60">
            {trustBadges.map((badge) => (
              <div
                key={badge}
                className="text-lg lg:text-xl font-bold text-muted-foreground"
              >
                {badge}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
