"use client";

import { useBiz } from "@/components/preview/BizContext";
import { Reveal } from "@/components/ui/Reveal";
import { faq } from "@/content/offer";
import { useT } from "@/lib/i18n";

/** Every question has its own wall switch: open one and the rocker clicks over and its pilot light comes on. */
export function Faq() {
  const biz = useBiz();
  const t = useT();
  return (
    <section id="pitanja" aria-labelledby="faq-title" className="sec-bone relative px-[var(--gutter)] py-24 md:py-36">
      <div className="grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
          <p className="fuse">
            <b>F9</b> {t("Questions")}
          </p>
          <h2 id="faq-title" className="t-display t-lg mt-5">
            {t("What people ask")} <span className="quiet">{t("before they call.")}</span>
          </h2>
        </Reveal>
        <Reveal className="lg:col-span-7 lg:col-start-6">
          <div>
            {faq[biz.lang].map((x, i) => (
              <details key={x.q} className="qa rule border-b first:border-t" open={i === 0}>
                <summary className="flex min-h-[4.5rem] items-center gap-4 py-4">
                  <span className="rocker" aria-hidden />
                  <span className="t-sm flex-1 font-display font-medium">{x.q}</span>
                </summary>
                <p className="qa-answer quiet max-w-2xl pb-6 pl-[3.2rem] leading-relaxed">{x.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
