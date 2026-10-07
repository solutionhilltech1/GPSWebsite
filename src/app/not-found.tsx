import Link from "next/link";

export default function NotFound() {
  return (
    <section className="pageHero">
      <div className="container">
        <span className="eyebrow">404</span>
        <h1 className="display h1">
          This floor isn&apos;t <em>built yet</em>
        </h1>
        <p className="lead" style={{ margin: "24px 0 40px" }}>
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <Link href="/" className="btn btnGold">
          Back to home
        </Link>
      </div>
    </section>
  );
}
