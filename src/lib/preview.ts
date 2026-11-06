import { cache } from "react";
import { bizFromCrm, type Biz } from "./biz-core";
import { defaultBiz } from "./biz";

/** The Scale by Noon CRM API, which knows the business behind a preview token. */
const CRM_API = (process.env.CRM_API_URL ?? "https://dbs-media-crm.vercel.app/api").replace(/\/$/, "");

/**
 * The business for /for/<token>, or null when the token is unknown or removed. Fetched fresh on
 * every request (an edit in the CRM shows on reload); layout and page share it via cache().
 */
export const previewBiz = cache(async (token: string): Promise<Biz | null> => {
  if (!/^[a-z0-9-]{12,80}$/i.test(token)) return null;
  try {
    const res = await fetch(`${CRM_API}/demos/public/${encodeURIComponent(token)}`, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return bizFromCrm(await res.json(), defaultBiz.timezone);
  } catch {
    return null;
  }
});
