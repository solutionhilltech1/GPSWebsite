import type { Metadata } from "next";
import Image from "next/image";
import { site } from "@/data/site";
import GalleryClient from "./GalleryClient";

export const metadata: Metadata = {
  title: "Gallery",
  description: `Visual photographic archive of projects and site construction by ${site.fullName}.`,
};

export default function GalleryPage() {
  return (
    <>
      <section className="pageHero">
        <div className="media" data-speed="0.3">
          <Image src={site.images.cranes} alt="" fill priority sizes="100vw" />
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
