import React, { useRef, useLayoutEffect, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLenis } from "lenis/react";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { useAnimationCoordinator, type AnimationMode } from "@/components/AnimationCoordinator";
import { heroApi } from "@/services/api.service";
import type { HeroStats } from "@/types/api";

function parseHsl(hslStr: string): [number, number, number] {
  if (!hslStr) return [0, 0, 0];
  const parts = hslStr.trim().split(/[\s,]+/);
  const h = parseFloat(parts[0]) / 360;
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;

  if (isNaN(h) || isNaN(s) || isNaN(l)) return [0, 0, 0];

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    hue2rgb(p, q, h + 1 / 3),
    hue2rgb(p, q, h),
    hue2rgb(p, q, h - 1 / 3),
  ];
}

function isDarkMode(): boolean {
  return document.documentElement.classList.contains("dark");
}

// ============================================================================
// MOBILE (THREE.JS) SHADERS (From HeroSection8)
// ============================================================================

const vertexShaderMobile = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShaderMobile = `
  precision highp float;
  uniform vec2 u_res;
  uniform vec2 u_mouse;
  uniform float u_scroll;
  uniform float u_time;
  uniform float u_dark;
  uniform vec3 u_c1;
  uniform vec3 u_c2;
  uniform float u_platform;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

  vec2 voronoi(vec2 x) {
    vec2 n = floor(x);
    vec2 f = fract(x);
    float md = 8.0;
    vec2 mr = vec2(8.0);
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 o = hash(n + g) * vec2(0.5) + vec2(0.25);
        vec2 r = g + o - f;
        float d = dot(r, r);
        if (d < md) {
          md = d;
          mr = r;
        }
      }
    }
    return vec2(sqrt(md), hash(n + mr));
  }

  float organicWarp(vec2 p, float t) {
    float warp = sin(p.x * 3.5 + t * 0.8) * 0.25;
    warp += sin(p.y * 2.8 - t * 0.6) * 0.2;
    warp += sin((p.x + p.y) * 2.2 + t * 0.9) * 0.18;
    return warp;
  }

  void main() {
    vec2 st = gl_FragCoord.xy / u_res.y;
    float zoom = u_res.x < u_res.y ? 1.5 : 1.0;
    st *= zoom;
    st -= 0.5 * vec2(u_res.x / u_res.y * zoom, zoom);

    float t = mod(u_time, 1000.0) * 0.15;
    vec2 mouseWarp = (u_mouse - 0.5) * 0.12;
    float scrollDrift = u_scroll * 0.25;

    vec2 v1 = voronoi(st * 2.5 + t * 0.4 + mouseWarp);
    vec2 v2 = voronoi(st * 4.2 + t * 0.6 - mouseWarp * 0.5 + vec2(0.0, scrollDrift * 0.3));
    
    float warp = organicWarp(st + v1 * 0.5, t);
    float pattern = v1.x * 0.6 + v2.x * 0.4;
    pattern += warp * 0.35;
    pattern = smoothstep(0.2, 0.8, pattern);

    vec3 colDark = mix(u_c1 * 0.7, u_c1 * 1.3, pattern) + u_c2 * pow(pattern, 2.5) * 0.55;
    float alphaDark = 0.35 * pattern + u_platform * 0.05;

    // Softer light‑mode colors – lower the multipliers and reduce opacity for a subtle overlay
    vec3 colLight = mix(u_c2 * 0.5, u_c2 * 1.0, pattern) + u_c1 * pow(pattern, 2.0) * 0.3;
    float alphaLight = 0.18 * mix(0.4, 0.8, pattern);

    vec3 col = mix(colLight, colDark, u_dark);
    float alpha = mix(alphaLight, alphaDark, u_dark);

    gl_FragColor = vec4(col * alpha, alpha);
  }
`;

// ============================================================================
// DESKTOP (RAW WEBGL) SHADERS (From HeroSection5)
// ============================================================================

const VERT_SRC_DESKTOP = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG_SRC_DESKTOP = `
precision highp float;

uniform vec2 u_res;
uniform vec2 u_mouse;
uniform float u_scroll;
uniform float u_time;
uniform float u_dark;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform float u_platform;

const float ROT_SIN = 0.479425538604;
const float ROT_COS = 0.877582561890;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 1.0;
  
  v += a * noise(p);
  float px = p.x * ROT_COS - p.y * ROT_SIN;
  float py = p.x * ROT_SIN + p.y * ROT_COS;
  p = vec2(px, py) * 2.1 + vec2(100.0);
  a *= 0.5;
  
  v += a * noise(p);
  px = p.x * ROT_COS - p.y * ROT_SIN;
  py = p.x * ROT_SIN + p.y * ROT_COS;
  p = vec2(px, py) * 2.1 + vec2(100.0);
  a *= 0.5;
  
  v += a * noise(p);
  
  return v / 1.75;
}

void main() {
  vec2 st = gl_FragCoord.xy / u_res.y;
  float zoom = u_res.x < u_res.y ? 1.5 : 1.0;
  st *= zoom;
  st -= 0.5 * vec2(u_res.x / u_res.y * zoom, zoom);

  float t = u_time * 0.04;
  vec2 mouseWarp = (u_mouse - 0.5) * 0.12;
  float scrollDrift = u_scroll * 0.22;

  vec2 q = vec2(
    fbm(st + t + mouseWarp + vec2(0.0, scrollDrift * 0.3)),
    fbm(st + vec2(5.20, 1.30) + t + mouseWarp + vec2(0.0, scrollDrift * 0.3))
  );

  float f = fbm(st + 0.7 * q + vec2(0.0, scrollDrift * 0.5) + t * 0.6);
  float fc = smoothstep(0.30, 0.70, f);

  vec3 colDark = mix(u_c1 * 0.62, u_c1 * 1.18, f) + u_c2 * pow(f, 3.0) * 0.48;
  float alphaDark = 0.26 * f + u_platform * 0.045;

  // Softer desktop light‑mode coloration – keep detail but lower contrast
  vec3 colLight = mix(u_c1 * 0.4, u_c1 * 0.9, fc) + u_c2 * pow(fc, 3.0) * 0.4;
  float alphaLight = 0.18 * mix(0.3, 0.8, fc);

  vec3 col = mix(colLight, colDark, u_dark);
  float alpha = mix(alphaLight, alphaDark, u_dark);

  gl_FragColor = vec4(col * alpha, alpha);
}
`;


// ============================================================================
// HELPERS
// ============================================================================

const isMobile = () => {
  return window.innerWidth < 768 || 
         typeof window.ontouchstart !== 'undefined' ||
         navigator.maxTouchPoints > 0;
};


// ============================================================================
// MOBILE HOOK (THREE.JS)
// ============================================================================

function useThreeShaderBackground(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  scrollProgressRef: React.MutableRefObject<number>
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const handleResize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      renderer.setSize(width, height);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const uniforms = {
      u_res: { value: new THREE.Vector2(canvas.clientWidth, canvas.clientHeight) },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_scroll: { value: 0.0 },
      u_time: { value: 0.0 },
      u_dark: { value: isDarkMode() ? 1.0 : 0.0 },
      u_c1: { value: new THREE.Color(0x06b6d4) },
      u_c2: { value: new THREE.Color(0xf59e0b) },
      u_platform: { value: 0.0 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShaderMobile,
      fragmentShader: fragmentShaderMobile,
      uniforms,
      transparent: true,
      blending: THREE.NormalBlending,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const updateColors = () => {
      const isDark = isDarkMode();
      uniforms.u_dark.value = isDark ? 1.0 : 0.0;

      const useBrand = !isMobile() || isDark;
      const c1Var = useBrand ? "--primary" : "--foreground";
      const c2Var = useBrand ? "--accent" : "--muted-foreground";

      const rawC1 = getComputedStyle(document.documentElement)
        .getPropertyValue(c1Var)
        .trim();
      const rawC2 = getComputedStyle(document.documentElement)
        .getPropertyValue(c2Var)
        .trim();

      if (!rawC1 || !rawC2) return false;

      const [r1, g1, b1] = parseHsl(rawC1);
      uniforms.u_c1.value.setRGB(r1, g1, b1);

      const [r2, g2, b2] = parseHsl(rawC2);
      uniforms.u_c2.value.setRGB(r2, g2, b2);

      return true;
    };

    let colorsResolved = updateColors();
    if (!colorsResolved) {
      let attempts = 0;
      const retryColors = () => {
        attempts += 1;
        colorsResolved = updateColors();
        if (!colorsResolved && attempts < 30) {
          requestAnimationFrame(retryColors);
        }
      };
      requestAnimationFrame(retryColors);
    }

    const mouseTarget = { x: 0.5, y: 0.5 };
    const mouseCurrent = { x: 0.5, y: 0.5 };
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseTarget.x = (e.clientX - rect.left) / rect.width;
      mouseTarget.y = (e.clientY - rect.top) / rect.height;
    };

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const rect = canvas.getBoundingClientRect();
      mouseTarget.x = (touch.clientX - rect.left) / rect.width;
      mouseTarget.y = (touch.clientY - rect.top) / rect.height;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    let animationId: number;
    let startTime = performance.now();
    let isVisible = true;
    let lastPauseTime = 0;
    let menuOpen = false;

    // const onMenuToggle = (e: Event) => {
    //   const open = (e as CustomEvent).detail?.open;
    //   menuOpen = !!open;
    //   if (menuOpen) {
    //     // Pause rendering so GPU is free for menu animation
    //     cancelAnimationFrame(animationId);
    //   } else if (isVisible) {
    //     // Resume rendering
    //     animationId = requestAnimationFrame(animate);
    //   }
    // };
    // window.addEventListener("navmenu:toggle", onMenuToggle);

    // Diff 7
    const onMenuToggle = (e: Event) => {
      const open = (e as CustomEvent).detail?.open;
      menuOpen = !!open;
      if (menuOpen) {
        // Pause rendering so GPU is free for menu animation
        cancelAnimationFrame(animationId);
        // Drop the backing-store resolution while the canvas isn't the
        // interactive focus anyway. A stale 2-3x DPR framebuffer still
        // occupies GPU memory bandwidth even while paused, and that
        // bandwidth contention is what causes dropped frames on the
        // clip-path wipe on mobile GPUs (Adreno/Mali especially).
        renderer.setPixelRatio(1);
      } else {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        if (isVisible) {
          // Resume rendering
          animationId = requestAnimationFrame(animate);
        }
      }
    };
    window.addEventListener("navmenu:toggle", onMenuToggle);
    const animate = (now: number) => {
      if (!isVisible || menuOpen) return;
      const elapsed = (now - startTime) / 1000;

      mouseCurrent.x = lerp(mouseCurrent.x, mouseTarget.x, 0.018);
      mouseCurrent.y = lerp(mouseCurrent.y, mouseTarget.y, 0.018);

      uniforms.u_time.value = elapsed;
      uniforms.u_mouse.value.set(mouseCurrent.x, mouseCurrent.y);
      uniforms.u_scroll.value = scrollProgressRef.current;
      uniforms.u_res.value.set(canvas.clientWidth, canvas.clientHeight);

      const isDark = isDarkMode();
      if (uniforms.u_dark.value !== (isDark ? 1.0 : 0.0)) {
        uniforms.u_dark.value = isDark ? 1.0 : 0.0;
        updateColors();
      }
      if (!colorsResolved) {
        colorsResolved = updateColors();
      }

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        if (!isVisible) {
          isVisible = true;
          // Compensate for time spent paused so shader doesn't jump
          if (lastPauseTime > 0) {
            startTime += performance.now() - lastPauseTime;
          }
          animationId = requestAnimationFrame(animate);
        }
      } else {
        if (isVisible) {
          isVisible = false;
          lastPauseTime = performance.now();
          cancelAnimationFrame(animationId);
        }
      }
    });
    observer.observe(canvas);

    animationId = requestAnimationFrame(animate);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("navmenu:toggle", onMenuToggle);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, [canvasRef, scrollProgressRef]);
}


// ============================================================================
// DESKTOP HOOK (RAW WEBGL)
// ============================================================================

function useRawShaderBackground(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  scrollProgressRef: React.MutableRefObject<number>
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    
    if (!gl) {
      const gl2 = canvas.getContext("webgl", { alpha: false, antialias: false });
      if (!gl2) return;
    }

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn("[shader]", gl.getShaderInfoLog(sh));
      }
      return sh;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT_SRC_DESKTOP));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG_SRC_DESKTOP));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uScroll = gl.getUniformLocation(prog, "u_scroll");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uDark = gl.getUniformLocation(prog, "u_dark");
    const uC1 = gl.getUniformLocation(prog, "u_c1");
    const uC2 = gl.getUniformLocation(prog, "u_c2");

    // const getScale = () => {
    //   const dpr = window.devicePixelRatio || 1;
    //   const width = window.screen.width;
    //   if (dpr >= 3 || width > 1200) return 0.5;
    //   if (dpr >= 2) return 0.35;
    //   return 0.25;
    // };
    
    //Diff 8
    const getScale = () => {
      // While the mobile/desktop menu overlay is animating, drop to the
      // lowest tier regardless of DPR — same rationale as the Three.js
      // pixelRatio drop above: less backing-store memory bandwidth
      // contending with the compositor during the clip-path wipe.
      if (menuOpenForScale) return 0.15;
      const dpr = window.devicePixelRatio || 1;
      const width = window.screen.width;
      if (dpr >= 3 || width > 1200) return 0.5;
      if (dpr >= 2) return 0.35;
      return 0.25;
    }; 

    // const resize = () => {
    //   if (!canvas) return;
    //   const SCALE = getScale();
    //   canvas.width = Math.floor(canvas.clientWidth * SCALE);
    //   canvas.height = Math.floor(canvas.clientHeight * SCALE);
    //   gl.viewport(0, 0, canvas.width, canvas.height);
    // };

    // Diff 8
    let menuOpenForScale = false;

    const resize = () => {
      if (!canvas) return;
      const SCALE = getScale();
      canvas.width = Math.floor(canvas.clientWidth * SCALE);
      canvas.height = Math.floor(canvas.clientHeight * SCALE);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const mouseTarget = { x: 0.5, y: 0.5 };
    const mouseCurrent = { x: 0.5, y: 0.5 };
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseTarget.x = (e.clientX - rect.left) / rect.width;
      mouseTarget.y = (e.clientY - rect.top) / rect.height;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const rect = canvas.getBoundingClientRect();
      mouseTarget.x = (touch.clientX - rect.left) / rect.width;
      mouseTarget.y = (touch.clientY - rect.top) / rect.height;
    }, { passive: true });

    let cachedDark = isDarkMode();
    let hasFoundValidColors = false;
    let cachedC1: [number, number, number] = [0, 0, 0];
    let cachedC2: [number, number, number] = [0, 0, 0];

    const updateColors = () => {
      cachedDark = isDarkMode();
      // For desktop dark mode, we keep the vibrant Green/Amber (--primary/--accent).
      // For desktop light mode, let's try a fresh Blue/Teal mix (--info/--primary)
      // that looks beautiful and highly visible against the warm cream background.
      const c1Var = cachedDark ? "--primary" : "--info";
      const c2Var = cachedDark ? "--accent" : "--primary";
      const rawC1 = getComputedStyle(document.documentElement).getPropertyValue(c1Var).trim();
      const rawC2 = getComputedStyle(document.documentElement).getPropertyValue(c2Var).trim();

      if (rawC1 && rawC2) {
        hasFoundValidColors = true;
        cachedC1 = parseHsl(rawC1);
        cachedC2 = parseHsl(rawC2);
      }
    };

    updateColors();

    let rafId: number;
    let isVisible = true;
    let menuOpen = false;

    // const onMenuToggle = (e: Event) => {
    //   const open = (e as CustomEvent).detail?.open;
    //   menuOpen = !!open;
    //   if (menuOpen) {
    //     cancelAnimationFrame(rafId);
    //   } else if (isVisible) {
    //     rafId = requestAnimationFrame(render);
    //   }
    // };
    // window.addEventListener("navmenu:toggle", onMenuToggle);

    // Diff 8
    const onMenuToggle = (e: Event) => {
      const open = (e as CustomEvent).detail?.open;
      menuOpen = !!open;
      menuOpenForScale = menuOpen;
      if (menuOpen) {
        cancelAnimationFrame(rafId);
        resize(); // apply the low-scale tier immediately, even while paused
      } else {
        resize(); // restore full scale on close
        if (isVisible) {
          rafId = requestAnimationFrame(render);
        }
      }
    };
    window.addEventListener("navmenu:toggle", onMenuToggle);

    const render = (now: number) => {
      if (!isVisible || menuOpen) return;
      
      const expectedW = Math.floor(canvas.clientWidth * getScale());
      const expectedH = Math.floor(canvas.clientHeight * getScale());
      if (canvas.width !== expectedW || canvas.height !== expectedH) {
        resize();
      }

      const currentDark = isDarkMode();
      if (!hasFoundValidColors || currentDark !== cachedDark) {
        updateColors();
      }

      const t = now * 0.001;

      mouseCurrent.x = lerp(mouseCurrent.x, mouseTarget.x, 0.018);
      mouseCurrent.y = lerp(mouseCurrent.y, mouseTarget.y, 0.018);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouseCurrent.x, mouseCurrent.y);
      gl.uniform1f(uScroll, scrollProgressRef.current);
      gl.uniform1f(uTime, t);
      gl.uniform1f(uDark, cachedDark ? 1.0 : 0.0);
      gl.uniform3fv(uC1, cachedC1);
      gl.uniform3fv(uC2, cachedC2);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafId = requestAnimationFrame(render);
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (!isVisible) {
          isVisible = true;
          rafId = requestAnimationFrame(render);
        }
      } else {
        if (isVisible) {
          isVisible = false;
          cancelAnimationFrame(rafId);
        }
      }
    });
    observer.observe(canvas);

    rafId = requestAnimationFrame(render);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("navmenu:toggle", onMenuToggle);
      ro.disconnect();
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
      
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
    };
  }, [canvasRef, scrollProgressRef]);
}

function MobileBackground({ scrollProgressRef }: { scrollProgressRef: React.MutableRefObject<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useThreeShaderBackground(canvasRef, scrollProgressRef);
  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />;
}

function DesktopBackground({ scrollProgressRef }: { scrollProgressRef: React.MutableRefObject<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useRawShaderBackground(canvasRef, scrollProgressRef);
  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />;
}


// ============================================================================
// COMPONENTS
// ============================================================================

function CounterCard({
  item,
  active,
  index,
}: {
  item: {
    value: number;
    labelKey: string;
    label: string;
    sublabelKey: string;
    sublabel: string;
  };
  active: boolean;
  index: number;
}) {
  const { t } = useTranslation();
  const count = useCountUp(item.value, 1.4 + index * 0.2, active);
  const label = t(item.labelKey, item.label);
  const sublabel = t(item.sublabelKey, item.sublabel);
  return (
    <div className="border-l border-border/60 pl-4 py-1">
      <div className="font-display font-black text-[clamp(1.6rem,3.5vw,2.6rem)] leading-none tabular-nums text-foreground">
        {count}
        {item.label === "ETB (K)" && "K"}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
        {label}
        <span className="block text-muted-foreground/50 tracking-[0.1em] normal-case font-sans text-[10px] mt-0.5">
          {sublabel}
        </span>
      </div>
    </div>
  );
}

function useCountUp(target: number, duration = 1.6, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const raf = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const t = Math.min(elapsed / duration, 1);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setCount(Math.round(eased * target));
      if (t < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [start, target, duration]);
  return count;
}

function MaskedWords({
  text,
  className,
  wordRefs,
}: {
  text: string;
  className: string;
  wordRefs: React.MutableRefObject<HTMLSpanElement[]>;
}) {
  const words = text.split(" ");
  return (
    <span className="block">
      {words.map((word, idx) => (
        <span key={idx} className="inline-block overflow-hidden align-top">
          <span
            ref={(el) => {
              if (el) wordRefs.current[idx] = el;
            }}
            className={`inline-block will-change-transform ${className}`}
          >
            {word}
            {idx < words.length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </span>
  );
}

const CACHE_KEY = "amana_hero_stats_cache_v1";
const SEEN_KEY = "amana_hero_stats_seen";
const STALE_MS = 5 * 60 * 1000;

const readStatsCache = (): { data: HeroStats; cachedAt: number } | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.data?.counters || !parsed?.data?.progress || !parsed?.data?.ticker)
      return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeStatsCache = (data: HeroStats) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, cachedAt: Date.now() }));
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* ignore */
  }
};

export default function HeroSection() {
  const { t } = useTranslation();
  const lenis = useLenis();
  const { registerAnimation, heroStats: coordinatorStats } = useAnimationCoordinator();

  const hasSeenBefore = (() => {
    try {
      return sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      return false;
    }
  })();

  const [heroStats, setHeroStats] = useState<HeroStats | null>(() => {
    const cached = readStatsCache();
    return cached?.data ?? null;
  });

  useEffect(() => {
    if (coordinatorStats) {
      setHeroStats(coordinatorStats);
      writeStatsCache(coordinatorStats);
    }
  }, [coordinatorStats]);

  useEffect(() => {
    if (coordinatorStats) return;
    const cached = readStatsCache();
    const isFresh = cached && Date.now() - cached.cachedAt < STALE_MS;
    if (isFresh) return;
    if (hasSeenBefore && cached) return;

    heroApi
      .getStats()
      .then((res) => {
        setHeroStats(res.data);
        writeStatsCache(res.data);
      })
      .catch((err) => console.warn("Hero stats fetch failed:", err));
  }, [coordinatorStats, hasSeenBefore, heroStats]);

  const TICKER_ITEMS = useMemo(() => {
    if (!heroStats) return [];
    const glyphs = ["ቤተሰቦች", "ምሕረት", "ተስፋ", "ሰላም", "ፍቅር", "አሚን"];

    function pickGlyph() {
      return glyphs[Math.floor(Math.random() * glyphs.length)];
    }

    const items: string[] = [];

    heroStats.ticker.donations?.forEach((d) => {
      items.push(
        t("ticker.donation", "{{name}} · ETB {{amount}}", {
          name: d.donorName?.split(" ")[0] || t("ticker.someone", "Someone"),
          amount: d.etbEquivalent.toLocaleString(),
        })
      );
      items.push(pickGlyph());
    });

    heroStats.ticker.support?.forEach((s) => {
      const typeLabel = t(`ticker.supportType.${s.supportType}`, s.supportType);
      items.push(
        t("ticker.support", "{{type}} delivered — {{family}}", {
          type: typeLabel,
          family: s.familyCode || t("ticker.aFamily", "a family"),
        })
      );
      items.push(pickGlyph());
    });

    if (heroStats.ticker.aggregates.raisedThisMonth > 0) {
      items.push(
        t("ticker.raisedThisMonth", "ETB {{amount}} raised this month", {
          amount: heroStats.ticker.aggregates.raisedThisMonth.toLocaleString(),
        })
      );
      items.push(pickGlyph());
    }

    if (heroStats.ticker.aggregates.urgentFamilies > 0) {
      items.push(
        t("ticker.urgentFamilies", "{{count}} families need urgent support", {
          count: heroStats.ticker.aggregates.urgentFamilies,
        })
      );
      items.push(pickGlyph());
    }

    if (heroStats.ticker.aggregates.totalDonors) {
      items.push(
        t("ticker.donorCount", "{{count}} donors registered", {
          count: heroStats.ticker.aggregates.totalDonors,
        })
      );
      items.push(pickGlyph());
    }

    items.push(t("ticker.dispatch", "Live dispatch — Addis Ababa"));
    items.push(...glyphs);

    return items;
  }, [heroStats, t]);

  const COUNTER_TARGETS = useMemo(() => {
    if (!heroStats) return [];
    return [
      {
        value: heroStats.counters.familiesSupported,
        labelKey: "hero.counters.families",
        label: "Families",
        sublabelKey: "hero.counters.familiesSub",
        sublabel: "directly supported",
      },
      {
        value: heroStats.counters.eventsThisYear,
        labelKey: "hero.counters.events",
        label: "Events",
        sublabelKey: "hero.counters.eventsSub",
        sublabel: "this year",
      },
      {
        value: Math.round(heroStats.counters.raisedEtb / 1000),
        labelKey: "hero.counters.raised",
        label: "ETB (K)",
        sublabelKey: "hero.counters.raisedSub",
        sublabel: "raised to date",
      },
    ];
  }, [heroStats]);

  const sectionRef = useRef<HTMLElement>(null);
  const tickerWrapperRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef<number>(0);
  const [isMobileDevice] = useState(() => isMobile());

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    if (!section) return;
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => {
        scrollProgressRef.current = self.progress;
      },
    });
    return () => st.kill();
  }, []);

  const eyebrowRef = useRef<HTMLDivElement>(null);
  const line1WordRefs = useRef<HTMLSpanElement[]>([]);
  const line2WordRefs = useRef<HTMLSpanElement[]>([]);
  const line3WordRefs = useRef<HTMLSpanElement[]>([]);
  const subRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);
  const tickerInnerRef = useRef<HTMLDivElement>(null);
  const tickerItemRefs = useRef<HTMLDivElement[]>([]);
  const tickerRevealedRef = useRef(false);
  const [countersActive, setCountersActive] = useState(false);

  const hairlinesRef = useRef<SVGSVGElement>(null);
  const cornerTLRef = useRef<SVGSVGElement>(null);
  const cornerTRRef = useRef<SVGSVGElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const signalRef = useRef<SVGSVGElement>(null);
  const ringRefs = useRef<SVGCircleElement[]>([]);

  useEffect(() => {
    if (ringRefs.current.length === 0) return;

    const mm = gsap.matchMedia();

    mm.add({ reduceMotion: "(prefers-reduced-motion: reduce)" }, (context) => {
      const { reduceMotion } = context.conditions as { reduceMotion: boolean };

      if (reduceMotion) {
        ringRefs.current.forEach((ring, idx) => {
          gsap.set(ring, { attr: { r: 60 + idx * 34 }, opacity: 0.14 });
        });
        return;
      }

      gsap.set(ringRefs.current, { attr: { r: 4 }, opacity: 0 });

      const loop = gsap.timeline({ repeat: -1 });
      ringRefs.current.forEach((ring, idx) => {
        loop.fromTo(
          ring,
          { attr: { r: 4 }, opacity: 0.5 },
          { attr: { r: 170 }, opacity: 0, duration: 2.6, ease: "power2.out" },
          idx * 1.05
        );
      });

      return () => {
        loop.kill();
      };
    });

    return () => mm.revert();
  }, []);

  useEffect(() => {
    const ticker = tickerInnerRef.current;
    const wrapper = tickerWrapperRef.current;
    if (!ticker || !wrapper) return;

    let rafId: number;
    let cancelled = false;
    let cloneEls: HTMLElement[] = [];
    let lastTime = performance.now();
    const pxPerSec = 38;

    const init = () => {
      if (cancelled) return;
      const inner = tickerInnerRef.current;
      const outer = tickerRef.current;
      const wrap = tickerWrapperRef.current;
      if (!inner || !outer || !wrap) return;

      // Clean up previous clones if any
      cloneEls.forEach((el) => el.remove());
      cloneEls = [];

      const singleWidth = inner.scrollWidth;
      if (singleWidth <= 0) return;

      const wrapWidth = wrap.clientWidth || window.innerWidth;
      // Guarantee enough duplicates so the track extends past screen width + singleWidth
      const neededCopies = Math.max(2, Math.ceil((wrapWidth + singleWidth) / singleWidth) + 1);

      for (let i = 1; i < neededCopies; i++) {
        const clone = inner.cloneNode(true) as HTMLElement;
        clone.setAttribute("aria-hidden", "true");

        // Remove ref attributes from clone items to prevent GSAP ref collision
        const cloneItems = clone.querySelectorAll<HTMLElement>("[ref]");
        cloneItems.forEach((item) => item.removeAttribute("ref"));

        outer.appendChild(clone);
        cloneEls.push(clone);
      }

      // If reveal already happened before clones were created, ensure clone spans are visible
      if (tickerRevealedRef.current) {
        const spans = outer.querySelectorAll<HTMLElement>(".ticker-item-span");
        spans.forEach((span) => {
          span.style.opacity = "1";
          span.style.transform = "none";
        });
      }

      let x = 0;

      const animate = (now: number) => {
        if (cancelled) return;
        if (!tickerRevealedRef.current) {
          rafId = requestAnimationFrame(animate);
          lastTime = now;
          return;
        }

        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;
        x -= pxPerSec * dt;

        // Seamless wrap around: when x scrolls past 1 full singleWidth set, reset x back by singleWidth
        if (x <= -singleWidth) {
          x += singleWidth;
        }

        if (tickerRef.current) {
          tickerRef.current.style.transform = `translate3d(${x}px, 0, 0)`;
        }
        rafId = requestAnimationFrame(animate);
      };

      rafId = requestAnimationFrame(animate);
    };

    document.fonts.ready.then(init);

    const handleResize = () => {
      init();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      cloneEls.forEach((el) => el.remove());
    };
  }, [TICKER_ITEMS]);
  

const runAnimation = (mode: AnimationMode, payload?: HeroStats | null) => {
    if (payload) setHeroStats(payload);
    const isReveal = mode === "reveal";
    const ease = isReveal ? "expo.out" : "power3.out";
    const baseDuration = isReveal ? 0.7 : 0.5;
    const baseDelay = isReveal ? 0.05 : 0.2;

    const tl = gsap.timeline();

    const words = [...line1WordRefs.current, ...line2WordRefs.current, ...line3WordRefs.current];

    gsap.set([eyebrowRef.current, subRef.current, ctaRef.current], {
      y: 28,
      opacity: 0,
      filter: "blur(8px)",
    });
    gsap.set(panelRef.current, { x: 60, opacity: 0 });
    gsap.set(words, {
      yPercent: isReveal ? 115 : 40,
      opacity: 0,
      filter: isReveal ? "blur(10px)" : "blur(3px)",
    });

    tl.to(
      eyebrowRef.current,
      {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: baseDuration * 0.7,
        ease,
        clearProps: "filter",
      },
      baseDelay
    );

    const lineDelay = baseDelay + baseDuration * 0.3;
    const wordDuration = isReveal ? 0.7 : 0.45;
    const wordStagger = isReveal ? 0.055 : 0.04;

    tl.call(() => setCountersActive(true), [], lineDelay);
    tl.to(
      words,
      {
        yPercent: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: wordDuration,
        stagger: wordStagger,
        ease,
        clearProps: "filter",
      },
      lineDelay
    );
    const headlineEnd = lineDelay + Math.max(0, words.length - 1) * wordStagger + wordDuration;

    tl.to(
      subRef.current,
      {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: baseDuration * 0.85,
        ease,
        clearProps: "filter",
      },
      lineDelay + 0.3
    );
    tl.to(
      ctaRef.current,
      {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: baseDuration * 0.75,
        ease,
        clearProps: "filter",
      },
      lineDelay + 0.4
    );

    tl.to(
      panelRef.current,
      { x: 0, opacity: 1, duration: baseDuration * 1.1, ease },
      lineDelay + 0.1
    );

    const tickerRevealAt = headlineEnd - 0.3;
    const itemDuration = isReveal ? 0.45 : 0.3;
    const itemStagger = isReveal ? 0.028 : 0.018;

    const tickerSpans = tickerRef.current
      ? Array.from(tickerRef.current.querySelectorAll<HTMLElement>(".ticker-item-span"))
      : tickerItemRefs.current;

    if (tickerSpans.length > 0) {
      tl.to(
        tickerSpans,
        {
          yPercent: 0,
          opacity: 1,
          duration: itemDuration,
          stagger: itemStagger,
          ease: isReveal ? "power3.out" : "power2.out",
        },
        tickerRevealAt
      );
    }

    const itemRevealSpan =
      Math.max(0, tickerSpans.length - 1) * itemStagger + itemDuration;
    const tickerScrollStart = tickerRevealAt + itemRevealSpan + 0.1;
    tl.call(() => {
      tickerRevealedRef.current = true;
    }, [], tickerScrollStart);
  };

  useLayoutEffect(() => {
    gsap.set([eyebrowRef.current, subRef.current, ctaRef.current], {
      opacity: 0,
      y: 28,
    });
    gsap.set(panelRef.current, { opacity: 0, x: 60 });
    gsap.set([...line1WordRefs.current, ...line2WordRefs.current, ...line3WordRefs.current], {
      opacity: 0,
      yPercent: 115,
    });

    const spans = tickerRef.current?.querySelectorAll(".ticker-item-span");
    if (spans && spans.length > 0) {
      gsap.set(spans, { yPercent: 100, opacity: 0 });
    } else if (tickerItemRefs.current.length > 0) {
      gsap.set(tickerItemRefs.current, { yPercent: 100, opacity: 0 });
    }

    const unsub = registerAnimation(runAnimation);
    return unsub;
  }, [registerAnimation]);

  return (
    <section ref={sectionRef} className="relative h-svh flex flex-col overflow-hidden bg-background select-none">
      {/* Background layer */}
      {isMobileDevice ? (
        <MobileBackground scrollProgressRef={scrollProgressRef} />
      ) : (
        <DesktopBackground scrollProgressRef={scrollProgressRef} />
      )}

      {/* Diagonal shard-echo geometry */}
      <svg
        ref={hairlinesRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <line x1="60%" y1="0%" x2="80%" y2="100%" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.08" />
        <line x1="58%" y1="0%" x2="77%" y2="100%" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.05" />
      </svg>

      {/* Corner brackets */}
      <svg
        ref={cornerTLRef}
        className="absolute top-6 left-6 pointer-events-none"
        width="22"
        height="22"
        viewBox="0 0 28 28"
        aria-hidden="true"
        style={{ opacity: 0.2 }}
      >
        <path d="M 0 28 L 0 0 L 28 0" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg
        ref={cornerTRRef}
        className="absolute top-6 right-6 pointer-events-none"
        width="22"
        height="22"
        viewBox="0 0 28 28"
        aria-hidden="true"
        style={{ opacity: 0.2 }}
      >
        <path d="M 28 28 L 28 0 L 0 0" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>

      {/* Main content grid */}
      <div className="flex-1 min-h-0 container mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-0 items-center pt-14 pb-10 sm:pt-20 sm:pb-14 lg:pt-24 lg:pb-16 relative z-10">
        {/* LEFT — Typographic core */}
        <div className="flex flex-col justify-center max-w-3xl">
          {/* Eyebrow */}
          <div ref={eyebrowRef} className="flex items-center gap-3 mb-8">
            <div className="w-6 h-px bg-primary" />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              {t("hero.eyebrow", "Aid dispatch — Addis Ababa")}
            </span>
            <span className="relative flex h-[6px] w-[6px]">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex rounded-full h-[6px] w-[6px] bg-primary" />
            </span>
          </div>

          {/* Headline */}
          <div className="mb-8">
            <h1 className="font-display font-black leading-[0.93] tracking-[-0.03em] text-[clamp(3rem,8.5vw,6.5rem)]">
              <MaskedWords text={t("hero.line1", "Aid that")} className="text-foreground" wordRefs={line1WordRefs} />
              <MaskedWords text={t("hero.line2", "actually")} className="text-foreground" wordRefs={line2WordRefs} />
              <MaskedWords text={t("hero.line3", "arrives.")} className="text-primary" wordRefs={line3WordRefs} />
            </h1>
          </div>

          {/* Sub */}
          <p
            ref={subRef}
            className="text-[clamp(0.95rem,1.5vw,1.1rem)] leading-relaxed text-muted-foreground max-w-[42ch] mb-10"
          >
            {t(
              "hero.subtitle",
              "Amana connects donors directly with families in Addis Ababa. No black box. Every birr tracked, every family named."
            )}
          </p>

          {/* CTAs */}
          <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
            <Link to="/payment">
              <button className="group inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-7 h-12 rounded-xl hover:bg-primary/90 transition-colors shadow-md hover:shadow-glow">
                {t("hero.ctaPrimary", "Donate now")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                lenis?.scrollTo("#impact");
              }}
              className="inline-flex items-center gap-2 border border-border text-foreground font-medium text-sm px-7 h-12 rounded-xl hover:bg-secondary/60 transition-colors"
            >
              {t("hero.ctaSecondary", "See our impact")}
            </button>
          </div>
        </div>

        {/* RIGHT — The field dispatch panel */}
        <div
          ref={panelRef}
          className="hidden lg:flex flex-col self-stretch justify-center ml-16 xl:ml-24 relative"
          style={{ minWidth: "260px" }}
        >
          <div
            className="absolute -left-5 top-1/2 -translate-y-1/2 font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40"
            style={{ writingMode: "vertical-rl", transform: "translateY(-50%) rotate(180deg)" }}
          >
            FIELD / STATUS
          </div>

          <div className="border-t border-b border-border/50 py-3 mb-6">
            <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/60 flex justify-between">
              <span>AMANA / OS — v2.4.1</span>
              <span>15°N 38°E</span>
            </div>
          </div>

          <div className="flex flex-col gap-5 mb-8">
            {COUNTER_TARGETS.map((item, i) => (
              <CounterCard key={item.label} item={item} active={countersActive} index={i} />
            ))}
          </div>

          <div className="mt-auto">
            <div className="flex justify-between items-baseline mb-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
                {t("hero.counters.fundProgress", "FUND PROGRESS")}
              </span>
              <span className="font-mono text-[10px] text-foreground/60">{heroStats?.progress?.percent ?? 0}%</span>
            </div>
            <div className="h-[2px] w-full bg-border/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-[1400ms] ease-out"
                style={{ width: countersActive ? `${heroStats?.progress?.percent ?? 0}%` : "0%" }}
              />
            </div>
            <p className="font-mono text-[9px] text-muted-foreground/40 mt-2 tracking-[0.1em]">
              {t("hero.counters.raisedOf", "ETB {{raised}}K of {{goal}}K RAISED", {
                raised: Math.round((heroStats?.progress?.raised ?? 0) / 1000),
                goal: Math.round((heroStats?.progress?.goal ?? 0) / 1000),
              })}
            </p>
          </div>

          <svg
            className="absolute bottom-0 right-0"
            width="16"
            height="16"
            viewBox="0 0 28 28"
            aria-hidden="true"
            style={{ opacity: 0.15 }}
          >
            <path d="M 28 0 L 28 28 L 0 28" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* TICKER TAPE */}
      <div
        ref={tickerWrapperRef}
        className="relative z-10 border-t border-border/40 overflow-hidden select-none"
        aria-hidden="true"
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, hsl(var(--background)), transparent)" }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, hsl(var(--background)), transparent)" }}
        />

        <div
          ref={tickerRef}
          className="flex items-center will-change-transform py-3"
          style={{ width: "max-content" }}
        >
          <div
            ref={tickerInnerRef}
            className="flex items-center gap-0 shrink-0"
          >
            {TICKER_ITEMS.map((item, i) => (
              <div
                key={i}
                ref={(el) => {
                  if (el) tickerItemRefs.current[i] = el;
                }}
                className="flex items-center shrink-0 overflow-hidden"
              >
                <span className="ticker-item-span font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 whitespace-nowrap px-4 inline-block will-change-transform">
                  {item}
                </span>
                <span className="text-muted-foreground/20 text-xs">◆</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
