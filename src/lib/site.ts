/**
 * Kolo Elektro: the fictional business behind the concept site, an electrician in Novi Sad.
 * "Strujno kolo" is an electric circuit (and kolo is the Serbian round dance): the brand idea is
 * closing the circuit. Address, phone and email are invented.
 */
export const site = {
  name: "Kolo",
  legalName: "Kolo Elektro",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://kolo-elektro-demo.vercel.app").replace(/\/$/, ""),
  email: "zdravo@koloelektro.com",
  rating: { value: 4.9, count: 268 },
  area: "Novi Sad",
  phone: "+381210000000",
  phoneDisplay: "+381 21 000 0000",
  address: { street: "Strujna 12", city: "Novi Sad", region: "", postal: "21000" },
  timezone: "Europe/Belgrade",
  // 0 = Sunday
  hours: [
    { day: 0, open: null, close: null },
    { day: 1, open: "07:00", close: "20:00" },
    { day: 2, open: "07:00", close: "20:00" },
    { day: 3, open: "07:00", close: "20:00" },
    { day: 4, open: "07:00", close: "20:00" },
    { day: 5, open: "07:00", close: "20:00" },
    { day: 6, open: "08:00", close: "16:00" },
  ],
  hoursSummary: { sr: "Pon–Pet 7–20 · Sub 8–16", en: "Mon–Fri 7–20 · Sat 8–16" },
} as const;

export const agencyName = "Scale by Noon";
export const agencyUrl = "https://www.scalebynoon.com";

/** Demos stay out of search engines unless NEXT_PUBLIC_NOINDEX=false. */
export const noindex = process.env.NEXT_PUBLIC_NOINDEX !== "false";
