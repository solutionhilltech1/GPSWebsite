"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "../../../public/logo-transparent.png";
import styles from "./admin.module.css";

// Feather-style line icons, 24px grid, drawn with currentColor.
const paths = {
  gallery: "M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6M15.5 9.5a1.5 1.5 0 1 0 0-.01",
  projects: "M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6",
  external: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  lock: "M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4",
  edit: "M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4",
  trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6",
  replace: "M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5",
  search: "M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM21 21l-5-5",
  upload: "M12 16V4M7 9l5-5 5 5M4 16v4h16v-4",
  plus: "M12 5v14M5 12h14",
  share: "M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98",
  briefcase: "M16 16v1a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-1M4 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  key: "M21 2l-2 2m-1.5 1.5L14 9M3 17.5A4.5 4.5 0 1 0 9 12M12 9l3 3M15 6l3 3",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  check: "M20 6L9 17l-5-5",
};

export function Icon({ name, size = 18 }: { name: keyof typeof paths; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

const nav = [
  { href: "/admin", label: "Gallery", icon: "gallery" },
  { href: "/admin/projects", label: "Projects", icon: "projects" },
  { href: "/admin/careers", label: "Careers & HR", icon: "briefcase" },
  { href: "/admin/socials", label: "Social Media", icon: "share" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
] as const;

/** Frame for every logged-in admin screen: sidebar (top bar on phones) + page heading + content. */
export default function AdminShell({
  active,
  title,
  subtitle,
  actions,
  onLock,
  children,
}: {
  active: "/admin" | "/admin/projects" | "/admin/careers" | "/admin/socials" | "/admin/settings";
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  onLock: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brand} aria-label="GPS Projects website">
          <Image src={logo} alt="" sizes="120px" />
          <span>Admin</span>
        </Link>
        <nav className={styles.sideNav} aria-label="Admin">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} data-active={n.href === active} aria-current={n.href === active ? "page" : undefined}>
              <Icon name={n.icon} />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className={styles.sideFoot}>
          <Link href={active === "/admin" ? "/gallery" : active === "/admin/projects" ? "/projects" : active === "/admin/careers" ? "/careers" : active === "/admin/settings" ? "/careers" : "/#footer"} target="_blank">
            <Icon name="external" />
            View on website
          </Link>
          <button onClick={onLock}>
            <Icon name="lock" />
            Lock portal
          </button>
        </div>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.pageHead}>
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {actions && <div className={styles.pageActions}>{actions}</div>}
        </header>
        {children}
      </div>
    </div>
  );
}
