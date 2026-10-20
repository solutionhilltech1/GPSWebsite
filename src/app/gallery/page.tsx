import type { Metadata } from "next";
import Image from "next/image";
import JsonLd from "@/components/JsonLd";
import { site } from "@/data/site";
import { breadcrumbs, pageMeta } from "@/lib/seo";
import GalleryClient from "./GalleryClient";

export const metadata: Metadata = pageMeta({
  title: "Project Gallery: Construction Progress Photos",
  description: `Photographs of construction progress and completed projects by ${site.fullName}, from site engineering to finished buildings.`,
  path: "/gallery",
  image: "/opengraph-image.png",
});

export default function GalleryPage() {
  return (
    <>
      <JsonLd data={breadcrumbs([{ name: "Gallery", path: "/gallery" }])} />
      <section className="pageHero">
        <div className="media" data-speed="0.3">
          <Image src={site.images.cranes} alt="Tower cranes on a construction site" fill priority sizes="100vw" />
        </div>
        <div className="container">
          <span className="eyebrow">Visual Archive</span>
          <h1 className="display h1">Project Gallery</h1>
          <p className="lead">
            Live photographic documentation of site engineering, progress, and delivered architecture across our sites.
          </p>
        </div>
      </section>

      <GalleryClient />
    </>
  );
}
