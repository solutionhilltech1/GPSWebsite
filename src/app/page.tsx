import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { projects, site, stats } from "@/data/site";
import styles from "./page.module.css";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const heroProject = projects[0];

export default function Home() {
  return (
    <>
      {/*
        1. Hero: the logo's gold roofline frames a window onto a building.
        Scrolling opens the roof window into a full-screen photograph (ScrollFX: data-roof).
      */}
      <section className={styles.hero} data-roof>
        <div className={styles.stage}>
          <div className={styles.window} data-roof-window>
            <Image src={heroProject.image} alt="Residential building at dusk" fill priority sizes="100vw" />
            <div className={styles.shade} data-roof-shade />
          </div>

          <svg className={styles.roofline} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" data-roof-line>
            <path className={styles.lineWide} d="M3 86 H50 L73 22 L96 86 H82" />
            <path className={styles.lineNarrow} d="M4 44 H16 L50 12 L84 44 H96" />
          </svg>

          <div className={`container ${styles.copy}`} data-roof-copy>
            <span className="eyebrow">GPS Projects · Est. 2026 · Etah, Uttar Pradesh</span>
            <h1 className="display h1">
              Building
              <br />a better
              <br />
              <em>tomorrow.</em>
            </h1>
            <p className="lead">
              Residential buildings in Uttar Pradesh, planned, constructed and delivered by one dedicated team.
            </p>
            <div className={styles.actions}>
              <Link href="/projects" className="btn btnGold">
                Our projects
              </Link>
              <Link href="/contact" className="btn">
                Enquire
              </Link>
            </div>
          </div>

          <ul className={`container ${styles.facts}`} data-roof-copy>
            {stats.slice(0, 3).map((s) => (
              <li key={s.label}>
                <b>{s.value}</b>
                {s.label}
              </li>
            ))}
          </ul>

          <p className={`container ${styles.caption}`} data-roof-caption>
            <span>{site.tagline}</span>
            {site.fullName} · {site.offices[0]}
          </p>
        </div>
      </section>
    </>
  );
}
