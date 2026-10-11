import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { Suspense, ViewTransition } from "react";
import "lenis/dist/lenis.css";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteChrome from "@/components/SiteChrome";
import ScrollFX from "@/components/ScrollFX";
import JsonLd from "@/components/JsonLd";
import { site } from "@/data/site";
import { Analytics } from "@vercel/analytics/next";

// One family does everything: heavy italic for headlines (like the logo), regular for text.
const archivo = Archivo({
  variable: "--font-sans",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: { default: `${site.fullName} | ${site.tagline}`, template: `%s | ${site.fullName}` },
  description: site.description,
  applicationName: site.fullName,
  authors: [{ name: site.fullName, url: site.url }],
  creator: site.fullName,
  publisher: site.fullName,
  category: "construction",
  formatDetection: { telephone: false, email: false, address: false },
  // Share previews (WhatsApp etc.) need absolute image URLs.
  metadataBase: new URL(site.url),
  openGraph: { siteName: site.fullName, type: "website", locale: "en_IN" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, googleBot: { "max-image-preview": "large", "max-snippet": -1 } },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

// Company and website facts for Google's knowledge panel. Phone, email and socials are left out until they're real.
const org = {
  "@type": "GeneralContractor",
  "@id": `${site.url}/#organization`,
  name: site.fullName,
  legalName: "GPS PROJECTS PRIVATE LIMITED",
  alternateName: "GPS Projects",
  url: site.url,
  logo: `${site.url}/gps-logo-original.png`,
  image: `${site.url}/opengraph-image.png`,
  description: site.description,
  slogan: site.tagline,
  identifier: { "@type": "PropertyValue", propertyID: "CIN", value: site.legal.cin },
  address: {
    "@type": "PostalAddress",
    streetAddress: site.postal.street,
    addressLocality: site.postal.city,
    addressRegion: site.postal.region,
    postalCode: site.postal.code,
    addressCountry: "IN",
  },
  areaServed: { "@type": "State", name: "Uttar Pradesh" },
};
const website = {
  "@type": "WebSite",
  "@id": `${site.url}/#website`,
  name: site.fullName,
  url: site.url,
  inLanguage: "en-IN",
  publisher: { "@id": `${site.url}/#organization` },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={archivo.variable}>
      <body>
        <JsonLd data={{ "@graph": [org, website] }} />
        <SiteChrome>
          <Header />
        </SiteChrome>
        <ViewTransition>
          <main>{children}</main>
        </ViewTransition>
        <SiteChrome>
          <Footer />
        </SiteChrome>
        <Suspense>
          <ScrollFX />
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
