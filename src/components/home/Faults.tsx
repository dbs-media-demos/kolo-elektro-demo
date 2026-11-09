"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useBiz } from "@/components/preview/BizContext";
import { PhoneIcon } from "@/components/layout/MobileBar";
import { faults, type WaveShape } from "@/content/offer";
import { marketOf } from "@/lib/biz";
import { telOf } from "@/lib/biz-core";
import { prefersReducedMotion } from "@/lib/gsap";
import { useT } from "@/lib/i18n";

/**
 * "What's your home doing?" Pick a symptom and a live oscilloscope trace across the section takes
 * that shape: flickering sags, sparking spikes, a dead line goes flat. The reading tells you how
 * urgent it is, what you can safely do yourself and what we'd do.
 */
export function Faults() {
  const biz = useBiz();
  const t = useT();
  const list = faults[biz.lang];
  const market = marketOf(biz);
  const nominal = market === "us" ? 120 : 230;
  const [i, setI] = useState(1);
  const f = list[i];

  const URGENCY = {
    now: { label: t("Call now"), cls: "bg-[#e5532d] text-white" },
    today: { label: t("Today"), cls: "bg-spark text-[#17120a]" },
    soon: { label: t("No rush"), cls: "bg-white/10 text-bone" },
  } as const;

  return (
    <section id="kvar" aria-labelledby="faults-title" className="sec-night relative overflow-hidden py-24 md:py-36">
      <div className="px-[var(--gutter)]">
        <p className="fuse">
          <b>F3</b> {t("Faults")}
        </p>
        <h2 id="faults-title" className="t-display t-lg mt-5 max-w-4xl">
          {t("What is your home doing right now?")}
        </h2>
        <div role="group" aria-label={t("Pick a symptom")} className="mt-8 flex flex-wrap gap-2">
          {list.map((x, k) => (
            <button key={x.label} type="button" aria-pressed={k === i} onClick={() => setI(k)} className="chip">
              {x.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-8 md:mt-10">
        <Scope wave={f.wave} />
        <div className="pointer-events-none absolute right-[var(--gutter)] top-3 text-right">
          <p className="seg7 text-3xl text-spark md:text-5xl" aria-live="polite">
            {Math.round(nominal * f.wave.volts)}
            <span className="ml-1 text-lg md:text-2xl">V</span>
          </p>
          <p className="t-label quiet mt-1 text-[0.62rem]">{t("Nominal")} {nominal} V</p>
        </div>
      </div>

      <div key={i} className="swap-in mt-8 grid gap-8 px-[var(--gutter)] md:mt-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <span className={clsx("t-label inline-flex rounded-full px-3 py-1.5 text-[0.66rem]", URGENCY[f.urgency].cls)}>{URGENCY[f.urgency].label}</span>
          <p className="t-sm mt-4 font-display">{f.cause}</p>
        </div>
        <div className="md:col-span-3 md:col-start-6">
          <p className="t-label quiet text-[0.66rem]">{t("What you can do")}</p>
          <p className="mt-3 leading-relaxed">{f.you}</p>
        </div>
        <div className="md:col-span-3">
          <p className="t-label quiet text-[0.66rem]">{t("What we do")}</p>
          <p className="mt-3 leading-relaxed">{f.we}</p>
          {f.from[market] !== "—" && <p className="mt-3 font-mono text-sm text-spark">{f.from[market]}</p>}
        </div>
        {biz.phone && f.urgency !== "soon" && (
          <div className="md:col-span-12">
            <a href={telOf(biz)} className="btn btn-spark" data-no-translate>
              <PhoneIcon />
              <span className="tabular-nums">{biz.phoneDisplay}</span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

/** A full-width trace on a graticule, drawn on canvas. It eases from one shape to the next. */
function Scope({ wave }: { wave: WaveShape }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const target = useRef(wave);
  useEffect(() => {
    target.current = wave;
  }, [wave]);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const reduced = prefersReducedMotion();
    const cur = { ...target.current };
    let w = 0;
    let h = 0;
    let raf = 0;
    let on = false;
    let time = 0;
    let last = 0;
    let seed = 0;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };
    const noise = (x: number) => Math.sin(x * 12.9898 + seed) * 43758.5453 % 1;

    function trace() {
      ctx!.beginPath();
      const cycles = w < 700 ? 3 : 6;
      const mid = h / 2;
      const a = h * 0.34;
      for (let x = 0; x <= w; x += 2) {
        const u = x / w;
        const ph = u * cycles * Math.PI * 2 - time * 3.2;
        // sag: a slow envelope pulling the amplitude down in pulses
        const sag = 1 - cur.dip * Math.pow(Math.max(0, Math.sin(u * 5 - time * 1.4)), 6);
        let y = Math.sin(ph) * a * cur.amp * sag;
        y += noise(x * 0.31 + time) * a * cur.noise;
        // spikes: narrow arcs that jump up on random places
        if (cur.spike > 0.01) {
          const b = Math.sin(u * 37 + time * 2.3) * Math.sin(u * 91 - time * 3.7);
          if (b > 0.82) y += (noise(x + time) > 0 ? 1 : -1) * a * 1.1 * (b - 0.82) * 6 * cur.spike;
        }
        if (x === 0) ctx!.moveTo(x, mid - y);
        else ctx!.lineTo(x, mid - y);
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);
      ctx!.strokeStyle = "rgba(239,237,230,0.07)";
      ctx!.lineWidth = 1;
      const grid = w < 700 ? 48 : 72;
      ctx!.beginPath();
      for (let x = (w % grid) / 2; x < w; x += grid) {
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, h);
      }
      for (let y = ((h / 2) % grid); y < h; y += grid) {
        ctx!.moveTo(0, y);
        ctx!.lineTo(w, y);
      }
      ctx!.stroke();
      ctx!.strokeStyle = "rgba(239,237,230,0.16)";
      ctx!.beginPath();
      ctx!.moveTo(0, h / 2);
      ctx!.lineTo(w, h / 2);
      ctx!.stroke();

      ctx!.lineJoin = "round";
      trace();
      ctx!.strokeStyle = "rgba(255,178,36,0.14)";
      ctx!.lineWidth = 12;
      ctx!.stroke();
      ctx!.strokeStyle = "rgba(255,178,36,0.32)";
      ctx!.lineWidth = 5;
      ctx!.stroke();
      ctx!.strokeStyle = "#ffdd9a";
      ctx!.lineWidth = 1.6;
      ctx!.stroke();
    }

    const frame = (now: number) => {
      if (!on) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      time += dt;
      seed = Math.floor(now / 70);
      const k = Math.min(1, dt * 3.5);
      (Object.keys(cur) as (keyof WaveShape)[]).forEach((key) => {
        cur[key] += (target.current[key] - cur[key]) * k;
      });
      draw();
    };

    // The observer's first report sizes the scope once it is laid out (never a forced layout on load)
    const ro = new ResizeObserver(size);
    ro.observe(cv);
    if (reduced) return () => ro.disconnect();
    const io = new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (on) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(cv);
    return () => {
      on = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={canvas} aria-hidden className="block h-[13rem] w-full border-y border-white/10 md:h-[19rem]" />;
}
