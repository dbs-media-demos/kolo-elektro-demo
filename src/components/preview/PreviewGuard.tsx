"use client";

import { useEffect, useState } from "react";
import { useBiz } from "./BizContext";

/**
 * A preview is the homepage only. Links to the concept site's other pages stay put and say
 * "that page comes with the full site" instead of leaving the business's preview.
 */
export function PreviewGuard() {
  const biz = useBiz();
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.lang = biz.lang === "sr" ? "sr-Latn" : "en";
  }, [biz.lang]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname.startsWith("/for/")) return;
      // In-page anchors (#faq) still scroll
      if (url.pathname === window.location.pathname && url.hash) return;
      // Capture phase: runs before Next's <Link>, so the navigation never starts
      e.preventDefault();
      e.stopPropagation();
      if (url.pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setNote(biz.lang === "sr" ? "Ta stranica dolazi uz kompletan sajt." : `That page comes with the full ${biz.shortName} site.`);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [biz.shortName, biz.lang]);

  useEffect(() => {
    if (!note) return;
    const id = window.setTimeout(() => setNote(null), 3200);
    return () => window.clearTimeout(id);
  }, [note]);

  if (!note) return null;
  return (
    <div
      role="status"
      style={{
        position: "fixed",
        left: "50%",
        bottom: "6rem",
        transform: "translateX(-50%)",
        zIndex: 200,
        maxWidth: "calc(100vw - 2rem)",
        padding: "0.75rem 1.25rem",
        borderRadius: 9999,
        background: "rgba(17,17,17,0.92)",
        color: "#fff",
        fontSize: "0.875rem",
        textAlign: "center",
        boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
      }}
    >
      {note}
    </div>
  );
}
