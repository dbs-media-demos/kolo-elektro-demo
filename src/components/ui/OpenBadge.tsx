"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { openStatus } from "@/lib/biz-core";
import { useBiz } from "@/components/preview/BizContext";

/**
 * Live "Open now · until 7 pm" badge in the studio's time zone. Shows the weekly summary until mounted.
 * A business that takes calls around the clock passes `always`, shown instead of ever saying "Closed".
 */
export function OpenBadge({ className, always }: { className?: string; always?: string }) {
  const biz = useBiz();
  const [state, setState] = useState<{ open: boolean; label: string } | null>(null);
  useEffect(() => {
    const tick = () => {
      const s = openStatus(biz);
      setState(s ? (s.open || !always ? { open: s.open, label: s.text } : { open: true, label: always }) : null);
    };
    // Timezone maths is slow on a phone, so the first check waits until the page is idle
    const idle = "requestIdleCallback" in window;
    const first = idle ? window.requestIdleCallback(tick, { timeout: 2000 }) : window.setTimeout(tick, 300);
    const id = window.setInterval(tick, 60_000);
    return () => {
      if (idle) window.cancelIdleCallback(first);
      else window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [biz, always]);
  if (!biz.hours) return null;
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      <span aria-hidden className={clsx("pulse-dot h-2 w-2 shrink-0 rounded-full", state?.open ? "bg-spark text-spark" : "bg-ash text-ash", !state && "opacity-0")} />
      <span>{state ? state.label : biz.hoursSummary}</span>
    </span>
  );
}
