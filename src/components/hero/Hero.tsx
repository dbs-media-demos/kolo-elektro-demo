"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { getImageProps } from "next/image";
import dimWide from "@/assets/hero/dim-wide.jpg";
import dimTall from "@/assets/hero/dim-tall.jpg";
import litWide from "@/assets/hero/lit-wide.jpg";
import litTall from "@/assets/hero/lit-tall.jpg";
import { useBiz } from "@/components/preview/BizContext";
import { PhoneIcon } from "@/components/layout/MobileBar";
import { OpenBadge } from "@/components/ui/OpenBadge";
import { num, telOf } from "@/lib/biz-core";
import { BIG_SCREEN, loadGsap, prefersReducedMotion } from "@/lib/motion";
import { useT } from "@/lib/i18n";
import type { PanelScene } from "./panelScene";

/** Set when the board ran too slowly: the rest of the visit keeps the stills. */
const SLOW_KEY = "kolo-3d";

const remembered = () => {
  try {
    return sessionStorage.getItem(SLOW_KEY) === "still";
  } catch {
    return false;
  }
};

/**
 * The canvas's own WebGL 2 context, only on a real graphics chip: no major performance caveat and
 * not a software renderer. Made once and handed to three.js (the first context costs ~130 ms however
 * fast the machine is). Stills for scripts/capture-stills.mjs are drawn on any renderer.
 */
const gpuContext = (cv: HTMLCanvasElement, still: boolean) => {
  try {
    const gl = cv.getContext("webgl2", {
      alpha: false,
      antialias: true,
      depth: true,
      stencil: false,
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: !still,
      preserveDrawingBuffer: still,
    });
    if (!gl || still) return gl;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    if (!/swiftshader|llvmpipe|softpipe|software|basic render/i.test(name)) return gl;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {}
  return null;
};

/**
 * The centrepiece: a live 3D distribution board (panelScene.ts). The page paints with the headline
 * and a still of the same board; on a big screen with a mouse three.js loads once the page is idle,
 * builds in small steps and compiles its shaders while the still is on screen, and only then fades
 * in. As the board comes up the lamp strikes on. Scrolling flies the camera into the board and hands
 * over to the plan. If its first two seconds run slowly, the canvas fades back to the still and the
 * rest of the visit stays on stills. Phones and tablets keep stills rendered from the same desktop
 * scene: the lit one crossfades in once (the power-up), and the main switch flips between the two.
 * Reduced motion, no real graphics chip or Save-Data keep a still of the lit board.
 */
export function Hero() {
  const biz = useBiz();
  const t = useT();
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const fade = useRef<HTMLDivElement>(null);
  const scene = useRef<PanelScene | null>(null);
  const release = useRef<() => void>(() => {});
  const [mode, setMode] = useState<"dim" | "live" | "still">("dim");
  const [power, setPower] = useState<boolean | null>(null);
  const [litReady, setLitReady] = useState(false);
  /** The live board is handing over to the still underneath it. */
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const cv = canvas.current;
    const sec = section.current;
    if (!cv || !sec) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const big = window.matchMedia(BIG_SCREEN).matches;
    // scripts/capture-stills.mjs renders the fallback stills from the scene itself, on a big screen
    const still = big ? (new URLSearchParams(window.location.search).get("still") as "on" | "off" | null) : null;

    // Where the hero is a tall scroll flight (big screen, motion allowed), the copy leaves with the scroll
    let onScroll = (p: number) => void p;
    let st: { kill: () => void } | null = null;
    let stWanted = big && !prefersReducedMotion();
    const killSt = () => {
      stWanted = false;
      st?.kill();
    };
    if (stWanted)
      void loadGsap().then(({ ScrollTrigger }) => {
        if (!stWanted) return;
        st = ScrollTrigger.create({
          trigger: sec,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            const p = self.progress;
            if (copy.current) {
              const a = Math.max(0, 1 - p / 0.42);
              copy.current.style.opacity = String(a);
              copy.current.style.transform = `translateY(${-p * 70}px)`;
              copy.current.style.pointerEvents = a < 0.2 ? "none" : "";
            }
            if (fade.current) fade.current.style.opacity = String(Math.max(0, (p - 0.72) / 0.28));
            onScroll(p);
          },
        });
      });

    // The graphics chip is only asked about on a big screen that may run the board, once the page is idle
    if (!big || (!still && (prefersReducedMotion() || conn?.saveData || remembered()))) {
      // No scene: the lit still with a main switch. Phones see the dark board first, then the power-up.
      const on = () => {
        setMode("still");
        setPower(true);
      };
      if (big || prefersReducedMotion()) {
        on();
        return killSt;
      }
      let id = 0;
      const later = () => (id = window.setTimeout(on, 700));
      if (document.readyState === "complete") later();
      else window.addEventListener("load", later, { once: true });
      return () => {
        window.removeEventListener("load", later);
        window.clearTimeout(id);
      };
    }

    let alive = true;
    let onScreen = false;
    let covered = false;
    let gaveUp = false;
    let detach = () => {};

    // Draws only while some of the board can be seen: on screen, tab visible, not under the fade
    const gate = () => {
      const s = scene.current;
      if (!s) return;
      if (onScreen && !covered && !gaveUp && !document.hidden) s.start();
      else s.stop();
    };
    onScroll = (p) => {
      scene.current?.setScroll(p);
      const under = p >= 0.999;
      if (under !== covered) {
        covered = under;
        gate();
      }
    };
    document.addEventListener("visibilitychange", gate);

    // Too slow here: remember it for the visit, stop drawing, and let the still take over again
    const giveUp = () => {
      if (gaveUp || !alive) return;
      gaveUp = true;
      try {
        sessionStorage.setItem(SLOW_KEY, "still");
      } catch {}
      gate();
      detach();
      setPower((p) => p ?? true);
      setMode("still");
      // A board that was on screen hands over under cover; one that never showed has nothing to fade
      if (cv.dataset.ready === "true") setLeaving(true);
      else {
        release.current();
        release.current = () => {};
      }
    };

    const boot = async () => {
      // No real graphics chip: the still stays, and three.js is never downloaded
      const gl = gpuContext(cv, Boolean(still));
      if (!gl) return giveUp();
      let s: PanelScene;
      try {
        const { createPanelScene } = await import("./panelScene");
        if (!alive) return;
        s = await createPanelScene(cv, {
          context: gl,
          still: still ?? undefined,
          onFirstFrame: () => {
            cv.dataset.ready = "true";
            setMode("live");
          },
          onPower: setPower,
          onSlow: giveUp,
        });
      } catch {
        // No WebGL context after all, or it failed to build: the still stays
        if (!still) giveUp();
        return;
      }
      if (!alive) return s.dispose();
      scene.current = s;
      release.current = () => {
        s.dispose();
        if (scene.current === s) scene.current = null;
      };

      const stage = sec.querySelector<HTMLElement>("[data-stage]")!;
      const sizeIt = () => s.resize(stage.clientWidth, stage.clientHeight);
      sizeIt();
      const ro = new ResizeObserver(sizeIt);
      ro.observe(stage);

      // Off-screen, the scene doesn't draw at all
      const io = new IntersectionObserver(([e]) => {
        onScreen = e.isIntersecting;
        gate();
      });

      const toNdc = (e: PointerEvent) => {
        const r = cv.getBoundingClientRect();
        return [((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1] as const;
      };
      const onMove = (e: PointerEvent) => {
        if (e.pointerType === "touch") return;
        const [x, y] = toNdc(e);
        s.setPointer(x, y);
        sec.style.cursor = s.hitMain(x, y) ? "pointer" : "";
      };
      const onClick = (e: MouseEvent) => {
        if ((e.target as Element).closest("a,button")) return;
        const [x, y] = toNdc(e as PointerEvent);
        if (s.hitMain(x, y)) s.toggle();
      };
      sec.addEventListener("pointermove", onMove, { passive: true });
      sec.addEventListener("click", onClick);

      detach = () => {
        ro.disconnect();
        io.disconnect();
        sec.removeEventListener("pointermove", onMove);
        sec.removeEventListener("click", onClick);
        sec.style.cursor = "";
      };

      // Every shader compiled and one frame drawn while the still is on screen; only then may it show
      await s.warm();
      if (!alive || gaveUp) return;
      io.observe(sec);
    };

    // After the page, when the browser is idle: first paint and hydration never wait for three.js
    let idle = 0;
    const later = () => {
      const ric = window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 300));
      idle = ric(() => void boot(), { timeout: 2500 } as IdleRequestOptions) as number;
    };
    if (document.readyState === "complete") later();
    else window.addEventListener("load", later, { once: true });

    return () => {
      alive = false;
      window.removeEventListener("load", later);
      document.removeEventListener("visibilitychange", gate);
      if (idle) window.cancelIdleCallback?.(idle);
      killSt();
      detach();
      release.current();
      release.current = () => {};
    };
  }, []);

  // Handing back: once the still under the canvas is in place, the canvas fades out and the renderer is freed
  useEffect(() => {
    if (!leaving || (power && !litReady)) return;
    const cv = canvas.current;
    if (cv) {
      delete cv.dataset.ready;
      cv.dataset.fallback = "true";
    }
    const id = window.setTimeout(() => {
      release.current();
      release.current = () => {};
      setLeaving(false);
    }, 1200);
    return () => window.clearTimeout(id);
  }, [leaving, power, litReady]);

  const alt = t("A distribution board with neat rows of breakers on a dark wall, under one warm pendant lamp");
  const common = { alt, sizes: "100vw", quality: 75 };
  const { props: { srcSet: dimW } } = getImageProps({ ...common, src: dimWide });
  const { props: { srcSet: dimT, ...img } } = getImageProps({ ...common, src: dimTall, loading: "eager" });
  const { props: { srcSet: litW } } = getImageProps({ ...common, src: litWide });
  const { props: { srcSet: litT, ...imgLit } } = getImageProps({ ...common, src: litTall });
  const lit = mode === "still" && power === true;

  return (
    <section ref={section} id="top" aria-labelledby="hero-title" className="hero sec-night relative">
      <div data-stage className="sticky top-0 isolate h-[100svh] overflow-hidden max-[899px]:h-full">
        <div className="hero-still" aria-hidden={mode === "live"}>
          <picture>
            <source media="(min-width: 900px)" srcSet={dimW} sizes="100vw" />
            <source media="(max-width: 899px)" srcSet={dimT} sizes="100vw" />
            {/* eslint-disable-next-line jsx-a11y/alt-text -- alt comes from getImageProps */}
            <img {...img} fetchPriority="high" />
          </picture>
          {/* The lit board is only requested once it's wanted, then crossfades over the dark one */}
          {mode === "still" && (
            <picture className="hero-lit" data-on={lit && litReady} data-instant={leaving}>
              <source media="(min-width: 900px)" srcSet={litW} sizes="100vw" />
              <source media="(max-width: 899px)" srcSet={litT} sizes="100vw" />
              {/* The dark still below carries the alt text */}
              <img {...imgLit} alt="" onLoad={() => setLitReady(true)} />
            </picture>
          )}
        </div>
        <canvas ref={canvas} className="hero-canvas" aria-hidden />
        <div className="hero-scrim" aria-hidden />

        <div ref={copy} className="relative flex h-full flex-col justify-end px-[var(--gutter)] pb-7 pt-24 min-[900px]:justify-center min-[900px]:pb-14">
          <div className="hero-copy relative max-w-[46rem] min-[900px]:max-w-[52%]">
            <p className="anim-fade flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.78rem] font-medium uppercase tracking-[0.1em] md:text-[0.86rem]" style={{ "--d": "0.1s" } as CSSProperties}>
              <span className="text-spark">{t("Electrician")}</span>
              <span aria-hidden className="text-ash">
                ·
              </span>
              <span data-no-translate>{biz.area}</span>
            </p>
            <h1 id="hero-title" className="t-display t-xl mt-3 md:mt-5">
              {biz.tagline ? (
                <span className="anim-rise block" data-no-translate>
                  {biz.tagline}
                </span>
              ) : (
                <>
                  <span className="anim-rise block" style={{ "--d": "0.15s" } as CSSProperties}>
                    {t("The electrician")}
                  </span>
                  <span className="hero-title-2 block" style={{ "--d": "0.28s" } as CSSProperties}>
                    {t("who shows up when promised.")}
                  </span>
                </>
              )}
            </h1>
            <p className="t-lead anim-fade mt-3 max-w-[34rem] text-[0.98rem] md:mt-6 md:text-[1.15rem]" style={{ "--d": "0.5s" } as CSSProperties}>
              {t("Faults, rewiring, panels, lighting and EV chargers across {area}. Callouts 24/7, and the price before we start.", { area: biz.area })}
            </p>
            <div className="anim-fade mt-4 grid gap-2 sm:flex sm:flex-wrap sm:gap-3 md:mt-8" style={{ "--d": "0.6s" } as CSSProperties}>
              {biz.phone && (
                <a href={telOf(biz)} className="btn btn-spark" data-no-translate>
                  <PhoneIcon />
                  <span className="tabular-nums">{biz.phoneDisplay}</span>
                </a>
              )}
              {/* Very short phones drop this one: the call bar right below has the same button */}
              <a href="#kontakt" className={biz.phone ? "btn btn-ghost max-[899px]:[@media(max-height:600px)]:hidden" : "btn btn-spark"}>
                {t("Get a free quote")}
              </a>
            </div>
            {/* Phones always show the rating on the first screen; short ones drop the open badge */}
            <div className="anim-fade mt-5 hidden flex-wrap items-center gap-x-8 gap-y-2 text-sm max-[899px]:flex min-[900px]:mt-6 [@media(min-height:740px)]:flex" style={{ "--d": "0.8s" } as CSSProperties}>
              {biz.rating && (
                <p className="flex items-center gap-2">
                  <span className="text-spark" aria-hidden>
                    ★★★★★
                  </span>
                  <span>
                    <strong className="font-semibold">{num(biz, biz.rating.value)}</strong> <span className="quiet">· {t("{count} Google reviews", { count: biz.rating.count })}</span>
                  </span>
                </p>
              )}
              <OpenBadge className="quiet max-[899px]:[@media(max-height:739px)]:hidden" always={t("Emergency callouts 24/7")} />
            </div>
          </div>
        </div>

        {/* The real main switch of the 3D board, for anyone not hunting for it with a mouse */}
        {mode !== "dim" && power !== null && (
          <button
            type="button"
            onClick={() => (mode === "live" ? scene.current?.toggle() : setPower(!power))}
            aria-pressed={power}
            aria-label={power ? t("Main switch: on") : t("Main switch: off")}
            className="anim-fade absolute right-[var(--gutter)] top-[calc(var(--header-h)+0.5rem)] flex h-11 min-w-11 items-center justify-center gap-2.5 rounded-full border border-white/15 bg-night/50 text-xs text-bone backdrop-blur-md transition-colors hover:border-white/40 min-[900px]:bottom-8 min-[900px]:top-auto min-[900px]:justify-start min-[900px]:py-1 min-[900px]:pl-1.5 min-[900px]:pr-3.5"
          >
            <span className="breaker" data-on={power} style={{ "--w": "1.25rem", "--h": "1.95rem" } as CSSProperties} aria-hidden>
              <i />
            </span>
            <span aria-hidden className="hidden min-[900px]:inline">{power ? t("Main switch: on") : t("Main switch: off")}</span>
          </button>
        )}

        <div ref={fade} className="hero-fade" aria-hidden />
      </div>
    </section>
  );
}

export function Arrow({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
