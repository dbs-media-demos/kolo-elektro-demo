"use client";

import { useRef, type CSSProperties } from "react";
import { useBiz } from "@/components/preview/BizContext";
import { Reveal } from "@/components/ui/Reveal";
import { useArrive } from "@/components/ui/useArrive";
import { reviews } from "@/content/offer";
import { num } from "@/lib/biz-core";
import { useT } from "@/lib/i18n";

const STRING = "M0 6 Q 200 92 400 34 Q 600 -24 800 34 Q 1000 92 1200 6";
/** Height of the string at x, so every bulb hangs exactly on it. */
const Q = (a: number, c: number, b: number, t: number) => (1 - t) * (1 - t) * a + 2 * t * (1 - t) * c + t * t * b;
const stringY = (x: number) => (x < 400 ? Q(6, 92, 34, x / 400) : x < 800 ? Q(34, -24, 34, (x - 400) / 400) : Q(34, 92, 6, (x - 800) / 400));
const BULBS: [number, number][] = Array.from({ length: 10 }, (_, i) => {
  const x = 60 + i * 120;
  return [x, stringY(x)];
});

/** Reviews under a festoon string: the bulbs catch one by one, and each review sits in its pool of light. */
export function Reviews() {
  const biz = useBiz();
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  useArrive(ref, "fest-wait", undefined, "0px 0px -25% 0px");

  return (
    <section id="utisci" aria-labelledby="reviews-title" className="sec-night relative overflow-hidden pb-24 pt-20 md:pb-36 md:pt-28">
      <div ref={ref}>
        <svg viewBox="0 0 1200 110" preserveAspectRatio="xMidYMin slice" className="block h-[4.5rem] w-full md:h-auto" aria-hidden>
          <defs>
            <radialGradient id="bulbGlow">
              <stop offset="0" stopColor="#ffcf7d" stopOpacity="0.85" />
              <stop offset="0.4" stopColor="#ffb224" stopOpacity="0.24" />
              <stop offset="1" stopColor="#ffb224" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d={STRING} fill="none" stroke="#3a3b36" strokeWidth="2" />
          {BULBS.map(([x, y], i) => (
            <g key={x} transform={`translate(${x} ${y})`} style={{ "--dly": `${0.12 * i}s` } as CSSProperties}>
              <g className="sway" style={{ "--sw": `${-i * 0.7}s` } as CSSProperties}>
                <circle className="bulb-glow" cy="20" r="42" fill="url(#bulbGlow)" />
                <rect x="-3" y="0" width="6" height="8" rx="1" fill="#1a1b19" stroke="#3a3b36" />
                <circle className="bulb-core" cy="17" r="9" stroke="rgba(255,255,255,0.14)" />
              </g>
            </g>
          ))}
        </svg>

        <div className="px-[var(--gutter)]">
          <Reveal className="mt-8 grid items-end gap-6 md:mt-10 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="fuse">
                <b>F8</b> {t("Reviews")}
              </p>
              <h2 id="reviews-title" className="t-display t-lg mt-5">
                {t("Word gets around")} <span className="quiet">{t("the building.")}</span>
              </h2>
            </div>
            {biz.rating && (
              <div className="flex items-baseline gap-4 md:col-span-5 md:justify-end">
                <span className="font-display text-6xl font-medium tracking-tight md:text-7xl">{num(biz, biz.rating.value)}</span>
                <span className="quiet text-sm leading-snug">
                  <span className="text-spark" aria-hidden>
                    ★★★★★
                  </span>
                  <br />
                  {t("{count} Google reviews", { count: biz.rating.count })}
                </span>
              </div>
            )}
          </Reveal>

          <ul className="mt-12 grid gap-px md:mt-16 md:grid-cols-3 md:gap-8">
            {reviews[biz.lang].map((r, i) => (
              <li key={r.who} className="relative py-7 md:py-8" style={{ "--dly": `${0.4 + i * 0.3}s` } as CSSProperties}>
                <span aria-hidden className="review-glow pointer-events-none absolute inset-0" />
                <span aria-hidden className="rule absolute inset-x-0 top-0 border-t" />
                <blockquote className="relative">
                  <p className="text-[1.08rem] leading-relaxed md:text-[1.14rem]">“{r.text}”</p>
                  <footer className="mt-5 flex flex-wrap items-baseline gap-x-3 text-sm">
                    <cite className="font-semibold not-italic">{r.who}</cite>
                    <span className="quiet">{r.job}</span>
                  </footer>
                </blockquote>
              </li>
            ))}
          </ul>
          <p className="t-label quiet mt-6 text-[0.62rem]">{t("Sample reviews for this concept")}</p>
        </div>
      </div>
    </section>
  );
}
