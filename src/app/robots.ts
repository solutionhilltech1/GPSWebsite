import type { MetadataRoute } from "next";
import { site } from "@/data/site";

// /admin is left crawlable on purpose: its noindex tag only works if crawlers can read the page.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
