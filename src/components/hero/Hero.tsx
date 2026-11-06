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
import { ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { useT } from "@/lib/i18n";
import type { PanelScene } from "./panelScene";

/**
 * The centrepiece: a live 3D distribution board (panelScene.ts). The page paints with the headline
 * and a still of the same board; three.js only loads once the page is idle. As the board comes up
 * the lamp strikes on. Scrolling flies the camera into the board and hands over to the plan.
 * Reduced motion, no WebGL or Save-Data keep a still of the lit board.
 */
export function Hero() {
  const biz = useBiz();
  const t = useT();
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const fade = useRef<HTMLDivElement>(null);
  const scene = useRef<PanelScene | null>(null);
  const [mode, setMode] = useState<"dim" | "live" | "lit">("dim");
  const [power, setPower] = useState<boolean | null>(null);

  useEffect(() => {
    const cv = canvas.current;
    const sec = section.current;
    if (!cv || !sec) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const webgl = (() => {
      try {
        return Boolean(document.createElement("canvas").getContext("webgl2"));
      } catch {
        return false;
      }
    })();
    // scripts/capture-stills.mjs renders the fallback stills from the scene itself
    const still = new URLSearchParams(window.location.search).get("still") as "on" | "off" | null;
    if (!still && (prefersReducedMotion() || conn?.saveData || !webgl)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- capabilities are client-only
      setMode("lit");
      return;
    }

    const lite = window.matchMedia("(hover: none), (pointer: coarse), (max-width: 760px)").matches;
    let alive = true;
    let cleanup = () => {};

    const boot = async () => {
      const { createPanelScene } = await import("./panelScene");
      if (!alive) return;
      const s = createPanelScene(cv, {
        lite,
        still: still ?? undefined,
        onFirstFrame: () => {
          cv.dataset.ready = "true";
          setMode("live");
        },
        onPower: setPower,
      });
      scene.current = s;

      const sizeIt = () => s.resize(sec.querySelector<HTMLElement>("[data-stage]")!.clientWidth, sec.querySelector<HTMLElement>("[data-stage]")!.clientHeight);
      sizeIt();
      const ro = new ResizeObserver(sizeIt);
      ro.observe(sec.querySelector("[data-stage]")!);

      // Off-screen, the scene doesn't draw at all
      const io = new IntersectionObserver(([e]) => (e.isIntersecting ? s.start() : s.stop()));
      io.observe(sec);

      const st = ScrollTrigger.create({
        trigger: sec,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const p = self.progress;
          s.setScroll(p);
          if (copy.current) {
            const a = Math.max(0, 1 - p / 0.42);
            copy.current.style.opacity = String(a);
            copy.current.style.transform = `translateY(${-p * 70}px)`;
            copy.current.style.pointerEvents = a < 0.2 ? "none" : "";
          }
          if (fade.current) fade.current.style.opacity = String(Math.max(0, (p - 0.72) / 0.28));
        },
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

      cleanup = () => {
        ro.disconnect();
        io.disconnect();
        st.kill();
        sec.removeEventListener("pointermove", onMove);
        sec.removeEventListener("click", onClick);
        s.dispose();
        scene.current = null;
      };
    };

    // After the page: first paint and hydration never wait for three.js
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
      if (idle) window.cancelIdleCallback?.(idle);
      cleanup();
    };
  }, []);

  const alt = t("A distribution board with neat rows of breakers on a dark wall, under one warm pendant lamp");
  const common = { alt, sizes: "100vw", quality: 75 };
  const { props: { srcSet: dimW } } = getImageProps({ ...common, src: dimWide });
  const { props: { srcSet: dimT, ...img } } = getImageProps({ ...common, src: dimTall, loading: "eager" });
  const { props: { srcSet: litW } } = getImageProps({ ...common, src: litWide });
  const { props: { srcSet: litT, ...imgLit } } = getImageProps({ ...common, src: litTall });
  const lit = mode === "lit";

  return (
    <section ref={section} id="top" aria-labelledby="hero-title" className="sec-night relative h-[155svh] motion-reduce:h-[100svh] md:h-[170svh]">
      <div data-stage className="sticky top-0 isolate h-[100svh] overflow-hidden">
        <div className="hero-still" aria-hidden={mode === "live"}>
          <picture>
            <source media="(min-width: 900px)" srcSet={lit ? litW : dimW} sizes="100vw" />
            <source media="(max-width: 899px)" srcSet={lit ? litT : dimT} sizes="100vw" />
            {/* eslint-disable-next-line jsx-a11y/alt-text -- alt comes from getImageProps */}
            <img {...(lit ? imgLit : img)} fetchPriority="high" />
          </picture>
        </div>
        <canvas ref={canvas} className="hero-canvas" aria-hidden />
        <div className="hero-scrim" aria-hidden />

        <div ref={copy} className="relative flex h-full flex-col justify-end px-[var(--gutter)] pb-[5.2rem] pt-24 min-[900px]:justify-center min-[900px]:pb-14">
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
              <a href="#kontakt" className={biz.phone ? "btn btn-ghost" : "btn btn-spark"}>
                {t("Get a free quote")}
              </a>
            </div>
            <div className="anim-fade mt-6 hidden flex-wrap items-center gap-x-8 gap-y-2 text-sm [@media(min-height:740px)]:flex" style={{ "--d": "0.8s" } as CSSProperties}>
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
              <OpenBadge className="quiet" />
            </div>
          </div>
        </div>

        {/* The real main switch of the 3D board, for anyone not hunting for it with a mouse */}
        {mode === "live" && power !== null && (
          <button
            type="button"
            onClick={() => scene.current?.toggle()}
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
