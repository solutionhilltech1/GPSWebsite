import type { NextConfig } from "next";

// One canonical host: the Vercel preview URL and www both forward to the real domain, so Google
// never indexes duplicates of the site. Keep in sync with `site.url` in src/data/site.ts.
const CANONICAL = "https://gpsprojects.co.in";
const duplicateHosts = ["gps-one-opal.vercel.app", "www.gpsprojects.co.in"];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  async redirects() {
    return duplicateHosts.map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: `${CANONICAL}/:path*`,
      permanent: true,
    }));
  },
  images: {
    // ponytail: placeholder photography from Unsplash, swap for client renders in /public and drop this
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/photo-**" },
      // Project + gallery photos uploaded through /admin
      { protocol: "https", hostname: "*.ufs.sh", pathname: "/f/**" },
    ],
  },
};

export default nextConfig;
