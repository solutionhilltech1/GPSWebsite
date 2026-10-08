import styles from "./Skyline.module.css";

// Deterministic so server and client render the same skyline.
export function random(seed: number) {
  return () => (seed = (seed * 16807) % 2147483647) / 2147483647;
}

type Rect = { x: number; y: number; w: number; h: number };

/** A row of building silhouettes standing on `ground`, plus window positions. `gap` leaves an empty plot. */
export function skyline(seed: number, minH: number, maxH: number, ground: number, gap?: [number, number]) {
  const r = random(seed);
  const parts: string[] = [];
  const windows: Rect[] = [];
  const base = ground + 300;
  for (let x = -20; x < 1620; ) {
    const w = 46 + r() * 90;
    const h = minH + r() * (maxH - minH);
    const step = r() > 0.6 ? 20 + r() * 40 : 0;
    const top = ground - h;
    if (!gap || x + w < gap[0] || x > gap[1]) {
      // optional setback on the roof for a less boxy silhouette
      parts.push(
        step
          ? `M${x} ${base}V${top + step}H${x + w * 0.2}V${top}H${x + w * 0.8}V${top + step}H${x + w}V${base}Z`
          : `M${x} ${base}V${top}H${x + w}V${base}Z`,
      );
      for (let y = top + 18; y < ground - 14; y += 26)
        for (const col of [0.25, 0.6]) if (r() > 0.75) windows.push({ x: x + w * col, y, w: w * 0.14, h: 9 });
    }
    x += w + r() * 14;
  }
  return { path: parts.join(""), windows };
}

/** Tower crane; the trolley runs along the jib and the hook swings under it (CSS). */
function Crane() {
  return (
    <g>
      <rect x="1080" y="90" width="8" height="420" />
      <rect x="960" y="90" width="430" height="7" />
      <rect x="930" y="97" width="60" height="22" />
      <path d="M1084 90 L1084 50 L1300 93 M1084 50 L960 93" fill="none" strokeWidth="2" />
      <g className={styles.trolley}>
        <g className={styles.hook}>
          <line x1="1330" y1="97" x2="1330" y2="230" strokeWidth="1.5" />
          <rect x="1318" y="230" width="24" height="12" />
        </g>
      </g>
      <circle className={styles.beacon} cx="1084" cy="48" r="4" />
      <circle className={styles.beacon} cx="1388" cy="91" r="3.5" />
    </g>
  );
}

const box = "0 0 1600 800";
const slice = { viewBox: box, preserveAspectRatio: "xMidYMax slice", "aria-hidden": true } as const;

/**
 * Layered parallax skyline behind normal-flow content. Layers drift at different speeds
 * (ScrollFX data-speed). Stars and windows are split into a few whole <svg> groups that fade
 * as units, so the browser composites them instead of repainting SVG every frame; ScrollFX
 * adds .live only while the section is on screen, so nothing animates offscreen.
 */
export default function Skyline({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const near = skyline(37, 60, 230, 600);
  const r = random(5);
  const stars = Array.from({ length: 90 }, () => ({ x: r() * 1600, y: r() * 420, s: 0.6 + r() * 1.4 }));
  return (
    <section className={`${styles.skyline} ${className}`} data-live>
      <div className={styles.stars} data-speed="0.6">
        {[0, 1].map((g) => (
          <svg key={g} viewBox="0 0 1600 420" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
            {stars.map((s, i) => i % 2 === g && <circle key={i} cx={s.x} cy={s.y} r={s.s} />)}
          </svg>
        ))}
      </div>
      <div className={styles.sun} data-speed="0.45" />
      <svg className={`${styles.layer} ${styles.far}`} data-speed="0.35" {...slice}>
        <path d={skyline(11, 160, 420, 600).path} />
      </svg>
      <div className={styles.haze} />
      <svg className={`${styles.layer} ${styles.mid}`} data-speed="0.2" {...slice}>
        <Crane />
        <path d={skyline(23, 100, 320, 600).path} />
      </svg>
      <div className={`${styles.layer} ${styles.near}`} data-speed="0.05">
        <svg {...slice}>
          <rect x="-20" y="610" width="1640" height="200" />
          <path d={near.path} />
        </svg>
        {[0, 1, 2].map((g) => (
          <svg key={g} className={styles.windows} {...slice}>
            {near.windows.map((w, i) => i % 3 === g && <rect key={i} x={w.x} y={w.y} width={w.w} height={w.h} />)}
          </svg>
        ))}
      </div>
      <div className={`container ${styles.copy}`}>{children}</div>
    </section>
  );
}
