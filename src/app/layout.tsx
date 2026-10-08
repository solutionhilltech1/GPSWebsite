import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { Suspense, ViewTransition } from "react";
import "lenis/dist/lenis.css";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollFX from "@/components/ScrollFX";
import { site } from "@/data/site";

// One family does everything: heavy italic for headlines (like the logo), regular for text.
const archivo = Archivo({
  variable: "--font-sans",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: { default: `${site.fullName} | ${site.tagline}`, template: `%s | ${site.fullName}` },
  description: `${site.fullName} develops and constructs residential buildings in ${site.offices[0]}. Established 2026.`,
  // Share previews (WhatsApp etc.) need absolute image URLs.
  metadataBase: new URL(site.url),
  openGraph: { siteName: site.fullName, type: "website", locale: "en_IN" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={archivo.variable}>
      <body>
        <Header />
        <ViewTransition>
          <main>{children}</main>
        </ViewTransition>
        <Footer />
        <Suspense>
          <ScrollFX />
        </Suspense>
      </body>
    </html>
  );
}
