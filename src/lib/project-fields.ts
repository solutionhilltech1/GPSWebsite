// Project field options and helpers safe to import from client components (no MongoDB here).

export const categories = ["Commercial", "Healthcare", "Religious", "Residential"] as const;
export const statuses = ["Ongoing", "Completed", "Upcoming"] as const;
export type Category = (typeof categories)[number];
export type Status = (typeof statuses)[number];

// A file on UploadThing. `key` is what deletes it, `url` is what the site renders.
export type StoredImage = { key: string; url: string };

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
