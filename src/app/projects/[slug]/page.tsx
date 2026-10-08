import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import EnquiryForm from "@/components/EnquiryForm";
import JsonLd from "@/components/JsonLd";
import { getProject, projects, site } from "@/data/site";
import styles from "./project.module.css";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const project = getProject((await params).slug);
  return project
    ? {
        title: project.name,
        description: `${project.tagline}. ${project.location}.`,
        alternates: { canonical: `/projects/${project.slug}` },
      }
    : {};
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const next = projects[(projects.indexOf(project) + 1) % projects.length];

  return (
    <>
      <JsonLd
        data={{
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: site.url },
            { "@type": "ListItem", position: 2, name: "Projects", item: `${site.url}/projects` },
            { "@type": "ListItem", position: 3, name: project.name, item: `${site.url}/projects/${project.slug}` },
          ],
        }}
      />
      <section className={`pageHero ${styles.hero}`}>
        <ViewTransition name={`project-${project.slug}`} share="morph" default="none">
          <div className="media" data-speed="0.3">
            <Image src={project.image} alt={project.name} fill priority sizes="100vw" />
          </div>
        </ViewTransition>
        <div className="container">
          <span className="eyebrow">
            {project.category} · {project.status}
          </span>
          <h1 className="display h1">{project.name}</h1>
          <p className="lead">{project.location}</p>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.overview}`}>
          <h2 className="display h2" data-reveal>
            {project.tagline}
          </h2>
          <div>
            <p className="lead" data-reveal>
              {project.description}
            </p>
            <dl className={styles.facts}>
              {project.facts.map((f) => (
                <div key={f.label} data-reveal>
                  <dt>{f.label}</dt>
                  <dd className="display">{f.value}</dd>
                </div>
              ))}
            </dl>
            <p className={styles.rera} data-reveal>
              RERA: {project.rera}
            </p>
          </div>
        </div>
      </section>

      <section className={styles.gallery}>
        <div className="container">
          {project.gallery.map((src, i) => (
            <div key={src} className={`${styles.shot} frame`} data-clip>
              <div className="media" data-speed={0.15 + i * 0.08}>
                <Image src={src} alt={`${project.name} view ${i + 1}`} fill sizes="(max-width: 900px) 100vw, 60vw" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section dark">
        <div className="container">
          <span className="eyebrow" data-reveal>
            Amenities
          </span>
          <ul className={styles.amenities}>
            {project.amenities.map((a, i) => (
              <li key={a} data-reveal>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.enquire}`}>
          <div>
            <span className="eyebrow">Enquire</span>
            <h2 className="display h2">
              Interested in <em>{project.name}</em>?
            </h2>
            <p className="lead">
              Get the brochure, floor plans and pricing, or book a guided site visit. Call{" "}
              <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>.
            </p>
          </div>
          <EnquiryForm project={project.name} />
        </div>
      </section>

      <Link href={`/projects/${next.slug}`} className={`${styles.next} dark`}>
        <div className="media" data-speed="0.3">
          <Image src={next.image} alt="" fill sizes="100vw" />
        </div>
        <div className="container">
          <span className="eyebrow">Next project</span>
          <span className="display h1">{next.name} →</span>
        </div>
      </Link>
    </>
  );
}
