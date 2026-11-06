"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { openStatus } from "@/lib/biz-core";
import { useBiz } from "@/components/preview/BizContext";

/** Live "Open now · until 7 pm" badge in the studio's time zone. Shows the weekly summary until mounted. */
export function OpenBadge({ className }: { className?: string }) {
  const biz = useBiz();
  const [state, setState] = useState<{ open: boolean; label: string } | null>(null);
  useEffect(() => {
    const tick = () => {
      const s = openStatus(biz);
      setState(s ? { open: s.open, label: s.text } : null);
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [biz]);
  if (!biz.hours) return null;
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      <span aria-hidden className={clsx("pulse-dot h-2 w-2 shrink-0 rounded-full", state?.open ? "bg-spark text-spark" : "bg-ash text-ash", !state && "opacity-0")} />
      <span>{state ? state.label : biz.hoursSummary}</span>
    </span>
  );
}
