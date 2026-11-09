"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import clsx from "clsx";
import { useBiz } from "@/components/preview/BizContext";
import { steps } from "@/content/offer";
import { loadGsap, scrollScenes } from "@/lib/motion";
import { useT } from "@/lib/i18n";
import { Fuse } from "@/components/ui/Fuse";

/**
 * How it goes, along one surface-mounted cable run. Three conductors fill with the scroll, a spark
 * rides their tip, and each junction box lights the moment current reaches it. Phones and tablets
 * get the finished run, every box lit.
 */
export function Process() {
  const biz = useBiz();
  const t = useT();
  const list = steps[biz.lang];
  const wrap = useRef<HTMLOListElement>(null);
  const [live, setLive] = useState(list.length);

  useEffect(() => {
    const el = wrap.current;
    if (!el || !scrollScenes()) return;
    let alive = true;
    let st: { kill: () => void } | undefined;
    const items = Array.from(el.querySelectorAll<HTMLElement>(".step"));
    let lastN = -1;
    const paint = (p: number) => {
      el.style.setProperty("--p", p.toFixed(4));
      el.style.setProperty("--tip", p > 0.002 && p < 0.998 ? "1" : "0");
      const at = el.getBoundingClientRect().top + p * el.offsetHeight;
      let n = 0;
      items.forEach((it) => {
        if (it.getBoundingClientRect().top + 17 <= at + 1) n++;
      });
      if (n !== lastN) {
        lastN = n;
        setLive(n);
      }
    };
    void loadGsap().then(({ ScrollTrigger }) => {
      if (!alive) return;
      const t = ScrollTrigger.create({
        trigger: el,
        start: "top 62%",
        end: "bottom 62%",
        scrub: 0.3,
        onUpdate: (s) => paint(s.progress),
        onRefresh: (s) => paint(s.progress),
      });
      paint(t.progress);
      st = t;
    });
    return () => {
      alive = false;
      st?.kill();
    };
  }, []);

  return (
    <section aria-labelledby="process-title" className="sec-night relative px-[var(--gutter)] py-24 md:py-36">
      <Fuse n={5} phone={8}>{t("How it goes")}</Fuse>
      <h2 id="process-title" className="t-display t-lg mt-5 max-w-3xl">
        {t("Five steps,")} <span className="quiet">{t("and no surprises in any of them.")}</span>
      </h2>

      <ol ref={wrap} className="relative mx-auto mt-14 max-w-5xl md:mt-20" style={{ "--p": 1 } as CSSProperties}>
        <div className="run left-[10px] md:left-1/2 md:-ml-[7px]" aria-hidden>
          <span style={{ "--c": "var(--wire-l)" } as CSSProperties} />
          <span style={{ "--c": "var(--wire-n)" } as CSSProperties} />
          <span />
          <i className="run-tip" />
        </div>
        {list.map((s, i) => {
          const right = i % 2 === 0;
          return (
            <li key={s.title} className="step relative grid grid-cols-[34px_1fr] gap-x-5 pb-14 last:pb-0 md:grid-cols-[1fr_34px_1fr] md:gap-x-10 md:pb-24" data-live={live > i}>
              <div className={clsx("step-copy col-start-2 row-start-1 min-w-0", right ? "md:col-start-3" : "md:col-start-1 md:text-right")}>
                <span className="t-label text-[0.62rem] text-spark">{s.tag}</span>
                <h3 className="t-md mt-2 font-display font-medium">{s.title}</h3>
                <p className={clsx("quiet mt-3 max-w-md leading-relaxed", !right && "md:ml-auto")}>{s.line}</p>
              </div>
              <div className="junction relative z-10 col-start-1 row-start-1 md:col-start-2" aria-hidden />
            </li>
          );
        })}
      </ol>
    </section>
  );
}
