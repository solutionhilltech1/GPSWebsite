import { connection } from "next/server";
import { photos, toItem } from "@/lib/gallery";

// Public, read-only. Uploads and deletes go through /api/admin/gallery.
export async function GET() {
  await connection(); // always read fresh from MongoDB, never prerender at build time
  const images = (await (await photos()).find().sort({ createdAt: -1 }).toArray()).map(toItem);
  const hash = images.map((i) => `${i.id}:${i.mtime}`).join("|");

  return Response.json(
    { success: true, images, count: images.length, hash },
    { headers: { "Cache-Control": "no-store" } },
  );
}
