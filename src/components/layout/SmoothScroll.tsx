"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/** Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync. */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    // Phones/tablets keep native momentum scrolling (better feel, zero cost), so
    // Lenis is only downloaded on desktop.
    if (prefersReducedMotion() || window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    let cleanup: (() => void) | undefined;
    let alive = true;
    import("lenis").then(({ default: Lenis }) => {
      if (!alive) return;
      const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, touchMultiplier: 1.4, anchors: { offset: -80 } });
      window.__lenis = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      cleanup = () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
        delete window.__lenis;
      };
    });
    return () => {
      alive = false;
      cleanup?.();
    };
  }, []);

  // New page: Next.js handles scroll position (top on navigation, restored on Back);
  // re-measure every trigger once the new layout settles.
  useEffect(() => {
    window.__lenis?.resize();
    // Fonts and images settle after the first paint; measure again once they have.
    const ids = [350, 2400].map((t) => window.setTimeout(() => ScrollTrigger.refresh(), t));
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [pathname]);

  return null;
}
