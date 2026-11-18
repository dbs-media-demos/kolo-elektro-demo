import type { Metadata } from "next";
import { BizProvider } from "@/components/preview/BizContext";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { HomeContent } from "@/components/home/HomeContent";
import { JsonLd } from "@/components/ui/JsonLd";
import { defaultBizEn } from "@/lib/biz";
import { businessSchema } from "@/lib/schema";
import { metadata as home } from "../page";

// The English homepage without the 3D board. Search engines get `/en`.
export const metadata: Metadata = {
  ...home,
  alternates: { canonical: "/en" },
  openGraph: { ...home.openGraph, url: "/en/v2" },
  robots: { index: false, follow: true },
};

export default function HomeEnV2() {
  return (
    <BizProvider biz={defaultBizEn}>
      <SiteChrome>
        <HomeContent hero="v2" />
      </SiteChrome>
      <JsonLd data={businessSchema(defaultBizEn)} />
    </BizProvider>
  );
}
