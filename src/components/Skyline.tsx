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

function Crane() {
  return (
    <g>
      <rect x="1080" y="90" width="8" height="420" />
      <rect x="960" y="90" width="430" height="7" />
      <rect x="930" y="97" width="60" height="22" />
      <path d="M1084 90 L1084 50 L1300 93 M1084 50 L960 93" fill="none" strokeWidth="2" />
      <line x1="1330" y1="97" x2="1330" y2="230" strokeWidth="1.5" />
      <rect x="1318" y="230" width="24" height="12" />
    </g>
  );
}

const box = "0 0 1600 800";

/** Layered parallax skyline. `hero` makes it a full-screen page opener. */
export default function Skyline({ children, hero = false }: { children: React.ReactNode; hero?: boolean }) {
  const near = skyline(37, 60, 230, 600);
  return (
    <section className={`${styles.skyline} ${hero ? styles.hero : ""}`}>
      <div className={styles.sun} data-speed="0.8" />
      <svg className={`${styles.layer} ${styles.far}`} data-speed="0.5" viewBox={box} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <path d={skyline(11, 160, 420, 600).path} />
      </svg>
      <svg className={`${styles.layer} ${styles.mid}`} data-speed="0.28" viewBox={box} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <Crane />
        <path d={skyline(23, 100, 320, 600).path} />
      </svg>
      <div className={`container ${styles.copy}`} data-speed="0.4">
        {children}
      </div>
      <svg className={`${styles.layer} ${styles.near}`} data-speed="0.06" viewBox={box} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <path d={near.path} />
        {near.windows.map((w, i) => (
          <rect key={i} className={styles.window} x={w.x} y={w.y} width={w.w} height={w.h} />
        ))}
      </svg>
    </section>
  );
}
