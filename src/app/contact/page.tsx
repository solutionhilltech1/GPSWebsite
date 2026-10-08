import type { Metadata } from "next";
import Image from "next/image";
import EnquiryForm from "@/components/EnquiryForm";
import { site } from "@/data/site";
import { getProjects } from "@/lib/projects";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description: "Book a site visit or talk to our sales and leasing teams.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const projects = await getProjects();
  return (
    <>
      <section className="pageHero">
        <div className="media" data-speed="0.3">
          <Image src={site.images.hero} alt="" fill priority sizes="100vw" />
        </div>
        <div className="container">
          <span className="eyebrow">Contact</span>
          <h1 className="display h1">
            Let&apos;s <em>talk</em>
          </h1>
          <p className="lead">Sales, leasing, partnerships or a site visit. One form, and the right team calls you back.</p>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.grid}`}>
          <div className={styles.details}>
            <div data-reveal>
              <h2>Registered office</h2>
              <p>{site.address}</p>
            </div>
            <div data-reveal>
              <h2>Call</h2>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>
            </div>
            <div data-reveal>
              <h2>Write</h2>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </div>
            <div data-reveal>
              <h2>Offices</h2>
              <p>{site.offices.join(" · ")}</p>
            </div>
          </div>
          <div data-reveal>
            <EnquiryForm projectNames={projects.map((p) => p.name)} />
          </div>
        </div>
      </section>

      <iframe
        className={styles.map}
        title="Head office location"
        src={`https://www.google.com/maps?q=${encodeURIComponent(site.address)}&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </>
  );
}
