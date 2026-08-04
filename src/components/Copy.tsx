import React, { forwardRef, useImperativeHandle, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export interface CopyHandle {
  play: (skip?: boolean) => void;
  fadeIn: () => void;
}

interface CopyProps {
  children: React.ReactNode;
  animateOnScroll?: boolean;
  delay?: number;
  revealDelay?: number;
  fadeDelay?: number;
}

const Copy = forwardRef<CopyHandle, CopyProps>(function Copy({ children, animateOnScroll = true, delay = 0, revealDelay, fadeDelay }, ref) {
  const containerRef = useRef<HTMLDivElement | HTMLElement | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      let elements: Element[] = [];
      if (containerRef.current.hasAttribute("data-copy-wrapper")) {
        elements = Array.from(containerRef.current.children);
      } else {
        elements = [containerRef.current];
      }

      elements.forEach((el) => {
        if (el.hasAttribute("data-split-done")) return;
        el.setAttribute("data-split-done", "true");

        const htmlEl = el as HTMLElement;
        const text = htmlEl.innerText;
        const words = text.split(" ");
        
        htmlEl.innerHTML = words
          .map(
            (word) =>
              `<span class="mask-word-wrapper" style="display: inline-block; overflow: hidden; vertical-align: bottom;">
                <span class="anim-word" style="display: inline-block; transform: translateY(100%); will-change: transform;">
                  ${word}&nbsp;
                </span>
              </span>`
          )
          .join("");
      });

      const targetWords = containerRef.current.querySelectorAll(".anim-word");

      const animProps: gsap.TweenVars = {
        y: "0%",
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.025,
        delay: 0,
      };

      if (animateOnScroll) {
        animProps.scrollTrigger = {
          trigger: containerRef.current,
          start: "top 85%", 
          once: true,
        };
        gsap.to(targetWords, animProps);
      } else if (!ref) {
        gsap.to(targetWords, animProps);
      } else {
        tweenRef.current = gsap.to(targetWords, {
          ...animProps,
          paused: true,
        });
      }
    },
    { scope: containerRef, dependencies: [animateOnScroll] }
  );

  const getWords = () => containerRef.current?.querySelectorAll(".anim-word");

  useImperativeHandle(ref, () => ({
    play: (skip = false) => {
      if (tweenRef.current) {
        tweenRef.current.delay(skip ? 0 : (revealDelay ?? delay));
        tweenRef.current.paused(false);
      } else {
        const words = getWords();
        if (words?.length) {
          gsap.to(words, {
            y: "0%",
            duration: skip ? 0 : 0.5,
            ease: "power3.out",
            stagger: skip ? 0 : 0.025,
            delay: skip ? 0 : (revealDelay ?? delay),
          });
        }
      }
    },
    // fadeIn: () => {
    //   tweenRef.current?.kill();
    //   tweenRef.current = null;
    //   const words = getWords();
    //   if (words?.length) {
    //     gsap.set(words, { y: "0%" });
    //   }
    //   const el = containerRef.current;
    //   if (el) {
    //     gsap.set(el, { opacity: 0 });
    //     gsap.to(el, { opacity: 1, duration: 0.7, ease: "power2.out", delay: fadeDelay ?? delay });
    //   }
    // },
    fadeIn: () => {
  tweenRef.current?.kill();
  tweenRef.current = null;
  const words = getWords();
  if (words?.length) {
    // Reset words to visible — we animate the container instead
    gsap.set(words, { y: "0%" });
  }
  const el = containerRef.current;
  if (el) {
    gsap.set(el, { opacity: 0, y: 18 }); // ← start slightly below
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.65,
      ease: "power3.out",
      delay: fadeDelay ?? delay,
    });
  }
},
  }));

  if (React.Children.count(children) === 1) {
    const singleChild = React.Children.only(children) as React.ReactElement;
    return React.cloneElement(singleChild, { ref: containerRef });
  }

  return (
    <div ref={containerRef as React.RefObject<HTMLDivElement>} data-copy-wrapper>
      {children}
    </div>
  );
});

export default Copy;
