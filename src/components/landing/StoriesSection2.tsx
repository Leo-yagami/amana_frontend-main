import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionHeading from "./SectionHeading1";

gsap.registerPlugin(ScrollTrigger);

interface Story {
  quoteKey: string;
  quoteFallback: string;
  name: string;
  roleKey: string;
  roleFallback: string;
  avatar: string;
}

const STORIES: Story[] = [
  {
    quoteKey: "story.amara.quote",
    quoteFallback:
      "The school fund meant I could keep studying instead of working the fields with my brothers. I want to be a doctor for my village.",
    name: "Amara K.",
    roleKey: "story.amara.role",
    roleFallback: "Kenya — Education Programme",
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&auto=format&fit=crop&q=80",
  },
  {
    quoteKey: "story.rahman.quote",
    quoteFallback:
      "After the flood took our home, HopeBridge helped us rebuild on higher ground. Our children finally have a safe place to grow up.",
    name: "The Rahman Family",
    roleKey: "story.rahman.role",
    roleFallback: "Bangladesh — Emergency Relief",
    avatar:
      "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=200&auto=format&fit=crop&q=80",
  },
  {
    quoteKey: "story.maya.quote",
    quoteFallback:
      "The medical fund covered the heart surgery we could never have paid for ourselves. Today she's running around like any seven-year-old should.",
    name: "Maya's Mother",
    roleKey: "story.maya.role",
    roleFallback: "Nepal — Healthcare Programme",
    avatar:
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=200&auto=format&fit=crop&q=80",
  },
];

// Stacking recipe: each card's pin engages a little later than the one
// before it (offset + i * step), and every card releases together once
// the stack's bottom clears the same viewport line (endTrigger + end).
// Tuned originally for fixed 400px cards — retune if your breakpoints
// push card height much past that.
const PIN_START_OFFSET = 60;
const PIN_START_STEP = 10;
const PIN_END = "bottom 550";

export default function StoriesSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const wrapperEl = wrapperRef.current;
      const cardWrappers = cardWrapperRefs.current.filter(Boolean) as HTMLDivElement[];
      const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
      if (!wrapperEl || cardWrappers.length === 0) return;

      // Uncapped ticker, no lag smoothing — the scrub tracks native scroll
      // position 1:1 every animation frame, so it scales cleanly across
      // 60/120/144Hz instead of chasing a time-smoothed target.
      gsap.ticker.lagSmoothing(0);

      cardWrappers.forEach((cardWrapper, i) => {
        const card = cards[i];
        if (!card) return;

        // Last card is the top of the stack — it pins but never scales/tilts.
        const isLast = i === cardWrappers.length - 1;
        const scale = isLast ? 1 : 0.9 + 0.025 * i;
        const rotation = isLast ? 0 : -10;

        gsap.to(card, {
          scale,
          rotationX: rotation,
          transformOrigin: "top center",
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: cardWrapper,
            start: `top ${PIN_START_OFFSET + PIN_START_STEP * i}`,
            end: PIN_END,
            endTrigger: wrapperEl,
            scrub: true,
            anticipatePin: 1,
            fastScrollEnd: true,
            invalidateOnRefresh: true,
            pin: cardWrapper,
            pinSpacing: false,
            // markers: { indent: 100 * i, startColor: "#0ae448", endColor: "#fec5fb", fontSize: "14px" },
            id: `story-card-${i + 1}`,
          },
        });
      });

      const resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh());
      resizeObserver.observe(wrapperEl);

      return () => resizeObserver.disconnect();
    },
    { scope: sectionRef }
  );

  return (
    <section id="stories" ref={sectionRef} className="py-16 sm:py-24 lg:py-32">
      <div className="container mx-auto px-4">
        <SectionHeading
          align="center"
          kicker={t("stories.kicker", "In Their Words")}
          title={t(
            "stories.title",
            "Stories from the other end of a donation"
          )}
          className="mx-auto mb-10 sm:mb-14 lg:mb-16"
        />

        <div ref={wrapperRef} className="mx-auto w-full max-w-2xl">
          {STORIES.map((story, i) => (
            <div
              key={story.name}
              ref={(el) => {
                cardWrapperRefs.current[i] = el;
              }}
              className="mb-[50px] last:mb-0 w-full"
              style={{ perspective: "500px" }}
            >
              <article
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="flex h-[360px] xs:h-[380px] sm:h-[420px] md:h-[450px] lg:h-[460px] w-full flex-col justify-between rounded-2xl sm:rounded-3xl bg-card p-5 xs:p-6 sm:p-8 lg:p-10 will-change-transform [transform:translateZ(0)]"
                style={{
                  border: "1px solid hsl(var(--border))",
                  boxShadow: `
                    0 0 0 1px hsl(var(--border) / 0.5),
                    0 12px 24px hsl(var(--foreground) / 0.08)
                  `,
                  backfaceVisibility: "hidden",
                }}
              >
                <div>
                  <span className="font-display text-3xl sm:text-4xl lg:text-5xl text-primary/20 mb-1 sm:mb-2 block leading-none">
                    &ldquo;
                  </span>
                  <blockquote className="text-base xs:text-lg sm:text-xl lg:text-2xl leading-snug sm:leading-relaxed font-medium pb-2 sm:pb-4">
                    {t(story.quoteKey, story.quoteFallback)}
                  </blockquote>
                </div>

                <figcaption className="flex items-center gap-3 sm:gap-4 mb-1 sm:mb-2 pt-3 sm:pt-6 border-t border-border">
                  <img
                    src={story.avatar}
                    alt={story.name}
                    className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-sm sm:text-base truncate">{story.name}</div>
                    <div className="text-xs sm:text-sm text-primary truncate">
                      {t(story.roleKey, story.roleFallback)}
                    </div>
                  </div>
                </figcaption>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}