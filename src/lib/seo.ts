import type { Metadata } from "next";
import { site } from "@/data/site";

// A page's own openGraph/twitter replace the layout's wholesale (Next doesn't merge them),
// so every page gets the full set from here. Titles get the "| GPS Projects..." suffix from the layout template.
export function pageMeta({
  title,
  description,
  path,
  image,
}: {
  title?: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  const shareTitle = title ? `${title} | ${site.fullName}` : `${site.fullName} | Construction Company in Etah, Uttar Pradesh`;
  const images = image ? [{ url: image, alt: title ?? site.fullName }] : undefined;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: { title: shareTitle, description, url: path, siteName: site.fullName, type: "website", locale: "en_IN", images },
    twitter: { card: "summary_large_image", title: shareTitle, description, images: image ? [image] : undefined },
  };
}

export const breadcrumbs = (trail: { name: string; path: string }[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: [{ name: "Home", path: "" }, ...trail].map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: t.name,
    item: site.url + t.path,
  })),
});
