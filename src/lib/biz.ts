import { site } from "./site";
import type { Biz, DayHours, Lang } from "./biz-core";

export type { Biz } from "./biz-core";

function conceptBiz(lang: Lang): Biz {
  const a = site.address;
  return {
    lang,
    name: site.legalName,
    shortName: site.name,
    tagline: null,
    area: site.area,
    phone: site.phone,
    phoneDisplay: site.phoneDisplay,
    address: { ...a, full: `${a.street}, ${a.postal} ${a.city}` },
    timezone: site.timezone,
    hours: site.hours.map((h): DayHours => ({ ...h })),
    hoursSummary: site.hoursSummary[lang],
    rating: { ...site.rating },
    preview: false,
  };
}

/** The fictional electrician as a Biz: what the concept site shows (previews swap in a real one). */
export const defaultBiz = conceptBiz("sr");
/** The same business in English, for the English switch (/en). */
export const defaultBizEn = conceptBiz("en");

/**
 * Prices and voltage follow the market, not just the language. The concept site is a Serbian
 * business in both languages (dinars, 230 V); an English preview is a real English-speaking
 * business from the CRM (dollars, 120 V).
 */
export type Market = "rs" | "us";
export const marketOf = (biz: Pick<Biz, "lang" | "preview">): Market => (biz.lang === "en" && biz.preview ? "us" : "rs");
