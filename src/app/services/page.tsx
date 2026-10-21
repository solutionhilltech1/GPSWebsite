import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { faqs, services, site } from "@/data/site";
import { breadcrumbs, pageMeta } from "@/lib/seo";
import styles from "./services.module.css";

export const metadata: Metadata = pageMeta({
  title: "Construction & Infrastructure Services in Etah",
  description: `${site.fullName} offers civil construction, roads, bridges and industrial complexes, interior and architectural design, and end-to-end project management across Uttar Pradesh, Delhi NCR, Uttarakhand & Punjab.`,
  path: "/services",
  image: "/opengraph-image.png",
});

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={{
          "@graph": [
            breadcrumbs([{ name: "Services", path: "/services" }]),
            ...services.map((s) => ({
              "@type": "Service",
              name: s.title,
              description: s.text,
              serviceType: s.title,
              provider: { "@id": `${site.url}/#organization` },
              areaServed: ["Uttar Pradesh", "Delhi NCR", "Uttarakhand", "Punjab"].map((name) => ({
                "@type": "AdministrativeArea",
                name,
              })),
              url: `${site.url}/services`,
            })),
            {
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
            },
          ],
        }}
      />
      <section className="pageHero">
        <div className="media" data-speed="0.3">
          <Image src={site.images.build} alt="Construction work in progress on a GPS Projects site" fill priority sizes="100vw" />
        </div>
        <div className="container">
          <span className="eyebrow">Our core services</span>
          <h1 className="display h1">
            From plan <em>to handover</em>
          </h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <ol className={styles.rows}>
            {services.map((s, i) => (
              <li key={s.title} data-reveal>
                <span className={`display ${styles.num}`}>0{i + 1}</span>
                <h2 className="display h3">{s.title}</h2>
                <div>
                  <p className="lead">{s.text}</p>
                  <ul className={styles.scope}>
                    {s.scope.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
          <Link href="/contact" className="btn" data-reveal>
            Discuss your project
          </Link>
        </div>
      </section>

      <section className="section dark">
        <div className="container">
          <span className="eyebrow" data-reveal>
            Questions
          </span>
          <h2 className={`display h2 ${styles.faqTitle}`} data-reveal>
            Frequently asked <em>questions</em>
          </h2>
          <div className={styles.faqs}>
            {faqs.map((f) => (
              <details key={f.q} data-reveal>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
