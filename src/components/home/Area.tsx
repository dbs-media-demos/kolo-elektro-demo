"use client";

import { useState, type CSSProperties } from "react";
import clsx from "clsx";
import { useBiz } from "@/components/preview/BizContext";
import { PreviewMap } from "@/components/preview/PreviewMap";
import { OpenBadge } from "@/components/ui/OpenBadge";
import { Reveal } from "@/components/ui/Reveal";
import { nodes } from "@/content/offer";
import { DAY_NAMES, dayRange, weekFromMonday } from "@/lib/biz-core";
import { useT } from "@/lib/i18n";
import { Fuse } from "@/components/ui/Fuse";

/**
 * Where we work. On the concept, Novi Sad as a circuit board: the Danube a band across it, the
 * neighbourhoods soldered-on pads, current running out along the traces. A preview shows the real
 * business's address on a Google map instead.
 */
export function Area() {
  const biz = useBiz();
  const t = useT();
  const [active, setActive] = useState(nodes.findIndex((n) => n.name === "Liman"));
  const node = nodes[active];

  return (
    <section id="teren" aria-labelledby="area-title" className="sec-night relative px-[var(--gutter)] py-24 md:py-36">
      <div className="grid gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <Fuse n={10}>{t("Where we work")}</Fuse>
          <h2 id="area-title" className="t-display t-lg mt-5">
            {biz.preview ? t("{area} and around.", { area: biz.area }) : t("All of Novi Sad, both banks.")}
          </h2>

          {!biz.preview && (
            <p key={node.name} className="swap-in mt-8" aria-live="polite">
              <span className="font-mono text-6xl tabular-nums tracking-tight text-spark md:text-7xl">{node.min}</span>
              <span className="ml-2 font-mono text-lg text-spark">min</span>
              <span className="quiet mt-2 block">{t("average arrival in {place}", { place: node.name })}</span>
            </p>
          )}

          {biz.address.full && (
            <address className="mt-8 text-lg not-italic leading-snug" data-no-translate>
              {biz.address.full}
            </address>
          )}
          <OpenBadge className="mt-4 text-sm" always={t("Emergency callouts 24/7")} />
          {biz.hours && (
            <dl className="mt-6 max-w-sm space-y-2 text-sm">
              {weekFromMonday(biz.hours).map((h) => (
                <div key={h.day} className="rule flex justify-between gap-4 border-b pb-2">
                  <dt className="quiet">{DAY_NAMES[biz.lang][h.day]}</dt>
                  <dd className="tabular-nums">{dayRange(h, biz.lang)}</dd>
                </div>
              ))}
            </dl>
          )}
        </Reveal>

        <Reveal className="lg:col-span-8" delay={0.1}>
          <div className={clsx("relative overflow-hidden rounded-2xl border border-white/10 bg-[#101210] shadow-[0_50px_90px_-50px_#000]", biz.preview ? "aspect-[4/3]" : "")}>
            {biz.preview ? (
              <PreviewMap biz={biz} />
            ) : (
              <svg viewBox="0 0 800 620" className="block h-auto w-full" role="group" aria-label={t("Service area map of Novi Sad")}>
                <defs>
                  <pattern id="pcb" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="0.8" fill="rgba(239,237,230,0.07)" />
                  </pattern>
                </defs>
                <rect width="800" height="620" fill="url(#pcb)" />
                {/* the Danube */}
                <path d="M-20 505 C 150 470 260 500 400 480 S 620 470 690 330 S 760 130 840 90" fill="none" stroke="#17324d" strokeWidth="40" strokeLinecap="round" />
                <text x="598" y="500" fill="#4e7ea8" fontFamily="var(--font-jetbrains)" fontSize="13" letterSpacing="4" transform="rotate(-48 598 500)">
                  {t("DANUBE")}
                </text>

                {nodes.map((n) => (
                  <path key={n.name} className="trace" d={n.path} />
                ))}
                {nodes.map((n, i) => (
                  <path key={`l-${n.name}`} className="trace-live" d={n.path} pathLength={1} style={{ "--dly": `${-i * 0.39}s` } as CSSProperties} />
                ))}

                {/* base: the chip all traces come from */}
                <g transform="translate(372 316)">
                  <rect width="56" height="30" rx="3" fill="#20221f" stroke="#ffb224" strokeWidth="1.5" />
                  <text x="28" y="20" textAnchor="middle" fill="#ffb224" fontFamily="var(--font-jetbrains)" fontSize="12" data-no-translate>
                    KOLO
                  </text>
                </g>

                {nodes.map((n, i) => (
                  <g
                    key={n.name}
                    className="node-btn"
                    data-active={i === active}
                    tabIndex={0}
                    role="button"
                    aria-label={`${n.name}: ${n.min} min`}
                    aria-pressed={i === active}
                    onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                    onClick={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActive(i);
                      }
                    }}
                  >
                    <circle cx={n.x} cy={n.y} r="24" fill="transparent" />
                    <circle className="node-dot" cx={n.x} cy={n.y} r="8" fill="#efede6" stroke="#101210" strokeWidth="3" />
                    <text x={n.x} y={n.y - 16} textAnchor={n.x > 700 ? "end" : n.x < 90 ? "start" : "middle"} fill={i === active ? "#ffb224" : "#c9cac2"} fontFamily="var(--font-instrument)" fontSize="17" fontWeight="600">
                      {n.name}
                    </text>
                  </g>
                ))}
              </svg>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
