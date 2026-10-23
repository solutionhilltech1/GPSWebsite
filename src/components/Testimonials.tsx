"use client";

import { useRef, useState } from "react";
import styles from "./Testimonials.module.css";

type Testimonial = { quote: string; name: string; role: string };

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^\p{L}/u.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

const pad = (n: number) => String(n).padStart(2, "0");

// Coverflow: the active quote sits centre stage, its neighbours tilt back and fade out to the left and right.
// Autoplay is the active dot's CSS fill animation (its end advances the slide), so it pauses on hover or
// keyboard focus and is off under reduced motion with no timers.
export default function Testimonials({ items }: { items: Testimonial[] }) {
  const [active, setActive] = useState(0);
  const startX = useRef<number | null>(null);
  const n = items.length;
  const go = (i: number) => setActive(((i % n) + n) % n);
  const half = Math.floor(n / 2);

  return (
    <section
      className={`section dark ${styles.root}`}
      aria-roledescription="carousel"
      aria-label="Client testimonials"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(active - 1);
        if (e.key === "ArrowRight") go(active + 1);
      }}
    >
      <div className={`container ${styles.head}`}>
        <div>
          <span className="eyebrow" data-reveal>
            What our clients say
          </span>
          <h2 className="display h2" data-reveal>
            Built on trust. <em>Told by clients.</em>
          </h2>
        </div>
        <div className={styles.controls} data-reveal>
          <span className={styles.count}>
            <b>{pad(active + 1)}</b> / {pad(n)}
          </span>
          <button type="button" onClick={() => go(active - 1)} aria-label="Previous testimonial">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
          </button>
          <button type="button" onClick={() => go(active + 1)} aria-label="Next testimonial">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className={styles.stage}
        data-reveal
        onPointerDown={(e) => (startX.current = e.clientX)}
        onPointerUp={(e) => {
          if (startX.current === null) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          if (Math.abs(dx) > 50) go(active + (dx < 0 ? 1 : -1));
        }}
      >
        {items.map((t, i) => {
          // Signed distance from the active card, wrapped so the ring has no ends.
          const o = ((i - active + n + half) % n) - half;
          return (
            <figure
              key={t.quote}
              className={styles.card}
              data-active={o === 0 || undefined}
              aria-hidden={o !== 0}
              style={{ "--o": o, zIndex: n - Math.abs(o) } as React.CSSProperties}
              onClick={() => o && go(i)}
            >
              <span className={styles.mark} aria-hidden="true">
                &ldquo;
              </span>
              <blockquote>{t.quote}</blockquote>
              <figcaption>
                <span className={styles.avatar}>{initials(t.name)}</span>
                <span>
                  <b>{t.name}</b>
                  {t.role}
                </span>
              </figcaption>
            </figure>
          );
        })}
      </div>

      <div className={styles.dots}>
        {items.map((t, i) => (
          <button
            key={t.quote}
            type="button"
            className={styles.dot}
            aria-label={`Show testimonial ${i + 1}`}
            aria-current={i === active}
            onClick={() => go(i)}
          >
            {i === active && <span className={styles.fill} onAnimationEnd={() => go(active + 1)} />}
          </button>
        ))}
      </div>
    </section>
  );
}
