// import { useRef, useCallback, ReactNode, useEffect } from 'react';
// import { createContext, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { flushSync } from 'react-dom';
// import { useAnimationCoordinator } from './AnimationCoordinator';

// // ─── Timing ──────────────────────────────────────────────────────────────────
// const EXIT_D  = 1000; // old page slides up + fades — runs concurrently with enter
// const ENTER_D = 1200; // new page wipes in from bottom
// const EASE    = 'cubic-bezier(0.87, 0, 0.13, 1)'; // expo in-out — the AROCK curve

// const STYLE_ID = 'aw-transition-styles';

// const STYLES = `
//   @keyframes aw-exit {
//     from { transform: translateY(0%);   opacity: 1; }
//     to   { transform: translateY(-12%); opacity: 0; }
//   }

//   @keyframes aw-enter {
//     from { clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%); }
//     to   { clip-path: polygon(0%   0%, 100%   0%, 100% 100%, 0% 100%); }
//   }

//   /* Exit clone: fixed on top, slides up and fades */
//   .aw-exit-el {
//     position: fixed;
//     top: 0; left: 0;
//     width: 100%; height: 100%;
//     z-index: 10;
//     pointer-events: none;
//     overflow: hidden;
//     animation: aw-exit ${EXIT_D}ms ${EASE} both;
//     transform-origin: top center;
//   }

//   /* New page: starts clipped to a bottom line, wipes upward */
//   .aw-enter-el {
//     clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%);
//     animation: aw-enter ${ENTER_D}ms ${EASE} both;
//     will-change: clip-path;
//   }
// `;

// if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
//   const el = document.createElement('style');
//   el.id = STYLE_ID;
//   el.textContent = STYLES;
//   document.head.appendChild(el);
// }

// // ─── Context ─────────────────────────────────────────────────────────────────
// interface TransitionContextType {
//   startTransition: (to: string) => void;
// }

// const TransitionCtx = createContext<TransitionContextType>(null!);
// export const useArockTransition = () => useContext(TransitionCtx);

// // ─── Provider ────────────────────────────────────────────────────────────────
// export function ViewTransitionProvider({ children }: { children: ReactNode }) {
//   const contentRef  = useRef<HTMLDivElement>(null);
//   const portalRef   = useRef<HTMLDivElement | null>(null);
//   const navigate    = useNavigate();
//   const { claim, triggerAnimations } = useAnimationCoordinator();
//   const navigateRef = useRef(navigate);
//   navigateRef.current = navigate;
//   const busyRef = useRef(false);

//   useEffect(() => {
//     if (portalRef.current) return;
//     const div = document.createElement('div');
//     div.id = 'aw-portal';
//     div.style.cssText =
//       'position:fixed;top:0;left:0;width:100%;height:100%;z-index:10;pointer-events:none;overflow:hidden;';
//     document.body.appendChild(div);
//     portalRef.current = div;
//     return () => { div.remove(); portalRef.current = null; };
//   }, []);

//   const startTransition = useCallback((to: string) => {
//     if (busyRef.current) return;
//     busyRef.current = true;
//     claim();

//     // 1. Clone current page into the portal for the exit animation.
//     //    This clone sits on top and plays the exit while the real content
//     //    div immediately swaps to the new route underneath.
//     if (contentRef.current && portalRef.current) {
//       const clone = contentRef.current.cloneNode(true) as HTMLElement;
//       // Reset any class state from a previous transition on the clone
//       clone.classList.remove('aw-enter-el');
//       clone.querySelectorAll('.aw-enter-el').forEach(el =>
//         el.classList.remove('aw-enter-el')
//       );
//       clone.className = 'aw-exit-el';
//       portalRef.current.appendChild(clone);
//       setTimeout(() => clone.remove(), EXIT_D + 50);
//     }

//     // 2. Apply the enter class BEFORE the route swap so the new page
//     //    starts clipped (invisible) the instant React renders it.
//     contentRef.current?.classList.add('aw-enter-el');

//     // 3. Swap route — new page renders already clipped to bottom line.
//     //    The exit clone is on top covering everything, and the enter
//     //    animation is already running on the content below it.
//     flushSync(() => { navigateRef.current(to); });

//     // 4. Trigger text/content reveal at 75% through the enter animation
//     setTimeout(() => {
//       triggerAnimations('reveal');
//     }, ENTER_D * 0.75);

//     // 5. Cleanup
//     setTimeout(() => {
//       contentRef.current?.classList.remove('aw-enter-el');
//       busyRef.current = false;
//     }, ENTER_D + 100);

//   }, [claim, triggerAnimations]);

//   return (
//     <TransitionCtx.Provider value={{ startTransition }}>
//       <div ref={contentRef} style={{ position: 'relative' }}>
//         {children}
//       </div>
//     </TransitionCtx.Provider>
//   );
// }

// // ─── Link ────────────────────────────────────────────────────────────────────
// export function TransitionLink({
//   to,
//   children,
//   className,
//   lenisRef = null,
//   onTransitionStart,
//   onTransitionEnd,
// }: {
//   to: string;
//   children: ReactNode;
//   className?: string;
//   lenisRef?: { current: any } | null;
//   onTransitionStart?: () => void;
//   onTransitionEnd?: () => void;
// }) {
//   const { startTransition } = useArockTransition();

//   const handleNavigation = (e: React.MouseEvent) => {
//     if (e.metaKey || e.ctrlKey) return;
//     e.preventDefault();

//     if (lenisRef?.current) lenisRef.current.scrollTo(0, { immediate: true });
//     else window.scrollTo(0, 0);

//     if (onTransitionStart) onTransitionStart();
//     startTransition(to);
//     if (onTransitionEnd) setTimeout(onTransitionEnd, ENTER_D + 100);
//   };

//   return (
//     <a href={to} onClick={handleNavigation} className={className}>
//       {children}
//     </a>
//   );
// }

import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { flushSync } from 'react-dom';
import { gsap } from 'gsap';
import { useAnimationCoordinator } from '@/components/AnimationCoordinator';
import './ViewTransition.css';

// ─────────────────────────────────────────────────────────────────────────────
// Entrance Animation Runner
// ─────────────────────────────────────────────────────────────────────────────
//
// Call after transition.finished resolves. Targets any element on the new page
// with a [data-enter] attribute. Three types supported:
//
//   data-enter="up"      — slides up from slightly below, fades in
//   data-enter="lines"   — staggered line reveal; wrap each line in a
//                          <span data-line> inside an overflow-hidden parent,
//                          or falls back to a block reveal on the element itself
//   data-enter="fade"    — opacity only
//
// Optional: data-enter-delay="0.15"  (seconds, applied per element)
//
export function runEntranceAnimations() {
  const els = document.querySelectorAll<HTMLElement>('[data-enter]');
  if (!els.length) return;

  els.forEach((el) => {
    const type = el.dataset.enter ?? 'up';
    const delay = parseFloat(el.dataset.enterDelay ?? '0');

    if (type === 'up') {
      gsap.fromTo(
        el,
        { yPercent: 12, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          delay,
          clearProps: 'transform,opacity',
        }
      );
    }

    if (type === 'lines') {
      // Expects child <span data-line> elements inside an overflow:hidden wrapper.
      // If none found, treats the element itself as a single block.
      const lines = el.querySelectorAll<HTMLElement>('[data-line]');
      const targets: HTMLElement[] = lines.length > 0 ? Array.from(lines) : [el];

      gsap.fromTo(
        targets,
        { yPercent: 105 },
        {
          yPercent: 0,
          duration: 0.85,
          ease: 'power3.out',
          stagger: 0.07,
          delay,
          clearProps: 'transform',
        }
      );
    }

    if (type === 'fade') {
      gsap.fromTo(
        el,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.7,
          ease: 'power2.out',
          delay,
          clearProps: 'opacity',
        }
      );
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ViewTransitionProvider
// ─────────────────────────────────────────────────────────────────────────────
// Wrap your app (or router outlet) with this. Handles the initial page-load
// entrance — subsequent navigations are handled by TransitionLink directly.

interface ProviderProps {
  children: React.ReactNode;
}

export const ViewTransitionProvider = ({ children }: ProviderProps) => {
  useEffect(() => {
    // One rAF gives React time to paint before entrance animations fire
    const id = requestAnimationFrame(() => runEntranceAnimations());
    return () => cancelAnimationFrame(id);
  }, []); // runs once on mount = initial page load only

  return <>{children}</>;
};

// ─────────────────────────────────────────────────────────────────────────────
// TransitionLink
// ─────────────────────────────────────────────────────────────────────────────
// Drop-in replacement for <Link>. Intercepts clicks, runs the view transition,
// then fires GSAP entrance animations on the new page once the wipe completes.

interface TransitionLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onTransitionStart?: () => void;
}

export const TransitionLink = ({
  to,
  children,
  className,
  onClick,
  onTransitionStart,
}: TransitionLinkProps) => {
  const navigate = useNavigate();
  const { claim, triggerAnimations } = useAnimationCoordinator();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Preserve browser-native behaviour for modifier-key clicks
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      e.preventDefault();
      onClick?.();
      onTransitionStart?.();

      // Prevent AnimationCoordinator auto-fade on the new page
      claim();

      // ── Fallback: no View Transitions API support ──
      if (!document.startViewTransition) {
        navigate(to);
        window.scrollTo(0, 0);
        requestAnimationFrame(() => {
          runEntranceAnimations();
          triggerAnimations('reveal');
        });
        return;
      }

      const WIPE_DURATION_MS = 1500; // must match animation-duration in ViewTransition.css
// Fire reveal at 60% through the wipe so text animates AS the page sweeps in.
// Too early = text visible before page; too late = text pops on an already-visible page.
const REVEAL_OFFSET_MS = WIPE_DURATION_MS * 0.60; // 900ms

      // ── View Transition ──
      const transition = document.startViewTransition(() => {
        /*
          flushSync is critical here. Without it, React 18's concurrent renderer
          batches the state update and the View Transitions API captures a stale
          DOM snapshot for the "new" view, resulting in no visible change.
        */
        flushSync(() => navigate(to));
      });

      /*
        Reset scroll the moment the new DOM is painted but before the wipe
        animation begins — this prevents a flash of the wrong scroll position
        bleeding through the clip-path during the reveal.
      */
      // transition.ready.then(() => {
      //   window.scrollTo({ top: 0, behavior: 'instant' });
      // });

      // Reset scroll the instant the new DOM is painted but before the wipe begins.
transition.ready.then(() => {
  window.scrollTo({ top: 0, behavior: "instant" });
  // Schedule the reveal relative to when the wipe actually started,
  // not when handleClick fired — avoids drift from React render time.
  setTimeout(() => {
    triggerAnimations("reveal");
  }, REVEAL_OFFSET_MS);
});

      /*
        Fire GSAP entrance animations only after the 1.5s wipe fully completes.
        This ensures text/elements don't animate while still clipped.
      */
      // transition.finished.then(() => {
      //   runEntranceAnimations();
      //   triggerAnimations('reveal');
      // });
      // runEntranceAnimations targets [data-enter] elements — fire after wipe completes.
transition.finished.then(() => {
  runEntranceAnimations();
});
    },
    [to, navigate, onClick, claim, triggerAnimations]
  );

  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};