import { cacheLife, cacheTag } from "next/cache";
import { site } from "@/data/site";
import { db } from "./mongo";

export const SETTINGS_TAG = "site_settings";

export type SocialLink = {
  id: string;
  label: string;
  url: string;
};

export type SiteSettingsDoc = {
  _id: string;
  phone: string;
  email: string;
  socials: SocialLink[];
  updatedAt: Date;
};

export type SiteSettings = {
  phone: string;
  email: string;
  socials: SocialLink[];
};

export const DEFAULT_PRESET_CHANNELS = [
  { id: "youtube", label: "YouTube", placeholder: "https://youtube.com/@channel" },
  { id: "instagram", label: "Instagram", placeholder: "https://instagram.com/profile" },
  { id: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/name" },
  { id: "facebook", label: "Facebook", placeholder: "https://facebook.com/page" },
  { id: "twitter", label: "X (Twitter)", placeholder: "https://x.com/handle" },
  { id: "whatsapp", label: "WhatsApp", placeholder: "https://wa.me/919560324929" },
];

export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export const settingsCollection = async () => (await db()).collection<SiteSettingsDoc>("settings");

/**
 * Fetches dynamic site settings (contact and social media links) from MongoDB.
 * Cached until updated by an HR / Admin via /admin/socials.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag(SETTINGS_TAG);
  cacheLife("max");

  try {
    const col = await settingsCollection();
    const doc = await col.findOne({ _id: "global" });
    if (doc) {
      return {
        phone: doc.phone?.trim() || site.phone,
        email: doc.email?.trim() || site.email,
        socials: Array.isArray(doc.socials) ? doc.socials : [],
      };
    }
  } catch (err) {
    // If Mongo is offline or not configured yet, fallback gracefully to static site defaults
    console.warn("Could not load site settings from DB, using fallback defaults:", err);
  }

  return {
    phone: site.phone,
    email: site.email,
    socials: [
      { id: "youtube", label: "YouTube", url: "" },
      { id: "instagram", label: "Instagram", url: "" },
      { id: "linkedin", label: "LinkedIn", url: "" },
      { id: "facebook", label: "Facebook", url: "" },
    ],
  };
}
