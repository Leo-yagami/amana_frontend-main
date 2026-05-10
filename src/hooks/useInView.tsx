// import { useEffect, useRef, useState } from "react";

// export function useInView(options?: IntersectionObserverInit) {
//   const ref = useRef<HTMLDivElement | null>(null);
//   const [isInView, setIsInView] = useState(false);

//   useEffect(() => {
//     if (!ref.current) return;

//     const observer = new IntersectionObserver(([entry]) => {
//       if (entry.isIntersecting) {
//         setIsInView(true);
//         observer.disconnect(); // animate only once
//       }
//     }, options);

//     observer.observe(ref.current);

//     return () => observer.disconnect();
//   }, [options]);

//   return { ref, isInView };
// }

// hooks/useInView.ts
import { useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean; // stop observing after first trigger
}

export const useInView = ({
  threshold = 0,
  rootMargin = "0px",
  once = true,
}: UseInViewOptions = {}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If element is already visible on mount (common on mobile), fire immediately
    const rect = el.getBoundingClientRect();
    const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (alreadyVisible) {
      setIsInView(true);
      return; // no need to observe
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isInView };
};