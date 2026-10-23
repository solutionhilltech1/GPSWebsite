import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Skyline from "@/components/Skyline";
import Testimonials from "@/components/Testimonials";
import Words from "@/components/Words";
import { about, machinery, pillars, services, site, stats, testimonials } from "@/data/site";
import { pageMeta } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata: Metadata = pageMeta({
  description:
    "GPS Projects Private Limited is a construction and infrastructure company in Etah, Uttar Pradesh. Civil construction, roads and bridges, architectural and interior design, and complete project management.",
  path: "/",
  image: "/opengraph-image.png",
});

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
            <Image src="/hero-tower.jpg" alt="Modern luxury twin residential towers with skybridge crown" fill priority sizes="100vw" />
            <div className={styles.shade} data-roof-shade />
          </div>

          <svg className={styles.roofline} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" data-roof-line>
            <path className={styles.lineWide} d="M3 86 H50 L73 22 L96 86 H82" />
            <path className={styles.lineNarrow} d="M4 96 H16 L50 8 L84 96 H96" />
          </svg>

          <div className={`container ${styles.copy}`} data-roof-copy>
            <span className="eyebrow">{site.fullName} · Etah, Uttar Pradesh</span>
            <h1 className="display h1">
              A new name for modern construction <em>and trust.</em>
            </h1>
            <p className="lead">
              We don&apos;t just build buildings, we transform modern architecture and your dreams into reality.
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

      {/* 2. About */}
      <section className="section">
        <div className="container">
          <span className="eyebrow" data-reveal>
            About us
          </span>
          <Words className={`display ${styles.manifesto}`} text={about.intro} />
          <div className={styles.aboutRow}>
            <p className="lead" data-reveal>
              {about.text}
            </p>
            <Link href="/about" className="btn" data-reveal>
              About GPS
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Services: dusk skyline parallax behind glass cards */}
      <Skyline>
        <span className="eyebrow" data-reveal>
          Our core services
        </span>
        <h2 className={`display h2 ${styles.skyTitle}`} data-reveal>
          From plan <em>to handover.</em>
        </h2>
        <ol className={`${styles.cards} ${styles.glass}`}>
          {services.map((s, i) => (
            <li key={s.title} data-reveal>
              <span>0{i + 1}</span>
              <h3 className="display h3">{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
        <Link href="/services" className="btn btnGold" data-reveal>
          All services
        </Link>
      </Skyline>

      {/* 4. Why choose us */}
      <section className="section dark">
        <div className="container">
          <span className="eyebrow" data-reveal>
            Why choose us
          </span>
          <ol className={styles.cards}>
            {pillars.map((p, i) => (
              <li key={p.title} data-reveal>
                <span>0{i + 1}</span>
                <h3 className="display h3">{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 5. Vision & mission */}
      <section className="section">
        <div className={`container ${styles.vm}`}>
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

      {/* 6. Our own machinery */}
      <section className={styles.split}>
        <div className={`${styles.splitImage} frame`} data-clip>
          <div className="media" data-speed="0.2">
            <Image src={machinery.image.src} alt={machinery.image.alt} fill sizes="(max-width: 900px) 100vw, 50vw" />
          </div>
        </div>
        <div className={styles.splitText}>
          <span className="eyebrow" data-reveal>
            Our own machinery
          </span>
          <h2 className="display h2" data-reveal>
            Our machines. <em>Our schedule.</em>
          </h2>
          <p className="lead" data-reveal>
            {machinery.intro}
          </p>
          <ul className={styles.fleet}>
            {machinery.fleet.map((m) => (
              <li key={m.name} data-reveal>
                <b>{m.name}</b>
                {m.text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 7. Testimonials */}
      {testimonials.length > 0 && <Testimonials items={testimonials} />}
    </>
  );
}
