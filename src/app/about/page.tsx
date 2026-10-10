import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Words from "@/components/Words";
import { about, pillars, site, stats, timeline } from "@/data/site";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About",
  description: `${site.fullName}: construction and infrastructure development in ${site.offices[0]}.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <section className="pageHero">
        <div className="media" data-speed="0.3">
          <Image src={site.images.site} alt="" fill priority sizes="100vw" />
        </div>
        <div className="container">
          <span className="eyebrow">About us</span>
          <h1 className="display h1">
            Building trust,
            <br />
            <em>brick by brick</em>
          </h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Words className={`display ${styles.manifesto}`} text={about.intro} />
          <p className={`lead ${styles.intro}`} data-reveal>
            {about.text}
          </p>
        </div>
      </section>

      <section className={styles.duo}>
        <div className={`${styles.duoImage} frame`} data-clip>
          <div className="media" data-speed="0.25">
            <Image src={site.images.crane} alt="Tower crane on a GPS site" fill sizes="(max-width: 900px) 100vw, 50vw" />
          </div>
        </div>
        <div className={styles.duoText}>
          <div data-reveal>
            <span className="eyebrow">Vision</span>
            <p className="display h3">{about.vision}</p>
          </div>
          <div data-reveal>
            <span className="eyebrow">Mission</span>
            <p className="display h3">{about.mission}</p>
          </div>
        </div>
      </section>

      <section className="section dark">
        <div className={`container ${styles.numbers}`}>
          {stats.map((s) => (
            <div key={s.label} data-reveal>
              <p className="display">
                {s.value}
              </p>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <span className="eyebrow" data-reveal>
            Why choose us
          </span>
          <div className={styles.pillars}>
            {pillars.map((p, i) => (
              <div key={p.title} data-reveal>
                <span>0{i + 1}</span>
                <h2 className="display h3">{p.title}</h2>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section dark">
        <div className="container">
          <span className="eyebrow" data-reveal>
            Milestones
          </span>
          <ol className={styles.milestones}>
            {timeline.map((t) => (
              <li key={t.year} data-reveal>
                <span className="display">{t.year}</span>
                <h3>{t.title}</h3>
                <p>{t.text}</p>
              </li>
            ))}
          </ol>
          <Link href="/projects" className="btn" data-reveal>
            See our projects
          </Link>
        </div>
      </section>
    </>
  );
}
