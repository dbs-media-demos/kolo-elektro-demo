"use client";

import { useEffect, useRef } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { useBiz } from "@/components/preview/BizContext";
import { telOf } from "@/lib/biz-core";
import { prefersReducedMotion } from "@/lib/motion";
import { useT } from "@/lib/i18n";
import { agencyName, agencyUrl, site } from "@/lib/site";
import { NAV } from "./nav";

export function Footer() {
  const biz = useBiz();
  const t = useT();
  const year = new Date().getFullYear();
  return (
    <footer className="sec-night relative overflow-hidden border-t border-white/10 px-[var(--gutter)] pb-28 pt-20 md:pb-10">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="flex items-center gap-3" data-no-translate>
            <LogoMark className="h-10 w-10" />
            <span className="font-display text-2xl font-medium tracking-tight">{biz.name}</span>
          </p>
          <p className="quiet mt-5 max-w-sm">{t("Faults, rewiring, panels and lighting. We say when, we say how much, and then we do exactly that.")}</p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3 md:col-span-7">
          <div>
            <p className="t-label quiet">{t("Where")}</p>
            {biz.address.full && (
              <address className="mt-4 not-italic leading-relaxed" data-no-translate>
                {biz.address.full}
              </address>
            )}
            {biz.hoursSummary && (
              <p className="quiet mt-2" data-no-translate>
                {biz.hoursSummary}
              </p>
            )}
          </div>
          <div>
            <p className="t-label quiet">{t("Contact")}</p>
            <ul className="mt-4 space-y-2" data-no-translate>
              {biz.phone && (
                <li>
                  <a href={telOf(biz)} className="hover:text-spark">
                    {biz.phoneDisplay}
                  </a>
                </li>
              )}
              {!biz.preview && (
                <li>
                  {/* A narrow column breaks the address after the @, never inside a word */}
                  <a href={`mailto:${site.email}`} className="break-words hover:text-spark">
                    {site.email.split("@")[0]}@<wbr />
                    {site.email.split("@")[1]}
                  </a>
                </li>
              )}
            </ul>
          </div>
          <div>
            <p className="t-label quiet">{t("On this page")}</p>
            <ul className="mt-4 space-y-2">
              {NAV.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="hover:text-spark">
                    {t(n.label)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Wordmark name={biz.shortName} />

      <div className="rule mt-8 flex flex-col gap-3 border-t pt-6 text-xs sm:flex-row sm:justify-between">
        <p className="quiet" data-no-translate>
          © {year} {biz.name}
        </p>
        <p className="quiet">
          {t("Design & development:")}{" "}
          <a href={agencyUrl} className="text-bone hover:text-spark" data-no-translate>
            {agencyName}
          </a>
        </p>
      </div>
    </footer>
  );
}

/** The name, huge and unlit, in outline. A warm lamp follows the pointer (and drifts on its own on phones). */
function Wordmark({ name }: { name: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      // Any business name, short or long, runs the full width on one line
      el.style.fontSize = "";
      const parent = el.parentElement!.clientWidth;
      el.style.fontSize = `${Math.min((parseFloat(getComputedStyle(el).fontSize) * parent) / el.scrollWidth, window.innerWidth * 0.42)}px`;
    };
    // Fits on the observer's first report, after layout, and again whenever the width changes
    const ro = new ResizeObserver(fit);
    ro.observe(el.parentElement!);
    document.fonts?.ready.then(fit);
    if (prefersReducedMotion()) return () => ro.disconnect();

    const hover = window.matchMedia("(hover: hover)").matches;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--x", `${e.clientX - r.left}px`);
      el.style.setProperty("--y", `${e.clientY - r.top}px`);
    };
    if (hover) el.parentElement!.addEventListener("pointermove", onMove);
    else {
      let on = false;
      const io = new IntersectionObserver(([e]) => {
        on = e.isIntersecting;
        if (on) raf = requestAnimationFrame(drift);
      });
      const drift = (t: number) => {
        el.style.setProperty("--x", `${50 + Math.sin(t / 2400) * 42}%`);
        el.style.setProperty("--y", `${45 + Math.sin(t / 1700) * 20}%`);
        if (on) raf = requestAnimationFrame(drift);
      };
      io.observe(el);
      return () => {
        io.disconnect();
        cancelAnimationFrame(raf);
        ro.disconnect();
      };
    }
    return () => {
      el.parentElement?.removeEventListener("pointermove", onMove);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="mt-16 overflow-hidden">
      <p ref={ref} aria-hidden className="wordmark w-max pb-[0.06em] pr-[0.06em]" data-no-translate>
        {name}
      </p>
    </div>
  );
}
