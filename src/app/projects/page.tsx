import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import JsonLd from "@/components/JsonLd";
import { site } from "@/data/site";
import { breadcrumbs, pageMeta } from "@/lib/seo";
import { categories, getProjects } from "@/lib/projects";
import styles from "./projects.module.css";

export const metadata: Metadata = pageMeta({
  title: "Our Projects: Commercial, Healthcare & Religious Construction",
  description: `Browse commercial, healthcare and religious projects engineered and delivered by ${site.fullName} in Uttar Pradesh.`,
  path: "/projects",
  image: "/opengraph-image.png",
});

export default async function ProjectsPage() {
  const projects = await getProjects();
  // Only categories that have projects get a filter chip.
  const usedCategories = categories.filter((c) => projects.some((p) => p.category === c));
  return (
    <>
      <JsonLd
        data={{
          "@graph": [
            breadcrumbs([{ name: "Projects", path: "/projects" }]),
            {
              "@type": "ItemList",
              name: `Projects by ${site.fullName}`,
              itemListElement: projects.map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: p.name,
                url: `${site.url}/projects/${p.slug}`,
              })),
            },
          ],
        }}
      />
      <section className="pageHero">
        <div className="media" data-speed="0.3">
          <Image src={site.images.dusk} alt="Building skyline at dusk" fill priority sizes="100vw" />
        </div>
        <div className="container">
          <span className="eyebrow">Our portfolio</span>
          <h1 className="display h1">Projects</h1>
          <p className="lead">
            Offices, hospitals and places of worship, each one engineered and delivered by our own teams.
          </p>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.wrap}`}>
          {/* Pure CSS filter: the checked radio hides non-matching cards via :has() */}
          <fieldset className={styles.filters}>
            <legend>Filter by category</legend>
            {["All", ...usedCategories].map((c) => (
              <label key={c}>
                <input type="radio" name="filter" value={c} defaultChecked={c === "All"} />
                <span>{c}</span>
              </label>
            ))}
          </fieldset>

          <div className={styles.grid}>
            {projects.map((p) => (
              <Link key={p.slug} href={`/projects/${p.slug}`} className={styles.card} data-cat={p.category}>
                <ViewTransition name={`project-${p.slug}`} share="morph" default="none">
                  <div className={`${styles.image} frame`}>
                    <Image src={p.image} alt={p.name} fill sizes="(max-width: 760px) 100vw, 50vw" />
                    <span className={styles.status}>{p.status}</span>
                  </div>
                </ViewTransition>
                <div className={styles.meta}>
                  <div>
                    <span>{p.category}</span>
                    <h2 className="display h3">{p.name}</h2>
                    <p>{p.location}</p>
                  </div>
                  <span className={styles.arrow}>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
