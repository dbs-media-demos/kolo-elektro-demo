"use client";

import { useEffect, type ReactNode } from "react";
import { useBiz } from "@/components/preview/BizContext";
import { useT } from "@/lib/i18n";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileBar } from "./MobileBar";
import { DemoPill } from "./DemoPill";

/** Header, the page, footer, the phone bar and the demo pill, in the business's language. */
export function SiteChrome({ children }: { children: ReactNode }) {
  const biz = useBiz();
  const t = useT();
  useEffect(() => {
    document.documentElement.lang = biz.lang === "sr" ? "sr-Latn" : "en";
  }, [biz.lang]);
  return (
    <>
      <a href="#main" className="btn btn-spark fixed left-3 top-3 z-[300] -translate-y-24 focus:translate-y-0">
        {t("Skip to content")}
      </a>
      <Header />
      <main id="main" data-lang={biz.lang} data-preview={biz.preview || undefined}>
        {children}
      </main>
      <Footer />
      <MobileBar />
      <DemoPill />
    </>
  );
}
