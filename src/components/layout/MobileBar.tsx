"use client";

import { useBiz } from "@/components/preview/BizContext";
import { telOf } from "@/lib/biz-core";
import { useT } from "@/lib/i18n";

/** Thumb-reach Call + Quote bar on phones. */
export function MobileBar() {
  const biz = useBiz();
  const t = useT();
  return (
    <div className="fixed inset-x-0 bottom-0 z-[65] grid grid-cols-2 gap-2 border-t border-white/10 bg-night/85 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] text-bone backdrop-blur-xl md:hidden">
      {biz.phone ? (
        <a href={telOf(biz)} className="btn btn-ghost min-h-12 w-full">
          <PhoneIcon />
          {t("Call")}
        </a>
      ) : (
        <a href="#kontakt" className="btn btn-ghost min-h-12 w-full">
          {t("Contact")}
        </a>
      )}
      <a href="#kontakt" className="btn btn-spark min-h-12 w-full">
        {t("Get a quote")}
      </a>
    </div>
  );
}

export function PhoneIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M5 3.5h3.2l1.6 4.3-2 1.4a12 12 0 0 0 7 7l1.4-2 4.3 1.6V19a1.8 1.8 0 0 1-1.9 1.8A16.5 16.5 0 0 1 3.2 5.4 1.8 1.8 0 0 1 5 3.5Z" strokeLinejoin="round" />
    </svg>
  );
}
