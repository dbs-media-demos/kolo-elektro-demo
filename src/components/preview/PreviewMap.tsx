"use client";

import type { Biz } from "@/lib/biz-core";
import { useT } from "@/lib/i18n";

/** A preview's map: the real business's address on a Google map (the concept site draws its own). */
export function PreviewMap({ biz }: { biz: Biz }) {
  const t = useT();
  const query = [biz.name, biz.address.full].filter(Boolean).join(", ");
  return (
    <iframe
      src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`}
      title={t("Map: {place}", { place: query })}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className="absolute inset-0 h-full w-full border-0 [filter:invert(0.92)_hue-rotate(180deg)_saturate(0.35)_contrast(0.9)]"
    />
  );
}

export const directionsUrl = (biz: Biz) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent([biz.name, biz.address.full].filter(Boolean).join(", "))}`;
