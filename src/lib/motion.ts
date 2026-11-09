/**
 * Motion helpers with no dependencies. GSAP (src/lib/gsap.ts) is only ever loaded through
 * loadGsap(), from effects that first checked for a big screen with a mouse, so phones never
 * download it. Keep BIG_SCREEN in sync with the `pin` variant in globals.css.
 */

/** A big screen with a mouse: the only place the 3D board, pinned scenes, parallax and Lenis run. */
export const BIG_SCREEN = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Scroll-driven scenes (pinning, scrubbing, parallax) are allowed here. */
export const scrollScenes = () => typeof window !== "undefined" && window.matchMedia(BIG_SCREEN).matches && !prefersReducedMotion();

let gsapModule: Promise<typeof import("./gsap")> | null = null;
/** GSAP + ScrollTrigger, registered, as a separate chunk. */
export const loadGsap = () => (gsapModule ??= import("./gsap"));
