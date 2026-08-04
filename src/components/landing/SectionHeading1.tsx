import { ReactNode } from "react";

interface SectionHeadingProps {
  title: ReactNode;
  description?: ReactNode;
    kicker?: string; 
  align?: "left" | "center" | "right";
  className?: string;
}

export default function SectionHeading({
  title,
  description,
  align = "left",
  kicker,
  className = "",
}: SectionHeadingProps) {
  return (
    <div
      data-reveal="up"
      className={`${align === "center" ? "text-center mx-auto max-w-2xl" : "max-w-2xl"} ${className}`}
    >
      {kicker && (        // 👈 render it
        <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
          {kicker}
        </p>
      )}
      <h2 className="font-display text-[clamp(1.5rem,4vw,2.25rem)] font-bold leading-[1.15] text-primary text-balance">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-[clamp(0.9rem,1.4vw,1.05rem)] leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}