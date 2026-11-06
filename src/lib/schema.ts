import type { Biz } from "./biz-core";
import { site } from "./site";

const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Electrician (schema.org) with hours, area and rating. */
export function businessSchema(biz: Biz) {
  const url = biz.lang === "en" ? `${site.url}/en` : site.url;
  return {
    "@context": "https://schema.org",
    "@type": "Electrician",
    "@id": `${url}#business`,
    name: biz.name,
    url,
    telephone: biz.phone,
    email: site.email,
    image: `${site.url}/opengraph-image`,
    priceRange: "RSD",
    address: {
      "@type": "PostalAddress",
      streetAddress: biz.address.street,
      addressLocality: biz.address.city,
      postalCode: biz.address.postal,
      addressCountry: "RS",
    },
    areaServed: biz.area,
    openingHoursSpecification: (biz.hours ?? [])
      .filter((h) => h.open && h.close)
      .map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: `https://schema.org/${DAY[h.day]}`, opens: h.open, closes: h.close })),
    aggregateRating: biz.rating ? { "@type": "AggregateRating", ratingValue: biz.rating.value, reviewCount: biz.rating.count } : undefined,
    makesOffer: ["Emergency electrician", "New wiring", "Consumer unit replacement", "Lighting", "EV charger installation", "Electrical inspection"].map((name) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name },
    })),
  };
}
