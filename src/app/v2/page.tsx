import type { Metadata } from "next";
import { BizProvider } from "@/components/preview/BizContext";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { HomeContent } from "@/components/home/HomeContent";
import { JsonLd } from "@/components/ui/JsonLd";
import { defaultBiz } from "@/lib/biz";
import { businessSchema } from "@/lib/schema";
import { metadata as home } from "../page";

// The homepage without the 3D board, for a slow laptop or a lead who doesn't want it. Search engines get `/`.
export const metadata: Metadata = {
  ...home,
  alternates: { canonical: "/" },
  openGraph: { ...home.openGraph, url: "/v2" },
  robots: { index: false, follow: true },
};

export default function HomeV2() {
  return (
    <BizProvider biz={defaultBiz}>
      <SiteChrome>
        <HomeContent hero="v2" />
      </SiteChrome>
      <JsonLd data={businessSchema(defaultBiz)} />
    </BizProvider>
  );
}
