import type { ObjectId, WithId } from "mongodb";
import { db } from "./mongo";

// One photo in the `gallery` collection. The image itself lives on UploadThing under `key`.
export type PhotoDoc = {
  key: string;
  url: string;
  name: string;
  size: number;
  title: string;
  caption: string;
  category: string;
  tags: string[];
  // Shown on the gallery page; older photos fall back to the defaults below.
  location?: string;
  developer?: string;
  recordedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

// Shape sent to the gallery and admin pages.
export type GalleryItem = ReturnType<typeof toItem>;

export const photos = async () => (await db()).collection<PhotoDoc>("gallery");

const formatBytes = (bytes: number) => {
  const i = bytes ? Math.floor(Math.log(bytes) / Math.log(1024)) : 0;
  return `${parseFloat((bytes / 1024 ** i).toFixed(1))} ${["B", "KB", "MB", "GB"][i]}`;
};

export const DEFAULT_LOCATION = "Etah, Uttar Pradesh";
export const DEFAULT_DEVELOPER = "GPS Projects Private Limited";

// Dates are shown and edited as Indian calendar days.
const day = (d: Date, opts: Intl.DateTimeFormatOptions, locale = "en-IN") =>
  d.toLocaleDateString(locale, { timeZone: "Asia/Kolkata", ...opts });

export const toItem = (d: WithId<PhotoDoc>) => ({
  id: (d._id as ObjectId).toString(),
  name: d.name,
  src: d.url,
  title: d.title,
  caption: d.caption,
  category: d.category,
  tags: d.tags,
  sizeBytes: d.size,
  sizeFormatted: formatBytes(d.size),
  extension: (d.name.split(".").pop() ?? "").toUpperCase(),
  mtime: d.updatedAt.getTime(),
  location: d.location ?? DEFAULT_LOCATION,
  developer: d.developer ?? DEFAULT_DEVELOPER,
  recordedDate: day(d.recordedAt ?? d.createdAt, {}, "en-CA"), // YYYY-MM-DD for <input type="date">
  modifiedFormatted: day(d.recordedAt ?? d.createdAt, { day: "numeric", month: "short", year: "numeric" }),
});

// "YYYY-MM-DD" from a date input, as midnight in India; null if it isn't a real date.
export const dateOnly = (v: unknown) => {
  const d = typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(`${v}T00:00:00+05:30`) : null;
  return d && !isNaN(d.getTime()) ? d : null;
};

// Trim and cap free-text fields coming from the admin forms.
export const text = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");
export const tagList = (v: unknown) =>
  (Array.isArray(v) ? v : String(v ?? "").split(","))
    .map((t) => text(t, 40))
    .filter(Boolean)
    .slice(0, 12);
