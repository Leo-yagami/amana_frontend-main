import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Heart, Users, HandHeart } from "lucide-react";

const stats = [
  { value: "$12M+", label: "Funds Raised" },
  { value: "50K+", label: "Lives Impacted" },
  { value: "120+", label: "Active Campaigns" },
  { value: "98%", label: "Transparency Score" },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero opacity-95" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-foreground/5 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      />

      {/* Floating icons */}
      <div
        className="absolute top-1/4 right-[15%] hidden lg:block animate-float opacity-20"
        style={{ animationDelay: "1s" }}
      >
        <Heart className="w-16 h-16 text-primary-foreground" />
      </div>
      <div
        className="absolute bottom-1/3 left-[10%] hidden lg:block animate-float opacity-20"
        style={{ animationDelay: "3s" }}
      >
        <Users className="w-20 h-20 text-primary-foreground" />
      </div>
      <div
        className="absolute top-1/3 left-[20%] hidden lg:block animate-float opacity-15"
        style={{ animationDelay: "2s" }}
      >
        <HandHeart className="w-12 h-12 text-primary-foreground" />
      </div>

      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground text-sm font-medium mb-8 animate-fade-up opacity-0"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Trusted by 10,000+ donors worldwide
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-primary-foreground leading-tight mb-6 animate-fade-up opacity-0 text-balance"
            style={{ animationDelay: "0.2s" }}
          >
            Together, We Can
            <span className="block text-accent">Change Lives</span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg sm:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10 animate-fade-up opacity-0 text-balance"
            style={{ animationDelay: "0.3s" }}
          >
            Join our mission to provide hope, education, healthcare, and
            sustainable support to communities in need. Every contribution
            creates lasting impact.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up opacity-0"
            style={{ animationDelay: "0.4s" }}
          >
            <Button variant="hero" size="xl" className="group">
              Start Donating
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="hero-outline" size="xl" className="group">
              <Play className="w-5 h-5" />
              Watch Our Story
            </Button>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 animate-fade-up opacity-0"
            style={{ animationDelay: "0.5s" }}
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-4 rounded-2xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10"
              >
                <div className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-primary-foreground/70">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
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
