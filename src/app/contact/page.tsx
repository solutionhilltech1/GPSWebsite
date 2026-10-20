import type { Metadata } from "next";
import Image from "next/image";
import EnquiryForm from "@/components/EnquiryForm";
import JsonLd from "@/components/JsonLd";
import { site } from "@/data/site";
import { breadcrumbs, pageMeta } from "@/lib/seo";
import { getProjects } from "@/lib/projects";
import { getSiteSettings } from "@/lib/settings";
import styles from "./contact.module.css";

export const metadata: Metadata = pageMeta({
  title: "Contact Us: Get a Quote or Book a Site Visit",
  description: `Contact ${site.fullName} in Etah, Uttar Pradesh. Call ${site.phone}, send an enquiry, request a quotation or book a site visit.`,
  path: "/contact",
  image: "/opengraph-image.png",
});

export default async function ContactPage() {
  const [projects, settings] = await Promise.all([
    getProjects(),
    getSiteSettings(),
  ]);
  const phone = settings.phone || site.phone;
  const email = settings.email || site.email;

  return (
    <>
      <JsonLd
        data={{
          "@graph": [
            breadcrumbs([{ name: "Contact", path: "/contact" }]),
            {
              "@type": "ContactPage",
              url: `${site.url}/contact`,
              name: `Contact ${site.fullName}`,
              about: { "@id": `${site.url}/#organization` },
            },
          ],
        }}
      />
      <section className="pageHero">
        <div className="media" data-speed="0.3">
          <Image src={site.images.hero} alt="Residential towers by GPS Projects" fill priority sizes="100vw" />
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
              {phone && <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>}
            </div>
            <div data-reveal>
              <h2>Write</h2>
              {email && <a href={`mailto:${email}`}>{email}</a>}
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
