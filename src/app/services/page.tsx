import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { services, site } from "@/data/site";
import styles from "./services.module.css";

export const metadata: Metadata = {
  title: "Services",
  description: `${site.fullName}: civil construction, infrastructure projects, interior and architectural design, and project management.`,
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <section className="pageHero">
        <div className="media" data-speed="0.3">
          <Image src={site.images.build} alt="" fill priority sizes="100vw" />
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
    </>
  );
}
