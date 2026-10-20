import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { getProjects } from "@/lib/projects";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  return ["", "/projects", "/services", "/gallery", "/about", "/careers", "/contact", ...projects.map((p) => `/projects/${p.slug}`)].map(
    (path) => ({ url: site.url + path }),
  );
}
