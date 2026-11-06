"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { agencyName, agencyUrl } from "@/lib/site";
import { useBiz } from "@/components/preview/BizContext";

const KEY = "kolo-demo-pill-dismissed";

/** Small fixed pill that marks the site as a Scale by Noon concept. Dismissible for the session. */
export function DemoPill() {
  const biz = useBiz();
  const [show, setShow] = useState(false);
  // On phones the pill only shows at the end of the page: over the hero or the plan it would sit on what matters
  const [clear, setClear] = useState(false);
  useEffect(() => {
    const on = () => setClear(window.innerWidth >= 768 || window.scrollY + window.innerHeight > document.documentElement.scrollHeight - 700);
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);
  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(KEY) === "1";
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage is client-only
    if (!dismissed) setShow(true);
  }, []);
  if (!show || !clear) return null;
  const sr = biz.lang === "sr";
  return (
    <div
      className="anim-fade fixed bottom-[5.3rem] left-3 z-[66] flex items-center rounded-full border border-white/20 bg-graphite/90 pl-3.5 text-[0.72rem] text-bone shadow-lg backdrop-blur md:bottom-4 md:left-4 md:pl-4 md:text-[0.78rem]"
      style={{ "--d": "2.5s" } as CSSProperties}
      data-no-translate
    >
      <a href={agencyUrl} className="inline-flex min-h-10 items-center gap-1.5 pr-1 hover:text-spark">
        <span className="inline-block max-w-[15rem] truncate align-bottom sm:max-w-none">
          {biz.preview ? (sr ? `Pregled za ${biz.shortName} · ` : `Preview for ${biz.shortName} · by `) : sr ? "Koncept sajt · " : "Concept site by "}
          <strong className="font-semibold">{agencyName}</strong> <span aria-hidden>↗</span>
        </span>
      </a>
      <button
        type="button"
        onClick={() => {
          setShow(false);
          try {
            sessionStorage.setItem(KEY, "1");
          } catch {}
        }}
        aria-label={sr ? "Zatvori obaveštenje" : "Dismiss concept site notice"}
        className="flex h-10 w-10 items-center justify-center rounded-full text-bone/70 hover:text-bone"
      >
        <span aria-hidden className="text-base leading-none">
          ×
        </span>
      </button>
    </div>
  );
}
