# Claude Integration Prompt — Amana Charity Landing Page

## Context

You are converting a high-fidelity HTML prototype into a production React component for the Amana Charity Hub landing page. The prototype files are:
- `amana-landing-v1.html` — Dark-default editorial brutalism variation
- `amana-landing-v2.html` — Light-default warm editorial variation

The user will choose which variation to implement (or elements from both). Read both files before starting.

## Codebase Architecture

**Stack:** Vite + React 18 + TypeScript + Tailwind CSS 3 + shadcn/ui
**Project root:** `amana_frontend-main`
**Branch:** `frontend-rewrite-mobile`

### Key Files
```
src/
├── index.css              — Global tokens (HSL CSS custom properties in :root + .dark)
├── App.tsx                — Router + layout wrapper
├── pages/Index.tsx        — Landing page (currently: Navbar → Hero → Campaigns → Impact → Stories → Footer)
├── components/landing/
│   ├── Navbar.tsx         — Current basic navbar (REPLACE with new design)
│   ├── HeroSection.tsx    — Current hero (REPLACE)
│   ├── CampaignsSection.tsx
│   ├── ImpactSection.tsx
│   ├── StoriesSection.tsx
│   └── Footer.tsx
├── contexts/
│   └── (empty — theme context needs creation)
└── lenis.tsx              — Lenis smooth scroll config (EXISTS, USE IT)
```

### Existing Assets (DO NOT DELETE — integrate)
- `mqt2680b-Navbar.tsx` — GSAP-powered navbar with clipPath mobile menu, SweepFillButton, animated hamburger ↔ X
- `mqt27spu-TransitionSkeleton.jsx` — Route transition with SVG heart draw animation
- `mqt27spn-TransitionSkeleton.css` — Transition styles
- `src/lenis.tsx` — Lenis smooth scroll (already configured)

### Theme System
CSS custom properties in `src/index.css`:
- **Light:** `--background: 40 33% 98%` (warm cream), `--primary: 168 65% 38%` (teal), `--accent: 32 95% 55%` (amber)
- **Dark:** `.dark` class on `<html>`, `--background: 200 30% 8%` (deep navy)
- Toggle: `localStorage`-based, `.dark` class on `<html>`
- **MUST sync** with dashboard theme — single source of truth

### Font Stack
```css
--font-display: 'Playfair Display', Georgia, serif;  /* ADD to tailwind config */
--font-body: 'Plus Jakarta Sans', system-ui, sans-serif;  /* Already configured */
```

## Design Specifications (Non-Negotiable)

### Typography
```css
/* Hero headline — massive, fluid, overlapping */
font-size: clamp(3.2rem, 8vw, 8rem);
line-height: 0.95;
letter-spacing: -0.03em;
font-family: var(--font-display); /* Playfair Display */
```
- Headers MUST use `clamp()` for fluid sizing
- Headers MUST deliberately overlap grid boundaries using negative margins or absolute positioning
- Body text: Plus Jakarta Sans, `clamp(1rem, 1.3vw, 1.2rem)`, line-height 1.75

### Layout Asymmetry
```css
/* Golden ratio grid — NOT standard 12-col Bootstrap */
grid-template-columns: 1fr 1.618fr 0.5fr;

/* Campaign grid — asymmetric */
grid-template-columns: 1.618fr 1fr;

/* At least one section: 65% width media + 15% overlapping text */
grid-column: 1 / 3; /* wide media */
/* Neighboring text with negative margin */
margin-left: -15%;
```

### GSAP Animation Requirements

#### 1. Lenis Smooth Scroll
```typescript
// Already exists in src/lenis.tsx — import and use
import { useLenis } from 'lenis/react';
const lenis = useLenis();
// Nav clicks: lenis?.scrollTo(href)
```

#### 2. ScrollTrigger Reveals
```typescript
// Install: gsap + @gsap/react + scrolltrigger
// Every text/image container needs will-change: transform, opacity
// Every section needs overflow: hidden to prevent layout break

gsap.registerPlugin(ScrollTrigger);

// Staggered text reveal
gsap.from('.split-line', {
  yPercent: 110,
  duration: 1.1,
  stagger: 0.1,
  ease: 'expo.out',
  scrollTrigger: { trigger: '.hero', start: 'top 80%' }
});

// Image scale reveal
gsap.from('.media-container', {
  scale: 0.92,
  opacity: 0,
  duration: 1.2,
  ease: 'power3.out',
  scrollTrigger: { trigger: '.media-container', start: 'top 85%' }
});
```

#### 3. Horizontal Pinned Gallery (V1 feature)
```typescript
// Stats gallery: horizontal scroll pinned via ScrollTrigger
const gallery = document.getElementById('statsGallery');
gsap.to(gallery, {
  x: () => -(gallery.scrollWidth - window.innerWidth),
  ease: 'none',
  scrollTrigger: {
    trigger: '#stats-wrapper',
    start: 'top top',
    end: () => `+=${gallery.scrollWidth - window.innerWidth}`,
    pin: true,
    scrub: 1,
  }
});
```

#### 4. Theme Morph (GSAP interpolation)
```typescript
// When toggling dark/light, smoothly interpolate CSS variables
const toggleTheme = () => {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('amana-theme', isDark ? 'dark' : 'light');
  
  // GSAP timeline for smooth color morph (0.4s-0.6s)
  const tl = gsap.timeline();
  tl.to(document.documentElement, {
    duration: 0.5,
    ease: 'power2.inOut',
    // CSS transitions handle the actual color shift
    // GSAP provides the timing control
  });
};
```
- The CSS `transition: background-color 0.5s, color 0.5s` on `<body>` handles the visual morph
- GSAP timeline controls the timing envelope
- **No layout flashing** — all transitions use `background-color`, `color`, `border-color` (never `background` shorthand)

#### 5. Proactive GSAP Rigging
```html
<!-- DOM structure for SplitText compatibility -->
<div class="split-container" style="overflow: hidden;">
  <h2 class="split-text" style="will-change: transform;">
    Split this into characters
  </h2>
</div>

<!-- Every animated container needs: -->
<div style="will-change: transform, opacity; transform: translate3d(0,0,0);">
  Content here
</div>

<!-- Section boundaries for ScrollTrigger -->
<section style="overflow: hidden;">
  Pinned content stays contained
</section>
```

### Video Integration
```html
<!-- Replace placeholder divs with: -->
<video autoplay muted loop playsinline class="absolute inset-0 w-full h-full object-cover">
  <source src="/videos/hero-loop.mp4" type="video/mp4">
</video>
```

### Nav Design (from mqt2680b-Navbar.tsx)
- Floating, minimal, transparent → solid on scroll
- GSAP clipPath mobile menu (already implemented in mqt2680b)
- SweepFillButton for donate CTA (already implemented)
- Animated hamburger ↔ X with GSAP timeline (already implemented)
- `mix-blend-difference` on mobile hamburger for contrast

## Step-by-Step Implementation Plan

1. **Read both prototype HTML files** to understand the full design
2. **Read existing codebase files** (index.css, App.tsx, lenis.tsx, mqt2680b-Navbar.tsx)
3. **Install GSAP packages:** `npm install gsap @gsap/react`
4. **Add Playfair Display** to `tailwind.config.ts` font-family.extend
5. **Create theme context** (`src/contexts/ThemeContext.tsx`) — single source of truth for dark/light, synced with dashboard
6. **Build new landing components:**
   - `src/components/landing/Navbar.tsx` — adapt from mqt2680b with new design tokens
   - `src/components/landing/HeroSection.tsx` — massive serif title, video background, GSAP entrance
   - `src/components/landing/MissionSection.tsx` — asymmetric grid
   - `src/components/landing/StatsGallery.tsx` — horizontal pinned scroll (V1) or ticker (V2)
   - `src/components/landing/AboutSection.tsx` — overlapping editorial
   - `src/components/landing/CampaignsSection.tsx` — asymmetric grid with real copy
   - `src/components/landing/VideoBreak.tsx` — full-width loop with overlay
   - `src/components/landing/ImpactSection.tsx` — 2×3 staggered grid
   - `src/components/landing/TestimonialsSection.tsx` — editorial quotes
   - `src/components/landing/CTABand.tsx` — accent-colored full-width
   - `src/components/landing/Footer.tsx` — substantial 4-column
7. **Wire up GSAP animations** in each component (ScrollTrigger reveals, split text, pin)
8. **Wire up Lenis** — ensure nav clicks use `lenis?.scrollTo()`
9. **Wire up theme toggle** — GSAP morph timeline, localStorage sync
10. **Test:** dark/light toggle, smooth scroll, all animations, responsive, no FOUC

## Critical Constraints

- **DO NOT** rewrite the transition skeleton or mobile navbar GSAP — integrate them
- **DO NOT** use `scrollIntoView` — breaks embedded preview
- **DO NOT** use `background` shorthand for animated properties — use `background-color` separately
- **DO** use `will-change: transform, opacity` on all animated elements
- **DO** use `overflow: hidden` on sections with ScrollTrigger pin/scale/rotation
- **DO** use `transform: translate3d(0,0,0)` for GPU acceleration
- **DO** keep CSS transitions for theme morph (0.4s-0.6s duration)
- **DO** map all colors to CSS custom variables from index.css
- **DO** preserve the existing i18n system (useTranslation / useLanguage)
- **DO** keep the mobile nav from mqt2680b-Navbar.tsx intact
