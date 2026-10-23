import type { NextConfig } from "next";

// One canonical host: the Vercel preview URL forwards to the real domain, so Google never indexes a duplicate.
// Keep in sync with `site.url` in src/data/site.ts. Don't redirect the apex or www here: Vercel's domain settings
// already send gpsprojects.co.in to www, and a rule back the other way is an infinite loop.
const CANONICAL = "https://www.gpsprojects.co.in";
const duplicateHosts = ["gps-one-opal.vercel.app"];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  experimental: {
    agentUpgrade: "security",
  },
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
