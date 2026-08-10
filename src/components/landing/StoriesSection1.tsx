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

// Scroll distance per card transition (px).
const SCROLL_PER_CARD = 500;

export default function StoriesSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
      const total = cards.length;
      if (total === 0 || !sectionRef.current) return;

      // Initial state — every card staged off-screen below, first card visible.
      gsap.set(cards, {
        yPercent: 100,
        scale: 1.04,
        opacity: 0,
        rotation: 0,
        zIndex: 1,
      });
      gsap.set(cards[0], { yPercent: 0, scale: 1, opacity: 1, zIndex: total });

      let lastIdx = -1;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => {
            const stickyHeight = stickyRef.current?.clientHeight || window.innerHeight;
            return `+=${total * SCROLL_PER_CARD - stickyHeight}`;
          },
          scrub: 0.1,
          fastScrollEnd: true,
          preventOverlaps: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(
              Math.floor(self.progress * (total - 1) + 0.5),
              total - 1
            );
            if (idx === lastIdx) return;
            lastIdx = idx;
            dotRefs.current.forEach((dot, i) => {
              if (!dot) return;
              dot.style.width = i === idx ? "2rem" : "0.375rem";
              dot.style.backgroundColor =
                i === idx ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.2)";
            });
          },
        },
      });

      for (let i = 0; i < total - 1; i++) {
        // Outgoing: recedes up and back, tilts, fades.
        tl.to(
          cards[i],
          {
            scale: 0.82,
            yPercent: -8,
            rotation: i % 2 === 0 ? -4 : 4,
            opacity: 0,
            zIndex: 1,
            duration: 1,
            force3D: true,
            ease: "none",
          },
          i
        );
        // Incoming: slides up from below, settles to natural size.
        tl.to(
          cards[i + 1],
          {
            yPercent: 0,
            scale: 1,
            opacity: 1,
            zIndex: total - i,
            duration: 1,
            force3D: true,
            ease: "none",
          },
          i
        );
      }

      const resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh());
      resizeObserver.observe(sectionRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    },
    { scope: sectionRef }
  );

  const totalScrollHeight = STORIES.length * SCROLL_PER_CARD;

  return (
    <section
      id="stories"
      ref={sectionRef}
      className="relative"
      style={{ height: `${totalScrollHeight}px` }}
    >
      {/* Sticky wrapper — CSS sticky top-0, sized responsively to 100svh */}
      <div
        ref={stickyRef}
        className="sticky top-0 flex flex-col items-center justify-center pt-6 pb-3 sm:py-8 lg:py-12 overflow-hidden box-border"
        style={{ height: "100svh" }}
      >
        <div className="container mx-auto px-4 flex flex-col items-center justify-center flex-1 min-h-0">
          <SectionHeading
            align="center"
            kicker={t("stories.kicker", "In Their Words")}
            title={t(
              "stories.title",
              "Stories from the other end of a donation"
            )}
            className="mx-auto mb-3 sm:mb-6 lg:mb-8 mt-1 sm:mt-2 shrink-0"
          />

          {/* Card container with responsive height so it never overflows small screens */}
          <div className="relative w-full max-w-2xl h-[340px] xs:h-[370px] sm:h-[420px] md:h-[450px] lg:h-[460px] mx-auto overflow-hidden rounded-2xl sm:rounded-3xl shrink-0">
            {STORIES.map((story, i) => (
              <figure
                key={story.name}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="absolute inset-0 flex flex-col justify-between rounded-2xl sm:rounded-3xl bg-card p-5 xs:p-6 sm:p-8 lg:p-10 will-change-transform [transform:translateZ(0)]"
                style={{
                  border: "1px solid hsl(var(--border))",
                  boxShadow: `
                    0 0 0 1px hsl(var(--border) / 0.5),
                    0 12px 24px hsl(var(--foreground) / 0.08)
                  `,
                  transformOrigin: "center top",
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
              </figure>
            ))}
          </div>

          {/* Scroll progress dots */}
          <div className="flex items-center justify-center gap-2.5 mt-6 sm:mt-8 lg:mt-10 shrink-0">
            {STORIES.map((_, i) => (
              <div
                key={i}
                ref={(el) => {
                  dotRefs.current[i] = el;
                }}
                className="h-1.5 rounded-full bg-primary/20 transition-[width,background-color] duration-300 ease-out"
                style={{ width: i === 0 ? "2rem" : "0.375rem" }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
