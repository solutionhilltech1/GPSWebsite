import { cacheLife, cacheTag } from "next/cache";
import { text } from "./gallery";
import { db } from "./mongo";
import { categories, slugify, statuses, type Category, type Status, type StoredImage } from "./project-fields";

export { categories, statuses, type Category, type Status, type StoredImage };

// Public pages cache project reads under this tag; every admin write expires it.
export const PROJECTS_TAG = "projects";

// One project in the `projects` collection.
export type ProjectDoc = {
  slug: string;
  name: string;
  category: Category;
  status: Status;
  location: string;
  tagline: string;
  description: string;
  // Cover photo. A project without one is a draft: listed in the admin, hidden from the site.
  image?: StoredImage;
  gallery: StoredImage[];
  facts: { label: string; value: string }[];
  highlights: string[];
  rera?: string;
  order: number; // lower first on /projects
  createdAt: Date;
  updatedAt: Date;
};

// What the public pages render.
export type Project = Omit<ProjectDoc, "image" | "gallery" | "order" | "createdAt" | "updatedAt"> & {
  image: string;
  gallery: string[];
};

// What the admin editor works with.
export type AdminProject = Omit<ProjectDoc, "createdAt" | "updatedAt"> & { id: string };

export const projectsCollection = async () => (await db()).collection<ProjectDoc>("projects");

// Only documents in this shape. Older placeholder records (image as a plain URL string) are ignored.
export const CURRENT = { highlights: { $type: "array" } } as const;

/** Published projects (those with a cover photo), cached until an admin edit expires PROJECTS_TAG. */
export async function getProjects(): Promise<Project[]> {
  "use cache";
  cacheTag(PROJECTS_TAG);
  cacheLife("max");
  const docs = await (await projectsCollection())
    .find({ ...CURRENT, "image.url": { $exists: true } })
    .sort({ order: 1, createdAt: 1 })
    .toArray();
  return docs.map((d) => ({
    slug: d.slug,
    name: d.name,
    category: d.category,
    status: d.status,
    location: d.location,
    tagline: d.tagline,
    description: d.description,
    image: d.image!.url,
    gallery: d.gallery.map((g) => g.url),
    facts: d.facts,
    highlights: d.highlights,
    ...(d.rera && { rera: d.rera }),
  }));
}

export const getProject = async (slug: string) => (await getProjects()).find((p) => p.slug === slug);

// ---------- Admin input validation ----------

// Only UploadThing URLs: they come from the browser, and next/image only allows this host anyway.
const UPLOADTHING_URL = /^https:\/\/[a-z0-9-]+\.ufs\.sh\/f\/[\w.-]+$/;

export const storedImage = (v: unknown): StoredImage | null => {
  const f = v as Partial<StoredImage> | null;
  return f && typeof f.key === "string" && f.key && typeof f.url === "string" && UPLOADTHING_URL.test(f.url)
    ? { key: f.key.slice(0, 200), url: f.url }
    : null;
};

const list = (v: unknown) => (Array.isArray(v) ? v : []);

export type ParsedProject = Omit<ProjectDoc, "image" | "rera" | "createdAt" | "updatedAt"> & {
  image: StoredImage | null;
  rera: string; // "" = none
};

/** Validates an admin form body into project fields, or returns the first problem. */
export function parseProject(b: Record<string, unknown>): { error: string } | { project: ParsedProject } {
  const name = text(b.name, 120);
  // Page address comes from the name; the API keeps it fixed after creation (see /api/admin/projects).
  const slug = slugify(name);
  const category = categories.find((c) => c === b.category);
  const status = statuses.find((s) => s === b.status);
  if (!name) return { error: "Name is required." };
  if (!slug) return { error: "Name needs at least one letter or number." };
  if (!category) return { error: "Pick a category." };
  if (!status) return { error: "Pick a status." };

  const facts = list(b.facts)
    .map((f) => ({ label: text((f as { label?: unknown })?.label, 40), value: text((f as { value?: unknown })?.value, 60) }))
    .filter((f) => f.label && f.value)
    .slice(0, 8);
  const order = Number(b.order);

  return {
    project: {
      slug,
      name,
      category,
      status,
      location: text(b.location, 160),
      tagline: text(b.tagline, 160),
      description: text(b.description, 2000),
      image: storedImage(b.image),
      gallery: list(b.gallery).map(storedImage).filter((g): g is StoredImage => g !== null).slice(0, 20),
      facts,
      highlights: list(b.highlights).map((h) => text(h, 120)).filter(Boolean).slice(0, 20),
      rera: text(b.rera, 80),
      order: Number.isFinite(order) ? Math.round(order) : 0,
    },
  };
}

/** Every UploadThing key a project points at. */
export const imageKeys = (p: { image?: StoredImage | null; gallery: StoredImage[] }) =>
  [p.image?.key, ...p.gallery.map((g) => g.key)].filter((k): k is string => Boolean(k));
