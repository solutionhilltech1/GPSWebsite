import { ObjectId } from "mongodb";
import { UTApi } from "uploadthing/server";
import { isAdmin } from "@/lib/auth";
import { photos, tagList, text, toItem } from "@/lib/gallery";

const utapi = new UTApi();
const unauthorized = () => Response.json({ error: "Please log in again." }, { status: 401 });
const badRequest = (error: string) => Response.json({ error }, { status: 400 });

// A file the browser just uploaded to UploadThing.
type Uploaded = { key: string; url: string; name: string; size: number };
const uploaded = (f: Partial<Uploaded> | undefined): Uploaded | null =>
  f && typeof f.key === "string" && typeof f.url === "string" && f.url.startsWith("https://")
    ? { key: f.key, url: f.url, name: text(f.name, 200) || f.key, size: Number(f.size) || 0 }
    : null;

const objectId = (id: unknown) => (typeof id === "string" && ObjectId.isValid(id) ? new ObjectId(id) : null);

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  const docs = await (await photos()).find().sort({ createdAt: -1 }).toArray();
  const images = docs.map(toItem);
  const totalBytes = docs.reduce((sum, d) => sum + d.size, 0);
  const categoryCount: Record<string, number> = {};
  for (const d of docs) categoryCount[d.category] = (categoryCount[d.category] ?? 0) + 1;

  return Response.json({
    success: true,
    images,
    stats: {
      totalCount: images.length,
      totalSizeFormatted: totalBytes ? `${(totalBytes / 1024 / 1024).toFixed(1)} MB` : "0 MB",
      categoryCount,
    },
  });
}

// Save newly uploaded photos with their captions.
export async function POST(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  const body = await request.json().catch(() => ({}));
  const files = (Array.isArray(body.files) ? body.files : []).map(uploaded).filter(Boolean) as Uploaded[];
  if (!files.length) return badRequest("No uploaded files were received.");

  const now = new Date();
  const title = text(body.title, 120);
  const tags = tagList(body.tags);
  await (await photos()).insertMany(
    files.map((f) => ({
      ...f,
      title: title && files.length === 1 ? title : f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
      caption: text(body.caption, 600),
      category: text(body.category, 60) || "General",
      tags: tags.length ? tags : ["GPS Site"],
      createdAt: now,
      updatedAt: now,
    })),
  );
  return Response.json({ success: true, uploaded: files.length });
}

// Edit captions, or swap the image for a newly uploaded one.
export async function PUT(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  const body = await request.json().catch(() => ({}));
  const _id = objectId(body.id);
  if (!_id) return badRequest("Missing photo id.");

  const collection = await photos();
  const existing = await collection.findOne({ _id });
  if (!existing) return Response.json({ error: "Photo not found." }, { status: 404 });

  const file = uploaded(body.file);
  await collection.updateOne(
    { _id },
    {
      $set: {
        ...(file ?? {}),
        ...(body.title !== undefined && { title: text(body.title, 120) || existing.title }),
        ...(body.caption !== undefined && { caption: text(body.caption, 600) }),
        ...(body.category !== undefined && { category: text(body.category, 60) || existing.category }),
        ...(body.tags !== undefined && { tags: tagList(body.tags) }),
        updatedAt: new Date(),
      },
    },
  );
  // Remove the old image only after the record points at the new one.
  if (file && file.key !== existing.key) await utapi.deleteFiles(existing.key);
  return Response.json({ success: true });
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  const _id = objectId(new URL(request.url).searchParams.get("id"));
  if (!_id) return badRequest("Missing photo id.");

  const doc = await (await photos()).findOneAndDelete({ _id });
  if (!doc) return Response.json({ error: "Photo not found." }, { status: 404 });
  await utapi.deleteFiles(doc.key);
  return Response.json({ success: true });
}
