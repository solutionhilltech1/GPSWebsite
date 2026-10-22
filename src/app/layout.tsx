import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import "lenis/dist/lenis.css";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteChrome from "@/components/SiteChrome";
import ScrollFX from "@/components/ScrollFX";
import JsonLd from "@/components/JsonLd";
import { services, site } from "@/data/site";
import { Analytics } from "@vercel/analytics/next";

// One family does everything: heavy italic for headlines (like the logo), regular for text.
const archivo = Archivo({
  variable: "--font-sans",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: { default: `${site.fullName} | Construction Company in Etah, Uttar Pradesh`, template: `%s | ${site.fullName}` },
  description: site.description,
  keywords: [
    "construction company in Etah",
    "civil contractor Uttar Pradesh",
    "infrastructure development",
    "residential construction",
    "commercial construction",
    "industrial construction",
    "project management",
    "GPS Projects",
  ],
  applicationName: site.fullName,
  authors: [{ name: site.fullName, url: site.url }],
  creator: site.fullName,
  publisher: site.fullName,
  category: "construction",
  formatDetection: { telephone: false, email: false, address: false },
  // Share previews (WhatsApp etc.) need absolute image URLs.
  metadataBase: new URL(site.url),
  openGraph: { siteName: site.fullName, type: "website", locale: "en_IN", url: "/" },
  twitter: { card: "summary_large_image" },
  // Local-business hints for search engines that still read them.
  other: {
    "geo.region": "IN-UP",
    "geo.placename": site.postal.city,
    "geo.position": `${site.geo.latitude};${site.geo.longitude}`,
    ICBM: `${site.geo.latitude}, ${site.geo.longitude}`,
  },
  robots: { index: true, follow: true, googleBot: { "max-image-preview": "large", "max-snippet": -1 } },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

// Company and website facts for Google's knowledge panel. sameAs (social profiles) is left out until the real URLs exist.
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
  telephone: site.phone,
  email: site.email,
  founder: site.directors.map((name) => ({
    "@type": "Person",
    name,
    jobTitle: name === site.chairman.name ? site.chairman.title : "Director",
    ...(name === site.chairman.name ? { image: `${site.url}${site.chairman.image}` } : {}),
  })),
  identifier: { "@type": "PropertyValue", propertyID: "CIN", value: site.legal.cin },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    telephone: site.phone,
    email: site.email,
    areaServed: "IN",
    availableLanguage: ["English", "Hindi"],
  },
  geo: { "@type": "GeoCoordinates", latitude: site.geo.latitude, longitude: site.geo.longitude },
  knowsAbout: ["Civil construction", "Infrastructure development", "Architectural design", "Interior design", "Project management"],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Construction services",
    itemListElement: services.map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: s.title, description: s.text },
    })),
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: site.postal.street,
    addressLocality: site.postal.city,
    addressRegion: site.postal.region,
    postalCode: site.postal.code,
    addressCountry: "IN",
  },
  areaServed: ["Uttar Pradesh", "Delhi NCR", "Uttarakhand", "Punjab"].map((name) => ({
    "@type": "AdministrativeArea",
    name,
  })),
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
      <body suppressHydrationWarning>
        <JsonLd data={{ "@graph": [org, website] }} />
        <SiteChrome>
          <Header />
        </SiteChrome>
        <main>{children}</main>
        <SiteChrome>
          <Footer />
        </SiteChrome>
        <Suspense>
          <ScrollFX />
        </Suspense>
        <Analytics />
        {/* Google tag (gtag.js) */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-V0BYJQDLGH" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-V0BYJQDLGH');`}
        </Script>
      </body>
    </html>
  );
}
