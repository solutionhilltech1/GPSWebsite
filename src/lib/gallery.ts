import { MongoClient, type ObjectId, type WithId } from "mongodb";

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
  createdAt: Date;
  updatedAt: Date;
};

// Shape sent to the gallery and admin pages.
export type GalleryItem = ReturnType<typeof toItem>;

const g = globalThis as { _mongo?: Promise<MongoClient> };

// Reuse one connection across requests and dev hot reloads; retry if the first connect failed.
export async function photos() {
  g._mongo ??= new MongoClient(process.env.MONGODB_URI!).connect().catch((err) => {
    g._mongo = undefined;
    throw err;
  });
  return (await g._mongo).db(process.env.MONGODB_DB).collection<PhotoDoc>("gallery");
}

const formatBytes = (bytes: number) => {
  const i = bytes ? Math.floor(Math.log(bytes) / Math.log(1024)) : 0;
  return `${parseFloat((bytes / 1024 ** i).toFixed(1))} ${["B", "KB", "MB", "GB"][i]}`;
};

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
  modifiedFormatted: d.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
});

// Trim and cap free-text fields coming from the admin forms.
export const text = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");
export const tagList = (v: unknown) =>
  (Array.isArray(v) ? v : String(v ?? "").split(","))
    .map((t) => text(t, 40))
    .filter(Boolean)
    .slice(0, 12);
