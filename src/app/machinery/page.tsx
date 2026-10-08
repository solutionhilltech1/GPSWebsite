import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Words from "@/components/Words";
import { machinery, site } from "@/data/site";
import styles from "./machinery.module.css";

export const metadata: Metadata = {
  title: "Machinery",
  description: `${site.fullName} owns and runs its own construction machinery in ${site.offices[0]}.`,
  alternates: { canonical: "/machinery" },
};

export default function MachineryPage() {
  return (
    <>
      <section className="pageHero">
        <div className="media" data-speed="0.3">
          <Image src={machinery.photos[1].src} alt="" fill priority sizes="100vw" />
        </div>
        <div className="container">
          <span className="eyebrow">Our own machinery</span>
          <h1 className="display h1">
            Our machines. <em>Our schedule.</em>
          </h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Words className={`display ${styles.manifesto}`} text={machinery.intro} />
          <ol className={styles.fleet}>
            {machinery.fleet.map((m, i) => (
              <li key={m.name} data-reveal>
                <span>0{i + 1}</span>
                <h2 className="display h3">{m.name}</h2>
                <p>{m.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.photos}>
        {machinery.photos.map((p) => (
          <div key={p.src} className={`${styles.photo} frame`} data-clip>
            <div className="media" data-speed="0.15">
              <Image src={p.src} alt={p.alt} fill sizes="(max-width: 900px) 100vw, 50vw" />
            </div>
          </div>
        ))}
      </section>

      <section className="section dark">
        <div className={`container ${styles.cta}`}>
          <p className="display h3">Need a site cleared, levelled or built? Our crew and machines are ready.</p>
          <Link href="/contact" className="btn btnGold" data-reveal>
            Enquire
          </Link>
        </div>
      </section>
    </>
  );
}
