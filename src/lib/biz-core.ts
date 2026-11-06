/**
 * Personalised previews (Scale by Noon CRM → /for/<token>): the business a page shows.
 * On the concept site it's the fictional one (defaultBiz in ./biz); on a preview it's a real
 * business from the CRM: name, phone, address, hours and Google rating, nothing else.
 */
export type Lang = "en" | "sr";

/** 0 = Sunday; times "HH:MM" in the business's timezone; null = closed */
export type DayHours = { day: number; open: string | null; close: string | null };

export type Biz = {
  /** Serbian for Serbian businesses (the CRM decides) */
  lang: Lang;
  name: string;
  shortName: string;
  /** Hero headline override from the CRM; null = the demo's own */
  tagline: string | null;
  /** City / neighbourhood used in headlines */
  area: string;
  /** E.164 for tel: links ("" = none) */
  phone: string;
  phoneDisplay: string;
  address: { street: string; city: string; region: string; postal: string; full: string };
  timezone: string;
  /** null = unknown (badges hide) */
  hours: DayHours[] | null;
  hoursSummary: string;
  rating: { value: number; count: number } | null;
  /** A personalised preview: other pages say "comes with the full site" */
  preview: boolean;
};

export const telOf = (biz: Pick<Biz, "phone">) => (biz.phone ? `tel:${biz.phone}` : undefined);

/** "Expertech Automotive" → "EA"; "Torque & Temper" → "T&T" */
export const initialsOf = (name: string) => {
  const words = name
    .split(/\s+/)
    .filter((w) => /^[\p{L}\d]/u.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase());
  return name.includes("&") ? words.join("&") : words.join("");
};

export const openDays = (biz: Pick<Biz, "hours">) => biz.hours?.filter((h) => h.open).length ?? 0;

/** Pick the English or Serbian version of a line written in code (names, numbers inside). */
export const L = (biz: Pick<Biz, "lang">, en: string, sr: string) => (biz.lang === "sr" ? sr : en);

/** 4.9 → "4,9" in Serbian */
export const num = (biz: Pick<Biz, "lang">, n: number) => (biz.lang === "sr" ? String(n).replace(".", ",") : String(n));

export const DAY_NAMES: Record<Lang, string[]> = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  sr: ["Nedelja", "Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"],
};
const SR_ON_DAY = ["u nedelju", "u ponedeljak", "u utorak", "u sredu", "u četvrtak", "u petak", "u subotu"];

/** "18:00" → "6 pm" / "7:30 am"; Serbian 24h "18:00" ("23:59" → "24:00") */
export function fmtHM(t: string, lang: Lang) {
  const [h, m] = t.split(":").map(Number);
  if (lang === "sr") return t === "23:59" ? "24:00" : `${h}:${String(m).padStart(2, "0")}`;
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${h12}:${String(m).padStart(2, "0")} ${suffix}` : `${h12} ${suffix}`;
}

/** One day's hours as text: "7:30 am – 7 pm", "Open 24 hours", "Closed" (or the Serbian) */
export function dayRange(h: DayHours, lang: Lang) {
  if (h.open === "00:00" && h.close === "23:59") return lang === "sr" ? "Otvoreno 24 sata" : "Open 24 hours";
  if (!h.open || !h.close) return lang === "sr" ? "Zatvoreno" : "Closed";
  return `${fmtHM(h.open, lang)} – ${fmtHM(h.close, lang)}`;
}

/** Monday-first week, for hour tables */
export const weekFromMonday = (hours: DayHours[]) => (hours.length ? [...hours.slice(1), hours[0]] : []);

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));

function nowIn(timeZone: string, date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  return { day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")), minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

/** Live open/closed line for any week of hours, in the business's timezone and language. */
export function openStatus(biz: Pick<Biz, "hours" | "timezone" | "lang">, date = new Date()): { open: boolean; text: string } | null {
  const hours = biz.hours;
  if (!hours) return null;
  const sr = biz.lang === "sr";
  const f = (t: string) => fmtHM(t, biz.lang);
  const { day, minutes } = nowIn(biz.timezone, date);
  const today = hours[day];
  if (today.open === "00:00" && today.close === "23:59") return { open: true, text: sr ? "Otvoreno 24 sata" : "Open 24 hours" };
  if (today.open && today.close) {
    const o = toMin(today.open);
    const c = toMin(today.close);
    if (minutes >= o && minutes < c) {
      const left = c - minutes;
      if (left <= 60) return { open: true, text: sr ? `Otvoreno · zatvaramo za ${left} min` : `Open · closes in ${left} min` };
      return { open: true, text: sr ? `Otvoreno · radimo do ${f(today.close)}` : `Open now · until ${f(today.close)}` };
    }
    if (minutes < o) return { open: false, text: sr ? `Zatvoreno · otvaramo u ${f(today.open)}` : `Opens today at ${f(today.open)}` };
  }
  for (let i = 1; i <= 7; i++) {
    const next = hours[(day + i) % 7];
    if (!next.open) continue;
    if (sr) return { open: false, text: i === 1 ? `Zatvoreno · otvaramo sutra u ${f(next.open)}` : `Zatvoreno · otvaramo ${SR_ON_DAY[next.day]} u ${f(next.open)}` };
    return { open: false, text: `Closed · opens ${i === 1 ? "tomorrow" : DAY_NAMES.en[next.day]} ${f(next.open)}` };
  }
  return { open: false, text: sr ? "Zatvoreno" : "Closed" };
}

/** What the CRM sends (GET /api/demos/public/<token>) → a preview Biz. */
export function bizFromCrm(b: Record<string, unknown> & { address: Biz["address"] }, fallbackTz: string): Biz {
  const s = (v: unknown) => (typeof v === "string" ? v : "");
  const hours = Array.isArray(b.hours) && b.hours.length === 7 ? (b.hours as DayHours[]) : null;
  return {
    lang: b.lang === "sr" ? "sr" : "en",
    name: s(b.name),
    shortName: s(b.shortName) || s(b.name),
    tagline: s(b.tagline) || null,
    area: s(b.area) || b.address?.city || "",
    phone: s(b.phone),
    phoneDisplay: s(b.phoneDisplay),
    address: b.address,
    timezone: s(b.timezone) || fallbackTz,
    hours,
    hoursSummary: s(b.hoursSummary),
    rating: (b.rating as Biz["rating"]) ?? null,
    preview: true,
  };
}

/** "HH:MM" from minutes after midnight (for demos that store hours as minutes) */
export const hmFromMinutes = (m?: number) => (m == null ? null : `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
