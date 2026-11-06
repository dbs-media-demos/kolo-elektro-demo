"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { useBiz } from "@/components/preview/BizContext";
import { Reveal } from "@/components/ui/Reveal";
import { estimator, priceList } from "@/content/offer";
import { marketOf } from "@/lib/biz";
import { useT } from "@/lib/i18n";

const DRUMS = 7;

/**
 * Prices, read off the old electricity meter everyone has in the hallway. Slide the floor area and
 * the number drums roll to the estimate while the aluminium disc spins faster. Next to it, the
 * fixed price list.
 */
export function Prices() {
  const biz = useBiz();
  const t = useT();
  const market = marketOf(biz);
  const cfg = estimator[market];
  const [area, setArea] = useState<number>(cfg.start);
  const [kind, setKind] = useState<"rewire" | "new">("rewire");
  const [smart, setSmart] = useState(false);

  const { lo, hi } = useMemo(() => {
    const mult = smart ? 1.15 : 1;
    const round = market === "us" ? 50 : 1000;
    const [a, b] = cfg.rate[kind];
    return { lo: Math.round((area * a * mult) / round) * round, hi: Math.round((area * b * mult) / round) * round };
  }, [area, kind, smart, cfg, market]);

  const digits = String(lo).padStart(DRUMS, "0").slice(-DRUMS).split("");
  const fill = ((area - cfg.min) / (cfg.max - cfg.min)) * 100;
  // A bigger job turns the disc faster: from 5 s down to under a second
  const spin = (5 - (fill / 100) * 4.2).toFixed(2);

  return (
    <section id="cene" aria-labelledby="prices-title" className="sec-bone relative px-[var(--gutter)] py-24 md:py-36">
      <Reveal>
        <p className="fuse">
          <b>F4</b> {t("Prices")}
        </p>
        <h2 id="prices-title" className="t-display t-lg mt-5 max-w-4xl">
          {t("The number on the quote")} <span className="quiet">{t("is the number on the invoice.")}</span>
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-14">
        <Reveal className="lg:col-span-7">
          <div className="meter overflow-hidden p-5 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="t-label text-[0.62rem] text-ash">{t("New wiring, estimate")}</p>
                <p className="mt-1 font-mono text-[0.7rem] text-ash/70" data-no-translate>
                  Nr. 0268 · 50 Hz · {market === "us" ? "120 V" : "230 V"}
                </p>
              </div>
              <span className="t-label rounded border border-white/15 px-2 py-1 text-[0.6rem] text-ash">{cfg.currency}</span>
            </div>

            <div className="mt-6 max-w-full overflow-hidden">
              <div className="drums" role="img" aria-label={t("From {price}", { price: cfg.format(lo) })}>
                {digits.map((d, i) => (
                  <span key={i} className="drum" data-last={i === DRUMS - 1}>
                    <span style={{ transform: `translateY(calc(var(--cell) * ${-Number(d)}))`, transitionDelay: `${(DRUMS - i) * 45}ms` }}>
                      {"0123456789".split("").map((n) => (
                        <b key={n}>{n}</b>
                      ))}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            <p className="mt-5 text-lg font-medium" aria-live="polite">
              {cfg.format(lo)} <span className="text-ash">– {cfg.format(hi)}</span>
            </p>

            {/* The Ferraris disc, seen edge-on through the meter window */}
            <div className="relative mt-6 h-10 overflow-hidden rounded-md bg-black/60 shadow-[inset_0_2px_8px_#000]" aria-hidden>
              <svg viewBox="0 0 600 40" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                <defs>
                  <linearGradient id="disc" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0" stopColor="#5a5b56" />
                    <stop offset="0.5" stopColor="#d9d9d2" />
                    <stop offset="1" stopColor="#5a5b56" />
                  </linearGradient>
                </defs>
                <rect x="0" y="16" width="600" height="8" fill="url(#disc)" />
              </svg>
              <div className="absolute inset-y-[14px] left-0 right-0 overflow-hidden [container-type:inline-size]">
                <span className="meter-mark block h-full w-16 bg-[#a12c18]" style={{ "--spin": `${spin}s` } as CSSProperties} />
              </div>
            </div>

            <label htmlFor="area" className="mt-7 flex items-baseline justify-between text-sm">
              <span className="text-ash">{t("Floor area")}</span>
              <span className="font-mono text-lg tabular-nums">
                {area.toLocaleString(biz.lang === "sr" ? "de-DE" : "en-US")} {cfg.unit}
              </span>
            </label>
            <input
              id="area"
              type="range"
              className="slider mt-1"
              min={cfg.min}
              max={cfg.max}
              step={cfg.step}
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              style={{ "--fill": `${fill}%` } as CSSProperties}
            />

            <div className="mt-4 flex flex-wrap gap-2">
              <div role="radiogroup" aria-label={t("Kind of job")} className="flex flex-wrap gap-2">
                {(["rewire", "new"] as const).map((k) => (
                  <button key={k} type="button" role="radio" aria-checked={kind === k} onClick={() => setKind(k)} className="chip" style={{ "--rule": "rgba(239,237,230,.18)" } as CSSProperties}>
                    {k === "rewire" ? t("Replacing old wiring") : t("New build")}
                  </button>
                ))}
              </div>
              <button type="button" aria-pressed={smart} onClick={() => setSmart((s) => !s)} className="chip" style={{ "--rule": "rgba(239,237,230,.18)" } as CSSProperties}>
                + {t("Smart home")}
              </button>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-ash">{t("Includes materials and labour. A rough guide; after one visit you get a fixed number in writing.")}</p>
            <span className="meter-glass" aria-hidden />
          </div>
        </Reveal>

        <Reveal className="lg:col-span-5" delay={0.1}>
          <h3 className="t-sm font-display font-medium">{t("Fixed prices for the everyday jobs")}</h3>
          <ul className="mt-6">
            {priceList[biz.lang].map((r) => (
              <li key={r.name} className="rule grid grid-cols-[1fr_auto] items-baseline gap-x-4 border-b py-3.5 first:border-t sm:flex sm:gap-x-3">
                <span className="leading-snug">{r.name}</span>
                <span className="leader hidden sm:block" aria-hidden />
                <span className="whitespace-nowrap text-right font-mono text-sm tabular-nums">{r.price[market]}</span>
              </li>
            ))}
          </ul>
          <p className="quiet mt-6 text-sm leading-relaxed">{t("Every price includes tax. You hear the callout fee on the phone, before we set off.")}</p>
        </Reveal>
      </div>
    </section>
  );
}
