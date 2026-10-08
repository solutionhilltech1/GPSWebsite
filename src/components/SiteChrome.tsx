"use client";

import { usePathname } from "next/navigation";

// Public header/footer wrapper: the admin portal has its own frame (src/app/admin/AdminShell.tsx).
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  return usePathname().startsWith("/admin") ? null : children;
}
