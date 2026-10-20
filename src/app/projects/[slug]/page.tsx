import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import EnquiryForm from "@/components/EnquiryForm";
import JsonLd from "@/components/JsonLd";
import { site } from "@/data/site";
import { breadcrumbs, pageMeta } from "@/lib/seo";
import { getProject, getProjects } from "@/lib/projects";
import styles from "./project.module.css";

// Cache Components needs at least one param at build time, even with an empty collection.
export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.length ? projects.map((p) => ({ slug: p.slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const project = await getProject((await params).slug);
  return project
    ? pageMeta({
        title: `${project.name}: ${project.category} Project`,
        description: `${project.tagline}. ${project.category} project, ${project.status.toLowerCase()}, in ${project.location}, built by ${site.fullName}.`,
        path: `/projects/${project.slug}`,
        image: project.image,
      })
    : {};
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const projects = await getProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const next = projects.length > 1 ? projects[(projects.indexOf(project) + 1) % projects.length] : null;

  return (
    <>
      <JsonLd
        data={{
          "@graph": [
            breadcrumbs([
              { name: "Projects", path: "/projects" },
              { name: project.name, path: `/projects/${project.slug}` },
            ]),
            {
              "@type": "WebPage",
              "@id": `${site.url}/projects/${project.slug}#page`,
              url: `${site.url}/projects/${project.slug}`,
              name: project.name,
              description: project.description,
              primaryImageOfPage: { "@type": "ImageObject", url: project.image },
              image: [project.image, ...project.gallery],
              isPartOf: { "@id": `${site.url}/#website` },
              about: {
                "@type": "Place",
                name: project.name,
                address: { "@type": "PostalAddress", addressLocality: project.location, addressCountry: "IN" },
              },
              author: { "@id": `${site.url}/#organization` },
            },
          ],
        }}
      />
      <section className={`pageHero ${styles.hero}`}>
        <ViewTransition name={`project-${project.slug}`} share="morph" default="none">
          <div className="media" data-speed="0.3">
            <Image src={project.image} alt={`${project.name}, ${project.category.toLowerCase()} project in ${project.location}`} fill priority sizes="100vw" />
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
            {project.rera && (
              <p className={styles.rera} data-reveal>
                RERA: {project.rera}
              </p>
            )}
          </div>
        </div>
      </section>

      {project.gallery.length > 0 && (
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
      )}

      <section className="section dark">
        <div className="container">
          <span className="eyebrow" data-reveal>
            Highlights
          </span>
          <ul className={styles.amenities}>
            {project.highlights.map((a, i) => (
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
              Planning something <em>like this?</em>
            </h2>
            <p className="lead">
              Tell us about your site and what you want to build, and our team will get back to you. Or call{" "}
              <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>.
            </p>
          </div>
          <EnquiryForm project={project.name} projectNames={projects.map((p) => p.name)} />
        </div>
      </section>

      {next && (
        <Link href={`/projects/${next.slug}`} className={`${styles.next} dark`}>
          <div className="media" data-speed="0.3">
            <Image src={next.image} alt="" fill sizes="100vw" />
          </div>
          <div className="container">
            <span className="eyebrow">Next project</span>
            <span className="display h1">{next.name} →</span>
          </div>
        </Link>
      )}
    </>
  );
}
