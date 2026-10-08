import Link from "next/link";
import { site } from "@/data/site";
import { getProjects } from "@/lib/projects";
import styles from "./Footer.module.css";

export default async function Footer() {
  const projects = await getProjects();
  return (
    <footer className={`${styles.footer} dark`}>
      <div className="container">
        <div className={styles.top}>
          <p className={`display ${styles.pitch}`} data-reveal>
            Let&apos;s build <em>what&apos;s next</em>, together.
          </p>
          <Link href="/contact" className="btn btnGold" data-reveal>
            Start a conversation
          </Link>
        </div>

        <div className={styles.cols}>
          <div>
            <h3>Registered office</h3>
            <p>{site.address}</p>
            <p className={styles.offices}>{site.offices.join(" · ")}</p>
          </div>
          <div>
            <h3>Projects</h3>
            {projects.slice(0, 5).map((p) => (
              <Link key={p.slug} href={`/projects/${p.slug}`}>
                {p.name}
              </Link>
            ))}
          </div>
          <div>
            <h3>Company</h3>
            {site.nav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
          <div>
            <h3>Get in touch</h3>
            <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <div className={styles.socials}>
              {site.socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.wordmark} aria-hidden="true">
        <span data-speed="-0.4">{site.name}</span>
      </div>

      <div className={`container ${styles.legal}`}>
        <p>
          © {site.fullName} · CIN {site.legal.cin} ·{" "}
          <Link href="/admin" style={{ opacity: 0.65, textDecoration: "underline" }}>
            HR Portal
          </Link>
        </p>
        <p>
          Renderings of upcoming projects are artistic impressions. Project details are subject to approvals.
        </p>
      </div>
    </footer>
  );
}
