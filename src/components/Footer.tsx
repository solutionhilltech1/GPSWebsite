import Link from "next/link";
import { site } from "@/data/site";
import { getProjects } from "@/lib/projects";
import { getSiteSettings } from "@/lib/settings";
import styles from "./Footer.module.css";

export default async function Footer() {
  const [projects, settings] = await Promise.all([
    getProjects(),
    getSiteSettings(),
  ]);

  const phone = settings.phone || site.phone;
  const email = settings.email || site.email;
  const activeSocials = (settings.socials || []).filter(
    (s) => typeof s.url === "string" && s.url.trim().length > 0
  );

  return (
    <>
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
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
            )}
            {email && (
              <a href={`mailto:${email}`}>{email}</a>
            )}
            {activeSocials.length > 0 && (
              <div className={styles.socials}>
                {activeSocials.map((s) => (
                  <a key={s.id || s.label} href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
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

    {/* Floating quick-contact buttons, on every public page (Footer sits inside SiteChrome). */}
    {phone && (
      <div className={styles.float}>
        <a
          href={`https://wa.me/${phone.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className={styles.whatsapp}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </svg>
        </a>
        <a href={`tel:${phone.replace(/\s/g, "")}`} aria-label={`Call ${phone}`} className={styles.call}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.12.37 2.33.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
          </svg>
        </a>
      </div>
    )}
    </>
  );
}
