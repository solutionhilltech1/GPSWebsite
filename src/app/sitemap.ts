import type { MetadataRoute } from "next";
import { projects, site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/projects", "/services", "/gallery", "/about", "/contact", ...projects.map((p) => `/projects/${p.slug}`)].map(
    (path) => ({ url: site.url + path }),
  );
}
