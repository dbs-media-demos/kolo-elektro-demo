import type { Metadata } from "next";
import { BizProvider } from "@/components/preview/BizContext";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { HomeContent } from "@/components/home/HomeContent";
import { JsonLd } from "@/components/ui/JsonLd";
import { defaultBiz } from "@/lib/biz";
import { businessSchema } from "@/lib/schema";
import { site } from "@/lib/site";

const title = `${site.legalName} | Električar, Novi Sad: kvarovi, instalacije, table`;
const description = "Električar koji dođe kad kaže. Hitne intervencije 0–24, nove instalacije, razvodne table, rasveta i punjači za automobile u Novom Sadu. Cena pre početka rada, zapisnik posle.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/", languages: { "sr-Latn-RS": "/", en: "/en", "x-default": "/" } },
  openGraph: { title, description, url: "/", locale: "sr_RS" },
};

export default function Home() {
  return (
    <BizProvider biz={defaultBiz}>
      <SiteChrome>
        <HomeContent />
      </SiteChrome>
      <JsonLd data={businessSchema(defaultBiz)} />
    </BizProvider>
  );
}
