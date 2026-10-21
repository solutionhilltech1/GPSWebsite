import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Words from "@/components/Words";
import JsonLd from "@/components/JsonLd";
import { about, pillars, services, site } from "@/data/site";
import { breadcrumbs, pageMeta } from "@/lib/seo";
import styles from "./about.module.css";

export const metadata: Metadata = pageMeta({
  title: "About Us: Construction Company in Etah",
  description: `${site.fullName} is a registered construction and infrastructure development company in ${site.offices[0]}. Meet our directors and read our vision, mission and company profile.`,
  path: "/about",
  image: "/opengraph-image.png",
});

const glance = [
  { label: "Headquarters", value: site.offices[0] },
  { label: "Sectors", value: "Residential, commercial, industrial & infrastructure" },
  { label: "Equipment", value: "Own fleet of heavy machinery" },
];

const profile = [
  { label: "Legal name", value: site.fullName },
  { label: "CIN", value: site.legal.cin },
  { label: "Registrar", value: site.legal.registrar },
  { label: "Registered office", value: site.address },
  { label: "Chairman & MD", value: `${site.chairman.salutation} ${site.chairman.name}` },
  { label: "Directors", value: site.directors.join(", ") },
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("");

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={{
          "@graph": [
            breadcrumbs([{ name: "About", path: "/about" }]),
            {
              "@type": "AboutPage",
              "@id": `${site.url}/about#page`,
              url: `${site.url}/about`,
              name: `About ${site.fullName}`,
              about: { "@id": `${site.url}/#organization` },
              isPartOf: { "@id": `${site.url}/#website` },
            },
          ],
        }}
      />
      <section className="pageHero">
        <div className="media" data-speed="0.3">
          <Image src={site.images.site} alt="Construction site and building frame by GPS Projects" fill priority sizes="100vw" />
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
        <div className={`container ${styles.introGrid}`}>
          <div>
            <span className="eyebrow" data-reveal>
              Who we are
            </span>
            <Words className={`display ${styles.manifesto}`} text={about.intro} />
            <p className={`lead ${styles.intro}`} data-reveal>
              {about.text}
            </p>
          </div>
          <dl className={styles.glance} data-reveal>
            {glance.map((g) => (
              <div key={g.label}>
                <dt>{g.label}</dt>
                <dd>{g.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section dark">
        <div className={`container ${styles.chairman}`}>
          <figure className={styles.portrait} data-reveal>
            <Image
              src={site.chairman.image}
              alt={`${site.chairman.salutation} ${site.chairman.name}, ${site.chairman.title} of ${site.fullName}, at his desk`}
              width={1265}
              height={1244}
              sizes="(max-width: 900px) 100vw, 45vw"
            />
          </figure>
          <div>
            <span className="eyebrow" data-reveal>
              Chairman&rsquo;s message
            </span>
            <blockquote className={`display h3 ${styles.quote}`} data-reveal>
              {site.chairman.message}
            </blockquote>
            <p className={styles.signoff} data-reveal>
              <strong>
                {site.chairman.salutation} {site.chairman.name}
              </strong>
              <span>{site.chairman.title}</span>
            </p>
          </div>
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

      <section className="section">
        <div className="container">
          <span className="eyebrow" data-reveal>
            What we do
          </span>
          <h2 className={`display h2 ${styles.heading}`} data-reveal>
            One partner from <em>plan to handover</em>
          </h2>
          <div className={styles.services}>
            {services.map((s, i) => (
              <div key={s.title} data-reveal>
                <span>0{i + 1}</span>
                <h3 className="display h3">{s.title}</h3>
                <p>{s.text}</p>
                <ul>
                  {s.scope.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Link href="/services" className="btn" data-reveal>
            Explore our services
          </Link>
        </div>
      </section>

      <section className="section dark">
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

      <section className="section">
        <div className={`container ${styles.leadership}`}>
          <div>
            <span className="eyebrow" data-reveal>
              Leadership
            </span>
            <h2 className={`display h2 ${styles.heading}`} data-reveal>
              Led by people who <em>answer for the work</em>
            </h2>
            <p className="lead" data-reveal>
              Our directors are directly involved in every project, so clients always have a decision-maker on call.
            </p>
          </div>
          <ul className={styles.people}>
            {site.directors.map((d) => (
              <li key={d} data-reveal>
                <span className={styles.monogram} aria-hidden="true">
                  {initials(d)}
                </span>
                <div>
                  <h3>{d}</h3>
                  <p>{d === site.chairman.name ? site.chairman.title : "Director"}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section dark">
        <div className={`container ${styles.profileGrid}`}>
          <div>
            <span className="eyebrow" data-reveal>
              Corporate profile
            </span>
            <h2 className={`display h2 ${styles.heading}`} data-reveal>
              A registered company, <em>on the record</em>
            </h2>
            <p className="lead" data-reveal>
              {site.fullName} is a private limited company registered with the Ministry of Corporate Affairs, Government of
              India.
            </p>
          </div>
          <dl className={styles.profile} data-reveal>
            {profile.map((p) => (
              <div key={p.label}>
                <dt>{p.label}</dt>
                <dd>{p.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.cta}`}>
          <h2 className="display h2" data-reveal>
            Have a project in mind? <em>Let&rsquo;s build it.</em>
          </h2>
          <div className={styles.ctaActions} data-reveal>
            <Link href="/contact" className="btn btnGold">
              Get in touch
            </Link>
            <Link href="/projects" className="btn">
              See our projects
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
