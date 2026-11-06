import type { Metadata } from "next";
import { BizProvider } from "@/components/preview/BizContext";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { HomeContent } from "@/components/home/HomeContent";
import { JsonLd } from "@/components/ui/JsonLd";
import { defaultBizEn } from "@/lib/biz";
import { businessSchema } from "@/lib/schema";
import { site } from "@/lib/site";

const title = `${site.legalName} | Electrician in Novi Sad: faults, rewiring, consumer units`;
const description = "The electrician who shows up when promised. 24/7 callouts, rewiring, consumer units, lighting and EV chargers in Novi Sad. The price before we start, a test report after.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/en", languages: { "sr-Latn-RS": "/", en: "/en", "x-default": "/" } },
  openGraph: { title, description, url: "/en", locale: "en_US" },
};

/** The same electrician in English. */
export default function HomeEn() {
  return (
    <BizProvider biz={defaultBizEn}>
      <SiteChrome>
        <HomeContent />
      </SiteChrome>
      <JsonLd data={businessSchema(defaultBizEn)} />
    </BizProvider>
  );
}
