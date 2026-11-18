"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Logo } from "@/components/brand/Logo";
import { useBiz } from "@/components/preview/BizContext";
import { inlineLogo } from "@/lib/logo";
import { telOf } from "@/lib/biz-core";
import { useT } from "@/lib/i18n";
import { NAV } from "./nav";

/**
 * Solid night, so nothing shows through. On a big screen it stays transparent over the 3D board until the
 * page scrolls. Phones get a full-screen menu.
 */
export function Header() {
  const biz = useBiz();
  const t = useT();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // /v2 and /en/v2 (the homepage without 3D) keep to their own version
  const v2 = usePathname()?.endsWith("/v2") ?? false;
  const home = biz.preview ? "#top" : (biz.lang === "en" ? "/en" : "") + (v2 ? "/v2" : "") || "/";

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", esc);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-[70] border-b text-bone transition-[background-color,border-color] duration-500",
        scrolled || open ? "border-white/10 bg-night" : "border-white/10 bg-night lg:border-transparent lg:bg-transparent",
      )}
    >
      <div className="flex h-[var(--header-h)] items-center justify-between gap-4 px-[var(--gutter)]">
        <a href={home} className="relative z-10 min-w-0" aria-label={`${biz.shortName}, ${t("home")}`} data-no-translate>
          {biz.logo ? (
            // Their own logo, in the header's ink (currentColor)
            <span role="img" aria-label={biz.name} className="biz-logo h-9 max-w-[min(16rem,52vw)] max-md:h-8" dangerouslySetInnerHTML={{ __html: inlineLogo(biz.logo.svg) }} />
          ) : (
            <Logo name={biz.shortName} sub={biz.preview ? undefined : "Elektro"} className="block" />
          )}
        </a>

        <nav aria-label={t("Main")} className="hidden lg:block">
          <ul className="flex items-center gap-8 text-sm text-bone/80">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="transition-colors hover:text-spark">
                  {t(n.label)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="relative z-10 flex shrink-0 items-center gap-2 sm:gap-3">
          {!biz.preview && <LangSwitch lang={biz.lang} label={t("Language")} v2={v2} />}
          {biz.phone && (
            <a href={telOf(biz)} className="hidden text-sm font-semibold tabular-nums xl:block" data-no-translate>
              {biz.phoneDisplay}
            </a>
          )}
          <a href="#kontakt" className="btn btn-spark hidden min-h-11 px-5 text-sm sm:inline-flex">
            {t("Get a quote")}
          </a>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="menu"
            aria-label={open ? t("Close menu") : t("Open menu")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 lg:hidden"
          >
            <span aria-hidden className="relative block h-3 w-5">
              <span className={clsx("absolute left-0 h-[1.5px] w-5 bg-bone transition-all duration-500", open ? "top-1.5 rotate-45" : "top-0")} />
              <span className={clsx("absolute left-0 h-[1.5px] w-5 bg-bone transition-all duration-500", open ? "top-1.5 -rotate-45" : "top-3")} />
            </span>
          </button>
        </div>
      </div>

      <div id="menu" hidden={!open} className="fixed inset-x-0 bottom-0 top-[var(--header-h)] overflow-y-auto bg-night px-[var(--gutter)] pb-10 pt-8 lg:hidden">
        <ul className="space-y-1">
          {NAV.map((n, i) => (
            <li key={n.href} className="anim-rise" style={{ "--d": `${0.04 * i}s` } as CSSProperties}>
              <a href={n.href} onClick={() => setOpen(false)} className="t-display block py-2 text-[2.5rem]">
                {t(n.label)}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap gap-3">
          <a href="#kontakt" onClick={() => setOpen(false)} className="btn btn-spark">
            {t("Get a quote")}
          </a>
          {biz.phone && (
            <a href={telOf(biz)} className="btn btn-ghost" data-no-translate>
              {biz.phoneDisplay}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

/** SR | EN: a tiny two-position switch. Kept in the bar on every width so the English is one tap away. */
function LangSwitch({ lang, label, v2 }: { lang: "en" | "sr"; label: string; v2: boolean }) {
  return (
    <div className="t-label flex items-center rounded-full border border-white/20 p-0.5 text-[0.65rem]" role="group" aria-label={label}>
      <Link href={v2 ? "/v2" : "/"} hrefLang="sr" aria-current={lang === "sr" ? "true" : undefined} className={clsx("flex min-h-9 items-center rounded-full px-2.5", lang === "sr" ? "bg-bone text-night" : "text-ash hover:text-bone")}>
        SR
      </Link>
      <Link href={v2 ? "/en/v2" : "/en"} hrefLang="en" aria-current={lang === "en" ? "true" : undefined} className={clsx("flex min-h-9 items-center rounded-full px-2.5", lang === "en" ? "bg-bone text-night" : "text-ash hover:text-bone")}>
        EN
      </Link>
    </div>
  );
}
