"use client";

import { useBiz } from "@/components/preview/BizContext";
import { sr } from "@/i18n/sr";
import type { Biz } from "./biz-core";

export type T = (text: string, vars?: Record<string, string | number>) => string;

/** English fragments a Serbian page asked for but i18n/sr doesn't have yet (dev helper below). */
const misses = new Set<string>();

/**
 * Text in the page's language. The page is written in English and Serbian pages look every
 * string up in i18n/sr (keys are the English text itself), so they render in Serbian on the
 * server: no flash, no hidden page. A missing key falls back to English and is reported by
 * window.__untranslated(). `{name}` placeholders are filled from `vars`.
 */
export function tOf(biz: Pick<Biz, "lang">): T {
  return (text, vars) => {
    let out = text;
    if (biz.lang === "sr") {
      const hit = sr[text];
      if (hit != null) out = hit;
      else if (typeof window !== "undefined") misses.add(text);
    }
    if (vars) out = out.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
    return out;
  };
}

export const useT = () => tOf(useBiz());

/**
 * Dev helper for Serbian pages: run `copy(window.__untranslated())` in the console. Lists the
 * strings that fell back to English plus any visible text or label that still reads as English
 * (common English words), skipping [data-no-translate] (the business's own name and address).
 */
if (typeof window !== "undefined") {
  const ENGLISH = /\b(the|and|your|you|with|our|we|for|from|this|that|are|is|of|book|call|open|closed|before|after|wash|paint)\b/i;
  const ATTRS = ["alt", "title", "aria-label", "placeholder"];
  const norm = (s: string) => s.replace(/\s+/g, " ").trim();
  (window as unknown as { __untranslated: () => string[] }).__untranslated = () => {
    if (!document.documentElement.lang.startsWith("sr")) return ["(not a Serbian page)"];
    const out = new Set<string>(misses);
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    while (w.nextNode()) {
      const n = w.currentNode;
      const el = n.nodeType === Node.TEXT_NODE ? n.parentElement : (n as Element);
      if (!el || el.closest("script,style,noscript,[data-no-translate]")) continue;
      const texts = n.nodeType === Node.TEXT_NODE ? [n.nodeValue ?? ""] : ATTRS.map((a) => (n as Element).getAttribute(a) ?? "");
      for (const raw of texts) {
        const t = norm(raw);
        if (t && ENGLISH.test(t)) out.add(t);
      }
    }
    return [...out];
  };
}
