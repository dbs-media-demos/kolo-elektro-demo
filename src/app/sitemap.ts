import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { "sr-Latn-RS": site.url, en: `${site.url}/en` };
  return [
    { url: site.url, changeFrequency: "monthly", priority: 1, alternates: { languages } },
    { url: `${site.url}/en`, changeFrequency: "monthly", priority: 0.9, alternates: { languages } },
  ];
}
