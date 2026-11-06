"use client";

import { useRef, type CSSProperties } from "react";
import { useBiz } from "@/components/preview/BizContext";
import { Reveal } from "@/components/ui/Reveal";
import { useArrive } from "@/components/ui/useArrive";
import { readings } from "@/content/offer";
import { marketOf } from "@/lib/biz";
import { useT } from "@/lib/i18n";

/**
 * The thing nobody else hands over: a signed test report. The sheet fills in reading by reading as
 * it arrives, every value gets its tick, and the stamp comes down last.
 */
export function Report() {
  const biz = useBiz();
  const t = useT();
  const sheet = useRef<HTMLDivElement>(null);
  useArrive(sheet, "report-wait", undefined, "0px 0px -28% 0px");

  return (
    <section aria-labelledby="report-title" className="sec-bone relative overflow-hidden px-[var(--gutter)] py-24 md:py-36">
      <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <p className="fuse">
            <b>F7</b> {t("Proof")}
          </p>
          <h2 id="report-title" className="t-display t-lg mt-5">
            {t("Measured,")} <span className="quiet">{t("not guessed.")}</span>
          </h2>
          <p className="t-lead mt-6 max-w-md">{t("Before we leave, every circuit goes through a calibrated tester. You get the numbers on paper, signed, for your insurer, your buyer or your own peace of mind.")}</p>
          <ul className="mt-8 space-y-3 text-[1.02rem]">
            {[t("Licensed electricians, no subcontractors"), t("Three years of guarantee on the work"), t("A test report with every job")].map((x) => (
              <li key={x} className="flex items-baseline gap-3">
                <span aria-hidden className="h-2 w-2 shrink-0 translate-y-[-1px] rounded-full bg-spark shadow-[0_0_8px_rgba(255,178,36,0.9)]" />
                {x}
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="relative mx-auto w-full max-w-[34rem] lg:col-span-6 lg:col-start-7">
          <div aria-hidden className="sheet-under rotate-[2.6deg] rounded-sm" />
          <div ref={sheet} className="sheet relative -rotate-[1.2deg] rounded-sm p-6 sm:p-9">
            <div className="flex items-start justify-between gap-4 border-b border-black/15 pb-4">
              <div className="min-w-0">
                <p className="t-label text-[0.62rem] text-black/55">{t("Test report")}</p>
                <p className="mt-1 truncate font-display text-lg font-medium" data-no-translate>
                  {biz.name}
                </p>
              </div>
              <p className="shrink-0 font-mono text-[0.68rem] text-black/55" data-no-translate>
                № 2026/0418
              </p>
            </div>

            <ul className="mt-2">
              {readings[biz.lang].map((r, i) => (
                <li key={r.name} className="reading grid grid-cols-[1fr_auto_1.25rem] items-center gap-x-3 border-b border-dashed border-black/15 py-3" style={{ "--i": i } as CSSProperties}>
                  <span className="min-w-0">
                    <span className="block text-[0.92rem] leading-tight sm:text-base">{r.name}</span>
                    <span className="mt-0.5 block font-mono text-[0.66rem] text-black/50">{r.limit}</span>
                  </span>
                  <span className="t-hand whitespace-nowrap text-2xl leading-none text-[#1c2a55]">{r.value}</span>
                  <svg viewBox="0 0 20 20" className="h-5 w-5 text-[#1c2a55]" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
                    <path d="M3 11l5 5L17 4" pathLength={1} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </li>
              ))}
            </ul>

            <div className="relative mt-5 flex items-end justify-between gap-4">
              <div>
                <p className="t-hand text-3xl leading-none text-[#1c2a55]" data-no-translate>
                  M. Kolarov
                </p>
                <p className="t-label mt-1.5 border-t border-black/25 pt-1.5 text-[0.58rem] text-black/55">{t("Signed")}</p>
              </div>
              <div className="stamp absolute -top-3 right-0 flex h-24 w-24 flex-col items-center justify-center rounded-full border-[3px] border-[#b4361c] text-center text-[#b4361c] sm:right-2">
                <span className="t-label text-[0.72rem] leading-tight">{t("Passed")}</span>
                <span className="mt-0.5 font-mono text-[0.56rem]">{marketOf(biz) === "us" ? "120 V" : "230 V"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
