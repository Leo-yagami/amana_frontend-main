import { Quote } from "lucide-react";

const stories = [
  {
    id: 1,
    name: "Amara K.",
    location: "Kenya",
    story:
      "Thanks to the scholarship program, I became the first in my family to attend university. Now I'm a nurse, giving back to my community.",
    image:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&auto=format&fit=crop&q=80",
    category: "Education",
  },
  {
    id: 2,
    name: "The Rahman Family",
    location: "Bangladesh",
    story:
      "After the flood destroyed our home, HopeBridge helped us rebuild. We now have a safe place for our children to grow up.",
    image:
      "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&auto=format&fit=crop&q=80",
    category: "Housing",
  },
  {
    id: 3,
    name: "Little Maya",
    location: "Nepal",
    story:
      "The medical fund saved my daughter's life. She needed heart surgery we couldn't afford. Today, she's healthy and thriving.",
    image:
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&auto=format&fit=crop&q=80",
    category: "Medical",
  },
];

const StoriesSection = () => {
  return (
    <section id="stories" className="py-12 sm:py-16 md:py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16">
          <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-accent/10 text-accent text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
            Success Stories
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            Real Stories, Real Impact
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground px-2">
            Behind every number is a person. Here are some of the lives
            transformed through your generosity.
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-6 md:gap-8">
          {stories.map((story, index) => (
            <article
              key={story.id}
              className="group relative bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border animate-fade-up opacity-0"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Image */}
              <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                <img
                  src={story.image}
                  alt={story.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                    {story.category}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-card mt-2">
                    {story.name}
                  </h3>
                  <p className="text-card/80 text-xs sm:text-sm">{story.location}</p>
                </div>
              </div>

              {/* Quote */}
              <div className="p-4 sm:p-5 md:p-6">
                <Quote className="w-6 sm:w-8 h-6 sm:h-8 text-primary/20 mb-3" />
                <p className="text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed italic">
                  &quot;{story.story}&quot;
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 sm:mt-14 md:mt-16 text-center px-4">
          <div className="inline-block bg-secondary rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 w-full max-w-2xl">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3">
              Be Part of the Next Success Story
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base mb-6 max-w-xl mx-auto">
              Your support creates these life-changing moments. Start making a
              difference today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a
                href="#campaigns"
                className="inline-flex items-center justify-center h-10 sm:h-12 px-6 sm:px-8 rounded-lg bg-primary text-primary-foreground text-sm sm:text-base font-semibold hover:brightness-110 transition-all"
              >
                Browse Campaigns
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center h-10 sm:h-12 px-6 sm:px-8 rounded-lg border-2 border-primary text-primary text-sm sm:text-base font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
              >
                Partner With Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoriesSection;
