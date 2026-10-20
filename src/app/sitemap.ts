import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { getProjects } from "@/lib/projects";

// ponytail: no lastModified, since the pages don't carry a reliable change date (a fake "now" teaches Google to ignore it).
const pages: { path: string; priority: number; changeFrequency: "weekly" | "monthly" }[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/services", priority: 0.9, changeFrequency: "monthly" },
  { path: "/projects", priority: 0.9, changeFrequency: "weekly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
  { path: "/careers", priority: 0.6, changeFrequency: "weekly" },
  { path: "/gallery", priority: 0.6, changeFrequency: "weekly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  return [
    ...pages,
    ...projects.map((p) => ({ path: `/projects/${p.slug}`, priority: 0.8, changeFrequency: "monthly" as const })),
  ].map(({ path, ...rest }) => ({ url: site.url + path, ...rest }));
}
