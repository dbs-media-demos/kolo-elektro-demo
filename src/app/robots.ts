import type { MetadataRoute } from "next";
import { noindex, site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (noindex) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: "/for/" }, sitemap: `${site.url}/sitemap.xml` };
}
