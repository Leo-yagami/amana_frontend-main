import {
  createContext,
  useContext,
  useRef,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type AnimationMode = "reveal" | "fade";

import type { HeroStats } from "@/types/api";

interface AnimationCoordinatorContextType {
  registerAnimation: (
    fn: (mode: AnimationMode, payload?: HeroStats | null) => void
  ) => () => void;
  triggerAnimations: (mode?: AnimationMode, payload?: HeroStats | null) => void;
  claim: () => void;
  setHeroStats: (stats: HeroStats) => void;
  heroStats: HeroStats | null;
}

const Ctx = createContext<AnimationCoordinatorContextType | null>(null);

export function AnimationProvider({ children }: { children: ReactNode }) {
  const animsRef = useRef<Set<(mode: AnimationMode, payload?: HeroStats | null) => void>>(new Set());
  const claimedRef = useRef(false);
  const firedRef = useRef(false); // guards against double-fire per page
  const [hasRegistrations, setHasRegistrations] = useState(false);
  const [heroStats, setHeroStats] = useState<HeroStats | null>(null);

  // const doTrigger = useCallback(
  //   (mode: AnimationMode, payload?: HeroStats | null) => {
  //     if (firedRef.current) return;
  //     firedRef.current = true;
  //     claimedRef.current = false;
  //     setHasRegistrations(false);
  //     animsRef.current.forEach((fn) => fn(mode, payload ?? heroStats));
  //     animsRef.current.clear();
  //   },
  //   [heroStats]
  // );
  const heroStatsRef = useRef<HeroStats | null>(null);
useEffect(() => { heroStatsRef.current = heroStats; }, [heroStats]);

const doTrigger = useCallback(
  (mode: AnimationMode, payload?: HeroStats | null) => {
    if (firedRef.current) return;
    firedRef.current = true;
    claimedRef.current = false;
    setHasRegistrations(false);
    animsRef.current.forEach((fn) => fn(mode, payload ?? heroStatsRef.current));
    animsRef.current.clear();
  },
  []
);

  const registerAnimation = useCallback(
    (fn: (mode: AnimationMode, payload?: HeroStats | null) => void) => {
      // Each new registration resets the fired guard so the incoming
      // page's batch can trigger cleanly after a nav.
      firedRef.current = false;
      animsRef.current.add(fn);
      setHasRegistrations(true);
      return () => {
        animsRef.current.delete(fn);
        if (animsRef.current.size === 0) setHasRegistrations(false);
      };
    },
    []
  );

  const triggerAnimations = useCallback(
    (mode: AnimationMode = "reveal", payload?: HeroStats | null) => {
      doTrigger(mode, payload);
    },
    [doTrigger]
  );

  const claim = useCallback(() => {
    claimedRef.current = true;
  }, []);

  // ── Auto-trigger "fade" on direct load / reload ───────────────────────────
  // Only fires when nothing has claimed the coordinator (i.e. no nav transition
  // is in flight). Delay must be long enough for useLayoutEffect registrations
  // to complete (they're synchronous before paint) but short enough to feel
  // instant. 60ms is safe — well under a single frame after first paint.
  useEffect(() => {
    if (!hasRegistrations || claimedRef.current) return;
    const id = setTimeout(() => {
      // Re-check claim — a TransitionLink click that beat the timeout
      // would have set claimedRef by now.
      if (!claimedRef.current) doTrigger("fade");
    }, 60);
    return () => clearTimeout(id);
  }, [hasRegistrations, doTrigger]);

  return (
    <Ctx.Provider value={{ registerAnimation, triggerAnimations, claim, setHeroStats, heroStats }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAnimationCoordinator() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    return {
      registerAnimation: () => () => {},
      triggerAnimations: () => {},
      claim: () => {},
      setHeroStats: () => {},
      heroStats: null,
    };
  }
  return ctx;
}
