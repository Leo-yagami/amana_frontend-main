import React, { ReactNode, useEffect, useRef } from 'react';
import { ReactLenis } from 'lenis/react';
import { gsap } from 'gsap';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    // Sync Lenis's RAF with GSAP's highly-optimized ticker to eliminate stuttering
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }
    
    // Disable GSAP's lag smoothing for perfectly fluid scroll syncing
    gsap.ticker.lagSmoothing(0);
    gsap.ticker.add(update);

    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <ReactLenis 
      ref={lenisRef}
      root 
      autoRaf={false} // Disable autoRaf since we are manually syncing with GSAP
      options={{
        lerp: 0.09, // The Awwwards "sweet spot" for butter-smooth momentum
        wheelMultiplier: 1.05, // Slightly responsive wheel
        smoothTouch: false, // Leave touch devices to native momentum (best practice)
        touchMultiplier: 2, // Native-feeling touch speed if smoothTouch was enabled
        orientation: 'vertical',
        gestureOrientation: 'vertical',
      }}
    >
      {children}
    </ReactLenis>
  );
}