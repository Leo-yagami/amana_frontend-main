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
    <section id="stories" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-4">
            Success Stories
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
            Real Stories, Real Impact
          </h2>
          <p className="text-lg text-muted-foreground">
            Behind every number is a person. Here are some of the lives
            transformed through your generosity.
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <article
              key={story.id}
              className="group relative bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border animate-fade-up opacity-0"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={story.image}
                  alt={story.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                    {story.category}
                  </span>
                  <h3 className="text-xl font-bold text-card mt-2">
                    {story.name}
                  </h3>
                  <p className="text-card/80 text-sm">{story.location}</p>
                </div>
              </div>

              {/* Quote */}
              <div className="p-6">
                <Quote className="w-8 h-8 text-primary/20 mb-3" />
                <p className="text-muted-foreground leading-relaxed italic">
                  &quot;{story.story}&quot;
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-secondary rounded-2xl p-8 lg:p-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
              Be Part of the Next Success Story
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Your support creates these life-changing moments. Start making a
              difference today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#campaigns"
                className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all"
              >
                Browse Campaigns
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center h-12 px-8 rounded-lg border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
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
