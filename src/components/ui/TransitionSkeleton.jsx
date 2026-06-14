import React, { useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import './TransitionSkeleton.css';

const BLOCK_COUNT = 12; // Fewer, wider columns for a more premium feel

// ─────────────────────────────────────────────────────────────────────────────
// TransitionSkeleton — Awwwards-grade transition layer
// ─────────────────────────────────────────────────────────────────────────────

export const TransitionSkeleton = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const blocksOverlayRef = useRef(null);
  const logoOverlayRef = useRef(null);
  const heartPathRef = useRef(null);
  const isTransitioning = useRef(false);

  // ── Build the column blocks on mount ──
  useEffect(() => {
    if (blocksOverlayRef.current) {
      blocksOverlayRef.current.innerHTML = '';
      for (let i = 0; i < BLOCK_COUNT; i++) {
        const block = document.createElement('div');
        block.classList.add('tx-block');
        blocksOverlayRef.current.appendChild(block);
      }
    }
  }, []);

  // ── Navigation transition (link-based / programmatic) ──
  const navigateWithTransition = useCallback((targetPath) => {
    if (isTransitioning.current || location.pathname === targetPath) {
        // If we are already transitioning, or already on target path, just navigate instantly if needed
        if (location.pathname !== targetPath) navigate(targetPath);
        return;
    }
    isTransitioning.current = true;

    const blocks = blocksOverlayRef.current?.querySelectorAll('.tx-block');
    if (!blocks) {
        navigate(targetPath);
        return;
    }

    // Read theme colors live
    const cs = getComputedStyle(document.documentElement);
    const primaryRaw = cs.getPropertyValue('--primary').trim();
    const primaryColor = primaryRaw ? `hsl(${primaryRaw})` : '#00b4d8';

    // Setup heart path for the transition
    if (heartPathRef.current) {
      const pathLength = heartPathRef.current.getTotalLength();
      gsap.set(heartPathRef.current, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
        fill: 'transparent',
      });
    }

    // ── COVER IN ──
    const coverTl = gsap.timeline({
      onComplete: () => {
        navigate(targetPath);
      },
    });

    coverTl
      .set(blocks, { transformOrigin: 'left center' })
      .to(blocks, {
        scaleX: 1,
        duration: 0.65,
        stagger: {
          each: 0.035,
          from: 'edges', // Columns close from edges inward
        },
        ease: 'expo.inOut',
      })
      // Quick logo flash
      .to(logoOverlayRef.current, { opacity: 1, duration: 0.1 }, '-=0.25')
      .to('.tx-squircle', {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: 'back.out(1.2)',
      }, '-=0.15')
      .to(heartPathRef.current, {
        strokeDashoffset: 0,
        duration: 0.8,
        ease: 'expo.out',
      })
      .to(heartPathRef.current, {
        fill: primaryColor,
        duration: 0.25,
        ease: 'power2.in',
      })
      .to('.tx-squircle', {
        opacity: 0,
        scale: 0.85,
        duration: 0.3,
        ease: 'power4.in',
      })
      .set(logoOverlayRef.current, { opacity: 0 });
  }, [location.pathname, navigate]);

  // ── REVEAL OUT on location change (after navigateWithTransition) ──
  useEffect(() => {
    if (!isTransitioning.current) {
      // Not transitioning — just make sure blocks are hidden
      gsap.set('.tx-block', { transformOrigin: 'right center', scaleX: 0 });
      return;
    }

    const blocks = blocksOverlayRef.current?.querySelectorAll('.tx-block');
    if (!blocks) return;

    const revealTl = gsap.timeline({
      onComplete: () => {
        isTransitioning.current = false;
        window.__isTransitioning = false;
      },
    });

    revealTl
      .set(blocks, { transformOrigin: 'right center' })
      .to(blocks, {
        scaleX: 0,
        duration: 0.7,
        stagger: {
          each: 0.035,
          from: 'center',
        },
        ease: 'expo.inOut',
      });
  }, [location.pathname]);

  // ── Expose transition function globally ──
  useEffect(() => {
    window.__animateRouteTransition = navigateWithTransition;
    return () => {
      delete window.__animateRouteTransition;
    };
  }, [navigateWithTransition]);

  return (
    <>
      <div className="tx-master-container" ref={containerRef}>
        <div className="tx-blocks-layer" ref={blocksOverlayRef} />
        <div className="tx-logo-layer" ref={logoOverlayRef}>
          <div className="tx-squircle">
            <svg viewBox="0 0 122 110" className="tx-svg">
              <path
                ref={heartPathRef}
                id="txHeartPath"
                d="M12 35.5C12 19.5 24.5 7 40 7C49.5 7 57.5 12.5 61 21C64.5 12.5 72.5 7 82 7C97.5 7 110 19.5 110 35.5C110 60 85 82 61 101C37 82 12 60 12 35.5Z"
              />
            </svg>
          </div>
        </div>
      </div>
      {children}
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TransitionLink — drop-in animated route link
// ─────────────────────────────────────────────────────────────────────────────

export const TransitionLink = ({ to, children, className }) => {
  const handleClick = (e) => {
    e.preventDefault();
    if (window.__animateRouteTransition) {
      window.__animateRouteTransition(to);
    } else {
        window.location.href = to;
    }
  };

  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};